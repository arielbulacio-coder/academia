import { useState, useEffect } from 'react';
import { Bot, Save, FileText, Send, Calendar, MessageSquare, Edit3, Eye, Trash2, UploadCloud, RefreshCw, Sparkles } from 'lucide-react';
import CursoModal from '../components/CursoModal';

const Planificador = ({ user }) => {
    const [view, setView] = useState('list'); // list, create, edit
    const [planes, setPlanes] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // Formulario Generación
    const [formData, setFormData] = useState({
        apiKey: '', temario: '', horasTotales: '', horasSemanales: '', dias: '', fechaInicio: '', fechaFin: '', extras: ''
    });
    const [fileType, setFileType] = useState('diseno'); // 'diseno' (contenido) or 'formato' (estructura)

    // Editor / Visualizador
    const [editorContent, setEditorContent] = useState('');
    const [commentText, setCommentText] = useState('');

    // Archivos
    const [fileDiseno, setFileDiseno] = useState(null);
    const [fileFormato, setFileFormato] = useState(null);

    // Modal Crear Curso desde Plan
    const [isCursoModalOpen, setIsCursoModalOpen] = useState(false);

    const isDirectivo = ['director', 'vicedirector', 'regente'].includes(user.role);

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = (e) => {
        setArchivo(e.target.files[0]);
    };

    useEffect(() => {
        if (view === 'list') fetchPlanes();
    }, [view]);

    const fetchPlanes = async () => {
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';
        try {
            const res = await fetch(`${apiUrl}/planificaciones?email=${user.email}&role=${user.role}&EscuelaId=${user.EscuelaId}`);
            if (res.ok) setPlanes(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';

        try {
            const payload = { ...formData, profesorNombre: user.name };

            // Procesar Diseño Curricular
            if (fileDiseno) {
                const base64Str = await fileToBase64(fileDiseno);
                payload.archivoDiseno = {
                    mimeType: fileDiseno.type,
                    data: base64Str.split(',')[1]
                };
            }

            // Procesar Formato (solo si no es ABP)
            if (fileFormato && !formData.usarFormatoABP) {
                const base64Str = await fileToBase64(fileFormato);
                payload.archivoFormato = {
                    mimeType: fileFormato.type,
                    data: base64Str.split(',')[1]
                };
            }

            const res = await fetch(`${apiUrl}/planificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setEditorContent(data.planificacion);
                setSelectedPlan({ titulo: formData.temario, isNew: true });
                setView('edit');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) { alert('Error de conexión o archivo muy grande'); }
        setLoading(false);
    };

    const handleSave = async () => {
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';
        const payload = {
            titulo: selectedPlan.titulo,
            contenido: editorContent,
            profesorEmail: user.email,
            profesorNombre: user.name,
            EscuelaId: user.EscuelaId
        };

        // Si ya existe (no es isNew), hacemos PUT, sino POST
        if (selectedPlan.id) {
            await fetch(`${apiUrl}/planificaciones/${selectedPlan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: editorContent })
            });
        } else {
            await fetch(`${apiUrl}/planificaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        setView('list');
    };

    const handleAddComment = async () => {
        if (!commentText) return;
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';

        await fetch(`${apiUrl}/planificaciones/${selectedPlan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nuevoComentario: {
                    autor: user.name,
                    texto: commentText,
                    fecha: new Date().toISOString()
                }
            })
        });
        setCommentText('');
        // Refresh local state logic would go here ideally
        alert('Comentario agregado');
        setView('list');
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar planificación?')) return;
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';
        await fetch(`${apiUrl}/planificaciones/${id}`, { method: 'DELETE' });
        fetchPlanes();
    };

    const handleCreateCourseFromPlan = async () => {
        setIsCursoModalOpen(true);
    };

    const handleCourseCreated = async (newCourseId) => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';
        try {
            // Trigger AI Content Generation
            const res = await fetch(`${apiUrl}/cursos/${newCourseId}/generar-contenido`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planificacionTexto: editorContent
                    // apiKey can be optional if relying on env backend side, or passed if user provided one in session
                })
            });

            if (res.ok) {
                alert('Aula Virtual generada y contenido creado exitosamente basado en esta planificación.');
                setIsCursoModalOpen(false);
            } else {
                alert('El curso se creó, pero hubo un error generando el contenido automático.');
            }

        } catch (e) {
            console.error(e);
            alert('Error generando contenido del aula');
        } finally {
            setLoading(false);
        }
    };

    // VISTAS
    if (view === 'list') {
        return (
            <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Planificaciones</h2>
                        <p className="text-slate-400">Gestión de Diseños Curriculares</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setView('create'); setFormData({ ...formData, temario: '' }); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Bot className="w-5 h-5" /> Nueva con IA
                        </button>
                        <button onClick={() => { setView('upload_manual'); }} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <UploadCloud className="w-5 h-5" /> Subir
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planes.map(p => (
                        <div key={p.id} onClick={() => { setSelectedPlan(p); setEditorContent(p.contenido); setView('edit'); }} className="bg-slate-800 border border-white/10 p-5 rounded-xl hover:border-purple-500 cursor-pointer transition-all group relative">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 pr-6">{p.titulo}</h3>
                            <p className="text-sm text-slate-400 mb-4">Prof. {p.profesorNombre}</p>

                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.comentarios?.length > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {p.comentarios?.length > 0 ? 'Con Observaciones' : 'Borrador'}
                                </span>
                                <Edit3 className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            </div>

                            {!isDirectivo && (
                                <button
                                    onClick={(e) => handleDelete(e, p.id)}
                                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-500/20 text-slate-600 hover:text-red-500 transition-colors z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {planes.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No hay planificaciones guardadas.</p>}
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Bot className="text-purple-400" /> Generar Nueva Planificación</h2>

                <form onSubmit={handleGenerate} className="space-y-4 bg-slate-800 p-6 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="col-span-2 bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Título / Temario (Ej: Curso de React)" name="temario" value={formData.temario} onChange={(e) => setFormData({ ...formData, temario: e.target.value })} required />

                        {/* Nuevos Campos Solicitados */}
                        <div className="col-span-1">
                            <label className="text-xs text-slate-400 mb-1 block">Fecha Inicio</label>
                            <input type="date" className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white" name="fechaInicio" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-xs text-slate-400 mb-1 block">Fecha Finalización</label>
                            <input type="date" className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white" name="fechaFin" value={formData.fechaFin} onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })} />
                        </div>

                        <input className="bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Horas Cátedra Semanales (Ej: 4)" name="horasSemanales" value={formData.horasSemanales} onChange={(e) => setFormData({ ...formData, horasSemanales: e.target.value })} />
                        <input className="bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Días y Horarios (Ej: Mar y Jue 18-20hs)" name="dias" value={formData.dias} onChange={(e) => setFormData({ ...formData, dias: e.target.value })} />

                        <input className="col-span-2 bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Horas Totales del Curso (Ej: 80)" name="horasTotales" value={formData.horasTotales} onChange={(e) => setFormData({ ...formData, horasTotales: e.target.value })} />

                        <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-dashed border-white/20 mt-4 space-y-4">

                            {/* Input 1: Diseño Curricular */}
                            <div>
                                <label className="block text-purple-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Cargar Diseño Curricular (PDF/IMG con Contenidos)
                                </label>
                                <input
                                    type="file"
                                    accept="application/pdf, image/*"
                                    onChange={(e) => setFileDiseno(e.target.files[0])}
                                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Sube aquí el programa o diseño curricular. La IA extraerá los temas y unidades de este archivo.
                                </p>
                            </div>

                            {/* Input 2: Formato Manual (Opcional) */}
                            {!formData.usarFormatoABP && (
                                <div className="pt-4 border-t border-white/10">
                                    <label className="block text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Cargar Formato Visual (Opcional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="application/pdf, image/*"
                                        onChange={(e) => setFileFormato(e.target.files[0])}
                                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Si tienes una plantilla visual específica diferente al ABP.
                                    </p>
                                </div>
                            )}

                            {/* Opción Template ABP */}
                            <div className="pt-4 border-t border-white/10">
                                <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.usarFormatoABP || false}
                                        onChange={(e) => setFormData({ ...formData, usarFormatoABP: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 bg-slate-800 border-slate-600"
                                    />
                                    Usar Formato Institucional (ABP)
                                </label>
                                <p className="text-[10px] text-slate-500 ml-6 mt-1">
                                    Se utilizará el formato PDF oficial cargado en el sistema para estructurar la respuesta. (Recomendado).
                                </p>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-slate-400 mb-1 block">Indicaciones Adicionales (Opcional - Prompt Extra)</label>
                            <textarea
                                className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white text-sm"
                                placeholder="Escribe aquí cualquier instrucción específica para la IA..."
                                rows="3"
                                value={formData.extras}
                                onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                    <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded flex justify-center items-center gap-2">
                        {loading ? 'Generando...' : 'Crear Planificación'}
                    </button>
                    <button type="button" onClick={() => setView('list')} className="text-slate-400 text-sm hover:text-white w-full text-center">Cancelar</button>
                </form>
            </div>
        );
    }

    if (view === 'upload_manual') {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><UploadCloud className="text-blue-400" /> Subir Planificación Existente</h2>
                <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div>
                        <label className="block text-slate-300 mb-2">Título del Curso</label>
                        <input className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white" value={formData.temario} onChange={(e) => setFormData({ ...formData, temario: e.target.value })} placeholder="Ej: Matemática 1" />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2">Contenido (Pegar texto o Markdown)</label>
                        <textarea
                            className="w-full h-96 bg-slate-900 border border-white/10 p-3 rounded text-white font-mono text-sm"
                            placeholder="# Planificación..."
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                        ></textarea>
                    </div>
                    <button onClick={() => { setSelectedPlan({ titulo: formData.temario, isNew: true }); handleSave(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded">
                        Guardar Planificación
                    </button>
                    <button type="button" onClick={() => setView('list')} className="text-slate-400 text-sm hover:text-white w-full text-center">Cancelar</button>
                </div>
            </div>
        )
    }

    if (view === 'edit') {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <button onClick={() => setView('list')} className="text-slate-400 hover:text-white text-sm mb-1">← Volver al listado</button>
                        <h2 className="text-2xl font-bold text-white">{selectedPlan.titulo}</h2>
                    </div>
                    <div className="flex gap-2">
                        {!isDirectivo && (
                            <button
                                onClick={handleCreateCourseFromPlan}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 animate-pulse-slow"
                            >
                                <Sparkles className="w-5 h-5" /> Crear Aula con IA
                            </button>
                        )}
                        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">PDF</button>
                        {!isDirectivo && (
                            <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20">
                                <Save className="w-5 h-5" /> Guardar Cambios
                            </button>
                        )}
                    </div>
                </div>

                <CursoModal
                    isOpen={isCursoModalOpen}
                    onClose={() => setIsCursoModalOpen(false)}
                    onSuccess={() => { /* Handled manually via prop injection if we mod CursoModal or we fetch list */ }}
                    onCourseCreated={handleCourseCreated}
                    user={user}
                    initialData={{ nombre: selectedPlan.titulo, descripcion: `Curso basado en planificación: ${selectedPlan.titulo}` }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* EDITOR */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-900 border border-white/10 p-4 rounded-xl min-h-[500px]">
                            <textarea
                                disabled={isDirectivo}
                                className={`w-full h-full bg-transparent text-white font-mono text-sm leading-relaxed outline-none resize-none ${isDirectivo ? 'opacity-70 cursor-not-allowed' : ''}`}
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                            ></textarea>
                        </div>

                        {!isDirectivo && (
                            <div className="bg-slate-800 border-white/10 p-4 rounded-xl flex gap-4 items-center">
                                <Bot className="text-purple-400 w-6 h-6" />
                                <input
                                    className="flex-1 bg-slate-900 border border-white/10 p-2 rounded text-white text-sm"
                                    placeholder="Ej: Reescribir la fundamentación más formal..."
                                    id="refinePrompt"
                                />
                                <button
                                    onClick={async () => {
                                        const prompt = document.getElementById('refinePrompt').value;
                                        if (!prompt) return;
                                        setLoading(true);
                                        try {
                                            const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';
                                            const res = await fetch(`${apiUrl}/refinar`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ contenido: editorContent, instruccion: prompt })
                                            });
                                            const data = await res.json();
                                            if (res.ok) setEditorContent(data.contenido);
                                            else alert('Error al refinar');
                                        } catch (e) { console.error(e); }
                                        setLoading(false);
                                    }}
                                    disabled={loading}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refinar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* COMENTARIOS */}
                    <div className="space-y-4">
                        <div className="bg-slate-800 border border-white/10 p-4 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Observaciones</h3>

                            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                {selectedPlan.comentarios && selectedPlan.comentarios.map((c, idx) => (
                                    <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-white/5">
                                        <p className="text-xs font-bold text-purple-400">{c.autor}</p>
                                        <p className="text-sm text-slate-300 mt-1">{c.texto}</p>
                                        <p className="text-[10px] text-slate-600 mt-2 text-right">{new Date(c.fecha).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {(!selectedPlan.comentarios || selectedPlan.comentarios.length === 0) && <p className="text-slate-500 text-sm italic">Sin comentarios aún.</p>}
                            </div>

                            {isDirectivo && (
                                <div className="pt-4 border-t border-white/10">
                                    <textarea
                                        className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white text-sm"
                                        placeholder="Escribir observación..."
                                        rows="3"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    ></textarea>
                                    <button onClick={handleAddComment} className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs uppercase">
                                        Agregar Nota
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        );
    }
};

export default Planificador;
