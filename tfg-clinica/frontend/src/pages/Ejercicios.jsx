import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEjercicio, setCurrentEjercicio] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    fetchEjercicios();
  }, []);

  const fetchEjercicios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ejercicios');
      setEjercicios(res.data);
    } catch (err) {
      console.error('Error fetching ejercicios:', err);
      setError('No se pudieron cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEjercicio.id) {
        // En una implementación completa habría un endpoint PUT
        // Por ahora simulamos creación/edición mediante POST si el backend lo permite
        await api.post('/ejercicios', currentEjercicio);
      } else {
        await api.post('/ejercicios', currentEjercicio);
      }
      setShowModal(false);
      setCurrentEjercicio({ nombre: '', descripcion: '' });
      fetchEjercicios();
    } catch (err) {
      console.error('Error saving ejercicio:', err);
      alert('Error al guardar el ejercicio');
    }
  };

  const filteredEjercicios = ejercicios.filter(ej => 
    ej.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ej.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Catálogo de Ejercicios</h1>
          <p className="text-slate-500 mt-1">Gestiona los ejercicios disponibles para los planes de entrenamiento.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentEjercicio({ nombre: '', descripcion: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-sky-600/20"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Ejercicio
        </button>
      </div>

      <div className="flex items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Buscar ejercicio..." 
          className="flex-1 px-4 py-2 bg-transparent border-0 focus:ring-0 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="card bg-red-50 border-red-100 text-red-600 p-6 flex items-center">
          <ExclamationCircleIcon className="w-6 h-6 mr-3" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEjercicios.map(ej => (
            <div key={ej.id} className="card group hover:border-sky-300 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">{ej.nombre}</h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-sky-600">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                {ej.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Simplificado */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Ejercicio</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none"
                    value={currentEjercicio.nombre}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descripción</label>
                  <textarea 
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none resize-none"
                    value={currentEjercicio.descripcion}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, descripcion: e.target.value})}
                  ></textarea>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-600/20"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ejercicios;
