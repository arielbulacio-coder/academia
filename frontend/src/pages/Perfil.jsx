import { User, Mail, School, Shield } from 'lucide-react';

const Perfil = ({ user }) => {
    if (!user) return <div>Cargando...</div>;

    const roleLabel = {
        'admin': 'Administrador General',
        'director': 'Director de Escuela',
        'vicedirector': 'Vicedirector',
        'regente': 'Regente Técnico',
        'inspector': 'Inspector Regional',
        'secretario': 'Secretario Académico',
        'profesor': 'Instructor / Docente',
        'alumno': 'Estudiante'
    }[user.role] || user.role;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-cyan-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-700">
                            <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                            <span className="inline-block px-3 py-1 mt-2 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                                {roleLabel}
                            </span>
                        </div>
                        {/* Status (Mock) */}
                        <span className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Activo
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Mail className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Correo Electrónico</p>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><School className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Institución</p>
                                <p className="text-white font-medium">{user.EscuelaId ? `Escuela ID #${user.EscuelaId}` : 'Administración Central'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Shield className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Nivel de Acceso</p>
                                <p className="text-white font-medium capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                        <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                            Cambiar Contraseña
                        </button>
                        <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                            Editar Perfil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
