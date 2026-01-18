import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cursos = () => {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCursos = async () => {
            let url = 'http://localhost:3002/cursos';
            if (import.meta.env.VITE_API_URL) {
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
                    <h2 className="text-3xl font-bold text-white">Oferta Académica</h2>
                    <p className="text-slate-400">Explora nuestros cursos profesionales</p>
                </div>
                {/* Solo Director vería esto idealmente */}
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <span>+</span> Nuevo Curso
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursos.map(curso => (
                        <div key={curso.id} onClick={() => navigate(`/curso/${curso.id}`)} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer flex flex-col h-full">
                            {/* Imagen de Portada */}
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                                <img
                                    src={curso.imagen || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                                    alt={curso.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase backdrop-blur-md">
                                        Curso Profesional
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{curso.nombre}</h3>
                                <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{curso.descripcion}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                    <span className="text-xs text-slate-500">Inscripciones Abiertas</span>
                                    <span className="text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Ver Temario →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cursos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            No se encontraron cursos disponibles.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cursos;
