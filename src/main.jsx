import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AudioProvider } from './hooks/useAudioPlayer'
import ReproductorFlotante from './components/ui/ReproductorFlotante'

const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #F1EFE8;
  }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D3D1C7; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #B4B2A9; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <App />
      <ReproductorFlotante />
    </AudioProvider>
  </React.StrictMode>
)