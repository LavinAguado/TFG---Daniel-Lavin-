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
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
          title="Anterior"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          Hoy
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
          title="Siguiente"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Current period label */}
      <h2 className="text-lg font-black text-slate-800 capitalize tracking-tight text-center">{label}</h2>

      {/* View switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {['month', 'week', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === v
                ? 'bg-white text-sky-700 shadow-sm shadow-slate-200'
                : 'text-slate-500 hover:text-slate-700'
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
   Estado de cita → colores
───────────────────────────────────────────── */
const ESTADO_STYLES = {
  pendiente:  { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  confirmada: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  completada: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  cancelada:  { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
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
    console.log('Datos enviados:', formData);
    try {
      if (isEditing) {
        await api.put(`/citas/${selectedCita.id}`, formData);
        showMsg('Cita actualizada', 'success');
      } else {
        await api.post('/citas', formData);
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
    setTimeout(() => setMensaje({ text: '', type: '' }), 3500);
  };

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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Agenda Clínica</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión de citas por día, semana y mes.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
            className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-900/10"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Cita
          </button>
        </div>
      </header>

      {/* ── Toast message ── */}
      {mensaje.text && (
        <div className={`p-4 rounded-2xl flex items-center shadow-lg animate-in slide-in-from-top duration-300 ${
          mensaje.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensaje.type === 'success'
            ? <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            : <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />}
          <span className="font-bold">{mensaje.text}</span>
        </div>
      )}

      {/* ── Calendar card ── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <style>{`
          .rbc-calendar { border: none !important; font-family: inherit; }
          .rbc-month-view { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .rbc-time-view { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .rbc-header { padding: 10px 8px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0 !important; }
          .rbc-today { background: #f0f9ff !important; }
          .rbc-off-range-bg { background: #fafafa !important; }
          .rbc-event { transition: transform .15s, box-shadow .15s; }
          .rbc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 8px -2px rgba(0,0,0,.12); }
          .rbc-event:focus { outline: none; }
          .rbc-slot-selection { background: rgba(14,165,233,.15); }
          .rbc-time-slot { border-color: #f1f5f9; }
          .rbc-timeslot-group { border-color: #e2e8f0; min-height: 56px; }
          .rbc-time-content { border-top: 1px solid #e2e8f0; }
          .rbc-time-header-content { border-left: 1px solid #e2e8f0; }
          .rbc-allday-cell { display: none; }
          .rbc-current-time-indicator { background: #0ea5e9; height: 2px; }
          .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #f1f5f9; }
          /* hide default toolbar since we have our own */
          .rbc-toolbar { display: none; }
          .rbc-month-row { overflow: visible; }
          .rbc-show-more { font-size: 11px; font-weight: 700; color: #0ea5e9; }
        `}</style>

        {loading ? (
          <div className="flex justify-center items-center" style={{ height: 640 }}>
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
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
            <div style={{ height: 640 }}>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isEditing ? 'Detalle de Cita' : 'Nueva Cita'}
                  <span className="ml-3 text-xs font-medium text-slate-400">
                    ({pacientes.length} p / {profesionales.length} pr)
                  </span>
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Paciente */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paciente</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none bg-slate-50 font-bold text-slate-700 transition-all"
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <UserCircleIcon className="w-3 h-3" />Profesional Asignado *
                  </label>
                  <select
                    className={`w-full px-5 py-4 rounded-2xl border outline-none font-bold text-slate-700 transition-all focus:ring-4 focus:ring-sky-500/10 ${
                      !formData.usuario_id ? 'border-amber-300 bg-amber-50 focus:border-amber-400' : 'border-slate-200 bg-slate-50 focus:border-sky-500'
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none bg-slate-50 font-bold text-slate-700 transition-all"
                      value={formData.fecha}
                      onChange={e => setFormData(p => ({ ...p, fecha: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                    <select
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none bg-slate-50 font-bold text-slate-700 transition-all"
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="w-3 h-3 mr-1" />Comentarios Clínicos
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none bg-slate-50 font-medium text-slate-600 resize-none transition-all"
                    placeholder="Notas sobre la consulta o evolución..."
                    value={formData.comentarios}
                    onChange={e => setFormData(p => ({ ...p, comentarios: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  {isEditing && (
                    <button type="button" onClick={() => handleDelete(selectedCita.id)}
                      className="px-5 py-4 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                      Eliminar
                    </button>
                  )}
                  <button type="submit"
                    className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all">
                    {isEditing ? 'Guardar Cambios' : 'Agendar Cita'}
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

export default Citas;
