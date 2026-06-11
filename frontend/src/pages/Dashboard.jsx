import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  UsersIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pacientesCount, setPacientesCount] = useState(0);
  const [citasHoy, setCitasHoy] = useState([]);
  const [proximosEventos, setProximosEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [pacientesRes, citasRes] = await Promise.all([
          api.get('/pacientes'),
          api.get('/citas')
        ]);
        
        setPacientesCount(pacientesRes.data.length);
        
        // Process citas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const todasCitas = citasRes.data;
        
        // Citas del día de hoy
        const hoyCitas = todasCitas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= hoy && fechaCita < manana;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setCitasHoy(hoyCitas);

        // Próximos eventos (citas a partir de mañana, max 5)
        const eventosFuturos = todasCitas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= manana;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 5);

        setProximosEventos(eventosFuturos);
        
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-200 tracking-tight">Panel de Control</h1>
        <p className="text-slate-400 mt-1 font-medium">Resumen general de la actividad de la clínica</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700/50 shadow-sm flex items-center justify-between hover:shadow-md hover:shadow-black/20 transition-all">
          <div>
            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Total Pacientes</h3>
            <p className="text-4xl font-extrabold text-slate-200">{pacientesCount}</p>
          </div>
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <UsersIcon className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700/50 shadow-sm flex items-center justify-between hover:shadow-md hover:shadow-black/20 transition-all">
          <div>
            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">Citas de Hoy</h3>
            <p className="text-4xl font-extrabold text-slate-200">{citasHoy.length}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Citas de Hoy */}
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700/50 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-200 flex items-center">
              <ClockIcon className="w-5 h-5 text-blue-500 mr-2" />
              Agenda del Día
            </h3>
          </div>
          <div className="p-6 flex-1">
            {citasHoy.length > 0 ? (
              <div className="space-y-4">
                {citasHoy.map(cita => (
                  <div key={cita.id} className="flex items-center p-4 bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold mr-4 shrink-0">
                      {cita.paciente_nombre ? cita.paciente_nombre.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200 text-base truncate">{cita.paciente_nombre}</p>
                      <p className="text-xs text-slate-400 truncate">{cita.motivo}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-sm">
                        {new Date(cita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500">
                <CalendarDaysIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No hay citas programadas para hoy.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 text-center">
            <button 
              onClick={() => navigate('/citas')}
              className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center w-full"
            >
              Ver calendario completo
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700/50 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-200 flex items-center">
              <CalendarDaysIcon className="w-5 h-5 text-indigo-400 mr-2" />
              Próximos Eventos
            </h3>
          </div>
          <div className="p-6 flex-1">
            {proximosEventos.length > 0 ? (
              <div className="space-y-4">
                {proximosEventos.map(cita => {
                  const fecha = new Date(cita.fecha);
                  return (
                    <div key={cita.id} className="flex items-start p-4 hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-indigo-500/30">
                      <div className="flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-xl w-14 h-14 mr-4 shrink-0">
                        <span className="text-xs font-bold uppercase">{fecha.toLocaleDateString('es-ES', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{fecha.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-bold text-slate-200 text-base truncate">{cita.paciente_nombre}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {cita.motivo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500">
                <CalendarDaysIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No hay eventos próximos programados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
