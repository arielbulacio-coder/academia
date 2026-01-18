import { useState, useEffect } from 'react';

const Cursos = () => {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCursos = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Default to courses service local
            // Note: In prod, this will be handled by Nginx proxying /api/courses -> courses:3002
            // For now, let's assume direct connection or proxy setup.
            // If we use the proxy (http://courses.ip.nip.io), we should configure that.
            // But for local development without full proxy, we might need a direct port if not using the main proxy.
            // Let's try to fetch from the proxy URL if in production.

            let url = 'http://localhost:3002/cursos';
            if (import.meta.env.VITE_API_URL) {
                // Estructura de producción: courses.IP.nip.io
                // El VITE_API_URL apunta a auth.IP.nip.io, ajustamos para courses
                url = import.meta.env.VITE_API_URL.replace('auth', 'courses') + '/cursos';
            }

            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setCursos(data);
                }
            } catch (error) {
                console.error("Error fetching courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCursos();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Cursos</h2>
                    <p className="text-slate-400">Gestión de cursos y divisiones</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    + Nuevo Curso
                </button>
            </div>

            {loading ? (
                <p className="text-white">Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursos.map(curso => (
                        <div key={curso.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 group hover:border-purple-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase">
                                    Año {curso.anio}
                                </span>
                                <span className="text-slate-400 font-mono text-sm">{curso.division}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{curso.nombre}</h3>
                            <p className="text-slate-400 text-sm">{curso.descripcion}</p>
                        </div>
                    ))}
                    {cursos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            No se encontraron cursos.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cursos;
