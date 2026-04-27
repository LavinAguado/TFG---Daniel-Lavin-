import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: '',
    fecha: '',
    estado: 'pendiente',
    comentarios: ''
  });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCitas();
    fetchPacientes();
  }, []);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citas');
      setCitas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await api.get('/pacientes');
      setPacientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({
      paciente_id: '',
      fecha: new Date().toISOString().slice(0, 16),
      estado: 'pendiente',
      comentarios: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cita) => {
    setIsEditing(true);
    setSelectedCita(cita);
    setFormData({
      paciente_id: cita.paciente_id,
      fecha: new Date(cita.fecha).toISOString().slice(0, 16),
      estado: cita.estado,
      comentarios: cita.comentarios || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;
    try {
      await api.delete(`/citas/${id}`);
      setMensaje({ text: 'Cita eliminada', type: 'success' });
      fetchCitas();
    } catch (err) {
      setMensaje({ text: 'Error al eliminar', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/citas/${selectedCita.id}`, formData);
        setMensaje({ text: 'Cita actualizada', type: 'success' });
      } else {
        await api.post('/citas', formData);
        setMensaje({ text: 'Cita agendada', type: 'success' });
      }
      setShowModal(false);
      fetchCitas();
      setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
    } catch (err) {
      setMensaje({ text: 'Error al procesar la cita', type: 'error' });
    }
  };

  const filteredCitas = citas.filter(c => 
    c.pacientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pacientes?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmada': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'completada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Agenda de Citas</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión clínica y seguimiento de pacientes.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="btn-primary flex items-center bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/10"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Cita
        </button>
      </header>

      {mensaje.text && (
        <div className={`p-4 rounded-2xl flex items-center shadow-lg animate-in slide-in-from-top duration-300 ${
          mensaje.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {mensaje.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <ExclamationCircleIcon className="w-5 h-5 mr-2" />}
          <span className="font-bold">{mensaje.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <CalendarIcon className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Buscar por paciente..." 
            className="flex-1 px-4 py-2 bg-transparent border-0 focus:ring-0 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCitas.map(c => (
              <div key={c.id} className="card group hover:shadow-2xl transition-all cursor-pointer border-slate-100" onClick={() => handleOpenEdit(c)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">
                        {c.pacientes?.nombre} {c.pacientes?.apellidos}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {new Date(c.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(c.estado)}`}>
                    {c.estado}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center text-sm font-bold text-slate-600 mb-1">
                    <CalendarIcon className="w-4 h-4 mr-2 text-sky-500" />
                    {new Date(c.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>

                {c.comentarios && (
                  <div className="flex items-start space-x-2 text-sm text-slate-500 mb-4 bg-sky-50/30 p-2 rounded-lg italic">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-300" />
                    <p className="line-clamp-2">{c.comentarios}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(c); }}
                    className="p-2 hover:bg-sky-50 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredCitas.length === 0 && (
              <div className="col-span-full py-20 text-center card border-dashed border-2 bg-slate-50">
                <CalendarIcon className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No hay citas registradas.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal CRUD Cita */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isEditing ? 'Detalle de la Cita' : 'Programar Nueva Cita'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paciente</label>
                  <select 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-700"
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({...formData, paciente_id: e.target.value})}
                    disabled={isEditing}
                    required
                  >
                    <option value="">Seleccionar Paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha y Hora</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-700"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-700"
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="w-3 h-3 mr-1" />
                    Comentarios Clínicos
                  </label>
                  <textarea 
                    rows="4"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-medium text-slate-600 resize-none"
                    placeholder="Añade notas sobre el motivo de la consulta o la evolución..."
                    value={formData.comentarios}
                    onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/20"
                  >
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
