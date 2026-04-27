import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');

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

  const handleCreatePaciente = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/pacientes', { nombre, apellidos, email });
      setNombre('');
      setApellidos('');
      setEmail('');
      setShowForm(false);
      fetchPacientes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear paciente');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Directorio de Pacientes</h1>
          <p className="text-slate-500 mt-1">Gestiona el historial y datos de tus pacientes</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`btn flex items-center shadow-lg shadow-sky-900/10 ${showForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm ? 'Cancelar' : (
            <>
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Nuevo Paciente
            </>
          )}
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 text-sky-600" />
            Registrar Paciente
          </h3>
          <form onSubmit={handleCreatePaciente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input type="text" className="input" placeholder="Ej. Carlos" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label className="label">Apellidos</label>
              <input type="text" className="input" placeholder="Ej. García Martínez" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Correo Electrónico</label>
              <input type="email" className="input" placeholder="carlos@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary px-8">Guardar Registro</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="p-12 flex justify-center items-center flex-col text-slate-400">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Cargando pacientes...
          </div>
        ) : pacientes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <UserPlusIcon className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-medium">No hay pacientes registrados.</p>
            <button onClick={() => setShowForm(true)} className="text-sky-600 font-bold mt-2 hover:underline">Registrar el primero</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Email</th>
                <th>Fecha de Registro</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold text-slate-800">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold mr-3">
                        {p.nombre.charAt(0)}{p.apellidos.charAt(0)}
                      </div>
                      {p.nombre} {p.apellidos}
                    </div>
                  </td>
                  <td className="text-slate-500">{p.email || '-'}</td>
                  <td className="text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="text-right">
                    <Link 
                      to={`/pacientes/${p.id}`}
                      className="text-sky-600 hover:text-sky-800 font-bold text-sm bg-sky-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
