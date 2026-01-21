import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import CursoModal from '../components/CursoModal';


import { getApiUrl } from '../utils/api';

const Cursos = () => {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Local user state needed to check role
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cursoToEdit, setCursoToEdit] = useState(null); // Course to edit
    const navigate = useNavigate();

    // Fetch user role from local storage or context (simplified here)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decodificar token o fetch user (simplificado: asumimos que app.jsx pasó user, 
            // pero como este comp no recibe props directas si viene de route, 
            // idealmente usaríamos un Context. Por ahora hacemos fetch rápido de /me 
            // o confiamos en que el backend valida permisos para acciones POST/DELETE)
            fetchUserRole(token);
        }
    }, []);

    const fetchUserRole = async (token) => {
        const apiUrl = getApiUrl('auth');
        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setUser(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchCursos = async () => {
        let url = getApiUrl('courses') + '/cursos';

        // Filter based on role
        console.log('User Role:', user?.role, 'EscuelaId:', user?.EscuelaId);
        const params = new URLSearchParams();
        // TEMPORARY: Commenting out strict filtering to show courses even if School differs, for debugging "No veo nada"
        /*
        if (user?.role === 'director' || user?.role === 'regente' || user?.role === 'secretario') {
            if (user.EscuelaId) params.append('EscuelaId', user.EscuelaId);
        } else if (user?.role === 'profesor') {
            params.append('profesorId', user.id);
        }
        */

        // Show params in log
        console.log('Fetching courses params:', params.toString());
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCursos(data);
            }
        } catch (error) {
            console.error("Error fetching courses", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== undefined) { // Wait until user state is determining (null is initial, maybe add 'userLoaded' flag if strictly needed, but user starts null, fetches fast. Logic allows null user to fetch all public courses, which is fine, or we wait?)
            // Actually, we want public to see courses too? Yes.
            fetchCursos();
        }
    }, [user]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que desea eliminar este curso? Se borrarán todos los materiales.')) return;

        let url = getApiUrl('courses') + '/cursos/' + id;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchCursos(); // Reload
            } else {
                alert('Error al eliminar el curso');
            }
        } catch (e) {
            alert('Error eliminando curso');
        }
    };

    const handleEdit = (e, curso) => {
        e.stopPropagation();
        setCursoToEdit(curso);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCursoToEdit(null);
        setIsModalOpen(true);
    };

    const canEdit = ['director', 'vicedirector', 'regente', 'secretario', 'admin'].includes(user?.role);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Oferta Académica</h2>
                    <p className="text-slate-400">Capacitación Profesional y Técnica</p>
                </div>

                {canEdit && (
                    <button
                        onClick={handleCreate}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Curso
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                    Error cargando cursos: {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursos.map(curso => (
                        <div key={curso.id} onClick={() => navigate(`/curso/${curso.id}`)} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer flex flex-col h-full relative">

                            {/* Actions for Authorized Roles */}
                            {canEdit && (
                                <div className="absolute top-2 right-2 z-30 flex gap-2">
                                    <button onClick={(e) => handleEdit(e, curso)} className="p-2 bg-black/50 hover:bg-purple-600 text-white rounded-full backdrop-blur-md transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDelete(e, curso.id)} className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Imagen de Portada */}
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                                <img
                                    src={curso.imagen || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                                    alt={curso.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase backdrop-blur-md border border-cyan-500/30">
                                        Curso Oficial
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{curso.nombre}</h3>
                                <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{curso.descripcion}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Users className="w-4 h-4" />
                                        <span>Abierto</span>
                                    </div>
                                    <span className="text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Ver Programa →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cursos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            No hay cursos disponibles actualmente.
                        </div>
                    )}
                </div>
            )}

            <CursoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCursos}
                user={user}
                initialData={cursoToEdit}
                isEditing={!!cursoToEdit}
            />
        </div>
    );
};

export default Cursos;
