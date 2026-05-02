import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Citas from './pages/Citas';
import Entrenamientos from './pages/Entrenamientos';
import Archivos from './pages/Archivos';
import Ejercicios from './pages/Ejercicios';
import PacienteDetalle from './pages/PacienteDetalle';
import Seguimiento from './pages/Seguimiento';
import SuperAdminPanel from './pages/SuperAdminPanel';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/seguimiento/:id" element={<Seguimiento />} />

        
        {/* Rutas Privadas */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/pacientes" 
          element={<ProtectedRoute><MainLayout><Pacientes /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/pacientes/:id" 
          element={<ProtectedRoute><MainLayout><PacienteDetalle /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/citas" 
          element={<ProtectedRoute><MainLayout><Citas /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/entrenamientos" 
          element={<ProtectedRoute><MainLayout><Entrenamientos /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/archivos" 
          element={<ProtectedRoute><MainLayout><Archivos /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/ejercicios" 
          element={<ProtectedRoute><MainLayout><Ejercicios /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/superadmin" 
          element={<ProtectedRoute><MainLayout><SuperAdminPanel /></MainLayout></ProtectedRoute>} 
        />

      </Routes>
    </Router>
  );
}



export default App;
