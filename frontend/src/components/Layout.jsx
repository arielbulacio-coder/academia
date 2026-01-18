import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, LogOut, Menu, X, User, FileCheck } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children, user, handleLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Items de navegación según rol
    const getNavItems = () => {
        const items = [
            { name: 'Inicio', href: '/', icon: LayoutDashboard },
            { name: 'Cursos', href: '/cursos', icon: BookOpen },
        ];

        // Director
        if (user.role === 'director' || user.role === 'admin') {
            items.push({ name: 'Observaciones', href: '/observacion', icon: FileCheck });
            items.push({ name: 'Usuarios', href: '/usuarios', icon: Users });
        }

        // Alumno / Profesor
        if (user.role === 'profesor' || user.role === 'alumno') {
            items.push({ name: 'Mi Perfil', href: '/perfil', icon: User });
        }

        return items;
    };

    const navigation = getNavItems();

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 bg-slate-900 border-r border-white/10 flex-col fixed h-full z-20">
                <div className="p-6">
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter leading-none">
                        ACADEMIA
                        <span className="block text-white text-xs font-normal mt-1 tracking-normal">Técnico Profesional</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold border-t border-white/10 pt-2">Ciclo 2026</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isActive(item.href)
                                ? 'bg-purple-600 shadow-lg shadow-purple-900/40 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${isActive(item.href) ? 'text-white' : 'text-slate-500'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-slate-800/20">
                    <Link to="/perfil" className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                            <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-30 px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-white">ACADEMIA</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-20 bg-slate-900 pt-16 px-4 animate-in slide-in-from-top-10 md:hidden">
                    <nav className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-4 rounded-xl text-lg font-medium ${isActive(item.href) ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <item.icon className="w-6 h-6 mr-4" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-xl mt-8 font-medium"
                        >
                            <LogOut className="w-6 h-6 mr-4" />
                            Cerrar Sesión
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                {children}
            </main>
        </div>
    );
};

export default Layout;
