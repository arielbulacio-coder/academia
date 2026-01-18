import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
                <p className="text-slate-400">
                    {user.role === 'profesor' ? 'Vista de Instructor' : 'Vista de Estudiante'} • Bienvenido, {user?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card Mis Cursos */}
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-800 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all cursor-pointer group" onClick={() => navigate('/cursos')}>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2 group-hover:text-white transition-colors">Mis Cursos</h3>
                    <div className="mt-4 space-y-3">
                        <div onClick={(e) => { e.stopPropagation(); navigate('/curso/1'); }} className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between">
                            <div>
                                <p className="font-bold text-white text-sm">Aplicaciones de Elec. Digital</p>
                                <p className="text-xs text-slate-400">6° Año A • Prof. Bulacio</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Próximas Clases</h3>
                    <p className="text-4xl font-bold text-white">12</p>
                    <p className="text-sm text-slate-500 mt-2">Programadas para esta semana</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-2">Rendimiento</h3>
                    <p className="text-4xl font-bold text-white">95%</p>
                    <p className="text-sm text-slate-500 mt-2">Promedio general</p>
                </div>
            </div>

            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-slate-300 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Se subió nuevo material en <strong>Fundamentos de Lógica</strong></span>
                        <span className="ml-auto text-xs text-slate-500">Hace 2h</span>
                    </li>
                    <li className="flex items-center gap-4 text-slate-300 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span>Examen programado: <strong>Microcontroladores</strong></span>
                        <span className="ml-auto text-xs text-slate-500">Hace 5h</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
