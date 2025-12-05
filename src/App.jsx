import React, { useState, useEffect } from 'react';
import { User, Lock, CreditCard, Target, Award, BookOpen, TrendingUp, Plus, Trash2, ChevronLeft, LogOut, Calendar, DollarSign, History, Home, Settings, Menu, X, Calculator, Video, FileText, GraduationCap, Lightbulb, PlayCircle, Save } from 'lucide-react';

// --- UTILIDADES DE ALMACENAMIENTO LOCAL ---
const STORAGE_KEYS = {
  USERS: 'edufin_users',
  GOALS: 'edufin_goals',
  TRANSACTIONS: 'edufin_transactions',
  CURRENT_USER: 'edufin_current_user'
};

const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    const demoGoals = [
      { id: 1, userId: 1, titulo: "Viaje a la Playa", actual: 1500, objetivo: 5000 },
      { id: 2, userId: 1, titulo: "Laptop Nueva", actual: 8000, objetivo: 25000 },
      { id: 3, userId: 1, titulo: "Fondo de Emergencia", actual: 2000, objetivo: 10000 }
    ];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(demoGoals));
  }
};

// --- COMPONENTES UI REUTILIZABLES ---
const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled }) => {
  const baseStyle = "py-3 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:bg-gray-100 w-full justify-start px-4"
  };
  const finalClass = variant === 'ghost' 
    ? `${baseStyle} ${variants[variant]} ${className} hover:translate-x-1` 
    : `${baseStyle} w-full ${variants[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={finalClass}>
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange, required = false, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        required={required}
        disabled={disabled}
        className={`w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const Card = ({ title, icon: Icon, onClick, color = "bg-white", description }) => (
  <div onClick={onClick} className={`${color} p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border border-gray-100 flex flex-col items-center justify-center gap-4 group h-full`}>
    <div className="p-4 bg-white/90 rounded-full shadow-sm group-hover:scale-110 transition-transform">
      <Icon size={32} className="text-indigo-600" />
    </div>
    <div className="text-center">
      <span className="font-bold text-gray-800 block text-lg mb-1">{title}</span>
      {description && <span className="text-gray-500 text-sm">{description}</span>}
    </div>
  </div>
);

// --- COMPONENTES DE ESTRUCTURA (LAYOUT) ---

const Sidebar = ({ currentView, onNavigate, onLogout, user, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'goals', label: 'Mis Metas', icon: Target },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
  ];

  const baseClasses = "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none";
  const mobileClasses = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      
      <aside className={`${baseClasses} ${mobileClasses} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
               <TrendingUp size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">EduFinanciera</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu Principal</p>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button 
                key={item.id}
                variant="ghost" 
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={currentView === item.id ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600 rounded-r-none" : ""}
              >
                <item.icon size={20} className={currentView === item.id ? "text-indigo-600" : "text-gray-400"} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="danger" onClick={onLogout} className="text-sm py-2">
            <LogOut size={16} /> Cerrar Sesión
          </Button>
        </div>
      </aside>
    </>
  );
};

// --- PANTALLAS NUEVAS Y EXISTENTES ---

const ProfileScreen = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [stats, setStats] = useState({ totalGoals: 0, completedGoals: 0 });

  useEffect(() => {
    // Calcular estadísticas
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]").filter(g => g.userId === user.id);
    const completed = goals.filter(g => g.actual >= g.objetivo).length;
    setStats({ totalGoals: goals.length, completedGoals: completed });
  }, [user.id]);

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User size={28} className="text-indigo-600" /> Mi Perfil
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tarjeta de Usuario */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="text-center md:text-left">
               <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
               <p className="text-gray-500">{user.email}</p>
               <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                 Usuario Activo
               </div>
            </div>
            <div className="md:ml-auto">
               {!isEditing ? (
                 <Button onClick={() => setIsEditing(true)} variant="secondary" className="px-6">Editar Perfil</Button>
               ) : (
                 <div className="flex gap-2">
                   <Button onClick={() => setIsEditing(false)} variant="ghost" className="w-auto">Cancelar</Button>
                   <Button onClick={handleSave} className="w-auto bg-green-600 hover:bg-green-700"><Save size={18}/> Guardar</Button>
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Nombre Completo" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              disabled={!isEditing} 
            />
            <Input 
              label="Correo Electrónico" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing} // Email suele ser inmutable o requiere más validación
            />
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-yellow-300" size={24} />
              <h4 className="font-bold text-lg">Nivel Financiero</h4>
            </div>
            <p className="text-indigo-200 text-sm mb-4">¡Vas por buen camino!</p>
            <div className="text-4xl font-bold">Principiante</div>
            <div className="mt-4 bg-black/20 rounded-full h-2 w-full">
              <div className="bg-yellow-300 h-2 rounded-full w-1/3"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
               <span className="text-gray-500 font-medium">Metas Totales</span>
               <span className="text-2xl font-bold text-gray-800">{stats.totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-gray-500 font-medium">Metas Completadas</span>
               <span className="text-2xl font-bold text-green-600">{stats.completedGoals}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimulatorScreen = () => {
  const [mode, setMode] = useState('investment'); // 'investment' | 'credit'
  
  // States Inversión
  const [invAmount, setInvAmount] = useState('');
  const [invRate, setInvRate] = useState('');
  const [invTime, setInvTime] = useState(''); // meses
  const [invResult, setInvResult] = useState(null);

  // States Crédito
  const [credAmount, setCredAmount] = useState('');
  const [credRate, setCredRate] = useState(''); // Anual
  const [credDate, setCredDate] = useState('');
  const [credResult, setCredResult] = useState(null);

  const calculateInvestment = (e) => {
    e.preventDefault();
    const P = parseFloat(invAmount);
    const r = parseFloat(invRate) / 100 / 12; // Tasa mensual simple
    const t = parseFloat(invTime);
    
    // Fórmula interés compuesto: A = P(1 + r)^t
    const A = P * Math.pow((1 + r), t);
    setInvResult({ total: A, interest: A - P });
  };

  const calculateCredit = (e) => {
    e.preventDefault();
    const P = parseFloat(credAmount);
    const annualRate = parseFloat(credRate) / 100;
    
    // Calcular tiempo en años entre hoy y la fecha elegida
    const start = new Date();
    const end = new Date(credDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const diffYears = diffDays / 365;

    // Interés simple: I = P * r * t
    const interest = P * annualRate * diffYears;
    const total = P + interest;
    
    setCredResult({ total, interest, days: diffDays });
  };

  return (
    <div className="animate-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calculator size={28} className="text-indigo-600" /> Simulador Financiero
      </h2>

      {/* Selector de Modo */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-8 max-w-md">
        <button 
          onClick={() => { setMode('investment'); setInvResult(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'investment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Inversión (Ahorro)
        </button>
        <button 
          onClick={() => { setMode('credit'); setCredResult(null); }}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'credit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Crédito (Préstamo)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          {mode === 'investment' ? (
            <form onSubmit={calculateInvestment}>
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Proyecta tu Inversión</h3>
              <Input label="Monto inicial ($)" type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} required placeholder="1000" />
              <Input label="Tasa de interés anual (%)" type="number" value={invRate} onChange={e => setInvRate(e.target.value)} required placeholder="10" />
              <Input label="Tiempo (meses)" type="number" value={invTime} onChange={e => setInvTime(e.target.value)} required placeholder="12" />
              <Button type="submit">Calcular Rendimiento</Button>
            </form>
          ) : (
             <form onSubmit={calculateCredit}>
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Calcula tu Deuda</h3>
              <Input label="Monto a solicitar ($)" type="number" value={credAmount} onChange={e => setCredAmount(e.target.value)} required placeholder="5000" />
              <Input label="Tasa de interés anual (%)" type="number" value={credRate} onChange={e => setCredRate(e.target.value)} required placeholder="25" />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago total</label>
                <input type="date" className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={credDate} onChange={e => setCredDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <Button type="submit">Calcular Intereses</Button>
            </form>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2rem] border border-indigo-100 flex flex-col justify-center items-center text-center">
           {!invResult && !credResult ? (
             <div className="opacity-50">
               <Calculator size={64} className="mb-4 mx-auto text-indigo-300" />
               <p className="text-gray-500">Ingresa los datos para ver la simulación</p>
             </div>
           ) : mode === 'investment' && invResult ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-2">
               <p className="text-gray-500 font-medium mb-1">Obtendrás un total de</p>
               <h3 className="text-4xl font-bold text-green-600 mb-6">${invResult.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
               
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-2 flex justify-between">
                 <span>Tu capital:</span>
                 <span className="font-bold">${parseFloat(invAmount).toLocaleString()}</span>
               </div>
               <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full flex justify-between text-green-700">
                 <span>Interés Ganado:</span>
                 <span className="font-bold">+${invResult.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
               </div>
             </div>
           ) : mode === 'credit' && credResult ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-2">
               <p className="text-gray-500 font-medium mb-1">Total a pagar</p>
               <h3 className="text-4xl font-bold text-red-600 mb-2">${credResult.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
               <p className="text-xs text-gray-400 mb-6">En un plazo de {credResult.days} días</p>
               
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-2 flex justify-between">
                 <span>Préstamo:</span>
                 <span className="font-bold">${parseFloat(credAmount).toLocaleString()}</span>
               </div>
               <div className="bg-red-50 p-4 rounded-xl border border-red-100 w-full flex justify-between text-red-700">
                 <span>Interés Generado:</span>
                 <span className="font-bold">+${credResult.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
               </div>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

const LearnScreen = () => {
  const [activeTab, setActiveTab] = useState('tips');

  const content = {
    tips: [
      { id: 1, title: "La regla del 50/30/20", desc: "Destina 50% a necesidades, 30% a deseos y 20% a ahorros.", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
      { id: 2, title: "Fondo de Emergencia", desc: "Ahorra al menos 3 meses de tus gastos fijos para imprevistos.", icon: ShieldIcon, color: "bg-green-100 text-green-700" }, // Using ShieldIcon logic below
      { id: 3, title: "Evita gastos hormiga", desc: "El café diario suma. Identifica pequeños gastos innecesarios.", icon: Target, color: "bg-red-100 text-red-700" }
    ],
    videos: [
      { id: 1, title: "¿Cómo empezar a invertir?", duration: "10:05", thumbnail: "bg-indigo-900" },
      { id: 2, title: "Entendiendo tu tarjeta de crédito", duration: "15:30", thumbnail: "bg-blue-800" },
      { id: 3, title: "Libertad Financiera en 5 pasos", duration: "08:20", thumbnail: "bg-purple-900" }
    ],
    courses: [
      { id: 1, title: "Finanzas Personales 101", modules: "5 Módulos", level: "Principiante" },
      { id: 2, title: "Inversiones Avanzadas", modules: "8 Módulos", level: "Avanzado" }
    ]
  };

  // Helper component icon wrapper if Shield isn't imported, fallback to Lock
  const ShieldIcon = Lock; 

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen size={28} className="text-indigo-600" /> Aprender
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
         {['tips', 'videos', 'courses'].map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 rounded-full font-bold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
           >
             {tab === 'tips' ? 'Tips Rápidos' : tab === 'courses' ? 'Cursos' : tab}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'tips' && content.tips.map(tip => (
          <div key={tip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center mb-4`}>
              <tip.icon size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
          </div>
        ))}

        {activeTab === 'videos' && content.videos.map(vid => (
          <div key={vid.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer">
             <div className={`h-40 ${vid.thumbnail} relative flex items-center justify-center group-hover:opacity-90 transition-opacity`}>
               <PlayCircle className="text-white opacity-80 group-hover:scale-110 transition-transform" size={48} />
               <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{vid.duration}</span>
             </div>
             <div className="p-4">
               <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{vid.title}</h3>
               <p className="text-xs text-gray-400 mt-1">Video Educativo</p>
             </div>
          </div>
        ))}

        {activeTab === 'courses' && content.courses.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-indigo-200 transition-colors cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap size={80} className="text-indigo-600" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-3">{course.level}</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <FileText size={16} /> {course.modules}
              </p>
              <Button className="mt-4 w-full" variant="secondary">Ver Curso</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- PANTALLAS EXISTENTES (Login, Register, Goals, GoalDetails...) ---
// (Estas se mantienen casi iguales, solo Login/Register se definen abajo para el orden)

const LoginScreen = ({ onLogin, onNavigateToRegister }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Completa todos los campos");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      // Intentar recuperar usuario si existe en localStorage para persistencia real
      const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
      
      const user = savedUser && savedUser.email === form.email 
        ? savedUser 
        : { id: 1, name: "Usuario Demo", email: form.email };
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      seedData();
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <TrendingUp size={400} className="-translate-x-20 translate-y-20" />
          </div>
          <div className="relative z-10">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={32} />
             </div>
             <h1 className="text-4xl font-bold mb-4">EduFinanciera</h1>
             <p className="text-indigo-100 text-lg">Tu compañero inteligente para alcanzar la libertad financiera.</p>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-indigo-200">© 2024 EduFinanciera Inc.</p>
          </div>
        </div>
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-500 mb-8">Ingresa tus datos para acceder</p>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2"><div className="w-1 h-4 bg-red-500 rounded-full"></div>{error}</div>}
            <form onSubmit={handleSubmit}>
              <Input label="Correo Electrónico" type="email" placeholder="hola@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <div className="mt-8">
                <Button type="submit" disabled={loading}>{loading ? "Verificando..." : "Iniciar Sesión"}</Button>
              </div>
            </form>
            <p className="mt-8 text-center text-gray-600">¿No tienes cuenta? <button onClick={onNavigateToRegister} className="text-indigo-600 font-bold hover:underline">Regístrate gratis</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    setTimeout(() => {
      const newUser = { id: Date.now(), name: form.name, email: form.email };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      seedData();
      onRegisterSuccess(newUser);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg p-10 rounded-[2rem] shadow-2xl relative">
        <button onClick={onNavigateToLogin} className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="text-gray-600" /></button>
        <div className="text-center mb-8 mt-4"><h2 className="text-3xl font-bold text-gray-800">Crear Cuenta</h2><p className="text-gray-500">Únete a nuestra comunidad de ahorradores</p></div>
        <form onSubmit={handleSubmit}>
          <Input label="Nombre Completo" placeholder="Ej. Ana García" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Correo Electrónico" type="email" placeholder="hola@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="mt-6"><Button type="submit" disabled={loading}>{loading ? "Creando cuenta..." : "Registrarme"}</Button></div>
        </form>
      </div>
    </div>
  );
};

const GoalDetailsScreen = ({ goal, onBack, onUpdateGoal }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const goalTransactions = allTransactions.filter(t => t.metaId === goal.id);
    setHistory(goalTransactions.reverse());
  }, [goal.id]);

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setLoading(true);
    const depositAmount = Number(amount);
    
    setTimeout(() => {
      const newTransaction = { id: Date.now(), metaId: goal.id, monto: depositAmount, fecha: date };
      const currentTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...currentTransactions, newTransaction]));

      const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
      const updatedGoals = allGoals.map(g => {
        if (g.id === goal.id) return { ...g, actual: g.actual + depositAmount };
        return g;
      });
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
      onUpdateGoal(updatedGoals.find(g => g.id === goal.id));
      setHistory(prev => [newTransaction, ...prev]);
      setAmount("");
      setLoading(false);
    }, 500);
  };

  const porcentaje = Math.min(100, Math.round((goal.actual / goal.objetivo) * 100));

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
          <ChevronLeft size={20} /> Volver a Metas
        </button>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10"><Target size={200} /></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
             <div><p className="text-indigo-200 font-medium mb-1 uppercase tracking-wide text-sm">Detalle de Meta</p><h1 className="text-3xl md:text-4xl font-bold">{goal.titulo}</h1></div>
             <div className="text-right"><span className="text-4xl font-bold block">${goal.actual.toLocaleString()}</span><span className="text-indigo-200">de ${goal.objetivo.toLocaleString()}</span></div>
           </div>
           <div className="mt-8">
             <div className="flex justify-between text-sm font-bold mb-2"><span>Progreso</span><span>{porcentaje}%</span></div>
             <div className="bg-black/20 rounded-full h-4 w-full overflow-hidden backdrop-blur-sm border border-white/10"><div className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${porcentaje}%` }}></div></div>
           </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100"><div className="p-2 bg-green-100 text-green-600 rounded-lg"><Plus size={20} /></div><h3 className="font-bold text-gray-800 text-lg">Registrar Ahorro</h3></div>
            <form onSubmit={handleDeposit}>
              <div className="space-y-4 mb-6">
                  <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">CANTIDAD</label><div className="relative"><DollarSign size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 font-bold text-gray-800 text-lg" placeholder="0.00" required /></div></div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">FECHA</label><div className="relative"><Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 font-medium text-gray-800" required /></div></div>
              </div>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 shadow-green-200 text-lg">{loading ? "Guardando..." : "Agregar Dinero"}</Button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
             <div className="flex items-center gap-2 mb-6"><History size={20} className="text-gray-400" /><h3 className="font-bold text-gray-800 text-lg">Historial</h3></div>
             <div className="space-y-0">
               {history.length === 0 ? (
                 <div className="text-center py-20 flex flex-col items-center justify-center opacity-50"><Target size={48} className="mb-4 text-gray-300" /><p className="text-gray-500">No hay movimientos registrados aún.</p></div>
               ) : (
                 <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-4">Tipo</th><th className="p-4">Fecha</th><th className="p-4 text-right">Monto</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">{history.map((item) => (<tr key={item.id} className="hover:bg-gray-50 transition-colors"><td className="p-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xs font-bold">+</div><span className="font-medium text-gray-800">Depósito</span></td><td className="p-4 text-gray-500 text-sm">{item.fecha}</td><td className="p-4 text-right font-bold text-green-600">+${Number(item.monto).toLocaleString()}</td></tr>))}</tbody>
                    </table>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const GoalsScreen = ({ onBack, user, onSelectGoal }) => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMeta, setNewMeta] = useState({ titulo: "", objetivo: "" });

  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
    const userGoals = savedGoals.filter(g => g.userId === user.id || g.userId === undefined);
    setMetas(userGoals);
    setLoading(false);
  }, [user.id]);

  const handleAddMeta = () => {
    if (!newMeta.titulo.trim() || !newMeta.objetivo) return;
    const metaData = { id: Date.now(), titulo: newMeta.titulo, actual: 0, objetivo: Number(newMeta.objetivo), userId: user.id };
    const updatedGoals = [...metas, metaData];
    setMetas(updatedGoals);
    const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...allGoals, metaData]));
    setNewMeta({ titulo: "", objetivo: "" });
    setShowModal(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const filtered = metas.filter(m => m.id !== id);
    setMetas(filtered);
    const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
    const newAllGoals = allGoals.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newAllGoals));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-2xl font-bold text-gray-800">Mis Metas</h2><p className="text-gray-500">Visualiza y gestiona tus objetivos de ahorro</p></div>
        <Button onClick={() => setShowModal(true)} className="w-auto px-6"><Plus size={20} /> Nueva Meta</Button>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-gray-400">Cargando metas...</div></div>
      ) : metas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 p-12"><Target size={64} className="text-indigo-200 mb-4" /><h3 className="text-xl font-bold text-gray-700 mb-2">Aún no tienes metas</h3><p className="text-gray-500 mb-6">Crea tu primera meta de ahorro para empezar.</p><Button onClick={() => setShowModal(true)} className="w-auto">Crear Meta</Button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metas.map((meta) => {
            const porcentaje = Math.min(100, Math.round((meta.actual / meta.objetivo) * 100));
            return (
              <div key={meta.id} onClick={() => onSelectGoal(meta)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => handleDelete(e, meta.id)} className="text-red-300 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full shadow-sm transition-colors"><Trash2 size={18} /></button></div>
                <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Target size={24} /></div><div><h3 className="font-bold text-gray-800 text-lg leading-tight">{meta.titulo}</h3><p className="text-sm text-gray-400">Meta: ${meta.objetivo.toLocaleString()}</p></div></div>
                <div className="mt-4"><div className="flex justify-between text-sm font-bold mb-2"><span className="text-gray-700">${meta.actual.toLocaleString()}</span><span className="text-indigo-600">{porcentaje}%</span></div><div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${porcentaje}%` }}></div></div></div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Nueva Meta de Ahorro</h3>
            <Input label="Nombre de la meta" placeholder="Ej. Viaje a Europa" value={newMeta.titulo} onChange={(e) => setNewMeta({ ...newMeta, titulo: e.target.value })} required />
            <Input label="Objetivo ($)" type="number" placeholder="25000" value={newMeta.objetivo} onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })} required />
            <div className="flex gap-4 mt-8"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button onClick={handleAddMeta}>Guardar Meta</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user, onNavigate }) => {
  const [totalSaved, setTotalSaved] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dailyTip, setDailyTip] = useState(null);

  useEffect(() => {
    // 1. Calcular total ahorrado y cargar metas
    const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
    const userGoals = allGoals.filter(g => g.userId === user.id);
    const total = userGoals.reduce((acc, curr) => acc + curr.actual, 0);
    setTotalSaved(total);

    // 2. Cargar últimas transacciones
    const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
    const userGoalIds = userGoals.map(g => g.id);
    
    // Filtramos las transacciones que pertenecen a las metas de este usuario
    const userTransactions = allTransactions
      .filter(t => userGoalIds.includes(t.metaId))
      .map(t => {
        // Enriquecemos la transacción con el nombre de la meta
        const goal = userGoals.find(g => g.id === t.metaId);
        return { ...t, goalTitle: goal ? goal.titulo : 'Meta desconocida' };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id) // Ordenar por fecha o ID (descendente)
      .slice(0, 5); // Tomar las últimas 5
    
    setRecentTransactions(userTransactions);

    // 3. Generar un tip aleatorio (simple)
    const tips = [
      { title: "La regla del 50/30/20", desc: "Destina 50% a necesidades, 30% a deseos y 20% a ahorros.", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
      { title: "Fondo de Emergencia", desc: "Ahorra al menos 3 meses de tus gastos fijos para imprevistos.", icon: Lock, color: "bg-green-100 text-green-700" },
      { title: "Interés Compuesto", desc: "Es el interés sobre el interés. ¡Empieza joven y deja que el tiempo trabaje a tu favor!", icon: TrendingUp, color: "bg-purple-100 text-purple-700" },
      { title: "Diversificación", desc: "No pongas todos los huevos en la misma canasta. Distribuye tu riesgo.", icon: Target, color: "bg-blue-100 text-blue-700" }
    ];
    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);

  }, [user.id]);

  return (
    <div className="space-y-8">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
         <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Hola, {user.name} 👋</h1>
            <p className="text-indigo-100 text-lg md:text-xl opacity-90">Tu salud financiera se ve excelente hoy. Sigue construyendo tu futuro.</p>
            <div className="mt-8 flex gap-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 inline-block">
                <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Ahorro Total</p>
                <p className="text-3xl md:text-4xl font-bold">${totalSaved.toLocaleString()}</p>
              </div>
            </div>
         </div>
         <div className="hidden lg:block relative z-10">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
               <Award size={64} className="text-yellow-300" />
            </div>
         </div>
         {/* Decoración de fondo */}
         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Nueva Sección de Contenido Dinámico (Reemplaza el menú) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Tip del día y Accesos */}
        <div className="lg:col-span-1 space-y-6">
           {dailyTip && (
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Lightbulb size={20} className="text-yellow-500"/> Consejo del Día
               </h3>
               <div className={`p-4 rounded-xl ${dailyTip.color} mb-3`}>
                 <dailyTip.icon size={32} className="mb-2" />
                 <h4 className="font-bold text-lg">{dailyTip.title}</h4>
               </div>
               <p className="text-gray-600 text-sm leading-relaxed">{dailyTip.desc}</p>
             </div>
           )}
           
           <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2rem] border border-indigo-100">
              <h3 className="font-bold text-indigo-800 mb-2">Sigue Aprendiendo</h3>
              <p className="text-sm text-gray-600 mb-4">Descubre cursos y videos para mejorar tus finanzas.</p>
              <Button onClick={() => onNavigate('learn')} variant="secondary" className="w-full text-sm">Ir a Aprender</Button>
           </div>
        </div>

        {/* Columna Derecha: Actividad Reciente */}
        <div className="lg:col-span-2">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                  <History size={24} className="text-indigo-600"/> Actividad Reciente
                </h3>
                <Button variant="ghost" className="w-auto text-sm" onClick={() => onNavigate('goals')}>Ver todo</Button>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-12 opacity-60 flex flex-col items-center">
                   <Target size={48} className="mb-3 text-gray-300"/>
                   <p className="text-gray-500">No tienes movimientos recientes.</p>
                   <p className="text-xs text-gray-400">Tus depósitos aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50 group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors flex items-center justify-center text-green-600 font-bold">
                            <Plus size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{t.goalTitle}</p>
                            <p className="text-xs text-gray-500">{t.fecha} • Ahorro</p>
                          </div>
                       </div>
                       <span className="font-bold text-green-600 text-lg">+${t.monto.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => { setUser(userData); setCurrentView('dashboard'); };
  const handleLogout = () => { setUser(null); localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); setCurrentView('login'); };
  const handleUpdateUser = (updatedUser) => { setUser(updatedUser); };
  
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'goals': return <GoalsScreen user={user} onBack={() => setCurrentView('dashboard')} onSelectGoal={(g) => { setSelectedGoal(g); setCurrentView('goalDetails'); }} />;
      case 'goalDetails': return selectedGoal ? <GoalDetailsScreen goal={selectedGoal} onBack={() => setCurrentView('goals')} onUpdateGoal={(g) => setSelectedGoal(g)} /> : <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'profile': return <ProfileScreen user={user} onUpdateUser={handleUpdateUser} />;
      case 'simulator': return <SimulatorScreen />;
      case 'learn': return <LearnScreen />;
      default: return <div className="p-10 text-center text-gray-500">Sección en construcción</div>;
    }
  };

  if (!user) {
    if (currentView === 'register') {
      return <RegisterScreen onRegisterSuccess={handleLogin} onNavigateToLogin={() => setCurrentView('login')} />;
    }
    return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setCurrentView('register')} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout} 
        user={user} 
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-30">
           <div className="flex items-center gap-2 font-bold text-indigo-700">
             <TrendingUp size={20} /> EduFinanciera
           </div>
           <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
             <Menu size={24} />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}