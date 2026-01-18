import { useState, useEffect } from 'react';

const Materias = () => {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterias = async () => {
            let url = 'http://localhost:3002/materias';
            if (import.meta.env.VITE_API_URL) {
                url = import.meta.env.VITE_API_URL.replace('auth', 'courses') + '/materias';
            }

            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setMaterias(data);
                }
            } catch (error) {
                console.error("Error fetching materias", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterias();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Materias</h2>
                    <p className="text-slate-400">Plan de estudios y asignaturas</p>
                </div>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    + Nueva Materia
                </button>
            </div>

            {loading ? (
                <p className="text-white">Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materias.map(materia => (
                        <div key={materia.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 group hover:border-cyan-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${materia.tipo === 'taller' ? 'bg-orange-500/20 text-orange-300' : 'bg-cyan-500/20 text-cyan-300'
                                    }`}>
                                    {materia.tipo}
                                </span>
                                <span className="text-slate-500 text-sm">Año {materia.anio}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{materia.nombre}</h3>
                        </div>
                    ))}
                    {materias.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            No se encontraron materias.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Materias;
