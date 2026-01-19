import { useState, useEffect } from 'react';
import { Bot, Save, FileText, Send, Calendar, MessageSquare, Edit3, Eye } from 'lucide-react';

const Planificador = ({ user }) => {
    const [view, setView] = useState('list'); // list, create, edit
    const [planes, setPlanes] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // Formulario Generación
    const [formData, setFormData] = useState({
        apiKey: '', temario: '', horasTotales: '', horasSemanales: '', dias: '', fechaInicio: '', fechaFin: '', extras: ''
    });

    // Editor / Visualizador
    const [editorContent, setEditorContent] = useState('');
    const [commentText, setCommentText] = useState('');
    const [archivo, setArchivo] = useState(null);

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
            let fileData = null;
            if (archivo) {
                const base64Str = await fileToBase64(archivo);
                // Remove prefix "data:application/pdf;base64,"
                const base64Content = base64Str.split(',')[1];
                fileData = {
                    mimeType: archivo.type,
                    data: base64Content
                };
            }

            const payload = { ...formData, archivoFormato: fileData };

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

    // VISTAS
    if (view === 'list') {
        return (
            <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Planificaciones</h2>
                        <p className="text-slate-400">Gestión de Diseños Curriculares</p>
                    </div>
                    <button onClick={() => { setView('create'); setFormData({ ...formData, temario: '' }); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <Bot className="w-5 h-5" /> Nueva con IA
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planes.map(p => (
                        <div key={p.id} onClick={() => { setSelectedPlan(p); setEditorContent(p.contenido); setView('edit'); }} className="bg-slate-800 border border-white/10 p-5 rounded-xl hover:border-purple-500 cursor-pointer transition-all group">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300">{p.titulo}</h3>
                            <p className="text-sm text-slate-400 mb-4">Prof. {p.profesorNombre}</p>
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.comentarios?.length > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {p.comentarios?.length > 0 ? 'Con Observaciones' : 'Borrador'}
                                </span>
                                <Edit3 className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            </div>
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
                        <input className="bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Horas Totales" name="horasTotales" value={formData.horasTotales} onChange={(e) => setFormData({ ...formData, horasTotales: e.target.value })} />
                        <input className="bg-slate-900 border border-white/10 p-3 rounded text-white" placeholder="Clave API Gemini" name="apiKey" type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} required />

                        <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-dashed border-white/20 mt-4">
                            <label className="block text-purple-400 text-xs font-bold uppercase mb-2">
                                Subir Archivo de Formato / Diseño Curricular (PDF/IMG)
                            </label>
                            <input
                                type="file"
                                accept="application/pdf, image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-2">
                                Si subes un archivo, la IA intentará seguir estrictamente su estructura y contenido.
                            </p>
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

    if (view === 'edit') {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <button onClick={() => setView('list')} className="text-slate-400 hover:text-white text-sm mb-1">← Volver al listado</button>
                        <h2 className="text-2xl font-bold text-white">{selectedPlan.titulo}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">PDF</button>
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20">
                            <Save className="w-5 h-5" /> Guardar Cambios
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* EDITOR */}
                    <div className="lg:col-span-2 bg-slate-900 border border-white/10 p-4 rounded-xl min-h-[500px]">
                        <textarea
                            className="w-full h-full bg-transparent text-white font-mono text-sm leading-relaxed outline-none resize-none"
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                        ></textarea>
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
            </div>
        );
    }
};

export default Planificador;
