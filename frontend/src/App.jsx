import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Academia</h1>
        <p>Plataforma de Cursos de Gastronomía, Electrónica e Informática</p>
      </header>
      <main>
        <div className="card">
          <h2>Bienvenido</h2>
          <p>El sistema se está ejecutando correctamente.</p>
        </div>
      </main>
      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.7 }}>
        Build: {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'Local Dev'}
      </footer>
    </div>
  )
}

export default App
