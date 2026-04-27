import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  FaceSmileIcon, 
  FaceFrownIcon,
  BoltIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const Seguimiento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entrenamiento, setEntrenamiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    dolor: 0,
    esfuerzo: 5,
    comentarios: '',
    ejercicios: []
  });

  useEffect(() => {
    fetchEntrenamiento();
  }, [id]);

  const fetchEntrenamiento = async () => {
    try {
      const res = await api.get(`/entrenamientos/${id}`);
      setEntrenamiento(res.data);
      
      // Inicializar el estado de los ejercicios
      const initialEjercicios = res.data.entrenamiento_ejercicios.map(ee => ({
        ejercicio_id: ee.ejercicios.id,
        nombre: ee.ejercicios.nombre,
        esfuerzo_real: 5,
        dificultad: 5,
        comentario: ''
      }));
      setFormData(prev => ({ ...prev, ejercicios: initialEjercicios }));
    } catch (err) {
      setError('No se pudo cargar el entrenamiento. Es posible que el enlace haya expirado o sea incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...formData.ejercicios];
    updated[index][field] = value;
    setFormData({ ...formData, ejercicios: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/seguimiento-completo', {
        entrenamiento_id: id,
        ...formData
      });
      setEnviado(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Error al enviar el seguimiento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !entrenamiento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase">¡Enviado con éxito!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Tu fisioterapeuta recibirá tu feedback y ajustará tu plan según tu evolución. ¡Sigue así!
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
          <FaceFrownIcon className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Público */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-black text-xs mr-3">T</div>
          <span className="font-black text-slate-800 tracking-tighter uppercase">TheraTrack <span className="text-sky-600">Feedback</span></span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 animate-in slide-in-from-bottom duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-2">¿Cómo ha ido tu sesión?</h1>
          <p className="text-slate-500 font-medium">Cuéntanos tus sensaciones para mejorar tu recuperación.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección General */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Sensaciones Generales</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <BoltIcon className="w-5 h-5 mr-2 text-sky-500" />
                  Nivel de Dolor (0-10)
                </label>
                <input 
                  type="range" min="0" max="10" 
                  className="w-full accent-sky-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  value={formData.dolor}
                  onChange={(e) => setFormData({...formData, dolor: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">
                  <span>Sin dolor (0)</span>
                  <span className="text-sky-600 text-lg">{formData.dolor}</span>
                  <span>Dolor máximo (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Comentarios de la sesión</label>
                <textarea 
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none bg-slate-50 font-medium text-slate-600 resize-none"
                  rows="3"
                  placeholder="¿Cómo te has sentido hoy en general?"
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Sección Ejercicios */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">Detalle por Ejercicio</h2>
            
            {formData.ejercicios.map((ej, index) => (
              <section key={index} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{ej.nombre}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Esfuerzo Percibido</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none"
                      value={ej.esfuerzo_real}
                      onChange={(e) => handleExerciseChange(index, 'esfuerzo_real', parseInt(e.target.value))}
                    >
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>{i} - {i === 0 ? 'Reposo' : i === 10 ? 'Máximo' : `Nivel ${i}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Dificultad Técnica</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none"
                      value={ej.dificultad}
                      onChange={(e) => handleExerciseChange(index, 'dificultad', parseInt(e.target.value))}
                    >
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>{i} - {i === 0 ? 'Muy fácil' : i === 10 ? 'Imposible' : `Nivel ${i}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-600 resize-none"
                    rows="2"
                    placeholder="¿Alguna molestia con este ejercicio?"
                    value={ej.comentario}
                    onChange={(e) => handleExerciseChange(index, 'comentario', e.target.value)}
                  ></textarea>
                </div>
              </section>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg tracking-tight transition-all shadow-2xl shadow-slate-900/30 active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR SEGUIMIENTO'}
          </button>
        </form>
      </main>

      <footer className="max-w-2xl mx-auto px-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-8">
        Potenciado por TheraTrack • Clínica de Fisioterapia
      </footer>
    </div>
  );
};

export default Seguimiento;
