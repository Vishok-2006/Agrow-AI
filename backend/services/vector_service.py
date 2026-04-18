import asyncio
import json
import logging
import math
import zlib
from dataclasses import dataclass, field
from typing import Any

import httpx
import google.generativeai as genai

from config.settings import settings

logger = logging.getLogger(__name__)


@dataclass
class VectorSearchResult:
    results: list[dict[str, Any]] = field(default_factory=list)
    endpoint: str = ""
    method: str = "POST"
    unavailable: bool = False
    error: str | None = None
    status_code: int | None = None


class VectorService:
    def __init__(self):
        self.root_base_url, self.api_base_url = self._normalize_base_urls(settings.ENDEE_URL)
        self.index_name = settings.ENDEE_INDEX_NAME
        self.timeout = settings.ENDEE_TIMEOUT_SECONDS
        self.default_headers = {
            "Accept": "application/msgpack, application/json;q=0.9, */*;q=0.8",
            "Content-Type": "application/json",
        }
        if settings.ENDEE_AUTH_TOKEN:
            self.default_headers["Authorization"] = settings.ENDEE_AUTH_TOKEN

        self.client = httpx.AsyncClient(
            base_url=self.api_base_url,
            headers=self.default_headers,
            timeout=httpx.Timeout(self.timeout),
        )
        logger.info(
            "Configured Endee client root_base_url=%s api_base_url=%s index=%s",
            self.root_base_url,
            self.api_base_url,
            self.index_name,
        )

    @staticmethod
    def _normalize_base_urls(raw_url: str) -> tuple[str, str]:
        trimmed = raw_url.rstrip("/")
        api_base_url = trimmed if trimmed.endswith("/api/v1") else f"{trimmed}/api/v1"
        root_base_url = api_base_url.removesuffix("/api/v1")
        return root_base_url, api_base_url

    @staticmethod
    def _is_unavailable_error(exc: Exception | None = None, status_code: int | None = None) -> bool:
        if status_code is not None and status_code >= 500:
            return True
        return isinstance(
            exc,
            (
                httpx.ConnectError,
                httpx.ConnectTimeout,
                httpx.ReadTimeout,
                httpx.WriteTimeout,
                httpx.PoolTimeout,
                httpx.NetworkError,
            ),
        )

    @staticmethod
    def _response_body_text(response: httpx.Response) -> str:
        try:
            return response.text
        except UnicodeDecodeError:
            return response.content.hex()

    @staticmethod
    def _exception_text(exc: Exception) -> str:
        message = str(exc).strip()
        return message or exc.__class__.__name__

    @staticmethod
    def _decode_json_blob(blob: Any) -> dict[str, Any]:
        if blob in (None, "", b"", bytearray()):
            return {}
        if isinstance(blob, dict):
            return blob
        if isinstance(blob, str):
            try:
                parsed = json.loads(blob)
                return parsed if isinstance(parsed, dict) else {"value": parsed}
            except json.JSONDecodeError:
                return {"raw": blob}

        raw_bytes = bytes(blob) if isinstance(blob, (bytes, bytearray, memoryview)) else None
        if raw_bytes is None:
            return {"raw": str(blob)}

        for decoder in (
            lambda data: json.loads(zlib.decompress(data).decode("utf-8")),
            lambda data: json.loads(data.decode("utf-8")),
        ):
            try:
                parsed = decoder(raw_bytes)
                return parsed if isinstance(parsed, dict) else {"value": parsed}
            except (OSError, UnicodeDecodeError, json.JSONDecodeError):
                continue

        return {"raw": raw_bytes.hex()}

    @staticmethod
    def _decode_filter_blob(blob: Any) -> dict[str, Any] | None:
        if blob in (None, "", b"", bytearray()):
            return None
        if isinstance(blob, dict):
            return blob

        if isinstance(blob, (bytes, bytearray, memoryview)):
            try:
                blob = bytes(blob).decode("utf-8")
            except UnicodeDecodeError:
                return {"raw": bytes(blob).hex()}

        if isinstance(blob, str):
            try:
                parsed = json.loads(blob)
                return parsed if isinstance(parsed, dict) else {"value": parsed}
            except json.JSONDecodeError:
                return {"raw": blob}

        return {"raw": str(blob)}

    @staticmethod
    def _extract_result_text(result: dict[str, Any]) -> str:
        direct_text = result.get("text")
        if isinstance(direct_text, str) and direct_text.strip():
            return direct_text.strip()

        meta = result.get("meta") or {}
        candidates = (
            meta.get("text"),
            meta.get("content"),
            meta.get("body"),
            meta.get("chunk"),
            meta.get("document"),
            meta.get("description"),
            meta.get("summary"),
        )
        for candidate in candidates:
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()

        if meta:
            try:
                return json.dumps(meta, ensure_ascii=True)
            except TypeError:
                return str(meta)

        return ""

    @staticmethod
    def _format_context(results: list[dict[str, Any]]) -> str:
        context_chunks: list[str] = []
        for result in results:
            text = VectorService._extract_result_text(result)
            if not text:
                continue

            similarity = result.get("similarity")
            score = ""
            if isinstance(similarity, (float, int)):
                score = f" (similarity: {similarity:.3f})"

            context_chunks.append(f"[Source: {result.get('id', 'unknown')}{score}]\n{text}")

        return "\n\n".join(context_chunks)

    @staticmethod
    def _normalize_query_vector(vector: list[float], space_type: str) -> list[float]:
        if space_type != "cosine":
            return vector

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector

        return [value / norm for value in vector]

    def _log_request(self, method: str, url: str, payload: dict[str, Any] | None = None) -> None:
        if payload is None:
            logger.info("Endee request method=%s url=%s", method, url)
            return

        logger.info("Endee request method=%s url=%s payload=%s", method, url, payload)

    def _log_http_error(
        self,
        method: str,
        url: str,
        payload: dict[str, Any] | None,
        response: httpx.Response,
        prefix: str,
    ) -> None:
        body = self._response_body_text(response)
        logger.error(
            "%s method=%s url=%s status=%s payload=%s response=%s",
            prefix,
            method,
            url,
            response.status_code,
            payload,
            body,
        )

    async def check_health(self) -> bool:
        health_url = f"{self.root_base_url}/health"
        self._log_request("GET", health_url)
        try:
            response = await self.client.get(health_url)
            if response.status_code != 200:
                self._log_http_error("GET", health_url, None, response, "Endee health check failed")
                return False

            payload = response.json()
            status = payload.get("status") if isinstance(payload, dict) else None
            is_healthy = status in (None, "ok", "healthy")
            if is_healthy:
                logger.info("Endee connection verified at %s", health_url)
                return True

            logger.error("Endee health response was not healthy: %s", payload)
            return False
        except Exception as exc:
            logger.error(
                "Endee connection failed url=%s error=%s",
                health_url,
                self._exception_text(exc),
                exc_info=True,
            )
            return False

    async def get_index_info(self, index_name: str) -> dict[str, Any]:
        endpoint = f"/index/{index_name}/info"
        url = f"{self.api_base_url}{endpoint}"
        self._log_request("GET", url)
        try:
            response = await self.client.get(endpoint)
            response.raise_for_status()
            payload = response.json()
            logger.info("Endee index info received index=%s payload=%s", index_name, payload)
            return payload
        except httpx.HTTPStatusError as exc:
            self._log_http_error("GET", url, None, exc.response, "Endee index info failed")
            raise
        except Exception as exc:
            logger.error(
                "Endee index info request failed url=%s error=%s",
                url,
                self._exception_text(exc),
                exc_info=True,
            )
            raise

    async def _build_query_embedding(self, query_text: str, dimension: int) -> list[float]:
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError("Gemini API key is required to build Endee query embeddings.")

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        logger.info(
            "Generating Endee query embedding model=%s dimension=%s",
            settings.ENDEE_EMBEDDING_MODEL,
            dimension,
        )

        response = await asyncio.to_thread(
            genai.embed_content,
            model=settings.ENDEE_EMBEDDING_MODEL,
            content=query_text,
            task_type="retrieval_query",
            output_dimensionality=dimension if dimension > 0 else None,
            request_options={"timeout": settings.ENDEE_TIMEOUT_SECONDS},
        )

        embedding = response.get("embedding")
        if not isinstance(embedding, list) or not embedding:
            raise RuntimeError(f"Unexpected embedding response: {response}")

        try:
            return [float(value) for value in embedding]
        except (TypeError, ValueError) as exc:
            raise RuntimeError(f"Invalid embedding payload returned by Gemini: {response}") from exc

    @staticmethod
    def _decode_search_results(payload: bytes) -> list[dict[str, Any]]:
        try:
            import msgpack
        except ImportError as exc:
            raise RuntimeError(
                "The `msgpack` package is required to decode Endee search responses."
            ) from exc

        try:
            decoded = msgpack.unpackb(payload, raw=False, strict_map_key=False)
        except Exception as exc:
            raise RuntimeError(f"Unable to decode Endee MessagePack response: {exc}") from exc

        if not isinstance(decoded, list):
            raise RuntimeError(f"Unexpected Endee search response shape: {type(decoded).__name__}")

        results: list[dict[str, Any]] = []
        for item in decoded:
            if not isinstance(item, (list, tuple)) or len(item) < 5:
                logger.warning("Skipping malformed Endee search result: %s", item)
                continue

            similarity = float(item[0])
            vector_id = item[1].decode("utf-8") if isinstance(item[1], bytes) else str(item[1])
            meta = VectorService._decode_json_blob(item[2])
            filter_payload = VectorService._decode_filter_blob(item[3])
            result = {
                "id": vector_id,
                "similarity": similarity,
                "distance": 1 - similarity,
                "meta": meta,
                "norm": item[4],
            }
            if filter_payload is not None:
                result["filter"] = filter_payload

            if len(item) > 5 and item[5] is not None:
                vector_data = item[5]
                if isinstance(vector_data, (bytes, bytearray, memoryview)):
                    result["vector"] = list(bytes(vector_data))
                elif isinstance(vector_data, (list, tuple)):
                    result["vector"] = list(vector_data)

            extracted_text = VectorService._extract_result_text(result)
            if extracted_text:
                result["text"] = extracted_text

            results.append(result)

        return results

    async def query(
        self,
        index_name: str,
        vector: list[float],
        limit: int = 5,
        space_type: str = "cosine",
    ) -> list[dict[str, Any]]:
        endpoint = f"/index/{index_name}/search"
        url = f"{self.api_base_url}{endpoint}"
        payload = {
            "k": limit,
            "ef": settings.ENDEE_SEARCH_EF,
            "include_vectors": False,
            "dense_rrf_weight": 0.5,
            "rrf_rank_constant": 60,
            "vector": self._normalize_query_vector(vector, space_type),
            "filter_params": {
                "prefilter_cardinality_threshold": settings.ENDEE_PREFILTER_CARDINALITY_THRESHOLD,
                "filter_boost_percentage": settings.ENDEE_FILTER_BOOST_PERCENTAGE,
            },
        }
        self._log_request("POST", url, payload)

        try:
            response = await self.client.post(endpoint, json=payload)
            response.raise_for_status()
            results = self._decode_search_results(response.content)
            logger.info("Endee returned %s search results for index=%s", len(results), index_name)
            return results
        except httpx.HTTPStatusError as exc:
            self._log_http_error("POST", url, payload, exc.response, "Endee search failed")
            raise
        except Exception as exc:
            logger.error(
                "Endee search request failed url=%s error=%s",
                url,
                self._exception_text(exc),
                exc_info=True,
            )
            raise

    async def query_endee(
        self,
        query_text: str,
        index_name: str | None = None,
        top_k: int | None = None,
    ) -> VectorSearchResult:
        resolved_index = index_name or self.index_name
        resolved_top_k = top_k or settings.ENDEE_TOP_K
        endpoint = f"{self.api_base_url}/index/{resolved_index}/search"
        result = VectorSearchResult(endpoint=endpoint, method="POST")

        if not query_text.strip():
            result.error = "Query text is empty."
            logger.warning("Skipping Endee search because the query text is empty.")
            return result

        try:
            index_info = await self.get_index_info(resolved_index)
            dimension = int(index_info.get("dimension") or 0)
            space_type = str(index_info.get("space_type") or "cosine")
            query_vector = await self._build_query_embedding(query_text, dimension)
            result.results = await self.query(
                index_name=resolved_index,
                vector=query_vector,
                limit=resolved_top_k,
                space_type=space_type,
            )
            return result
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            result.status_code = status_code
            result.error = self._response_body_text(exc.response)
            result.unavailable = self._is_unavailable_error(status_code=status_code)
        except Exception as exc:
            result.error = self._exception_text(exc)
            result.unavailable = self._is_unavailable_error(exc=exc)

        if result.unavailable:
            logger.warning("Vector DB unavailable: %s", result.error)
        else:
            logger.error("Endee search did not succeed: %s", result.error)

        return result

    def build_context(self, results: list[dict[str, Any]]) -> str:
        return self._format_context(results)

    def build_test_commands(self, index_name: str | None = None) -> dict[str, str]:
        resolved_index = index_name or self.index_name
        return {
            "health": f"curl {self.root_base_url}/health",
            "index_info": f"curl {self.api_base_url}/index/{resolved_index}/info",
            "search": (
                f"curl -X POST {self.api_base_url}/index/{resolved_index}/search "
                "-H \"Content-Type: application/json\" "
                "-d '{\"k\":3,\"vector\":[0.1,0.2,0.3],\"include_vectors\":false}'"
            ),
        }


vector_service = VectorService()
