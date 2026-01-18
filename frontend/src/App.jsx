import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error("Error fetching user", error)
      localStorage.removeItem('token')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const endpoint = isLogin ? '/auth/login' : '/auth/register'
    const body = isLogin ? { email: formData.email, password: formData.password } : formData

    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setFormData({ name: '', email: '', password: '' })
      } else {
        setError(data.message || 'Error occurred')
      }
    } catch (err) {
      setError('Connection error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Academia</h1>
        <p>Plataforma de Cursos de Gastronomía, Electrónica e Informática</p>
      </header>
      <main>
        <div className="card">
          {user ? (
            <div>
              <h2>Bienvenido, {user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Rol: {user.role}</p>
              <button onClick={handleLogout} style={{ marginTop: '15px' }}>Cerrar Sesión</button>
            </div>
          ) : (
            <div>
              <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                {!isLogin && (
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre Completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ padding: '8px', width: '250px' }}
                  />
                )}
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '8px', width: '250px' }}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '8px', width: '250px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}>
                  {isLogin ? 'Entrar' : 'Registrarse'}
                </button>
              </form>
              <p style={{ marginTop: '15px' }}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <span
                  onClick={() => { setIsLogin(!isLogin); setError('') }}
                  style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                </span>
              </p>
            </div>
          )}
        </div>
      </main>
      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.7 }}>
        Build: {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'Local Dev'}
      </footer>
    </div>
  )
}

export default App
