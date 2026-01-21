import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cursos from './pages/Cursos'
import Materias from './pages/Materias'
import CourseDetail from './pages/CourseDetail'
import Perfil from './pages/Perfil'
import Observacion from './pages/Observacion'
import Usuarios from './pages/Usuarios'
import Planificador from './pages/Planificador'

const getAuthUrl = () => {
  // 1. Prioritize dynamic detection to ensure it works on the current domain/IP
  if (typeof window !== 'undefined' && window.location.hostname.includes('nip.io')) {
    // Dynamically replace subdomain 'academia' (or empty) with 'auth'
    // Uses regex to be safer: replace 'academia' or just prepend 'auth' if using IP?
    // Given the Nginx setup, we expect 'academia.149...'
    // If it's just the IP, this logic might fail, so we stick to hostname string manip for nip.io
    return window.location.protocol + '//' + window.location.hostname.replace('academia.', 'auth.');
  }

  // 2. Fallback to build-time variable
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // 3. Last resort
  return 'http://auth.149.50.130.160.nip.io';
};

function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(false) // No bloquear inicio
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuthChecking(true) // Mostrar loading solo si hay token que validar
      fetchUser(token)
    }
  }, [])

  const fetchUser = async (token) => {
    const apiUrl = getAuthUrl()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 seg timeout

      const res = await fetch(`${apiUrl}/auth/me`, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      clearTimeout(timeoutId)
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error("Error fetching user", error)
      localStorage.removeItem('token')
    } finally {
      setAuthChecking(false)
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
    setLoading(true)
    const endpoint = isLogin ? '/auth/login' : '/auth/register'
    const body = isLogin ? { email: formData.email, password: formData.password } : formData

    const apiUrl = getAuthUrl()
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
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
      console.error("Login Error:", err);
      setError(`Connection error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (authChecking) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>
  }

  if (user) {
    return (
      <Router>
        <Layout user={user} handleLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/curso/:id" element={<CourseDetail user={user} />} />
            <Route path="/materias" element={<Materias />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/observacion" element={<Observacion user={user} />} />
            <Route path="/planificador" element={<Planificador user={user} />} />
            <Route path="/usuarios" element={<Usuarios user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="ETPIA" className="h-24 w-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight mb-2">
            Academia Técnico Profesional
          </h1>
          <p className="text-slate-300 text-lg font-medium tracking-wide">
            Cursos de Formación Profesional
          </p>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">
            & Materias Técnicas
          </p>
          <div className="mt-4 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold">
            Ciclo Lectivo 2026
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 overflow-hidden relative">
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-semibold mb-6 text-center">
              {isLogin ? 'Acceso al Campus' : 'Solicitar Acceso'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre Completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}

              <div className="group">
                <input
                  type="email"
                  name="email"
                  placeholder="correo@institucional.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              <div className="group">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validando...
                  </span>
                ) : (
                  isLogin ? 'Ingresar' : 'Registrarse'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {isLogin ? '¿Olvidaste tu contraseña? ' : '¿Personal de la institución? '}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError('') }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
                >
                  {isLogin ? 'Recuperar' : 'Pedir acceso administrativo'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
          <button
            onClick={() => setShowAbout(true)}
            className="text-cyan-400 hover:text-purple-400 transition-colors font-medium flex items-center gap-1"
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">i</span>
            Acerca de ETPIA
          </button>
          <p>© 2024 Academia Education System - v2.0 Enterprise</p>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl shadow-purple-900/50">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <img src="/logo.png" alt="ETPIA Logo" className="w-24 h-24 object-contain" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                  Sobre ETPIA
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  <strong className="text-white">ETPIA</strong> es una aplicación que utiliza la <span className="text-cyan-400">Inteligencia Artificial</span> para potenciar las herramientas de enseñanza y aprendizaje.
                </p>
                <p className="text-slate-400">
                  Nuestra misión es facilitar la apropiación del conocimiento mediante tecnologías innovadoras que asisten tanto a educadores como a estudiantes en su recorrido académico, haciendo el proceso más dinámico, personalizado y eficiente.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAbout(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-900/40"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
