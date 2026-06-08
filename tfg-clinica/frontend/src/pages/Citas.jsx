import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const locales = { es };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const localDateTimeToISOString = (localDateTime) => {
  const date = new Date(localDateTime);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/* ─────────────────────────────────────────────
   Custom Toolbar — navigation + view switcher
───────────────────────────────────────────── */
const CustomToolbar = ({ date, view, onNavigate, onView }) => {
  const viewLabels = { month: 'Mes', week: 'Semana', day: 'Día' };

  const goToPrev = () => {
    if (view === 'month') onNavigate('prev', subMonths(date, 1));
    else if (view === 'week') onNavigate('prev', subWeeks(date, 1));
    else onNavigate('prev', subDays(date, 1));
  };

  const goToNext = () => {
    if (view === 'month') onNavigate('next', addMonths(date, 1));
    else if (view === 'week') onNavigate('next', addWeeks(date, 1));
    else onNavigate('next', addDays(date, 1));
  };

  const label = (() => {
    if (view === 'month') return format(date, 'MMMM yyyy', { locale: es });
    if (view === 'week') {
      const start = startOfWeek(date, { locale: es });
      const end = addDays(start, 6);
      return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    }
    return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });
  })();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrev}
          className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-slate-400 transition-all"
          title="Anterior"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all flex items-center gap-2"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          Hoy
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-slate-400 transition-all"
          title="Siguiente"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Current period label */}
      <h2 className="text-lg font-black text-slate-200 capitalize tracking-tight text-center">{label}</h2>

      {/* View switcher */}
      <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
        {['month', 'week', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === v
                ? 'bg-[#1E293B] text-blue-400 shadow-sm shadow-black/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Custom Event Card rendered inside calendar
───────────────────────────────────────────── */
const CustomEvent = ({ event }) => (
  <div className="px-1.5 py-0.5 leading-tight truncate">
    <span className="font-bold">{event.paciente}</span>
    {event.profesional && (
      <span className="opacity-70 ml-1 text-[10px]">· {event.profesional}</span>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   Estado de cita → colores (adaptado para dark mode)
───────────────────────────────────────────── */
const ESTADO_STYLES = {
  pendiente:  { bg: 'rgba(217, 119, 6, 0.15)', color: '#FCD34D', border: 'rgba(217, 119, 6, 0.3)' },
  confirmada: { bg: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA', border: 'rgba(37, 99, 235, 0.3)' },
  completada: { bg: 'rgba(5, 150, 105, 0.15)', color: '#34D399', border: 'rgba(5, 150, 105, 0.3)' },
  cancelada:  { bg: 'rgba(220, 38, 38, 0.15)', color: '#F87171', border: 'rgba(220, 38, 38, 0.3)' },
};

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calendar state
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [profFilter, setProfFilter] = useState('todos');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [formData, setFormData] = useState({
    paciente_id: '', usuario_id: '', fecha: '', estado: 'pendiente', comentarios: ''
  });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando datos (citas, pacientes, admins)...');
      
      const [resCitas, resPacientes, resProfs] = await Promise.allSettled([
        api.get('/citas'),
        api.get('/pacientes'),
        api.get('/staff'),
      ]);

      if (resCitas.status === 'fulfilled') {
        setCitas(resCitas.value.data);
      } else {
        console.error('❌ Error cargando citas:', resCitas.reason);
      }

      if (resPacientes.status === 'fulfilled') {
        setPacientes(resPacientes.value.data);
        console.log('✅ Pacientes cargados:', resPacientes.value.data.length);
      } else {
        console.error('❌ Error cargando pacientes:', resPacientes.reason);
      }

      if (resProfs.status === 'fulfilled') {
        setProfesionales(resProfs.value.data);
        console.log('✅ Profesionales cargados:', resProfs.value.data.length);
      } else {
        console.error('❌ Error cargando profesionales:', resProfs.reason);
      }

    } catch (err) {
      console.error('Error crítico en fetchAll:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Modal helpers ── */
  const openCreate = useCallback((slotInfo = null) => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({
      paciente_id: '',
      usuario_id: '',
      fecha: slotInfo ? format(slotInfo.start, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      estado: 'pendiente',
      comentarios: '',
    });
    setShowModal(true);
  }, []);

  const openEdit = useCallback((event) => {
    const c = event.resource;
    setIsEditing(true);
    setSelectedCita(c);
    setFormData({
      paciente_id: c.paciente_id,
      usuario_id: c.usuario_id,
      fecha: format(new Date(c.fecha), "yyyy-MM-dd'T'HH:mm"),
      estado: c.estado,
      comentarios: c.comentarios || '',
    });
    setShowModal(true);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    try {
      await api.delete(`/citas/${id}`);
      showMsg('Cita eliminada', 'success');
      setShowModal(false);
      fetchAll();
    } catch { showMsg('Error al eliminar', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paciente_id || !formData.usuario_id || !formData.fecha) { 
      showMsg('Debes completar paciente, profesional y fecha', 'error'); 
      return; 
    }

    const fechaIso = localDateTimeToISOString(formData.fecha);
    if (!fechaIso) {
      showMsg('La fecha y hora no son válidas', 'error');
      return;
    }

    const payload = { ...formData, fecha: fechaIso };
    console.log('Datos enviados:', payload);
    try {
      if (isEditing) {
        await api.put(`/citas/${selectedCita.id}`, payload);
        showMsg('Cita actualizada', 'success');
      } else {
        await api.post('/citas', payload);
        showMsg('Cita agendada', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al procesar la cita', 'error');
    }
  };

  const showMsg = (text, type) => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: '', type: '' }), 5000);
  };

  /* Abrir modal de creación con la misma fecha/hora de la cita que se está editando */
  const openDuplicate = useCallback(() => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData(prev => ({
      paciente_id: '',
      usuario_id: '',
      fecha: prev.fecha,
      estado: 'pendiente',
      comentarios: '',
    }));
  }, []);

  /* ── Calendar data ── */
  const events = useMemo(() => {
    const filtered = profFilter === 'todos' ? citas : citas.filter(c => c.usuario_id === profFilter);
    return filtered.map(c => ({
      id: c.id,
      title: `${c.pacientes?.nombre ?? ''} ${c.pacientes?.apellidos ?? ''}`,
      paciente: `${c.pacientes?.nombre ?? ''} ${c.pacientes?.apellidos ?? ''}`,
      profesional: c.usuarios?.nombre ?? null,
      start: new Date(c.fecha),
      end: new Date(new Date(c.fecha).getTime() + 60 * 60 * 1000),
      estado: c.estado,
      resource: c,
    }));
  }, [citas, profFilter]);

  const eventPropGetter = useCallback((event) => {
    const s = ESTADO_STYLES[event.estado] ?? ESTADO_STYLES.pendiente;
    return {
      style: {
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 700,
        padding: '1px 4px',
        cursor: 'pointer',
      }
    };
  }, []);

  const tipoLabel = (tipo) => tipo === 'fisio' ? 'Fisioterapeuta' : tipo === 'entrenador' ? 'Entrenador' : '';

  /* ─────── Render ─────── */
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-3xl shadow-sm shadow-black/10 border border-slate-700/50">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">Agenda Clínica</h1>
          <p className="text-slate-400 mt-1 font-medium">Gestión de citas por día, semana y mes.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-slate-800"
            value={profFilter}
            onChange={e => setProfFilter(e.target.value)}
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}{p.tipo ? ` · ${tipoLabel(p.tipo)}` : ''}</option>
            ))}
          </select>
          <button
            onClick={() => openCreate()}
            className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Cita
          </button>
        </div>
      </header>

      {/* ── Toast message ── */}
      {mensaje.text && (
        <div className={`p-4 rounded-2xl flex items-center shadow-lg animate-in slide-in-from-top duration-300 ${
          mensaje.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {mensaje.type === 'success'
            ? <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            : <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />}
          <span className="font-bold">{mensaje.text}</span>
        </div>
      )}

      {/* ── Calendar card ── */}
      <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-700/50 shadow-sm shadow-black/10">
        <style>{`
          .rbc-calendar { border: none !important; font-family: inherit; }
          .rbc-month-view { border-radius: 12px; border: 1px solid #334155; overflow: hidden; background: #0F172A; }
          .rbc-time-view { border-radius: 12px; border: 1px solid #334155; overflow: hidden; background: #0F172A; }
          .rbc-header { padding: 10px 8px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #94A3B8; background: #1E293B; border-bottom: 1px solid #334155 !important; }
          .rbc-today { background: rgba(37, 99, 235, 0.05) !important; }
          .rbc-off-range-bg { background: #0B1120 !important; }
          .rbc-day-bg { border-left: 1px solid #334155; }
          .rbc-month-row + .rbc-month-row { border-top: 1px solid #334155; }
          .rbc-event { transition: transform .15s, box-shadow .15s; }
          .rbc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 12px -2px rgba(0,0,0,.5); }
          .rbc-event:focus { outline: none; }
          .rbc-slot-selection { background: rgba(37,99,235,.2); }
          .rbc-time-slot { border-color: #1E293B; }
          .rbc-timeslot-group { border-color: #334155; min-height: 56px; }
          .rbc-time-content { border-top: 1px solid #334155; }
          .rbc-time-header-content { border-left: 1px solid #334155; }
          .rbc-allday-cell { display: none; }
          .rbc-current-time-indicator { background: #3B82F6; height: 2px; }
          .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #1E293B; }
          .rbc-time-header.rbc-overflowing { border-right: 1px solid #334155; }
          .rbc-time-gutter .rbc-timeslot-group { border-bottom: 1px solid #334155; border-right: 1px solid #334155; color: #94A3B8; }
          /* hide default toolbar since we have our own */
          .rbc-toolbar { display: none; }
          .rbc-month-row { overflow: visible; }
          .rbc-show-more { font-size: 11px; font-weight: 700; color: #60A5FA; }
        `}</style>

        {loading ? (
          <div className="flex justify-center items-center" style={{ height: 640 }}>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <CustomToolbar
              date={date}
              view={view}
              onNavigate={(action, newDate) => {
                if (action === 'TODAY') setDate(new Date());
                else if (newDate) setDate(newDate);
              }}
              onView={setView}
            />
            <div style={{ height: 640 }} className="text-slate-300">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                date={date}
                onNavigate={setDate}
                onView={setView}
                views={['month', 'week', 'day']}
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 7, 0)}
                max={new Date(2024, 0, 1, 21, 0)}
                culture="es"
                selectable
                onSelectSlot={openCreate}
                onSelectEvent={openEdit}
                eventPropGetter={eventPropGetter}
                dayLayoutAlgorithm="no-overlap"
                components={{ event: CustomEvent }}
                tooltipAccessor={e => `${e.paciente}\nProfesional: ${e.profesional ?? 'Sin asignar'}\nEstado: ${e.estado}`}
                messages={{
                  noEventsInRange: 'No hay citas en este periodo.',
                  showMore: n => `+${n} más`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3">
        {Object.entries({ pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada' }).map(([k, label]) => {
          const s = ESTADO_STYLES[k];
          return (
            <span key={k} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {label}
            </span>
          );
        })}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-black/50 border border-slate-700/50 w-full max-w-lg animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-200 tracking-tight">
                  {isEditing ? 'Detalle de Cita' : 'Nueva Cita'}
                  <span className="ml-3 text-xs font-medium text-slate-500">
                    ({pacientes.length} p / {profesionales.length} pr)
                  </span>
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Paciente */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Paciente</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-800/50 font-bold text-slate-200 transition-all [&>option]:bg-slate-800"
                    value={formData.paciente_id}
                    onChange={e => setFormData(p => ({ ...p, paciente_id: e.target.value }))}
                    disabled={isEditing}
                    required
                  >
                    <option value="">Selecciona paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellidos || ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profesional */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <UserCircleIcon className="w-3 h-3" />Profesional Asignado *
                  </label>
                  <select
                    className={`w-full px-5 py-4 rounded-2xl border outline-none font-bold transition-all focus:ring-4 focus:ring-blue-500/10 [&>option]:bg-slate-800 ${
                      !formData.usuario_id ? 'border-amber-500/50 bg-amber-500/10 text-amber-200 focus:border-amber-400' : 'border-slate-700 bg-slate-800/50 text-slate-200 focus:border-blue-500'
                    }`}
                    value={formData.usuario_id}
                    onChange={e => setFormData(p => ({ ...p, usuario_id: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona profesional</option>
                    {profesionales.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.tipo ? (p.tipo === 'fisio' ? 'Fisioterapeuta' : 'Entrenador') : p.rol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha + Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-4 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-800/50 font-bold text-slate-200 transition-all [color-scheme:dark]"
                      value={formData.fecha}
                      onChange={e => setFormData(p => ({ ...p, fecha: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
                    <select
                      className="w-full px-4 py-4 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-800/50 font-bold text-slate-200 transition-all [&>option]:bg-slate-800"
                      value={formData.estado}
                      onChange={e => setFormData(p => ({ ...p, estado: e.target.value }))}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Comentarios */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="w-3 h-3 mr-1" />Comentarios Clínicos
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-800/50 font-medium text-slate-300 placeholder:text-slate-500 resize-none transition-all"
                    placeholder="Notas sobre la consulta o evolución..."
                    value={formData.comentarios}
                    onChange={e => setFormData(p => ({ ...p, comentarios: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  {isEditing && (
                    <button type="button" onClick={() => handleDelete(selectedCita.id)}
                      className="px-5 py-4 rounded-2xl font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
                      Eliminar
                    </button>
                  )}
                  <button type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all">
                    {isEditing ? 'Guardar Cambios' : 'Agendar Cita'}
                  </button>
                </div>
                {isEditing && (
                  <button type="button" onClick={openDuplicate}
                    className="w-full mt-2 px-5 py-3 rounded-2xl font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all text-sm flex items-center justify-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Crear otra cita en este horario
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;
