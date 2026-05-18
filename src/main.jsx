import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initMonitoring } from './services/monitoring.js'
import './index.css'

initMonitoring()

function reloadOnceForUpdatedBuild() {
  const key = 'moayo-last-build-reload'
  const lastReload = Number(sessionStorage.getItem(key) || 0)
  if (Date.now() - lastReload < 15000) return
  sessionStorage.setItem(key, String(Date.now()))
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadOnceForUpdatedBuild()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
