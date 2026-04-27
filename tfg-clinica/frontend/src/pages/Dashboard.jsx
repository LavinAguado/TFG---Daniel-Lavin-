const Dashboard = () => {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-slate-500 mt-1">Resumen general de la actividad de la clnica</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="card border-l-4 border-sky-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Pacientes Totales</h3>
            <span className="bg-sky-100 text-sky-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </span>
          </div>
          <p className="text-4xl font-extrabold text-slate-800">124</p>
          <div className="mt-4 text-sm text-emerald-600 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            12% este mes
          </div>
        </div>

        <div className="card border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Citas Hoy</h3>
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002-2z"></path></svg>
            </span>
          </div>
          <p className="text-4xl font-extrabold text-slate-800">8</p>
          <div className="mt-4 text-sm text-slate-500 font-medium">
            3 pendientes para la tarde
          </div>
        </div>

        <div className="card border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Entrenamientos</h3>
            <span className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </span>
          </div>
          <p className="text-4xl font-extrabold text-slate-800">42</p>
          <div className="mt-4 text-sm text-emerald-600 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            5 nuevos planes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Prximas Citas</h3>
          <div className="space-y-4">
            {[
              { id: 1, name: 'Juan Prez', time: '10:30 AM', type: 'Fisioterapia' },
              { id: 2, name: 'Mara Garca', time: '11:15 AM', type: 'Evaluacin' },
              { id: 3, name: 'Roberto S.', time: '12:00 PM', type: 'Entrenamiento' },
            ].map(cita => (
              <div key={cita.id} className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold mr-4">
                  {cita.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{cita.name}</p>
                  <p className="text-xs text-slate-400">{cita.type}</p>
                </div>
                <div className="text-right text-sm font-bold text-slate-600">
                  {cita.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors">
            Ver toda la agenda &rarr;
          </button>
        </div>

        <div className="card bg-gradient-to-br from-sky-600 to-indigo-700 text-white">
          <h3 className="text-lg font-bold mb-2">Asistente TheraTrack IA</h3>
          <p className="text-sky-100 text-sm mb-6">Genera un resumen automático de la evolución de tus pacientes usando el historial clínico y métricas de entrenamiento.</p>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-200 mb-2">Consejo del Día</p>
            <p className="text-sm">"Revisa los datos de esfuerzo (RPE) de Sofía Martínez; ha subido un 20% en la última semana sin aumento de dolor."</p>
          </div>
          <button className="bg-white text-sky-700 px-6 py-3 rounded-xl font-bold hover:bg-sky-50 transition-all shadow-lg shadow-sky-950/20">
            Ir a Resumen IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
