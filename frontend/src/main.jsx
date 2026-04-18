import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { LogProvider } from './context/LogContext.jsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0D1B12;color:#E8F5E9;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:520px;text-align:center;">
        <h1 style="margin:0 0 12px;font-size:2rem;">Unable to start Agrow AI</h1>
        <p style="margin:0;line-height:1.6;">The frontend root element with id "root" was not found in <code>index.html</code>.</p>
      </div>
    </div>
  `
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <LogProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LogProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
