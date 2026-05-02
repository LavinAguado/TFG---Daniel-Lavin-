import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, UserPlusIcon, ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/outline';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    motivo_consulta: '',
    dolencia: '',
    antecedentes: '',
    valoracion_inicial: ''
  });

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreatePaciente = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/pacientes', formData);
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        motivo_consulta: '',
        dolencia: '',
        antecedentes: '',
        valoracion_inicial: ''
      });
      setShowForm(false);
      fetchPacientes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear paciente');
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Directorio de Pacientes</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestiona el historial clínico y datos de tus pacientes.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 bg-slate-50/50"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow-lg whitespace-nowrap ${showForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/20'}`}
          >
            {showForm ? 'Cancelar' : (
              <>
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Nuevo
              </>
            )}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 flex items-center shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
            <div className="bg-sky-50 p-3 rounded-2xl mr-4">
              <PlusIcon className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Alta de Paciente</h3>
              <p className="text-sm text-slate-500 font-medium">Completa la información básica y la valoración inicial.</p>
            </div>
          </div>
          
          <form onSubmit={handleCreatePaciente} className="space-y-8">
            
            {/* SECCIÓN: DATOS PERSONALES */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <h4 className="flex items-center text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                <UserIcon className="w-4 h-4 mr-2" />
                Información Personal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Nombre *</label>
                  <input type="text" name="nombre" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700" placeholder="Ej. Carlos" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Apellidos *</label>
                  <input type="text" name="apellidos" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700" placeholder="Ej. García Martínez" value={formData.apellidos} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Fecha de Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700" value={formData.fecha_nacimiento} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Teléfono</label>
                  <input type="tel" name="telefono" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700" placeholder="+34 600 000 000" value={formData.telefono} onChange={handleChange} />
                </div>
                <div className="md:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2">Correo Electrónico</label>
                  <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700" placeholder="carlos@correo.com" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* SECCIÓN: VALORACIÓN CLÍNICA */}
            <div className="bg-sky-50/30 p-6 rounded-2xl border border-sky-100">
              <h4 className="flex items-center text-sm font-black text-sky-600 uppercase tracking-widest mb-6">
                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                Valoración Clínica Inicial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-sky-800 mb-2">Motivo de Consulta principal</label>
                  <textarea name="motivo_consulta" rows="3" className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 resize-none bg-white" placeholder="¿Por qué acude a la clínica hoy?" value={formData.motivo_consulta} onChange={handleChange}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sky-800 mb-2">Dolencia Actual (Síntomas)</label>
                  <textarea name="dolencia" rows="3" className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 resize-none bg-white" placeholder="Descripción del dolor, zona afectada, etc." value={formData.dolencia} onChange={handleChange}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sky-800 mb-2">Antecedentes Médicos</label>
                  <textarea name="antecedentes" rows="4" className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 resize-none bg-white" placeholder="Lesiones previas, cirugías, enfermedades relevantes..." value={formData.antecedentes} onChange={handleChange}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sky-800 mb-2">Valoración del Profesional</label>
                  <textarea name="valoracion_inicial" rows="4" className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 resize-none bg-white" placeholder="Observaciones físicas posturales, rango de movimiento, tests..." value={formData.valoracion_inicial} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
              <button type="submit" className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all">Guardar Expediente Completo</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center items-center flex-col text-slate-400">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Cargando expedientes...
          </div>
        ) : pacientes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <UserPlusIcon className="w-12 h-12" />
            </div>
            <p className="text-slate-500 font-bold text-lg">No hay pacientes registrados.</p>
            <p className="text-slate-400 text-sm mt-2">Comienza añadiendo el primer expediente clínico.</p>
            <button onClick={() => setShowForm(true)} className="text-sky-600 font-bold mt-4 hover:underline">Registrar Paciente</button>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-bold text-lg">No se encontraron pacientes.</p>
            <p className="text-slate-400 text-sm mt-1">Prueba con otros términos de búsqueda.</p>
            <button onClick={() => setBusqueda("")} className="text-sky-600 font-bold mt-4 hover:underline">Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black">
                  <th className="p-6 border-b border-slate-100">Paciente</th>
                  <th className="p-6 border-b border-slate-100">Contacto</th>
                  <th className="p-6 border-b border-slate-100">Fecha de Alta</th>
                  <th className="p-6 border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientesFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-black mr-4 shadow-inner">
                          {p.nombre.charAt(0)}{p.apellidos.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{p.nombre} {p.apellidos}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">ID: {p.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-slate-700 font-medium">{p.email || '—'}</p>
                      <p className="text-slate-500 text-sm mt-0.5">{p.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="p-6 text-slate-600 font-medium">
                      {new Date(p.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="p-6 text-right">
                      <Link 
                        to={`/pacientes/${p.id}`}
                        className="inline-flex items-center text-sky-700 hover:text-white hover:bg-sky-600 font-bold text-sm bg-sky-50 px-5 py-2.5 rounded-xl transition-all"
                      >
                        Ver Expediente
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
