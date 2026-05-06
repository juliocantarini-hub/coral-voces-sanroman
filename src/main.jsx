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
    font-size: 14px;
  }
  body.fuente-mediana { font-size: 15px; }
  body.fuente-grande  { font-size: 16px; }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D3D1C7; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #B4B2A9; }
`
document.head.appendChild(style)

// Aplicar tamaño de fuente guardado
const fuenteGuardada = localStorage.getItem('tamanoFuente')
if (fuenteGuardada === 'mediana') document.body.classList.add('fuente-mediana')
if (fuenteGuardada === 'grande')  document.body.classList.add('fuente-grande')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <App />
      <ReproductorFlotante />
    </AudioProvider>
  </React.StrictMode>
)