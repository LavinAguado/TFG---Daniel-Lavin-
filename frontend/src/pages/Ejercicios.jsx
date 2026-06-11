import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  VideoCameraIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEjercicio, setCurrentEjercicio] = useState({ nombre: '', descripcion: '', video_url: '' });
  const [deletingId, setDeletingId] = useState(null);

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
    try {
      await api.delete(`/ejercicios/${id}`);
      setDeletingId(null);
      fetchEjercicios();
    } catch (err) {
      console.error('Error deleting ejercicio:', err);
      alert('Error al eliminar. Verifique que el ejercicio no esté en uso.');
      setDeletingId(null);
    }
  };

  const handleEdit = (ej) => {
    setCurrentEjercicio(ej);
    setShowModal(true);
  };

  const filteredEjercicios = ejercicios.filter(ej => 
    (ej.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ej.descripcion?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1E293B] p-8 rounded-[2rem] shadow-sm shadow-black/10 border border-slate-700/50">
        <div>
          <h1 className="text-4xl font-black text-slate-200 tracking-tight">Catálogo de Ejercicios</h1>
          <p className="text-slate-400 mt-2 font-medium">Define la biblioteca de movimientos para tus planes.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentEjercicio({ nombre: '', descripcion: '', video_url: '' });
            setShowModal(true);
          }}
          className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          Añadir Ejercicio
        </button>
      </div>

      <div className="relative max-w-xl">
        <MagnifyingGlassIcon className="w-6 h-6 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o técnica..." 
          className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-700/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-[#1E293B] font-medium text-slate-300 placeholder:text-slate-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-400 p-8 rounded-3xl flex items-center font-bold shadow-sm">
          <ExclamationCircleIcon className="w-8 h-8 mr-4" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEjercicios.map(ej => (
            <div key={ej.id} className="bg-[#1E293B] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-sm shadow-black/10 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex-1">
                  <h3 className="font-black text-slate-200 text-xl leading-tight mb-1">{ej.nombre}</h3>
                  <div className="h-1.5 w-12 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(ej)}
                    className="p-2.5 bg-slate-800/50 hover:bg-blue-500/10 rounded-xl text-slate-400 hover:text-blue-400 transition-all"
                    title="Editar"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  
                  {deletingId === ej.id ? (
                    <button 
                      onClick={() => handleDelete(ej.id)}
                      className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/30 animate-bounce"
                      title="Confirmar borrar"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(ej.id)}
                      className="p-2.5 bg-slate-800/50 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-slate-400 text-base leading-relaxed mb-8 flex-grow">
                {ej.descripcion || 'No se ha proporcionado una descripción detallada para este ejercicio.'}
              </p>

              {ej.video_url && (
                <div className="mt-auto">
                  <a 
                    href={ej.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center w-full justify-center px-6 py-3 bg-blue-500/10 text-blue-400 rounded-2xl font-bold text-sm hover:bg-blue-500/20 transition-all group/btn"
                  >
                    <VideoCameraIcon className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Vídeo Demostrativo
                  </a>
                </div>
              )}
              
              {/* Background accent */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-slate-800/50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            </div>
          ))}
          
          {filteredEjercicios.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <div className="inline-flex p-6 bg-slate-800/50 rounded-full mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-slate-400 font-black text-xl">Sin resultados</p>
              <p className="text-slate-500 mt-2">Prueba a buscar con otros términos.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-[3rem] shadow-2xl shadow-black/50 w-full max-w-xl animate-in slide-in-from-bottom-8 duration-500 my-auto">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-200 tracking-tight">
                    {currentEjercicio.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                  </h2>
                  <p className="text-slate-400 mt-1 font-medium">Completa los campos para tu biblioteca.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Nombre *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Press Militar con Mancuernas"
                    className="w-full px-6 py-5 rounded-3xl border-2 border-slate-700/50 focus:border-blue-500 focus:ring-0 transition-all outline-none bg-slate-800/50 font-bold text-slate-200 placeholder:text-slate-500 text-lg"
                    value={currentEjercicio.nombre}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, nombre: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Técnica y Detalles</label>
                  <textarea 
                    rows="4"
                    placeholder="Describe los puntos clave de la ejecución..."
                    className="w-full px-6 py-5 rounded-3xl border-2 border-slate-700/50 focus:border-blue-500 focus:ring-0 transition-all outline-none bg-slate-800/50 font-medium text-slate-300 placeholder:text-slate-500 resize-none leading-relaxed"
                    value={currentEjercicio.descripcion}
                    onChange={(e) => setCurrentEjercicio({...currentEjercicio, descripcion: e.target.value})}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Enlace de Vídeo</label>
                  <div className="relative">
                    <VideoCameraIcon className="w-6 h-6 text-slate-500 absolute left-6 top-1/2 -translate-y-1/2" />
                    <input 
                      type="url" 
                      placeholder="https://www.youtube.com/..."
                      className="w-full pl-16 pr-6 py-5 rounded-3xl border-2 border-slate-700/50 focus:border-blue-500 focus:ring-0 transition-all outline-none bg-slate-800/50 font-medium text-slate-300 placeholder:text-slate-500"
                      value={currentEjercicio.video_url || ''}
                      onChange={(e) => setCurrentEjercicio({...currentEjercicio, video_url: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 ml-2">Pega la URL de YouTube, Vimeo o Instagram.</p>
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-5 rounded-3xl font-bold text-slate-400 border border-slate-700/50 hover:bg-slate-800 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-3xl font-bold transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
                  >
                    {currentEjercicio.id ? 'Actualizar Cambios' : 'Crear Ejercicio'}
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
