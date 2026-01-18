import { useState, useEffect } from 'react';
import { Save, FileText, CheckSquare, Users, Calendar, Eye, School } from 'lucide-react';

const Observacion = ({ user }) => {
    // Si es inspector/admin ve el LISTADO GLOBAL primero.
    // Si es Director, ve el LISTADO DE SU ESCUELA.
    // Botón "Nueva Observación".

    const [view, setView] = useState('list'); // list, create, detail
    const [obsList, setObsList] = useState([]);
    const [selectedObs, setSelectedObs] = useState(null);

    // Listas dinámicas
    const [profesores, setProfesores] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);

    const [formData, setFormData] = useState({
        profesorNombre: '',
        materiaValidada: '',
        fecha: new Date().toISOString().split('T')[0],
        cantidadAlumnos: '',
        metodologiaABP: false,
        comentarios: '',
        itemsEvaluacion: {
            planificacion: 3,
            dominioGrupo: 3,
            usoRecursos: 3,
            climaAulico: 3
        }
    });

    const isInspector = user.role === 'inspector' || user.role === 'admin';
    const canCreate = ['director', 'vicedirector', 'regente', 'inspector', 'admin'].includes(user.role);

    useEffect(() => {
        if (view === 'list') fetchObservaciones();
        if (view === 'create') loadResources();
    }, [view, user.role, user.EscuelaId]);

    const fetchObservaciones = async () => {
        const apiUrl = 'http://courses.149.50.130.160.nip.io';
        // Construir query
        let query = `role=${user.role}`;
        if (user.EscuelaId) query += `&EscuelaId=${user.EscuelaId}`;

        try {
            const res = await fetch(`${apiUrl}/observaciones?${query}`);
            if (res.ok) setObsList(await res.json());
        } catch (e) { console.error(e); }
    };

    const loadResources = async () => {
        if (loadingResources) return;
        setLoadingResources(true);
        const token = localStorage.getItem('token');
        const authUrl = 'http://auth.149.50.130.160.nip.io';
        const coursesUrl = 'http://courses.149.50.130.160.nip.io';

        try {
            // Cargar Profesores (Role Profesor + Auth Token)
            let userQuery = `role=profesor`;
            if (user.EscuelaId) userQuery += `&EscuelaId=${user.EscuelaId}`;

            const resProf = await fetch(`${authUrl}/users?${userQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resProf.ok) {
                const users = await resProf.json();
                setProfesores(users);
            }

            // Cargar Cursos (Materias)
            let courseQuery = '';
            if (user.EscuelaId) courseQuery += `?EscuelaId=${user.EscuelaId}`;
            const resCourses = await fetch(`${coursesUrl}/cursos${courseQuery}`);
            if (resCourses.ok) {
                const crs = await resCourses.json();
                setCursos(crs);
            }

        } catch (e) { console.error("Error cargando recursos", e); }
        setLoadingResources(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = 'http://courses.149.50.130.160.nip.io';

        const payload = {
            ...formData,
            cantidadAlumnos: parseInt(formData.cantidadAlumnos) || 0, // Asegurar número
            directorEmail: user.email,
            EscuelaId: user.EscuelaId
        };

        await fetch(`${apiUrl}/observaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        alert('Observación registrada');
        setView('list');
        setFormData({ ...formData, profesorNombre: '', materiaValidada: '', comentarios: '', cantidadAlumnos: '', metodologiaABP: false });
    };

    const handleRatingChange = (key, value) => {
        setFormData({
            ...formData,
            itemsEvaluacion: { ...formData.itemsEvaluacion, [key]: parseInt(value) }
        });
    };

    // --- VISTAS ---

    if (view === 'list') {
        return (
            <div className="max-w-6xl mx-auto animate-in fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Observación de Clases</h2>
                        <p className="text-slate-400">
                            {isInspector ? 'Supervisión Global (Todas las Escuelas)' : `Registros de Escuela #${user.EscuelaId}`}
                        </p>
                    </div>
                    {canCreate && (
                        <button onClick={() => setView('create')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Nueva Observación
                        </button>
                    )}
                </div>

                <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900/50 uppercase text-xs text-slate-500">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Profesor</th>
                                <th className="p-4">Materia</th>
                                <th className="p-4">Alumnos</th>
                                <th className="p-4">ABP</th>
                                {isInspector && <th className="p-4">Escuela ID</th>}
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {obsList.map(obs => (
                                <tr key={obs.id} className="hover:bg-white/5">
                                    <td className="p-4">{new Date(obs.fecha).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-white">{obs.profesorNombre}</td>
                                    <td className="p-4">{obs.materiaValidada}</td>
                                    <td className="p-4">{obs.cantidadAlumnos}</td>
                                    <td className="p-4">
                                        {obs.metodologiaABP
                                            ? <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">SÍ</span>
                                            : <span className="text-slate-600 text-xs">NO</span>}
                                    </td>
                                    {isInspector && <td className="p-4 text-xs">#{obs.EscuelaId}</td>}
                                    <td className="p-4">
                                        <button onClick={() => { setSelectedObs(obs); setView('detail'); }} className="p-2 bg-slate-700 rounded hover:bg-purple-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {obsList.length === 0 && (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No hay observaciones registradas.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="max-w-2xl mx-auto animate-in fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white flex gap-2 items-center"><CheckSquare className="text-cyan-400" /> Nueva Observación Áulica</h2>

                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Profesor</label>
                            <select
                                required
                                className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white"
                                value={formData.profesorNombre}
                                onChange={e => setFormData({ ...formData, profesorNombre: e.target.value })}
                            >
                                <option value="">Seleccionar Profesor</option>
                                {profesores.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Materia / Curso</label>
                            <select
                                required
                                className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white"
                                value={formData.materiaValidada}
                                onChange={e => setFormData({ ...formData, materiaValidada: e.target.value })}
                            >
                                <option value="">Seleccionar Materia</option>
                                {cursos.map(c => (
                                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Fecha</label>
                            <input type="date" required className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Cant. Alumnos</label>
                            <input type="number" required min="0" className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white" value={formData.cantidadAlumnos} onChange={e => setFormData({ ...formData, cantidadAlumnos: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                        <input
                            type="checkbox"
                            id="abp"
                            className="w-5 h-5 accent-cyan-500"
                            checked={formData.metodologiaABP}
                            onChange={e => setFormData({ ...formData, metodologiaABP: e.target.checked })}
                        />
                        <label htmlFor="abp" className="text-white font-bold cursor-pointer">Aplica Metodología ABP (Aprendizaje Basado en Proyectos)</label>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rubrica Rápida (1-5)</label>
                        {Object.keys(formData.itemsEvaluacion).map(k => (
                            <div key={k} className="flex justify-between items-center">
                                <span className="text-slate-300 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(nu => (
                                        <button
                                            type="button"
                                            key={nu}
                                            onClick={() => handleRatingChange(k, nu)}
                                            className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${formData.itemsEvaluacion[k] === nu ? 'bg-cyan-500 text-white scale-110' : 'bg-slate-700 text-slate-400'}`}
                                        >
                                            {nu}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Comentarios / Feedback</label>
                        <textarea className="w-full bg-slate-900 border border-white/10 p-3 rounded text-white h-24" value={formData.comentarios} onChange={e => setFormData({ ...formData, comentarios: e.target.value })}></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-slate-400">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20">Guardar Observación</button>
                    </div>
                </form>
            </div>
        );
    }

    if (view === 'detail' && selectedObs) {
        return (
            <div className="max-w-3xl mx-auto animate-in fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <button onClick={() => setView('list')} className="text-slate-400 hover:text-white">← Volver</button>
                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">Imprimir Reporte</button>
                </div>

                <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Informe de Observación Áulica</h1>
                            <p className="text-slate-500 text-sm mt-1">Escuela ID #{selectedObs.EscuelaId}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">{new Date(selectedObs.fecha).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Fecha de Visita</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Profesor</p>
                            <p className="text-lg font-bold">{selectedObs.profesorNombre}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Materia</p>
                            <p className="text-lg font-bold">{selectedObs.materiaValidada}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Alumnos Presentes</p>
                            <p className="text-lg font-bold">{selectedObs.cantidadAlumnos}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Metodología ABP</p>
                            <p className={`text-lg font-bold ${selectedObs.metodologiaABP ? 'text-green-600' : 'text-slate-400'}`}>
                                {selectedObs.metodologiaABP ? 'APLICADA' : 'NO APLICADA'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                        <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Rúbrica de Evaluación</h3>
                        <div className="space-y-3">
                            {selectedObs.itemsEvaluacion && Object.entries(selectedObs.itemsEvaluacion).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center">
                                    <span className="capitalize text-slate-600 font-medium">{k.replace(/([A-Z])/g, ' $1')}</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <div key={n} className={`w-6 h-1 rounded-full ${n <= v ? 'bg-cyan-500' : 'bg-slate-200'}`}></div>
                                        ))}
                                        <span className="ml-2 font-bold text-slate-700">{v}/5</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-700 mb-2">Comentarios y Recomendaciones</h3>
                        <div className="bg-slate-50 p-4 rounded-xl text-slate-700 italic border-l-4 border-cyan-500">
                            "{selectedObs.comentarios}"
                        </div>
                    </div>

                    <div className="mt-12 text-center text-xs text-slate-400 uppercase">
                        Visado por: {selectedObs.directorEmail}
                    </div>
                </div>
            </div>
        );
    }

    return <div>Cargando...</div>;
};

export default Observacion;
