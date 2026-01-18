import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, FileCheck, GraduationCap, School } from 'lucide-react';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();

    if (!user) return <div className="p-8 text-white">Error crítico: Objeto usuario no recibido.</div>;
    console.log("Dashboard User:", user); // DEBUG

    // DASHBOARD ADMIN
    if (user.role === 'admin') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white">Panel de Administración Global</h2>
                    <p className="text-slate-400">Superusuario del Sistema</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => navigate('/usuarios')} className="bg-red-900/20 border border-red-500/30 p-8 rounded-2xl hover:border-red-400 cursor-pointer group">
                        <School className="w-10 h-10 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold text-white">Gestión de Escuelas</h3>
                        <p className="text-slate-400 mt-2">Crear instituciones y asignar Directores.</p>
                    </div>
                    <div onClick={() => navigate('/usuarios')} className="bg-slate-800 border border-white/10 p-8 rounded-2xl hover:border-white/30 cursor-pointer group">
                        <Users className="w-10 h-10 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold text-white">Usuarios del Sistema</h3>
                        <p className="text-slate-400 mt-2">Ver todos los usuarios registrados.</p>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD DIRECTOR / SECRETARIO
    if (user.role === 'director' || user.role === 'secretario') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            {user.role === 'director' ? 'Panel Directivo' : 'Secretaría Académica'}
                        </h2>
                        <p className="text-slate-400">Escuela Técnica Profesional (ID: {user.EscuelaId})</p>
                    </div>
                    {user.role === 'director' && (
                        <button onClick={() => navigate('/observacion')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                            <FileCheck className="w-5 h-5" /> Nueva Observación
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => navigate('/cursos')} className="bg-slate-800 border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 cursor-pointer transition-all group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Gestionar Cursos</h3>
                        <p className="text-slate-400 text-sm mt-2">ABM de Ccursos y aulas.</p>
                    </div>

                    <div onClick={() => navigate('/usuarios')} className="bg-slate-800 border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 cursor-pointer transition-all group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Personal</h3>
                        <p className="text-slate-400 text-sm mt-2">Instructores, Profesores y Secretarios.</p>
                    </div>

                    <div onClick={() => navigate('/usuarios')} className="bg-slate-800 border border-white/10 p-6 rounded-2xl hover:border-green-500/50 cursor-pointer transition-all group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Alumnos</h3>
                        <p className="text-slate-400 text-sm mt-2">Gestión de Matrícula e Inscripciones.</p>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD ALUMNO / PROFESOR
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">
                    {user.role === 'profesor' ? 'Mi Aula Virtual' : 'Mi Aprendizaje'}
                </h2>
                <p className="text-slate-400">
                    Bienvenido, {user?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-800 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all cursor-pointer group" onClick={() => navigate('/cursos')}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-purple-300 group-hover:text-white transition-colors">Mis Cursos Activos</h3>
                        <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="space-y-3">
                        <div onClick={(e) => { e.stopPropagation(); navigate('/curso/1'); }} className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between border border-transparent hover:border-white/10">
                            <div>
                                <p className="font-bold text-white text-sm">Aplicaciones de Elec. Digital</p>
                                <p className="text-xs text-slate-400">Aula 1</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">Go</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Avisos Institucionales</h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-slate-300 pb-2 border-b border-white/5">
                            <span className="text-cyan-400 font-bold block text-xs mb-1">ALERTA</span>
                            Cierre de notas trimestrales próximo.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
