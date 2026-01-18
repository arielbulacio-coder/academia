import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Video, Link as LinkIcon, File, PlusCircle, CheckSquare, UploadCloud } from 'lucide-react';

const CourseDetail = ({ user }) => {
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeUnit, setActiveUnit] = useState(null);

    // Mock upload function
    const handleUpload = (type) => {
        alert(`Simulando subida de ${type}... (En desarrollo)`);
    };

    useEffect(() => {
        const fetchCurso = async () => {
            let url = `http://localhost:3002/cursos/${id}`;
            if (import.meta.env.VITE_API_URL) {
                url = import.meta.env.VITE_API_URL.replace('auth', 'courses') + `/cursos/${id}`;
            }

            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setCurso(data);
                }
            } catch (error) {
                console.error("Error fetching course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurso();
    }, [id]);

    const isInstructor = user?.role === 'profesor' || user?.role === 'admin';

    if (loading) return <div className="text-white p-8">Cargando aula virtual...</div>;
    if (!curso) return <div className="text-white p-8">Curso no encontrado.</div>;

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
            case 'word': return <File className="w-5 h-5 text-blue-400" />;
            case 'video': return <Video className="w-5 h-5 text-purple-400" />;
            default: return <LinkIcon className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckSquare className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase mb-2">
                        Año {curso.anio} • Division {curso.division}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{curso.nombre}</h1>
                    <p className="text-slate-400 max-w-2xl">{curso.descripcion}</p>

                    {isInstructor && (
                        <div className="mt-6 flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium">
                                <PlusCircle className="w-4 h-4" />
                                Nueva Unidad
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">
                                <UploadCloud className="w-4 h-4" />
                                Gestionar Alumnos
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Units Content */}
            <div className="space-y-6">
                {curso.Unidads && curso.Unidads.map((unidad) => (
                    <div key={unidad.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{unidad.titulo}</h3>
                                {unidad.descripcion && <p className="text-slate-400 text-sm mt-1">{unidad.descripcion}</p>}
                            </div>
                            {isInstructor && (
                                <div className="flex gap-2">
                                    <button title="Subir Material" onClick={() => handleUpload('material')} className="p-2 hover:bg-white/10 rounded-lg text-cyan-400 transition-colors">
                                        <UploadCloud className="w-5 h-5" />
                                    </button>
                                    <button title="Nueva Actividad" onClick={() => handleUpload('actividad')} className="p-2 hover:bg-white/10 rounded-lg text-purple-400 transition-colors">
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Materiales */}
                            {unidad.Materials && unidad.Materials.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Material de Estudio</h4>
                                    {unidad.Materials.map(mat => (
                                        <div key={mat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                {getIcon(mat.tipo)}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-white font-medium group-hover:text-cyan-300 transition-colors">{mat.titulo}</h5>
                                                {mat.descripcion && <p className="text-xs text-slate-500">{mat.descripcion}</p>}
                                            </div>
                                            <button className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-slate-300">
                                                Ver
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actividades */}
                            {unidad.Actividads && unidad.Actividads.length > 0 && (
                                <div className="mt-6 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Actividades y Evaluaciones</h4>
                                    {unidad.Actividads.map(act => (
                                        <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                                <CheckSquare className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-white font-medium">{act.titulo}</h5>
                                                <p className="text-xs text-purple-300/70">
                                                    {act.tipo === 'formulario' ? 'Cuestionario Online' : 'Entrega de Trabajo'}
                                                    {act.fechaEntrega && ` • Vence: ${new Date(act.fechaEntrega).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            {isInstructor ? (
                                                <button className="text-xs px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded">
                                                    Calificar
                                                </button>
                                            ) : (
                                                <button className="text-xs px-3 py-1 bg-purple-500 hover:bg-purple-400 text-white rounded font-medium">
                                                    Realizar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(!unidad.Materials?.length && !unidad.Actividads?.length) && (
                                <div className="text-center py-6 text-slate-500 text-sm italic">
                                    No hay contenido disponible en esta unidad todavía.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseDetail;
