try:
    from supabase import create_client
except ImportError:
    create_client = None

from config.settings import settings


class SupabaseService:
    def __init__(self):
        self.client = None
        if create_client and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception:
                self.client = None

    @property
    def connected(self) -> bool:
        return self.client is not None

    def check_connection(self) -> bool:
        if not self.client:
            return False

        self.client.table(settings.SUPABASE_HEALTH_TABLE).select("*").limit(1).execute()
        return True

    def get_user_profile(self, user_id: str):
        if not self.client:
            return None
        return self.client.table("profiles").select("*").eq("id", user_id).single().execute()

    def store_chat(self, user_id: str, message: str, response: str):
        if not self.client:
            return None
        data = {
            "user_id": user_id,
            "message": message,
            "response": response,
        }
        return self.client.table("chat_history").insert(data).execute()

    def get_chat_history(self, user_id: str, limit: int = 20):
        if not self.client:
            return []
        return (
            self.client.table("chat_history")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

    def store_crop_request(self, user_id: str, inputs: dict, result: str):
        if not self.client:
            return None
        data = {
            "user_id": user_id,
            "inputs": inputs,
            "result": result,
        }
        return self.client.table("crop_requests").insert(data).execute()


supabase_service = SupabaseService()
