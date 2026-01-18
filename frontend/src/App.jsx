import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    }
  }, [])

  const fetchUser = async (token) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
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
    setLoading(true)
    const endpoint = isLogin ? '/auth/login' : '/auth/register'
    const body = isLogin ? { email: formData.email, password: formData.password } : formData

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
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
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
            Academia
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">
            Gastronomía • Electrónica • Informática
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 overflow-hidden relative">

          {user ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-block p-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white">¡Hola, {user.name}!</h2>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
                  {user.role}
                </span>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300 border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-mono text-white/80">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Activo
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 group"
              >
                <span>Cerrar Sesión</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-xl font-semibold mb-6 text-center">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
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
                    placeholder="correo@ejemplo.com"
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
                      Procesando...
                    </span>
                  ) : (
                    isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError('') }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
                  >
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-slate-500 text-xs">
          <p>© 2024 Academia - System Build: {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'Dev'}</p>
        </footer>
      </div>
    </div>
  )
}

export default App
