import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Video, Link as LinkIcon, File, PlusCircle, CheckSquare, UploadCloud, Users, GraduationCap, X, PlayCircle, Calendar, Sparkles, BrainCircuit } from 'lucide-react';
import EvaluacionPlayer from '../components/EvaluacionPlayer';

const CourseDetail = ({ user }) => {
    const { id } = useParams();
    const [curso, setCurso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenidos'); // contenidos, alumnos
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false); // New state for unit modal
    const [newUnitTitle, setNewUnitTitle] = useState(''); // New state for unit title
    const [creatingUnit, setCreatingUnit] = useState(false);

    // State for enrolling student
    const [enrollEmail, setEnrollEmail] = useState('');

    const [enrollLoading, setEnrollLoading] = useState(false);

    // AI Generation State
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiParams, setAiParams] = useState({
        topic: '',
        pages: 3,
        includeMultipleChoice: true,
        includeFinalExam: false
    });

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

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        setCreatingUnit(true);
        try {
            const res = await fetch(`${getBaseUrl()}/unidades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: newUnitTitle,
                    CursoId: id,
                    orden: (curso.Unidads?.length || 0) + 1
                })
            });
            if (res.ok) {
                setNewUnitTitle('');
                setShowUnitModal(false);
                fetchCurso();
            } else {
                alert('Error creando unidad');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreatingUnit(false);
        }
    };

    const handleGenerateAI = async (e) => {
        e.preventDefault();
        setGeneratingAI(true);
        try {
            const res = await fetch(`${getBaseUrl()}/cursos/${id}/unidades/${selectedUnitId}/generar-material-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiParams)
            });
            if (res.ok) {
                alert('Material generado con éxito!');
                setShowAIModal(false);
                setAiParams({ topic: '', pages: 3, includeMultipleChoice: true, includeFinalExam: false });
                fetchCurso();
            } else {
                alert('Error generando material. Verifique los logs.');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con la IA');
        } finally {
            setGeneratingAI(false);
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Content Column (Left) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* TAB: CONTENIDOS */}
                    {activeTab === 'contenidos' && (
                        <div className="space-y-6">
                            {/* Instructor Actions */}
                            {isInstructor && (
                                <div className="flex gap-3 mb-6">
                                    <button onClick={() => setShowUnitModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20">
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
                                                <button
                                                    onClick={() => { setSelectedUnitId(unidad.id); setShowAIModal(true); }}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-pink-400 hover:text-pink-300 transition-colors"
                                                    title="Generar con IA"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
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
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-6">
                    {/* Calendar Widget for Upcoming Deadlines */}
                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5 shadow-lg lg:sticky lg:top-24">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <Calendar className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-bold text-white text-lg">Próximos Vencimientos</h3>
                        </div>
                        <div className="space-y-3">
                            {(() => {
                                const allActivities = curso.Unidads?.flatMap(u => u.Actividads || []) || [];
                                const upcoming = allActivities
                                    .filter(a => new Date(a.fechaEntrega) >= new Date())
                                    .sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega))
                                    .slice(0, 3);

                                if (upcoming.length === 0) return <p className="text-slate-500 text-sm italic py-2">No hay entregas próximas.</p>;

                                return upcoming.map(act => (
                                    <div key={act.id} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-white/5 transition-colors hover:bg-slate-900">
                                        <div className="bg-purple-500/10 p-2 rounded text-center min-w-[50px]">
                                            <p className="text-xs font-bold text-purple-400 uppercase">{new Date(act.fechaEntrega).toLocaleString('default', { month: 'short' }).slice(0, 3)}</p>
                                            <p className="text-xl font-bold text-white leading-none">{new Date(act.fechaEntrega).getDate()}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium text-sm line-clamp-1" title={act.titulo}>{act.titulo}</p>
                                            <p className="text-xs text-slate-400">Vence en {Math.ceil((new Date(act.fechaEntrega) - new Date()) / (1000 * 60 * 60 * 24))} días</p>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 text-center">
                            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors">
                                Ver Calendario Completo
                            </button>
                        </div>
                    </div>

                    {isInstructor && (
                        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5 shadow-lg">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Estadísticas</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Alumnos Inscriptos</span>
                                    <span className="text-white font-bold">{curso.Inscripcions?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Total Unidades</span>
                                    <span className="text-white font-bold">{curso.Unidads?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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

            {/* Modal Nueva Unidad */}
            {showUnitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Nueva Unidad</h3>
                            <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateUnit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Título de la Unidad</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Unidad 1: Introducción"
                                    value={newUnitTitle}
                                    onChange={(e) => setNewUnitTitle(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowUnitModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={creatingUnit} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20">
                                    {creatingUnit ? 'Creando...' : 'Crear Unidad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Generación IA */}
            {showAIModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-600/20 rounded-lg">
                                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Generar Contenido IA</h3>
                                    <p className="text-xs text-slate-400">Powered by Gemini</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleGenerateAI} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Tema del Material</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Introducción a la Inteligencia Artificial"
                                    value={aiParams.topic}
                                    onChange={(e) => setAiParams({ ...aiParams, topic: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Cantidad de Hojas (Aprox)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={aiParams.pages}
                                        onChange={(e) => setAiParams({ ...aiParams, pages: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-white font-bold w-8 text-center">{aiParams.pages}</span>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aiParams.includeMultipleChoice}
                                        onChange={(e) => setAiParams({ ...aiParams, includeMultipleChoice: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-600 bg-slate-700"
                                    />
                                    <span className="text-sm text-slate-300">Incluir Evaluación Parcial (Multiple Choice)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aiParams.includeFinalExam}
                                        onChange={(e) => setAiParams({ ...aiParams, includeFinalExam: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-600 bg-slate-700"
                                    />
                                    <span className="text-sm text-slate-300">Incluir Examen Final</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
                                <button type="button" onClick={() => setShowAIModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={generatingAI}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20 flex items-center gap-2"
                                >
                                    {generatingAI ? (
                                        <>
                                            <Sparkles className="w-4 h-4 animate-spin" /> Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" /> Generar Material
                                        </>
                                    )}
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
