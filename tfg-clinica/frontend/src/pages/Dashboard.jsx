import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="main-content">
        <h1>Bienvenido al Dashboard</h1>
        <p>Selecciona una opción en el menú para comenzar.</p>
        
        <div className="dashboard-cards">
          <div className="card">
            <h3>Pacientes</h3>
            <p>Gestiona los pacientes de la clínica.</p>
          </div>
          {/* Futuras tarjetas de citas y entrenamientos irán aquí */}
          <div className="card placeholder">
            <h3>Citas (Próximamente)</h3>
            <p>Gestiona tu agenda y citas programadas.</p>
          </div>
          <div className="card placeholder">
            <h3>Entrenamientos (Próximamente)</h3>
            <p>Crea y gestiona planes de entrenamiento.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
