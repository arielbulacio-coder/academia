import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { getApiUrl } from '../utils/api';

const CursoModal = ({ isOpen, onClose, onSuccess, user, onCourseCreated, initialData }) => {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        imagen: initialData?.imagen || '',
        duracion_horas: initialData?.duracion_horas || '',
        modalidad: initialData?.modalidad || 'presencial',
        profesorId: initialData?.profesorId || ''
    });
    const [loading, setLoading] = useState(false);
    const [profesores, setProfesores] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchProfesores();
            if (initialData) {
                setFormData({
                    nombre: initialData.nombre || '',
                    descripcion: initialData.descripcion || '',
                    imagen: initialData.imagen || '',
                    duracion_horas: initialData.duracion_horas || '',
                    modalidad: initialData.modalidad || 'presencial',
                    profesorId: initialData.profesorId || ''
                });
            } else {
                setFormData({
                    nombre: '',
                    descripcion: '',
                    imagen: '',
                    duracion_horas: '',
                    modalidad: 'presencial',
                    profesorId: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchProfesores = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        let url = getApiUrl('auth');
        // endpoint is /users?role=profesor&EscuelaId=... but let's just get all professors for this school
        // If director, they have an EscuelaId.
        try {
            const res = await fetch(`${url}/users?role=profesor`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfesores(data);
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let url = getApiUrl('courses') + '/cursos';

        const method = initialData?.id ? 'PUT' : 'POST';
        if (initialData?.id) {
            url += `/${initialData.id}`;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    duracion_horas: parseInt(formData.duracion_horas) || 0,
                    EscuelaId: user?.EscuelaId
                })
            });

            if (res.ok) {
                const data = await res.json();

                if (onCourseCreated && !initialData?.id) {
                    onCourseCreated(data.id);
                } else {
                    onSuccess();
                }

                onClose();
                setFormData({
                    nombre: '',
                    descripcion: '',
                    imagen: '',
                    duracion_horas: '',
                    modalidad: 'presencial'
                });
            } else {
                const error = await res.json();
                alert('Error: ' + (error.error || 'No se pudo crear el curso'));
            }
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Error de conexión al crear el curso');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{initialData ? 'Editar Curso' : 'Nuevo Curso'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nombre del Curso *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Ej: Técnico en Programación"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Descripción *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                            placeholder="Descripción del curso..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Duración (horas)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.duracion_horas}
                                onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Modalidad
                            </label>
                            <select
                                value={formData.modalidad}
                                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Virtual</option>
                                <option value="hibrida">Híbrida</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Asignar Profesor
                        </label>
                        <select
                            value={formData.profesorId || ''}
                            onChange={(e) => setFormData({ ...formData, profesorId: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                            <option value="">Seleccionar Profesor...</option>
                            {profesores.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            URL de Imagen (opcional)
                        </label>
                        <input
                            type="url"
                            value={formData.imagen}
                            onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {formData.imagen && (
                            <img
                                src={formData.imagen}
                                alt="Preview"
                                className="mt-3 w-full h-32 object-cover rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Curso')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CursoModal;
