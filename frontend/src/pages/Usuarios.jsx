import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User, Mail, School as SchoolIcon } from 'lucide-react';

const Usuarios = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [escuelas, setEscuelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'alumno',
        EscuelaId: user.EscuelaId || ''
    });

    const isAdmin = user.role === 'admin';
    const isDirector = user.role === 'director';
    const isSecretario = user.role === 'secretario';

    // Fetch Base Data
    const fetchData = async () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

        try {
            // Fetch Users
            const resU = await fetch(`${baseUrl}/users`, { headers });
            if (resU.ok) setUsers(await resU.json());

            // Fetch Schools (Only Admin needs list to assign)
            if (isAdmin) {
                const resE = await fetch(`${baseUrl}/escuelas`, { headers });
                if (resE.ok) setEscuelas(await resE.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        try {
            // Create User
            const res = await fetch(`${baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Usuario creado correctamente');
                setShowModal(false);
                fetchData();
                setFormData({ name: '', email: '', role: 'alumno', EscuelaId: user.EscuelaId || '' });
            } else {
                const err = await res.json();
                const errorMessage = err.message || err.error || 'Ocurrió un error desconocido';
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar usuario?')) return;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        await fetch(`${baseUrl}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchData();
    };

    // --- RENDER ---

    if (loading) return <div className="text-white">Cargando gestión...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Gestión de Personal y Alumnos</h2>
                    <p className="text-slate-400">
                        {isAdmin ? 'Administración Global' : `Escuela ID: ${user.EscuelaId}`}
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Nuevo Usuario
                </button>
            </div>

            {/* TABLA USERS */}
            <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Escuela</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                            <img src={u.photo || `https://ui-avatars.com/api/?name=${u.name}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                        ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                            u.role === 'director' ? 'bg-purple-500/20 text-purple-400' :
                                                u.role === 'profesor' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}
                                     `}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {u.Escuela ? u.Escuela.nombre : (u.EscuelaId ? `#${u.EscuelaId}` : '-')}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-4">Registrar Nuevo Usuario</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input required className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input type="email" required className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Rol</label>
                                    <select className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="alumno">Alumno</option>
                                        <option value="profesor">Profesor / Instructor</option>
                                        {(isDirector || isAdmin) && <option value="secretario">Secretario</option>}
                                        {isAdmin && <option value="director">Director</option>}
                                        {isAdmin && <option value="admin">Administrador</option>}
                                    </select>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Escuela</label>
                                        <select className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white" value={formData.EscuelaId} onChange={e => setFormData({ ...formData, EscuelaId: e.target.value })}>
                                            <option value="">-- Seleccionar --</option>
                                            {escuelas.map(esc => (
                                                <option key={esc.id} value={esc.id}>{esc.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
