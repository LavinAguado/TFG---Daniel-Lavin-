import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEjercicio, setCurrentEjercicio] = useState({ nombre: '', descripcion: '', video_url: '' });

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
    console.log('Operación en ejercicio:', currentEjercicio);
    try {
      if (currentEjercicio.id) {
        await api.put(`/ejercicios/${currentEjercicio.id}`, currentEjercicio);
      } else {
        await api.post('/ejercicios', currentEjercicio);
      }
      setShowModal(false);
      setCurrentEjercicio({ nombre: '', descripcion: '', video_url: '' });
      fetchEjercicios();
    } catch (err) {
      console.error('Error saving ejercicio:', err);
      alert('Error al guardar el ejercicio');
    }
  };

  const handleDelete = async (id) => {
    // Usamos un confirm simple por ahora para depurar
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este ejercicio?');
    if (!confirmacion) return;
    
    console.log('Eliminando ejercicio con ID:', id);
    try {
      await api.delete(`/ejercicios/${id}`);
      fetchEjercicios();
    } catch (err) {
      console.error('Error deleting ejercicio:', err);
      alert('Error al eliminar el ejercicio. Verifica que no esté siendo usado en algún entrenamiento.');
    }
  };

  const handleEdit = (ej) => {
    setCurrentEjercicio(ej);
    setShowModal(true);
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
          <p className="text-slate-500 mt-1 font-medium">Gestiona los ejercicios disponibles para los planes de entrenamiento.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentEjercicio({ nombre: '', descripcion: '', video_url: '' });
            setShowModal(true);
          }}
          className="flex items-center bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-600/20"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Ejercicio
        </button>
      </div>

      <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 ml-3" />
        <input 
          type="text" 
          placeholder="Buscar ejercicio..." 
          className="flex-1 px-4 py-3 bg-transparent border-0 focus:ring-0 text-sm font-medium outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl flex items-center font-bold">
          <ExclamationCircleIcon className="w-6 h-6 mr-3" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEjercicios.map(ej => (
            <div key={ej.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800 text-lg">{ej.nombre}</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEdit(ej)}
                    className="p-2 hover:bg-sky-50 rounded-xl text-slate-400 hover:text-sky-600 transition-all"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ej.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                {ej.descripcion || 'Sin descripción disponible.'}
              </p>
              {ej.video_url && (
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <a 
                    href={ej.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sky-600 font-bold text-sm hover:text-sky-700 hover:underline"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                    Ver vídeo demostrativo
                  </a>
                </div>
              )}
            </div>
          ))}
          {filteredEjercicios.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium">
              No se encontraron ejercicios que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {currentEjercicio.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre del Ejercicio *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Sentadilla Goblet"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-700"
                    value={currentEjercicio.nombre}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción / Técnica</label>
                  <textarea 
                    rows="3"
                    placeholder="Describe la técnica correcta, respiración, errores comunes..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-medium text-slate-700 resize-none"
                    value={currentEjercicio.descripcion}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, descripcion: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">URL del Vídeo (Opcional)</label>
                  <input 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-medium text-slate-700"
                    value={currentEjercicio.video_url || ''}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, video_url: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 ml-1">Enlace a YouTube, Vimeo o servidor de vídeo.</p>
                </div>
                <div className="flex space-x-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-black text-white px-4 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/20"
                  >
                    {currentEjercicio.id ? 'Guardar Cambios' : 'Crear Ejercicio'}
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
