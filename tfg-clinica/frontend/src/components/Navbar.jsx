import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Clínica Deportiva</h2>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/pacientes">Pacientes</Link>
        </li>
        <li>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
