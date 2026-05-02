import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const SuperAdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin',
    tipo: 'fisio'
  });

  useEffect(() => {
    // Protección de ruta extra a nivel de componente
    if (!user || user.rol !== 'superadmin') {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setMensaje({ text: 'Error al cargar los usuarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'admin',
      tipo: 'fisio'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (usuario) => {
    setIsEditing(true);
    setSelectedUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No se edita la contraseña por aquí
      rol: usuario.rol,
      tipo: usuario.tipo || 'fisio'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      setMensaje({ text: 'No puedes eliminarte a ti mismo', type: 'error' });
      return;
    }
    if (!window.confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      setMensaje({ text: 'Usuario eliminado correctamente', type: 'success' });
      fetchUsers();
    } catch (err) {
      setMensaje({ text: err.response?.data?.error || 'Error al eliminar', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Ajustes antes de enviar
      if (payload.rol === 'superadmin') {
        payload.tipo = null;
      }
      
      if (isEditing) {
        // En edición no enviamos password
        delete payload.password;
        await api.put(`/admin/users/${selectedUser.id}`, payload);
        setMensaje({ text: 'Usuario actualizado', type: 'success' });
      } else {
        await api.post('/admin/users', payload);
        setMensaje({ text: 'Usuario creado', type: 'success' });
      }
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
    } catch (err) {
      setMensaje({ text: err.response?.data?.error || 'Error al guardar el usuario', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-slate-900 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-sky-500/20 p-3 rounded-2xl">
            <ShieldCheckIcon className="w-10 h-10 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Panel SuperAdmin</h1>
            <p className="text-slate-400 mt-1 font-medium">Gestión integral de credenciales y accesos de profesionales.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-sky-500/20"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Acceso
        </button>
      </header>

      {mensaje.text && (
        <div className={`p-4 rounded-2xl flex items-center shadow-lg animate-in slide-in-from-top duration-300 ${
          mensaje.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {mensaje.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <ExclamationCircleIcon className="w-5 h-5 mr-2" />}
          <span className="font-bold">{mensaje.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center">
          <UserGroupIcon className="w-5 h-5 text-slate-400 mr-2" />
          <h2 className="text-lg font-bold text-slate-800">Directorio de Profesionales</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black">
                  <th className="p-4 border-b border-slate-100">Nombre Completo</th>
                  <th className="p-4 border-b border-slate-100">Correo Electrónico</th>
                  <th className="p-4 border-b border-slate-100">Rol</th>
                  <th className="p-4 border-b border-slate-100">Tipo</th>
                  <th className="p-4 border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{u.nombre}</td>
                    <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        u.rol === 'superadmin' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.tipo ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200">
                          {u.tipo}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 rounded-lg shadow-sm transition-all"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === user.id}
                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 rounded-lg shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.id === user.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD Usuarios */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {isEditing ? 'Editar Acceso' : 'Nuevo Acceso Clínico'}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Configuración de credenciales de la plataforma</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-800"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                  <input 
                    type="email"
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-800"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contraseña Temporal</label>
                    <input 
                      type="password"
                      required={!isEditing}
                      minLength="6"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-bold text-slate-800"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Rol de Sistema</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-white font-bold text-slate-800"
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    >
                      <option value="admin">Administrador (Clínico)</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>
                  
                  {formData.rol === 'admin' && (
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Especialidad</label>
                      <select 
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-white font-bold text-slate-800"
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        required
                      >
                        <option value="fisio">Fisioterapeuta</option>
                        <option value="entrenador">Entrenador</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4 border-t border-slate-100">
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
                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default SuperAdminPanel;
