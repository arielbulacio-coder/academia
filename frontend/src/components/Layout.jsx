import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BookOpen, Users, LogOut, Menu, X } from 'lucide-react';

const Layout = ({ children, user, handleLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Cursos', href: '/cursos', icon: GraduationCap },
        { name: 'Materias', href: '/materias', icon: BookOpen },
        { name: 'Alumnos', href: '/alumnos', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-white/10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                        Academia
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    Academia
                </h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-slate-900 pt-16 px-4">
                    <nav className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-4 py-4 rounded-lg text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10"
                            >
                                <item.icon className="w-6 h-6 mr-3" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-4 mt-8 text-red-400 bg-red-500/10 rounded-lg"
                        >
                            <LogOut className="w-6 h-6 mr-3" />
                            Cerrar Sesión
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none fixed"></div>
                <div className="p-6 md:p-8 relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
