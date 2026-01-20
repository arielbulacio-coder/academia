import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Video, Link as LinkIcon, File, PlusCircle, CheckSquare, UploadCloud, Users, GraduationCap, X, PlayCircle } from 'lucide-react';
import EvaluacionPlayer from '../components/EvaluacionPlayer';

const CourseDetail = ({ user }) => {
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenidos'); // contenidos, alumnos
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // State for enrolling student
    const [enrollEmail, setEnrollEmail] = useState('');

    const [enrollLoading, setEnrollLoading] = useState(false);

    // Exams
    const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
    const [misCalificaciones, setMisCalificaciones] = useState([]);

    const isInstructor = user?.role === 'profesor' || user?.role === 'admin' || user?.role === 'director';

    const getBaseUrl = () => {
        let url = 'http://localhost:3002';
        if (import.meta.env.VITE_API_URL) {
            url = import.meta.env.VITE_API_URL.replace('auth', 'courses');
        }
        return url;
    }

    const fetchCurso = async () => {
        try {
            const res = await fetch(`${getBaseUrl()}/cursos/${id}`);
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

    const fetchCalificaciones = async () => {
        // Fetch grades for logged in student
        // Assuming user.id is available. If using email, need endpoint change or user ID logic.
        // We'll rely on user.id from props
        if (!user || isInstructor) return;

        try {
            const res = await fetch(`${getBaseUrl()}/calificaciones/alumno/${user.id}`);
            if (res.ok) {
                setMisCalificaciones(await res.json());
            }
        } catch (e) { console.error(e) }
    };

    useEffect(() => {
        fetchCurso();
        fetchCalificaciones();
    }, [id, user]);

    const handleEvaluationFinish = (data) => {
        alert(`Examen finalizado. Nota: ${data.nota}/100`);
        fetchCalificaciones(); // Refresh grades
        // Modal stays open showing results until manual close
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        setEnrollLoading(true);
        try {
            const res = await fetch(`${getBaseUrl()}/inscripciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CursoId: id,
                    alumnoEmail: enrollEmail
                })
            });
            if (res.ok) {
                alert('Alumno inscripto correctamente');
                setEnrollEmail('');
                setShowEnrollModal(false);
                fetchCurso(); // Refresh list
            } else {
                alert('Error al inscribir alumno');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEnrollLoading(false);
        }
    };

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            {/* Hero Header */}
            <div className="relative rounded-2xl overflow-hidden mb-8 min-h-[250px] flex items-end">
                <div className="absolute inset-0">
                    <img src={curso.imagen || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>
                <div className="relative z-10 p-8 w-full">
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase mb-2 border border-purple-500/30">
                        Curso
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 shadow-sm">{curso.nombre}</h1>
                    <p className="text-slate-300 max-w-2xl text-lg">{curso.descripcion}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 mb-8 border-b border-white/10 px-4">
                <button
                    onClick={() => setActiveTab('contenidos')}
                    className={`pb-4 px-2 font-medium transition-all relative ${activeTab === 'contenidos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Contenidos
                    {activeTab === 'contenidos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full"></span>}
                </button>
                {isInstructor && (
                    <button
                        onClick={() => setActiveTab('alumnos')}
                        className={`pb-4 px-2 font-medium transition-all relative ${activeTab === 'alumnos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Alumnos e Inscripciones
                        {activeTab === 'alumnos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full"></span>}
                    </button>
                )}
            </div>

            {/* TAB: CONTENIDOS */}
            {activeTab === 'contenidos' && (
                <div className="space-y-6">
                    {/* Instructor Actions */}
                    {isInstructor && (
                        <div className="flex gap-3 mb-6">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20">
                                <PlusCircle className="w-4 h-4" />
                                Nueva Unidad
                            </button>
                        </div>
                    )}

                    {curso.Unidads && curso.Unidads.map((unidad) => (
                        <div key={unidad.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">{unidad.titulo}</h3>
                                    {unidad.descripcion && <p className="text-slate-400 text-sm mt-0.5">{unidad.descripcion}</p>}
                                </div>
                                {isInstructor && (
                                    <div className="flex gap-2">
                                        <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Subir Material"><UploadCloud className="w-4 h-4" /></button>
                                        <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Crear Actividad"><CheckSquare className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 space-y-3">
                                {unidad.Materials?.map(mat => (
                                    <div key={mat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group cursor-pointer">
                                        <div className="p-2 bg-slate-900 rounded-lg border border-white/5">
                                            {getIcon(mat.tipo)}
                                        </div>
                                        <div>
                                            <h5 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">{mat.titulo}</h5>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{mat.tipo}</p>
                                        </div>
                                    </div>
                                ))}
                                {unidad.Actividads?.map(act => (
                                    <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500">
                                        <CheckSquare className="w-5 h-5 text-purple-400 ml-1" />
                                        <div>
                                            <h5 className="text-white font-medium text-sm">{act.titulo}</h5>
                                            <p className="text-xs text-purple-300/60 font-mono mt-0.5">VENCE: {new Date(act.fechaEntrega).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {unidad.Evaluacions?.map(eva => {
                                    const calificacion = misCalificaciones.find(c => c.EvaluacionId === eva.id);
                                    const fueRendido = !!calificacion;

                                    return (
                                        <div key={eva.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${fueRendido ? (calificacion.nota >= 60 ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5') : 'border-purple-500 bg-purple-500/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${fueRendido ? 'bg-slate-800' : 'bg-purple-600'}`}>
                                                    <GraduationCap className={`w-5 h-5 ${fueRendido ? (calificacion.nota >= 60 ? 'text-green-400' : 'text-red-400') : 'text-white'}`} />
                                                </div>
                                                <div>
                                                    <h5 className="text-white font-bold">{eva.titulo}</h5>
                                                    <p className="text-xs text-slate-400">Evaluación Automática • {eva.Pregunta?.length || 0} Preguntas</p>

                                                    {fueRendido && (
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${calificacion.nota >= 60 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                                Nota: {calificacion.nota.toFixed(1)}/100
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">Rendido el {new Date(calificacion.fecha).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                {!isInstructor && !fueRendido && (
                                                    <button
                                                        onClick={() => setSelectedEvaluacion(eva)}
                                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-transform active:scale-95"
                                                    >
                                                        <PlayCircle className="w-4 h-4" /> Comenzar
                                                    </button>
                                                )}
                                                {!isInstructor && fueRendido && (
                                                    <button className="text-slate-500 text-sm font-medium cursor-not-allowed">
                                                        Completado
                                                    </button>
                                                )}
                                                {isInstructor && (
                                                    <div className="flex gap-2">
                                                        <span className="text-xs text-slate-500 self-center mr-2">Visible para alumnos</span>
                                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><FileText className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {!unidad.Materials?.length && !unidad.Actividads?.length && !unidad.Evaluacions?.length && <p className="text-center text-slate-600 italic text-sm py-2">Unidad vacía</p>}
                            </div>
                        </div>
                    ))}
                    {!curso.Unidads?.length && <div className="text-center py-12 text-slate-500">No hay contenido todavía.</div>}

                    {selectedEvaluacion && (
                        <EvaluacionPlayer
                            evaluacion={selectedEvaluacion}
                            alumnoId={user.id}
                            onFinish={handleEvaluationFinish}
                            onClose={() => setSelectedEvaluacion(null)}
                        />
                    )}
                </div>
            )}

            {/* TAB: ALUMNOS */}
            {activeTab === 'alumnos' && isInstructor && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Listado de Alumnos</h3>
                        <button onClick={() => setShowEnrollModal(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Inscribir Alumno
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-white/10 text-xs uppercase text-slate-400 tracking-wider">
                                    <th className="p-4 font-bold">Alumno (Email)</th>
                                    <th className="p-4 font-bold">Fecha Inscripción</th>
                                    <th className="p-4 font-bold">Calificación Final</th>
                                    <th className="p-4 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                {curso.Inscripcions && curso.Inscripcions.map((ins) => (
                                    <tr key={ins.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{ins.alumnoEmail}</td>
                                        <td className="p-4">{new Date(ins.fechaInscripcion).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {ins.calificacionFinal ? (
                                                <span className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/30">
                                                    {ins.calificacionFinal}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-purple-400 hover:text-purple-300 font-medium">Calificar</button>
                                        </td>
                                    </tr>
                                ))}
                                {!curso.Inscripcions?.length && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500">No hay alumnos inscriptos en este curso.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Inscripción */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Inscribir Alumno</h3>
                            <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleEnrollStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email del Alumno</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="alumno@email.com"
                                    value={enrollEmail}
                                    onChange={(e) => setEnrollEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-slate-500 mt-2">El alumno debe estar registrado en la plataforma.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowEnrollModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={enrollLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20">
                                    {enrollLoading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
