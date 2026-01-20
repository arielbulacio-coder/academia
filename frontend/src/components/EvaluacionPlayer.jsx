import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';

const EvaluacionPlayer = ({ evaluacion, alumnoId, onFinish, onClose }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectOption = (preguntaId, opcionId) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [preguntaId]: opcionId }));
    };

    const handleSubmit = async () => {
        // Validation: Verify all questions are answered
        const unanswered = evaluacion.Pregunta.filter(p => !answers[p.id]);
        if (unanswered.length > 0) {
            if (!confirm(`Hay ${unanswered.length} preguntas sin responder. ¿Entregar igual?`)) return;
        }

        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('auth', 'courses') : 'http://localhost:3002';

        try {
            const res = await fetch(`${apiUrl}/evaluaciones/${evaluacion.id}/entregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alumnoId: alumnoId,
                    respuestas: answers
                })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setSubmitted(true);
                if (onFinish) onFinish(data);
            } else {
                alert("Error al entregar evaluación");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (submitted && result) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in zoom-in-95">
                <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 mb-4 ring-4 ring-purple-500/20">
                            <Trophy className="w-10 h-10 text-purple-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Resultados</h2>
                        <p className="text-slate-400">Has completado: {evaluacion.titulo}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                            <p className="text-xs text-slate-400 uppercase">Nota Final</p>
                            <p className={`text-3xl font-bold ${result.nota >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.nota.toFixed(1)}/100
                            </p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                            <p className="text-xs text-slate-400 uppercase">Puntos</p>
                            <p className="text-2xl font-bold text-white">{result.puntajeObtenido} / {result.puntajeTotal}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                            <p className="text-xs text-slate-400 uppercase">Estado</p>
                            <p className="text-xl font-bold text-white">{result.nota >= 60 ? 'Aprobado' : 'No Aprobado'}</p>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Revisión</h3>
                        {evaluacion.Pregunta.map((preg) => {
                            const detalle = result.detalle.find(d => d.preguntaId === preg.id);
                            const esCorrecta = detalle?.esCorrecta;

                            return (
                                <div key={preg.id} className={`p-4 rounded-xl border ${esCorrecta ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                    <div className="flex gap-3">
                                        {esCorrecta ? <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                                        <div>
                                            <p className="text-white font-medium mb-3">{preg.enunciado}</p>
                                            <div className="space-y-2">
                                                {preg.Opcions.map(op => {
                                                    const fueSeleccionada = answers[preg.id] == op.id;
                                                    const esLaCorrecta = op.esCorrecta;

                                                    let className = "p-3 rounded-lg text-sm border ";
                                                    if (esLaCorrecta) className += "border-green-500 bg-green-900/20 text-green-200";
                                                    else if (fueSeleccionada && !esLaCorrecta) className += "border-red-500 bg-red-900/20 text-red-200";
                                                    else className += "border-white/5 bg-slate-800 text-slate-400 opacity-70";

                                                    return (
                                                        <div key={op.id} className={className}>
                                                            {op.texto} {esLaCorrecta && "(Correcta)"} {fueSeleccionada && "(Tu respuesta)"}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">
                        Cerrar y Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{evaluacion.titulo}</h2>
                        <p className="text-slate-400 text-sm mt-1">{evaluacion.descripcion || "Evaluación de la unidad"}</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-purple-500/30">
                            {evaluacion.Pregunta.length} Preguntas
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {evaluacion.Pregunta.map((preg, idx) => (
                        <div key={preg.id} className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold font-mono">
                                    {idx + 1}
                                </span>
                                <div className="flex-1 space-y-4">
                                    <p className="text-lg text-white font-medium leading-relaxed">{preg.enunciado}</p>

                                    <div className="space-y-2 pl-2">
                                        {preg.Opcions.map(op => (
                                            <label
                                                key={op.id}
                                                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${answers[preg.id] === op.id ? 'bg-purple-600/20 border-purple-500 shadow-purple-900/20 shadow-sm' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`preg_${preg.id}`}
                                                    className="w-5 h-5 text-purple-600 focus:ring-purple-600 bg-slate-700 border-gray-600"
                                                    checked={answers[preg.id] === op.id}
                                                    onChange={() => handleSelectOption(preg.id, op.id)}
                                                />
                                                <span className={`ml-3 text-sm ${answers[preg.id] === op.id ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                    {op.texto}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-slate-800/50 rounded-b-2xl flex justify-end gap-4">
                    <button onClick={onClose} disabled={loading} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        {loading ? 'Enviando...' : 'Entregar Evaluación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionPlayer;
