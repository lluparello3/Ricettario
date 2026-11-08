import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StorageProvider } from './hooks/useStorage'
import { AuthGate } from './auth/AuthGate'
import { registerSW } from 'virtual:pwa-register'

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate>
      <StorageProvider>
        <App />
      </StorageProvider>
    </AuthGate>
  </React.StrictMode>,
)
