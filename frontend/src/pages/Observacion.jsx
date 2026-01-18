import { useState } from 'react';
import { Save, FileCheck, Send } from 'lucide-react';

const Observacion = ({ user }) => {
    const [formData, setFormData] = useState({
        profesorNombre: '',
        materiaValidada: '',
        comentarios: '',
        itemsEvaluacion: {
            puntualidad: 3,
            planificacion: 3,
            dominio_grupo: 3,
            uso_recursos: 3,
            clima_aulico: 3
        }
    });

    const handleRatingChange = (category, value) => {
        setFormData(prev => ({
            ...prev,
            itemsEvaluacion: { ...prev.itemsEvaluacion, [category]: parseInt(value) }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            directorEmail: user.email,
            EscuelaId: user.EscuelaId,
            ...formData
        };

        let url = 'http://localhost:3002/observaciones';
        if (import.meta.env.VITE_API_URL) {
            url = import.meta.env.VITE_API_URL.replace('auth', 'courses') + '/observaciones';
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Observación guardada correctamente');
                // Could redirect or generate PDF here
            } else {
                alert('Error al guardar datos');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-cyan-400" />
                    Observación de Clases
                </h2>
                <p className="text-slate-400">Herramienta para el equipo directivo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Generales */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2">Datos de la Clase</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Docente Observado</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white"
                                value={formData.profesorNombre}
                                onChange={e => setFormData({ ...formData, profesorNombre: e.target.value })}
                                placeholder="Nombre del Profesor/Instructor"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Espacio Curricular / Curso</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white"
                                value={formData.materiaValidada}
                                onChange={e => setFormData({ ...formData, materiaValidada: e.target.value })}
                                placeholder="Ej: Electrónica Digital"
                            />
                        </div>
                    </div>
                </div>

                {/* Rubrica */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2">Rúbrica de Evaluación</h3>
                    <p className="text-sm text-slate-500 mb-4">Califique del 1 (Bajo) al 5 (Excelente)</p>

                    <div className="space-y-4">
                        {[
                            { key: 'puntualidad', label: 'Puntualidad y Asistencia' },
                            { key: 'planificacion', label: 'Planificación de la Clase' },
                            { key: 'dominio_grupo', label: 'Dominio de Grupo' },
                            { key: 'uso_recursos', label: 'Uso de Recursos Didácticos' },
                            { key: 'clima_aulico', label: 'Clima Áulico' }
                        ].map((item) => (
                            <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-slate-900/30 rounded-lg">
                                <span className="text-slate-300 font-medium">{item.label}</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleRatingChange(item.key, val)}
                                            className={`w-10 h-10 rounded-full font-bold transition-all ${formData.itemsEvaluacion[item.key] === val
                                                    ? 'bg-purple-600 text-white scale-110 shadow-lg shadow-purple-900/50'
                                                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comentarios */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2">Observaciones Cualitativas</h3>
                    <textarea
                        className="w-full h-32 bg-slate-900 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="Comentarios adicionales, fortalezas observadas, sugerencias..."
                        value={formData.comentarios}
                        onChange={e => setFormData({ ...formData, comentarios: e.target.value })}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2">
                        <Send className="w-5 h-5" /> Generar PDF (WhatsApp)
                    </button>
                    <button type="submit" className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20">
                        <Save className="w-5 h-5" /> Guardar Observación
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Observacion;
