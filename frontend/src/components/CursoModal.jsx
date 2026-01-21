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
                            Imagen de Portada
                        </label>

                        <div className="space-y-3">
                            {/* File Upload */}
                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800 hover:border-purple-500 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                        <p className="text-xs text-slate-400 group-hover:text-white">Click para subir imagen (PNG, JPG)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, imagen: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* URL Input Fallback */}
                            <div>
                                <input
                                    type="url"
                                    value={formData.imagen.startsWith('data:') ? '' : formData.imagen}
                                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-xs"
                                    placeholder="O pegar URL de imagen externa..."
                                />
                            </div>

                            {/* Preview */}
                            {formData.imagen && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 group">
                                    <img
                                        src={formData.imagen}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imagen: '' })}
                                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
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
