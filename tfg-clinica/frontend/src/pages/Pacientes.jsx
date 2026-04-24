import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de creación
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');

  const fetchPacientes = async () => {
    try {
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener pacientes');
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
      fetchPacientes(); // Refrescar lista
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear paciente');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Pacientes</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Añadir Paciente'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="form-card">
            <h3>Nuevo Paciente</h3>
            <form onSubmit={handleCreatePaciente} className="inline-form">
              <input 
                type="text" 
                placeholder="Nombre" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Apellidos" 
                value={apellidos} 
                onChange={(e) => setApellidos(e.target.value)} 
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <button type="submit" className="btn-success">Guardar</button>
            </form>
          </div>
        )}

        <div className="table-container">
          {pacientes.length === 0 ? (
            <p>No hay pacientes registrados.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Email</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td>{paciente.nombre}</td>
                    <td>{paciente.apellidos}</td>
                    <td>{paciente.email || '-'}</td>
                    <td>{new Date(paciente.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pacientes;
