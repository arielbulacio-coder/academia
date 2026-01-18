const Dashboard = ({ user }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
                <p className="text-slate-400">Bienvenido de nuevo, {user?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Mis Cursos</h3>
                    <p className="text-4xl font-bold text-white">3</p>
                    <p className="text-sm text-slate-500 mt-2">Cursos activos este ciclo</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Próximas Clases</h3>
                    <p className="text-4xl font-bold text-white">12</p>
                    <p className="text-sm text-slate-500 mt-2">Programadas para esta semana</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-2">Asistencia</h3>
                    <p className="text-4xl font-bold text-white">95%</p>
                    <p className="text-sm text-slate-500 mt-2">Promedio mensual</p>
                </div>
            </div>

            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-slate-300 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Se subió nuevo material en <strong>Matemática I</strong></span>
                        <span className="ml-auto text-xs text-slate-500">Hace 2h</span>
                    </li>
                    <li className="flex items-center gap-4 text-slate-300 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span>Examen programado para <strong>Programación .NET</strong></span>
                        <span className="ml-auto text-xs text-slate-500">Hace 5h</span>
                    </li>
                    <li className="flex items-center gap-4 text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Registro de asistencia completado</span>
                        <span className="ml-auto text-xs text-slate-500">Ayer</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
