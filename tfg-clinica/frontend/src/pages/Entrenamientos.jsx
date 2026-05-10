import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Entrenamientos = () => {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntrenamientos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/entrenamientos');
        // En un entorno real, el backend debería devolver el nombre del paciente.
        // Por ahora, asumimos que el backend devuelve { id, fecha, notas, paciente_id, paciente_nombre, paciente_apellidos }
        setEntrenamientos(res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      } catch (err) {
        console.error('Error fetching entrenamientos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrenamientos();
  }, []);

  const filteredEntrenamientos = entrenamientos.filter(ent => 
    ent.pacientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ent.pacientes?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(ent.fecha).toLocaleDateString().includes(searchTerm)
  );


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">Registro de Entrenamientos</h1>
          <p className="text-slate-400 mt-1 font-medium">Historial global de todas las sesiones asignadas.</p>
        </div>
        
        <div className="flex items-center bg-[#1E293B] p-2 rounded-xl border border-slate-700/50 shadow-sm w-full md:w-80">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 ml-2" />
          <input 
            type="text" 
            placeholder="Buscar por paciente o fecha..." 
            className="flex-1 px-4 py-1.5 bg-transparent border-0 focus:ring-0 text-slate-300 placeholder:text-slate-500 text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium">Cargando historial...</p>
        </div>
      ) : filteredEntrenamientos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredEntrenamientos.map(ent => (
            <div 
              key={ent.id} 
              onClick={() => navigate(`/pacientes/${ent.paciente_id}`)}
              className="card group border-slate-700/50 hover:border-blue-500/50 hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer bg-[#1E293B]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ClipboardDocumentListIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <h3 className="font-bold text-slate-200">
                        {ent.pacientes?.nombre} {ent.pacientes?.apellidos}
                      </h3>

                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-bold text-blue-400">
                        {new Date(ent.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 md:px-8">
                  <p className="text-slate-400 text-sm italic line-clamp-1">
                    "{ent.notas || 'Sin observaciones adicionales'}"
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Asignado
                    </span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-dashed border-2 border-slate-700 bg-slate-800/30 py-20 flex flex-col items-center text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No se encontraron entrenamientos</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Prueba con otros términos de búsqueda o asigna un nuevo entrenamiento desde la ficha de un paciente.
          </p>
          <button 
            onClick={() => navigate('/pacientes')}
            className="mt-6 text-blue-500 font-bold hover:underline"
          >
            Ir a Directorio de Pacientes
          </button>
        </div>
      )}
    </div>
  );
};

export default Entrenamientos;


