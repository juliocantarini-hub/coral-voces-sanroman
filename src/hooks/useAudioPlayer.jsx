import { createContext, useContext, useState } from 'react'

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const [audioActivo, setAudioActivo] = useState(null)
  const [playing, setPlaying] = useState(false)

  function reproducir(fileId, nombre) {
    setAudioActivo({ fileId, nombre })
    setPlaying(true)
  }

  function detener() {
    setAudioActivo(null)
    setPlaying(false)
  }

  function togglePlay() {
    setPlaying(v => !v)
  }

  return (
    <AudioContext.Provider value={{ audioActivo, playing, reproducir, detener, togglePlay }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioPlayer() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudioPlayer debe usarse dentro de AudioProvider')
  return ctx
}