import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeftIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  PlusIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const PacienteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [resumenIA, setResumenIA] = useState(null);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const [loadingEntrenamientos, setLoadingEntrenamientos] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoEntrenamiento, setNuevoEntrenamiento] = useState({
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
    ejercicios: [] // { ejercicio_id, series, repeticiones, notas }
  });

  const [archivos, setArchivos] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchArchivos = async () => {
    try {
      const res = await api.get(`/archivos/${id}`);
      setArchivos(res.data);
    } catch (err) {
      console.error('Error fetching archivos:', err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    setUploadSuccess(false);
    console.log('📄 [DEBUG] Archivo seleccionado para subir:', fileToUpload);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      await api.post(`/archivos/${id}`, formData);
      setUploadSuccess(true);
      setFileToUpload(null);
      // Reset input file
      e.target.reset();
      fetchArchivos();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadArchivo = async (archivoId) => {
    try {
      const res = await api.get(`/archivos/file/${archivoId}`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Error getting file URL:', err);
      alert('No se pudo obtener el archivo');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener datos básicos del paciente
      try {
        setLoadingPaciente(true);
        const resPaciente = await api.get(`/pacientes`);
        const found = resPaciente.data.find(p => p.id === id);
        if (!found) throw new Error('Paciente no encontrado');
        setPaciente(found);
      } catch (err) {
        console.error('Error fetching paciente:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoadingPaciente(false);
      }

      // 2. Obtener resumen IA
      try {
        setLoadingResumen(true);
        const resIA = await api.get(`/resumen-ia/${id}`);
        setResumenIA(resIA.data);
      } catch (err) {
        console.error('Error fetching resumen IA:', err);
      } finally {
        setLoadingResumen(false);
      }

      // 3. Obtener Entrenamientos
      fetchEntrenamientos();

      // 4. Obtener Ejercicios para el modal
      try {
        const resEj = await api.get('/ejercicios');
        setEjerciciosDisponibles(resEj.data);
      } catch (err) {
        console.error('Error fetching ejercicios:', err);
      }

      // 5. Obtener Archivos
      fetchArchivos();
    };

    fetchData();
  }, [id]);

  const fetchEntrenamientos = async () => {
    try {
      setLoadingEntrenamientos(true);
      const res = await api.get('/entrenamientos');
      // Filtrar por paciente (si el backend no lo hace ya por query param)
      const filtrados = res.data.filter(e => e.paciente_id === id);
      setEntrenamientos(filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) {
      console.error('Error fetching entrenamientos:', err);
    } finally {
      setLoadingEntrenamientos(false);
    }
  };

  const handleAddEjercicio = () => {
    setNuevoEntrenamiento({
      ...nuevoEntrenamiento,
      ejercicios: [...nuevoEntrenamiento.ejercicios, { ejercicio_id: '', series: 3, repeticiones: 10, notas: '' }]
    });
  };

  const handleRemoveEjercicio = (index) => {
    const updated = [...nuevoEntrenamiento.ejercicios];
    updated.splice(index, 1);
    setNuevoEntrenamiento({ ...nuevoEntrenamiento, ejercicios: updated });
  };

  const handleUpdateEjercicio = (index, field, value) => {
    const updated = [...nuevoEntrenamiento.ejercicios];
    updated[index][field] = value;
    setNuevoEntrenamiento({ ...nuevoEntrenamiento, ejercicios: updated });
  };

  const handleSubmitEntrenamiento = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        paciente_id: id,
        fecha: nuevoEntrenamiento.fecha,
        notas: nuevoEntrenamiento.notas,
        ejercicios: nuevoEntrenamiento.ejercicios
      };
      await api.post('/entrenamientos', payload);
      setShowModal(false);
      setNuevoEntrenamiento({ fecha: new Date().toISOString().split('T')[0], notas: '', ejercicios: [] });
      fetchEntrenamientos();
    } catch (err) {
      alert('Error al crear entrenamiento: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loadingPaciente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Cargando perfil del paciente...</p>
      </div>
    );
  }

  if (error && !paciente) {
    return (
      <div className="card border-red-500/20 bg-red-500/10 text-center py-12">
        <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-500">Error</h2>
        <p className="text-red-400 mb-6">{error}</p>
        <button onClick={() => navigate('/pacientes')} className="btn-primary">Volver al Directorio</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Navegación y Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/pacientes')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-200">
              {paciente.nombre} {paciente.apellidos}
            </h1>
            <p className="text-slate-400">{paciente.email || 'Sin correo electrónico'}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Entrenamiento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Resumen IA e Historial de Entrenamientos */}
        <div className="lg:col-span-2 space-y-6">
          <section className="relative overflow-hidden card border-blue-500/20 bg-[#1E293B] shadow-xl shadow-black/20">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full opacity-50 blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-200 flex items-center">
                  <SparklesIcon className="w-6 h-6 text-blue-500 mr-2" />
                  Análisis Clínico TheraTrack IA
                </h2>
              </div>

              {loadingResumen ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-800 rounded-full animate-pulse"></div>
                </div>
              ) : resumenIA ? (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed text-lg italic border-l-4 border-blue-500/50 pl-6 py-2">
                    "{resumenIA.resumen}"
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No hay datos suficientes para el análisis.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200 flex items-center">
              <DocumentTextIcon className="w-6 h-6 text-slate-400 mr-2" />
              Planes de Entrenamiento
            </h2>
            
            {loadingEntrenamientos ? (
              <div className="py-10 text-center text-slate-500">Cargando planes...</div>
            ) : entrenamientos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {entrenamientos.map(ent => (
                  <div key={ent.id} className="card hover:border-blue-500/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-blue-400 mb-1">{new Date(ent.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-slate-400 text-sm">{ent.notas || 'Sin observaciones adicionales.'}</p>
                      </div>
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Asignado</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card bg-slate-800/30 border-dashed border-2 border-slate-700 flex flex-col items-center justify-center py-12 text-slate-500">
                <DocumentTextIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No hay entrenamientos asignados todavía.</p>
                <button onClick={() => setShowModal(true)} className="text-blue-500 font-bold text-sm mt-2 hover:underline">Asignar el primero ahora</button>
              </div>
            )}
          </section>
        </div>

        {/* Columna Derecha: Métricas y Datos Rápidos */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-[#1E293B] to-slate-800 text-white border-0 shadow-lg shadow-black/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Métricas de Rendimiento</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                  <ChartBarIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Dolor Promedio</p>
                  <p className="text-2xl font-bold">{resumenIA?.metricas?.promedio_dolor || 0}<span className="text-sm text-slate-500 ml-1">/10</span></p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Esfuerzo (RPE)</p>
                  <p className="text-2xl font-bold">{resumenIA?.metricas?.promedio_esfuerzo || 0}<span className="text-sm text-slate-500 ml-1">/10</span></p>
                </div>
              </div>
              <div className="flex items-center pt-4 border-t border-slate-700/50">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4">
                    <ClockIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Sesiones Totales</p>
                    <p className="text-2xl font-bold">{resumenIA?.metricas?.sesiones_totales || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Información de Contacto</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p><span className="font-bold text-slate-500">Email:</span> {paciente.email || 'N/A'}</p>
              <p><span className="font-bold text-slate-500">ID:</span> <span className="font-mono text-[10px]">{paciente.id}</span></p>
              <p><span className="font-bold text-slate-500">Alta:</span> {new Date(paciente.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="card border-blue-500/20 bg-blue-900/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Documentación y Archivos
            </h3>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="relative group">
                <input 
                  type="file" 
                  id="file-upload"
                  className="hidden" 
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  accept=".pdf,image/*"
                />
                <label 
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500/30 rounded-2xl p-6 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all group-hover:border-blue-400/50"
                >
                  <PlusIcon className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-blue-400">
                    {fileToUpload ? fileToUpload.name : 'Seleccionar PDF o Imagen'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 text-center">Máximo 5MB por archivo</span>
                </label>
              </div>

              {fileToUpload && (
                <button 
                  type="submit" 
                  disabled={uploading}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${uploading ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
                >
                  {uploading ? 'Subiendo...' : 'Confirmar Subida'}
                </button>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-[10px] font-bold text-center border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                  ¡Archivo subido correctamente!
                </div>
              )}
            </form>

            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Archivos Recientes</p>
              {archivos.length === 0 ? (
                <p className="text-xs text-slate-500 italic px-1">No hay documentos todavía.</p>
              ) : (
                <div className="space-y-2">
                  {archivos.map(file => (
                    <button 
                      key={file.id}
                      onClick={() => handleDownloadArchivo(file.id)}
                      className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all text-left group"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-800 rounded-lg mr-3 group-hover:bg-blue-500/10">
                          <DocumentTextIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-300 truncate w-32">{file.nombre}</p>
                          <p className="text-[9px] text-slate-500">{new Date(file.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ArrowLeftIcon className="w-4 h-4 text-slate-500 rotate-180 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Nuevo Entrenamiento */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 w-full max-w-2xl my-auto animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-200">Planificar Entrenamiento</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-300 font-bold">Cerrar</button>
              </div>

              <form onSubmit={handleSubmitEntrenamiento} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fecha de Sesión</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:border-blue-500 text-slate-200 outline-none [color-scheme:dark]"
                      value={nuevoEntrenamiento.fecha}
                      onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, fecha: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notas / Objetivos</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Céntrese en estabilidad"
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:border-blue-500 text-slate-200 placeholder:text-slate-500 outline-none"
                      value={nuevoEntrenamiento.notas}
                      onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, notas: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-300">Ejercicios de la sesión</h3>
                    <button 
                      type="button"
                      onClick={handleAddEjercicio}
                      className="text-xs font-bold text-blue-400 flex items-center hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" /> Añadir Ejercicio
                    </button>
                  </div>

                  {nuevoEntrenamiento.ejercicios.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm italic">
                      No has añadido ejercicios a esta sesión todavía.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {nuevoEntrenamiento.ejercicios.map((ej, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl relative group">
                          <div className="flex-1">
                            <select 
                              required
                              className="w-full bg-transparent border-0 font-bold text-slate-300 outline-none cursor-pointer [&>option]:bg-slate-800"
                              value={ej.ejercicio_id}
                              onChange={(e) => handleUpdateEjercicio(index, 'ejercicio_id', e.target.value)}
                            >
                              <option value="">Seleccionar Ejercicio...</option>
                              {ejerciciosDisponibles.map(disponible => (
                                <option key={disponible.id} value={disponible.id}>{disponible.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="number" 
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-blue-400"
                              value={ej.series}
                              onChange={(e) => handleUpdateEjercicio(index, 'series', e.target.value)}
                            />
                            <span className="text-xs text-slate-500 font-bold">ser.</span>
                            <input 
                              type="number" 
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-blue-400"
                              value={ej.repeticiones}
                              onChange={(e) => handleUpdateEjercicio(index, 'repeticiones', e.target.value)}
                            />
                            <span className="text-xs text-slate-500 font-bold">rep.</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveEjercicio(index)}
                            className="p-1 text-red-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 border border-slate-700 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20"
                  >
                    Asignar Plan
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

export default PacienteDetalle;

