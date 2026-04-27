import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  EyeIcon, 
  UserCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Archivos = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [file, setFile] = useState(null);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (pacienteId) {
      fetchArchivos();
    } else {
      setArchivos([]);
    }
  }, [pacienteId]);

  const fetchPacientes = async () => {
    try {
      const res = await api.get('/pacientes');
      setPacientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArchivos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/archivos/${pacienteId}`);
      setArchivos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !pacienteId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', file);

    try {
      await api.post(`/archivos/${pacienteId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMensaje({ text: 'Archivo subido con éxito', type: 'success' });
      setFile(null);
      fetchArchivos();
    } catch (err) {
      setMensaje({ text: 'Error al subir archivo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerArchivo = async (archivoId) => {
    try {
      const res = await api.get(`/archivos/file/${archivoId}`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Error al obtener URL del archivo:', err);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Repositorio de Archivos</h1>
        <p className="text-slate-500 mt-1">Almacenamiento seguro de informes, radiografas y documentos clnicos</p>
      </header>

      <div className="card max-w-xl">
        <label className="label mb-3">Seleccionar Paciente para gestionar archivos</label>
        <div className="relative">
          <select 
            className="input pl-10 appearance-none bg-white" 
            value={pacienteId} 
            onChange={(e) => setPacienteId(e.target.value)}
          >
            <option value="">-- Seleccionar Paciente --</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
            ))}
          </select>
          <UserCircleIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {!pacienteId ? (
        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <InformationCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-lg">Selecciona un paciente para ver su historial de archivos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <CloudArrowUpIcon className="w-5 h-5 mr-2 text-sky-600" />
                Subir Documento
              </h3>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/50 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    required 
                  />
                  <div className="space-y-2">
                    <CloudArrowUpIcon className="w-10 h-10 text-slate-300 mx-auto group-hover:text-sky-500 transition-colors" />
                    <p className="text-sm font-medium text-slate-600">
                      {file ? file.name : 'Haz clic o arrastra un archivo'}
                    </p>
                    <p className="text-xs text-slate-400">PDF, JPG, PNG hasta 10MB</p>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!file || loading}
                  className="w-full btn-primary py-3"
                >
                  {loading ? 'Subiendo...' : 'Confirmar Subida'}
                </button>
              </form>
              {mensaje.text && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-bold text-center ${mensaje.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {mensaje.text}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Nota de seguridad:</strong> Los archivos se almacenan en un bucket privado. Solo puedes acceder a ellos mediante URLs temporales firmadas que expiran automticamente.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card h-full min-h-[400px]">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <DocumentIcon className="w-5 h-5 mr-2 text-sky-600" />
                Archivos del Paciente
              </h3>
              
              {loading ? (
                <div className="p-12 text-center text-slate-400">Consultando archivos...</div>
              ) : archivos.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic">No se han encontrado archivos para este paciente.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {archivos.map(a => (
                    <div key={a.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 mr-3">
                          <DocumentIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate w-40">{a.nombre}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVerArchivo(a.id)}
                        className="p-2 bg-white text-sky-600 rounded-lg border border-slate-200 hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                        title="Ver Archivo"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archivos;
