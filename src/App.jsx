import React, { useState, useEffect } from 'react';
import { User, Lock, CreditCard, Target, Award, BookOpen, TrendingUp, Plus, Trash2, ChevronLeft, LogOut, Calendar, DollarSign, History, Home, Settings, Menu, X, Calculator, Video, FileText, GraduationCap, Lightbulb, PlayCircle, Save, CheckCircle, AlertCircle, Info, Clock, CheckCircle2, AlertTriangle, Loader, Gift, Star, Zap } from 'lucide-react';

// --- UTILIDADES DE ALMACENAMIENTO LOCAL Y CONSTANTES ---
const STORAGE_KEYS = {
  USERS: 'edufin_users',
  GOALS: 'edufin_goals',
  TRANSACTIONS: 'edufin_transactions',
  CURRENT_USER: 'edufin_current_user'
};

const XP_PER_LEVEL = 500; // Experiencia necesaria para subir de nivel

const REWARDS_POOL = [
  { id: 'r1', type: 'course', title: 'Acceso VIP: Masterclass de Inversión', icon: GraduationCap, color: 'text-purple-600 bg-purple-100' },
  { id: 'r2', type: 'points', title: '500 Puntos Google Play', icon: PlayCircle, color: 'text-green-600 bg-green-100' },
  { id: 'r3', type: 'gift', title: 'Tarjeta Regalo Amazon $10', icon: Gift, color: 'text-orange-600 bg-orange-100' },
  { id: 'r4', type: 'premium', title: '1 Mes Suscripción Premium', icon: Star, color: 'text-yellow-600 bg-yellow-100' },
  { id: 'r5', type: 'course', title: 'Ebook: Libertad Financiera', icon: BookOpen, color: 'text-blue-600 bg-blue-100' }
];

// Función para simular delay
const simulateDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Función para verificar y actualizar estado de metas
const verificarEstadosMetas = () => {
  const metas = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
  const hoy = new Date().toISOString().split('T')[0];
   
  const metasActualizadas = metas.map(meta => {
    const porcentaje = Math.min(100, Math.round((meta.actual / meta.objetivo) * 100));
    const completada = porcentaje >= 100;
    const vencida = !completada && meta.fechaLimite && meta.fechaLimite < hoy;
    
    return { ...meta, completada, vencida };
  });
   
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(metasActualizadas));
  return metasActualizadas;
};

// Inicializar datos de demostración
const initializeDemoData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = [
      { 
        id: 1, 
        name: "Usuario Demo", 
        email: "demo@edufin.com", 
        password: "demo123",
        level: 1,
        xp: 0,
        inventory: [] // Aquí se guardan las recompensas
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    const demoGoals = [
      { id: 1, userId: 1, titulo: "Viaje a la Playa", actual: 1500, objetivo: 5000, fechaLimite: "2024-12-31", completada: false, vencida: false },
      { id: 2, userId: 1, titulo: "Laptop Nueva", actual: 8000, objetivo: 25000, fechaLimite: "2024-10-15", completada: false, vencida: false }
    ];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(demoGoals));
  }
};

initializeDemoData();

// --- COMPONENTES UI REUTILIZABLES ---
const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled, loading = false }) => {
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
    <button type={type} onClick={onClick} disabled={disabled || loading} className={finalClass}>
      {loading ? (
        <><Loader size={18} className="animate-spin" /> Procesando...</>
      ) : children}
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
        className={`w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

// --- COMPONENTE DE NOTIFICACIONES (TOAST) ---
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 bg-white
            ${toast.type === 'success' ? 'border-green-100 text-gray-800' : ''}
            ${toast.type === 'error' ? 'border-red-100 text-gray-800' : ''}
            ${toast.type === 'info' ? 'border-blue-100 text-gray-800' : ''}
          `}
        >
          <div className={`p-2 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-600' : toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <div className="flex-1"><p className="font-medium text-sm">{toast.message}</p></div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENTE DE LOADER ---
const LoadingSpinner = ({ size = "md", text = "Cargando..." }) => {
  const sizes = { sm: "w-8 h-8 border-3", md: "w-12 h-12 border-4", lg: "w-16 h-16 border-4" };
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`${sizes[size]} border-gray-200 rounded-full`}></div>
        <div className={`${sizes[size]} border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0`}></div>
      </div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

// --- MODALES (RECOMPENSA, VIDEO, QUIZ) ---

const RewardModal = ({ visible, reward, levelUp, onClose, userLevel }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 relative z-10 text-center animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden">
        {/* Efecto de confeti visual */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-red-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-10 left-20 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        </div>

        <div className="mb-6 flex justify-center">
            {levelUp ? (
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Award size={48} className="text-white" />
                </div>
            ) : (
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-300 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Gift size={48} className="text-white" />
                </div>
            )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {levelUp ? "¡Nivel Completado!" : "¡Meta Alcanzada!"}
        </h2>
        
        <p className="text-gray-500 mb-8">
            {levelUp 
                ? `¡Increíble! Has subido al Nivel ${userLevel}. Tu disciplina financiera está dando frutos.` 
                : "Has completado tu objetivo de ahorro. ¡Felicidades!"
            }
        </p>

        {reward && (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 transform hover:scale-105 transition-transform duration-300">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Recompensa Desbloqueada</p>
                <div className="flex items-center gap-4 text-left">
                    <div className={`p-3 rounded-xl ${reward.color}`}>
                        <reward.icon size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{reward.title}</p>
                        <p className="text-xs text-gray-500">Añadido a tu inventario</p>
                    </div>
                </div>
            </div>
        )}

        <Button onClick={onClose} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none">
            ¡Genial, gracias!
        </Button>
      </div>
    </div>
  );
};

const VideoModal = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="bg-black w-full max-w-4xl rounded-2xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white border-b border-gray-800">
          <h3 className="font-bold truncate pr-4">{video.title}</h3>
          <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`} 
            title={video.title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const QuizModal = ({ quiz, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  useEffect(() => {
    if (quiz) {
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    }
  }, [quiz]);

  const handleOptionClick = (index) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
    setIsAnswerChecked(true);
    
    if (index === quiz.questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setShowResult(true);
    }
  };

  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white">
                <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-1">{quiz.title}</h2>
            {!showResult && (
                <p className="text-indigo-200 text-sm">Pregunta {currentQuestion + 1} de {quiz.questions.length}</p>
            )}
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto">
            {showResult ? (
                <div className="text-center py-8">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                        <Award size={48} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">¡Quiz Completado!</h3>
                    <p className="text-gray-500 mb-6">Tu puntuación final es:</p>
                    <div className="text-5xl font-bold text-indigo-600 mb-8">{score} / {quiz.questions.length}</div>
                    
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                        <Button onClick={() => {
                            setCurrentQuestion(0);
                            setScore(0);
                            setShowResult(false);
                            setSelectedOption(null);
                            setIsAnswerChecked(false);
                        }}>Intentar de nuevo</Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                            {quiz.questions[currentQuestion].question}
                        </h3>
                    </div>

                    <div className="space-y-3 mb-6">
                        {quiz.questions[currentQuestion].options.map((option, index) => {
                            let optionClass = "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
                            let icon = null;

                            if (isAnswerChecked) {
                                if (index === quiz.questions[currentQuestion].correct) {
                                    optionClass = "bg-green-100 border-green-500 text-green-800";
                                    icon = <CheckCircle2 size={20} className="text-green-600" />;
                                } else if (index === selectedOption) {
                                    optionClass = "bg-red-100 border-red-500 text-red-800";
                                    icon = <AlertCircle size={20} className="text-red-600" />;
                                } else {
                                    optionClass = "border-gray-100 opacity-50";
                                }
                            } else if (selectedOption === index) {
                                optionClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isAnswerChecked}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${optionClass}`}
                                >
                                    <span className="font-medium">{option}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>

                    {isAnswerChecked && (
                        <div className="animate-in slide-in-from-bottom-2 fade-in">
                            <Button onClick={handleNext}>
                                {currentQuestion + 1 === quiz.questions.length ? "Ver Resultados" : "Siguiente Pregunta"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTES DE ESTRUCTURA (LAYOUT) ---
const Sidebar = ({ currentView, onNavigate, onLogout, user, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'goals', label: 'Mis Metas', icon: Target },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
  ];
  
  const progressToNextLevel = ((user?.xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><TrendingUp size={24} /></div>
            <span className="text-xl font-bold tracking-tight">EduFinanciera</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400"><X size={24} /></button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Tarjeta de Nivel Mini */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white mb-6 shadow-md relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('profile')}>
             <div className="absolute right-0 top-0 p-2 opacity-20"><Award size={48} /></div>
             <div className="relative z-10">
                <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Nivel Actual</p>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold">{user?.level || 1}</span>
                    <span className="text-xs text-indigo-200">{Math.floor(progressToNextLevel)}% para Nivel {(user?.level || 1) + 1}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${progressToNextLevel}%` }}></div>
                </div>
             </div>
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu Principal</p>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button key={item.id} variant="ghost" onClick={() => { onNavigate(item.id); setMobileOpen(false); }} className={currentView === item.id ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600 rounded-r-none" : ""}>
                <item.icon size={20} className={currentView === item.id ? "text-indigo-600" : "text-gray-400"} /> {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{user?.name?.charAt(0) || "U"}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="danger" onClick={onLogout} className="text-sm py-2"><LogOut size={16} /> Cerrar Sesión</Button>
        </div>
      </aside>
    </>
  );
};

// --- PANTALLAS ---
const ProfileScreen = ({ user, onUpdateUser, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [stats, setStats] = useState({ totalGoals: 0, completedGoals: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const metasActualizadas = verificarEstadosMetas();
    const goals = metasActualizadas.filter(g => g.userId === user.id);
    const completed = goals.filter(g => g.completada).length;
    setStats({ totalGoals: goals.length, completedGoals: completed });
  }, [user.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await simulateDelay(1000);
      const updatedUser = { ...user, ...formData };
      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
      const newAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newAllUsers));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      
      onUpdateUser(updatedUser);
      setIsEditing(false);
      showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      showToast('Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = user.level || 1;
  const currentXP = user.xp || 0;
  const xpForNextLevel = XP_PER_LEVEL;
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;
  const userInventory = user.inventory || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User size={28} className="text-indigo-600" /> Mi Perfil
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl shadow-inner relative">
                {user.name.charAt(0)}
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                    Lvl {currentLevel}
                </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>XP: {xpInCurrentLevel} / {xpForNextLevel}</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                        </div>
                    </div>
                </div>
                <div className="md:ml-auto">
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="secondary" className="px-6">Editar Perfil</Button>
                ) : (
                    <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="w-auto" disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} className="w-auto bg-green-600 hover:bg-green-700" loading={loading} disabled={loading}>
                        {!loading && <Save size={18}/>} Guardar
                    </Button>
                    </div>
                )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing || loading} />
                <Input label="Correo Electrónico" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!isEditing || loading} />
            </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                    <Gift className="text-purple-500" /> Tus Recompensas ({userInventory.length})
                </h3>
                
                {userInventory.length === 0 ? (
                    <div className="text-center py-10 opacity-50 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Gift size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Aún no tienes recompensas.</p>
                        <p className="text-xs text-gray-400">Completa metas para ganar premios.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userInventory.map((item, idx) => {
                            const visual = REWARDS_POOL.find(r => r.id === item.id) || { icon: Gift, color: 'text-gray-600 bg-gray-100' };
                            const Icon = visual.icon;
                            return (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all bg-white">
                                    <div className={`p-3 rounded-lg ${visual.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm leading-tight">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-yellow-300" size={24} />
              <h4 className="font-bold text-lg">Nivel Financiero</h4>
            </div>
            <p className="text-indigo-200 text-sm mb-4">
                {currentLevel < 5 ? "Principiante" : currentLevel < 10 ? "Ahorrador" : "Experto"}
            </p>
            <div className="text-4xl font-bold mb-1">{currentLevel}</div>
            <p className="text-xs text-indigo-300">Sigue así para subir de nivel</p>
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

const SimulatorScreen = ({ showToast }) => {
  const [mode, setMode] = useState('investment');
  const [loading, setLoading] = useState(false);
  
  const [invAmount, setInvAmount] = useState('');
  const [invRate, setInvRate] = useState('');
  const [invTime, setInvTime] = useState('');
  const [invResult, setInvResult] = useState(null);

  const [credAmount, setCredAmount] = useState('');
  const [credRate, setCredRate] = useState('');
  const [credDate, setCredDate] = useState('');
  const [credResult, setCredResult] = useState(null);

  const calculateInvestment = async (e) => {
    e.preventDefault();
    if(!invAmount || !invRate || !invTime) { showToast('Por favor completa todos los campos', 'error'); return; }
    setLoading(true); setInvResult(null);
    try {
      await simulateDelay(1200);
      const P = parseFloat(invAmount); const r = parseFloat(invRate) / 100 / 12; const t = parseFloat(invTime);
      const A = P * Math.pow((1 + r), t);
      setInvResult({ total: A, interest: A - P });
      showToast('Cálculo completado', 'success');
    } catch (error) { showToast('Error en el cálculo', 'error'); } finally { setLoading(false); }
  };

  const calculateCredit = async (e) => {
    e.preventDefault();
    if(!credAmount || !credRate || !credDate) { showToast('Por favor completa todos los campos', 'error'); return; }
    setLoading(true); setCredResult(null);
    try {
      await simulateDelay(1200);
      const P = parseFloat(credAmount); const annualRate = parseFloat(credRate) / 100;
      const start = new Date(); const end = new Date(credDate);
      if (end <= start) { showToast('La fecha debe ser futura', 'error'); setLoading(false); return; }
      const diffTime = Math.abs(end - start); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const diffYears = diffDays / 365;
      const interest = P * annualRate * diffYears; const total = P + interest;
      setCredResult({ total, interest, days: diffDays });
      showToast('Cálculo completado', 'success');
    } catch (error) { showToast('Error en el cálculo', 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="animate-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calculator size={28} className="text-indigo-600" /> Simulador Financiero
      </h2>
      <div className="flex p-1 bg-gray-200 rounded-xl mb-8 max-w-md">
        <button onClick={() => { setMode('investment'); setInvResult(null); setCredResult(null); }} className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'investment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Inversión (Ahorro)</button>
        <button onClick={() => { setMode('credit'); setInvResult(null); setCredResult(null); }} className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'credit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Crédito (Préstamo)</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          {mode === 'investment' ? (
            <form onSubmit={calculateInvestment}>
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Proyecta tu Inversión</h3>
              <Input label="Monto inicial ($)" type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} required placeholder="1000" disabled={loading} />
              <Input label="Tasa de interés anual (%)" type="number" value={invRate} onChange={e => setInvRate(e.target.value)} required placeholder="10" disabled={loading} />
              <Input label="Tiempo (meses)" type="number" value={invTime} onChange={e => setInvTime(e.target.value)} required placeholder="12" disabled={loading} />
              <Button type="submit" loading={loading} disabled={loading}>Calcular Rendimiento</Button>
            </form>
          ) : (
             <form onSubmit={calculateCredit}>
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Calcula tu Deuda</h3>
              <Input label="Monto a solicitar ($)" type="number" value={credAmount} onChange={e => setCredAmount(e.target.value)} required placeholder="5000" disabled={loading} />
              <Input label="Tasa de interés anual (%)" type="number" value={credRate} onChange={e => setCredRate(e.target.value)} required placeholder="25" disabled={loading} />
              <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago total</label><input type="date" className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none disabled:opacity-60" value={credDate} onChange={e => setCredDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} disabled={loading} /></div>
              <Button type="submit" loading={loading} disabled={loading}>Calcular Intereses</Button>
            </form>
          )}
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2rem] border border-indigo-100 flex flex-col justify-center items-center text-center">
           {loading ? <LoadingSpinner text="Calculando..." /> : !invResult && !credResult ? (
             <div className="opacity-50"><Calculator size={64} className="mb-4 mx-auto text-indigo-300" /><p className="text-gray-500">Ingresa los datos para ver la simulación</p></div>
           ) : mode === 'investment' && invResult ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-2">
               <p className="text-gray-500 font-medium mb-1">Obtendrás un total de</p><h3 className="text-4xl font-bold text-green-600 mb-6">${invResult.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-2 flex justify-between"><span>Tu capital:</span><span className="font-bold">${parseFloat(invAmount).toLocaleString()}</span></div>
               <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full flex justify-between text-green-700"><span>Interés Ganado:</span><span className="font-bold">+${invResult.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
             </div>
           ) : mode === 'credit' && credResult ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-2">
               <p className="text-gray-500 font-medium mb-1">Total a pagar</p><h3 className="text-4xl font-bold text-red-600 mb-2">${credResult.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3><p className="text-xs text-gray-400 mb-6">En un plazo de {credResult.days} días</p>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-2 flex justify-between"><span>Préstamo:</span><span className="font-bold">${parseFloat(credAmount).toLocaleString()}</span></div>
               <div className="bg-red-50 p-4 rounded-xl border border-red-100 w-full flex justify-between text-red-700"><span>Interés Generado:</span><span className="font-bold">+${credResult.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

// --- LEARNSCREEN (ACTUALIZADO CON MODALES FUNCIONALES Y VIDEOS ESPECÍFICOS) ---
const LearnScreen = () => {
  const [activeTab, setActiveTab] = useState('tips');
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const content = {
    tips: [
      { id: 1, title: "La regla del 50/30/20", desc: "Destina 50% a necesidades, 30% a deseos y 20% a ahorros.", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
      { id: 2, title: "Fondo de Emergencia", desc: "Ahorra al menos 3 meses de tus gastos fijos para imprevistos.", icon: Lock, color: "bg-green-100 text-green-700" },
      { id: 3, title: "Evita gastos hormiga", desc: "El café diario suma. Identifica pequeños gastos innecesarios.", icon: Target, color: "bg-red-100 text-red-700" },
      { id: 4, title: "Interés Compuesto", desc: "El dinero genera dinero. Empieza a invertir lo antes posible.", icon: TrendingUp, color: "bg-purple-100 text-purple-700" }
    ],
    // Videos actualizados con la información proporcionada
    videos: [
      { id: 'v1', youtubeId: '7h0USmJk2-A', title: "¿Qué es el INTERÉS COMPUESTO?", duration: "07:38", thumbnail: "bg-indigo-900" },
      { id: 'v2', youtubeId: 'TwpF7hawfGg', title: "La regla del 50-30-20 y por qué no funciona", duration: "01:56", thumbnail: "bg-blue-800" },
      { id: 'v3', youtubeId: 'Vg4CL6GmvrU', title: "¿Cómo INVERTIR tu DINERO? Guía 2025", duration: "16:41", thumbnail: "bg-purple-900" },
      { id: 'v4', youtubeId: 'vCxbRuSG9S8', title: "5 hábitos que te hacen pobre en tus 20´s", duration: "07:35", thumbnail: "bg-gray-800" }
    ],
    // Quizzes interactivos que reemplazan a los cursos
    quizzes: [
      {
        id: 'q1',
        title: "Básicos de Finanzas",
        level: "Fácil",
        questions: [
            { question: "¿Qué es un fondo de emergencia?", options: ["Dinero para comprar regalos", "Ahorro para imprevistos (3-6 meses de gastos)", "Fondo para invertir en bolsa", "Dinero para vacaciones"], correct: 1 },
            { question: "Según la regla 50/30/20, ¿cuánto debes destinar al ahorro?", options: ["50%", "10%", "20%", "30%"], correct: 2 },
            { question: "¿Qué es la inflación?", options: ["Aumento generalizado de precios", "Bajada de precios", "Ganancia en inversiones", "Un tipo de impuesto"], correct: 0 }
        ]
      },
      {
        id: 'q2',
        title: "Experto en Inversiones",
        level: "Medio",
        questions: [
            { question: "¿Qué es una acción?", options: ["Un préstamo al gobierno", "Una parte propietaria de una empresa", "Una cuenta de ahorro", "Un seguro de vida"], correct: 1 },
            { question: "¿Cuál de estos activos suele tener menor riesgo?", options: ["Criptomonedas", "Acciones individuales", "Bonos del Gobierno (Cetes)", "Startups"], correct: 2 },
            { question: "¿Qué es el interés compuesto?", options: ["Interés que solo se paga una vez", "Ganar intereses sobre los intereses generados", "Interés fijo bancario", "Impuesto a las ganancias"], correct: 1 },
            { question: "¿Qué significa diversificar?", options: ["Poner todo el dinero en Apple", "No invertir nada", "Distribuir la inversión en varios activos para reducir riesgo", "Gastar el dinero en diferentes tiendas"], correct: 2 }
        ]
      },
      {
        id: 'q3',
        title: "Tarjetas y Crédito",
        level: "Difícil",
        questions: [
            { question: "¿Qué es el pago mínimo de una tarjeta?", options: ["Lo ideal para pagar", "El pago para no generar intereses", "La cantidad mínima para no caer en mora (pero genera intereses)", "La anualidad de la tarjeta"], correct: 2 },
            { question: "¿Qué es el CAT?", options: ["Costo Anual Total", "Comisión Anual de Tarjeta", "Crédito a Tasa", "Cargo Automático Total"], correct: 0 },
            { question: "Si eres 'totalero', ¿cuántos intereses pagas?", options: ["Muchos", "El 50%", "Cero", "Solo el IVA"], correct: 2 }
        ]
      }
    ]
  };

  const handleLoadContent = async (tab) => {
    setLoading(true);
    await simulateDelay(600);
    setActiveTab(tab);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      <QuizModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen size={28} className="text-indigo-600" /> Aprender
      </h2>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
         {['tips', 'videos', 'quizzes'].map(tab => (
           <button
             key={tab}
             onClick={() => handleLoadContent(tab)}
             disabled={loading}
             className={`px-6 py-2 rounded-full font-bold capitalize whitespace-nowrap transition-colors 
               ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'} 
               ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
             {tab === 'tips' ? 'Tips Rápidos' : tab === 'quizzes' ? 'Quizzes' : tab}
           </button>
         ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando contenido..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'tips' && content.tips.map(tip => (
            <div key={tip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:-translate-y-1 transform duration-200">
              <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center mb-4`}><tip.icon size={24} /></div>
              <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}

          {activeTab === 'videos' && content.videos.map(vid => (
            <div key={vid.id} onClick={() => setSelectedVideo(vid)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
               <div className={`h-48 relative flex items-center justify-center overflow-hidden`}>
                 <div className={`absolute inset-0 ${vid.thumbnail} opacity-90 group-hover:scale-110 transition-transform duration-500`}></div>
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                 <PlayCircle className="text-white opacity-90 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg relative z-10" size={56} />
                 <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{vid.duration}</span>
               </div>
               <div className="p-5">
                 <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors leading-tight mb-2">{vid.title}</h3>
                 <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600"><Video size={12} /></div><p className="text-xs text-gray-500 font-medium">Video Educativo • YouTube</p></div>
               </div>
            </div>
          ))}

          {activeTab === 'quizzes' && content.quizzes.map(quiz => (
            <div key={quiz.id} onClick={() => setSelectedQuiz(quiz)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-indigo-300 transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-500"><FileText size={100} className="text-indigo-600" /></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${quiz.level === 'Fácil' ? 'bg-green-100 text-green-700' : quiz.level === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{quiz.level}</span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><CheckCircle size={12} /> {quiz.questions.length} Preguntas</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-2 mb-6">Pon a prueba tu conocimiento financiero</p>
                <Button className="w-full bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 group-hover:border-indigo-200" variant="ghost">Iniciar Quiz</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PANTALLAS DE LOGIN/REGISTRO Y DASHBOARD ---
const LoginScreen = ({ onLogin, onNavigateToRegister, showToast }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Completa todos los campos"); showToast("Completa todos los campos", 'error'); return; }
    setLoading(true); setError("");
    try {
      await simulateDelay(1200);
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
      const savedUser = users.find(u => u.email === form.email && u.password === form.password);
      if (savedUser) {
        const userData = { ...savedUser };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
        showToast(`¡Bienvenido de nuevo, ${userData.name}!`, 'success');
        onLogin(userData);
      } else {
        if (form.email === "demo@edufin.com" && form.password === "demo123") {
          const userData = users.find(u => u.email === "demo@edufin.com") || { id: 1, name: "Usuario Demo", email: form.email, level: 1, xp: 0, inventory: [] };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
          showToast(`¡Bienvenido, Usuario Demo!`, 'success');
          onLogin(userData);
        } else {
          showToast("Credenciales incorrectas", 'error'); setError("Email o contraseña incorrectos");
        }
      }
    } catch (error) { showToast("Error al iniciar sesión", 'error'); setError("Error al conectar"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10"><TrendingUp size={400} className="-translate-x-20 translate-y-20" /></div>
          <div className="relative z-10">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={32} /></div>
             <h1 className="text-4xl font-bold mb-4">EduFinanciera</h1>
             <p className="text-indigo-100 text-lg">Tu compañero inteligente para alcanzar la libertad financiera.</p>
             <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm"><p className="text-sm font-medium mb-2">Credenciales de demostración:</p><p className="text-sm opacity-90">Email: demo@edufin.com</p><p className="text-sm opacity-90">Contraseña: demo123</p></div>
          </div>
          <div className="relative z-10"><p className="text-sm text-indigo-200">© 2025 EduFinanciera Inc.</p></div>
        </div>
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-500 mb-8">Ingresa tus datos para acceder</p>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2"><div className="w-1 h-4 bg-red-500 rounded-full"></div>{error}</div>}
            <form onSubmit={handleSubmit}>
              <Input label="Correo Electrónico" type="email" placeholder="hola@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={loading} />
              <Input label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={loading} />
              <div className="mt-8"><Button type="submit" loading={loading} disabled={loading}>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</Button></div>
            </form>
            <p className="mt-8 text-center text-gray-600">¿No tienes cuenta? <button onClick={() => onNavigateToRegister()} className="text-indigo-600 font-bold hover:underline" disabled={loading}>Regístrate gratis</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegisterSuccess, onNavigateToLogin, showToast }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "El nombre es requerido";
    if (!form.email.trim()) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email inválido";
    if (!form.password) newErrors.password = "La contraseña es requerida";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    if (users.some(u => u.email === form.email)) { newErrors.email = "Este email ya está registrado"; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { showToast("Por favor corrige los errores", 'error'); return; }
    setLoading(true);
    try {
      await simulateDelay(1500);
      const newUser = { 
        id: Date.now(), 
        name: form.name, 
        email: form.email, 
        password: form.password,
        level: 1,
        xp: 0,
        inventory: []
      };
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, newUser]));
      showToast("¡Cuenta creada con éxito!", 'success');
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setTimeout(() => { onNavigateToLogin(); }, 1000);
    } catch (error) { showToast("Error al crear cuenta", 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg p-10 rounded-[2rem] shadow-2xl relative">
        <button onClick={onNavigateToLogin} className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={loading}><ChevronLeft className="text-gray-600" /></button>
        <div className="text-center mb-8 mt-4"><h2 className="text-3xl font-bold text-gray-800">Crear Cuenta</h2><p className="text-gray-500">Únete a nuestra comunidad de ahorradores</p></div>
        <form onSubmit={handleSubmit}>
          <Input label="Nombre Completo" placeholder="Ej. Ana García" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={loading} />
          {errors.name && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.name}</p>}
          <Input label="Correo Electrónico" type="email" placeholder="hola@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={loading} />
          {errors.email && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.email}</p>}
          <Input label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={loading} />
          {errors.password && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.password}</p>}
          <Input label="Confirmar Contraseña" type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required disabled={loading} />
          {errors.confirmPassword && <p className="text-red-500 text-sm -mt-3 mb-3">{errors.confirmPassword}</p>}
          <div className="mt-6"><Button type="submit" loading={loading} disabled={loading}>{loading ? "Creando cuenta..." : "Registrarme"}</Button></div>
        </form>
        <div className="mt-6 text-center"><p className="text-sm text-gray-500">Al registrarte, aceptas nuestros{' '}<button className="text-indigo-600 hover:underline">Términos</button> y{' '}<button className="text-indigo-600 hover:underline">Política de Privacidad</button></p></div>
      </div>
    </div>
  );
};

const GoalDetailsScreen = ({ goal, onBack, onUpdateGoal, showToast, user, onUpdateUser }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState(null);
  const [isLevelUp, setIsLevelUp] = useState(false);
  
  const porcentaje = Math.min(100, Math.round((goal.actual / goal.objetivo) * 100));
  const completada = porcentaje >= 100;
  const hoy = new Date().toISOString().split('T')[0];
  const vencida = !completada && goal.fechaLimite && goal.fechaLimite < hoy;

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      await simulateDelay(800);
      const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
      const goalTransactions = allTransactions.filter(t => t.metaId === goal.id);
      setHistory(goalTransactions.reverse());
      setHistoryLoading(false);
    };
    loadHistory();
  }, [goal.id]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (completada) { showToast("¡Meta completada! No puedes agregar más dinero.", 'error'); return; }
    if (vencida) { showToast("La meta ha vencido. No puedes agregar más dinero.", 'error'); return; }
    if (!amount || amount <= 0) { showToast("Ingresa un monto válido", 'error'); return; }
    
    const depositAmount = Number(amount);
    const nuevoTotal = goal.actual + depositAmount;
    if (nuevoTotal > goal.objetivo) { showToast(`No puedes exceder el objetivo de $${goal.objetivo.toLocaleString()}. El máximo que puedes agregar es $${(goal.objetivo - goal.actual).toLocaleString()}`, 'error'); return; }
    
    setLoading(true);
    try {
      await simulateDelay(1200);
      const newTransaction = { id: Date.now(), metaId: goal.id, monto: depositAmount, fecha: date, tipo: 'deposito' };
      const currentTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...currentTransactions, newTransaction]));

      const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
      const updatedGoals = allGoals.map(g => {
        if (g.id === goal.id) {
          const nuevoPorcentaje = Math.min(100, Math.round(((g.actual + depositAmount) / g.objetivo) * 100));
          return { ...g, actual: g.actual + depositAmount, completada: nuevoPorcentaje >= 100 };
        }
        return g;
      });
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
      
      const metaCompletadaAhora = nuevoTotal >= goal.objetivo;
      
      if (metaCompletadaAhora) {
          const xpGain = 300;
          const currentXp = user.xp || 0;
          const currentLevel = user.level || 1;
          const newXp = currentXp + xpGain;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          const levelUp = newLevel > currentLevel;
          const randomReward = REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)];
          const newReward = { ...randomReward, date: new Date().toISOString() };
          
          const updatedUser = { ...user, xp: newXp, level: newLevel, inventory: [...(user.inventory || []), newReward] };

          const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
          const newAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newAllUsers));
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          onUpdateUser(updatedUser);

          setEarnedReward(newReward);
          setIsLevelUp(levelUp);
          setShowRewardModal(true);
      } else {
         showToast("¡Ahorro registrado exitosamente!", 'success');
      }
      
      const metaActualizada = updatedGoals.find(g => g.id === goal.id);
      onUpdateGoal(metaActualizada);
      setHistory(prev => [newTransaction, ...prev]);
      setAmount("");
    } catch (error) {
      showToast("Error al guardar el depósito", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500 relative">
      <RewardModal visible={showRewardModal} reward={earnedReward} levelUp={isLevelUp} userLevel={user?.level} onClose={() => setShowRewardModal(false)} />

      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium" disabled={loading}><ChevronLeft size={20} /> Volver a Metas</button>
      </div>
      
      {completada && <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-200"><div className="bg-white/20 p-2 rounded-full"><Gift size={24} className="text-white" /></div><div><p className="font-bold">¡Meta Completada!</p><p className="text-sm opacity-90">¡Revisa tu perfil para ver tus recompensas!</p></div></div>}
      
      {vencida && !completada && <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl flex items-center gap-3"><AlertTriangle size={24} className="text-white" /><div><p className="font-bold">Meta Vencida</p><p className="text-sm opacity-90">La fecha límite ha pasado y no se alcanzó el objetivo.</p></div></div>}
      
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10"><Target size={200} /></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
            <div>
              <p className="text-indigo-200 font-medium mb-1 uppercase tracking-wide text-sm">Detalle de Meta</p>
              <h1 className="text-3xl md:text-4xl font-bold">{goal.titulo}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-indigo-200"><Calendar size={14} /><span>Fecha límite: {goal.fechaLimite}</span></div>
                {goal.fechaLimite && <div className="flex items-center gap-1 text-sm text-white bg-white/20 px-2 py-0.5 rounded-full"><Clock size={14} /><span>{vencida ? 'Vencida' : completada ? 'Completada' : 'En progreso'}</span></div>}
              </div>
            </div>
            <div className="text-right"><span className="text-4xl font-bold block">${goal.actual.toLocaleString()}</span><span className="text-indigo-200">de ${goal.objetivo.toLocaleString()}</span></div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold mb-2"><span>Progreso</span><span>{porcentaje}%</span></div>
            <div className="bg-black/20 rounded-full h-4 w-full overflow-hidden backdrop-blur-sm border border-white/10">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)] ${completada ? 'bg-green-400' : vencida ? 'bg-amber-400' : 'bg-white'}`} style={{ width: `${porcentaje}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className={`p-2 rounded-lg ${completada || vencida ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}><Plus size={20} /></div>
              <h3 className="font-bold text-gray-800 text-lg">Registrar Ahorro</h3>
            </div>
            {(completada || vencida) ? (
              <div className="text-center p-6">
                <div className="mb-4">{completada ? <CheckCircle2 size={48} className="mx-auto text-green-400" /> : <AlertTriangle size={48} className="mx-auto text-amber-400" />}</div>
                <p className="text-gray-600 font-medium mb-2">{completada ? 'Esta meta ya está completada al 100%' : 'Esta meta ha vencido'}</p>
                <p className="text-sm text-gray-500">{completada ? '¡Felicidades! Has alcanzado tu objetivo.' : 'La fecha límite ha pasado. Puedes crear una nueva meta.'}</p>
              </div>
            ) : (
              <form onSubmit={handleDeposit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">CANTIDAD</label>
                    <div className="relative"><DollarSign size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 font-bold text-gray-800 text-lg" placeholder="0.00" required max={goal.objetivo - goal.actual} step="0.01" disabled={loading} /></div>
                    <p className="text-xs text-gray-500 mt-1">Máximo permitido: ${(goal.objetivo - goal.actual).toLocaleString()}</p>
                  </div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">FECHA</label><div className="relative"><Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 font-medium text-gray-800" required max={goal.fechaLimite || undefined} disabled={loading} /></div></div>
                </div>
                <Button type="submit" loading={loading} disabled={loading || completada || vencida} className="bg-green-600 hover:bg-green-700 shadow-green-200 text-lg">{loading ? "Guardando..." : "Agregar Dinero"}</Button>
              </form>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
             <div className="flex items-center gap-2 mb-6"><History size={20} className="text-gray-400" /><h3 className="font-bold text-gray-800 text-lg">Historial de Transacciones</h3></div>
             {historyLoading ? <LoadingSpinner text="Cargando historial..." /> : history.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center justify-center opacity-50"><Target size={48} className="mb-4 text-gray-300" /><p className="text-gray-500">No hay movimientos registrados aún.</p><p className="text-sm text-gray-400 mt-2">Los depósitos aparecerán aquí automáticamente</p></div>
             ) : (
               <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-4">Tipo</th><th className="p-4">Fecha</th><th className="p-4 text-right">Monto</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xs font-bold">+</div><span className="font-medium text-gray-800">Depósito</span></td>
                          <td className="p-4 text-gray-500 text-sm">{item.fecha}</td>
                          <td className="p-4 text-right font-bold text-green-600">+${Number(item.monto).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const GoalsScreen = ({ onBack, user, onSelectGoal, showToast }) => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMeta, setNewMeta] = useState({ titulo: "", objetivo: "", fechaLimite: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      await simulateDelay(800);
      const metasActualizadas = verificarEstadosMetas();
      const userGoals = metasActualizadas.filter(g => g.userId === user.id || g.userId === undefined);
      setMetas(userGoals);
      setLoading(false);
    };
    loadGoals();
  }, [user.id]);

  const handleAddMeta = async () => {
    if (!newMeta.titulo.trim() || !newMeta.objetivo) { showToast("Completa la información de la meta", 'error'); return; }
    if (!newMeta.fechaLimite) { showToast("Debes establecer una fecha límite para la meta", 'error'); return; }
    const hoy = new Date().toISOString().split('T')[0];
    if (newMeta.fechaLimite <= hoy) { showToast("La fecha límite debe ser futura", 'error'); return; }
    setSaving(true);
    try {
      await simulateDelay(1200);
      const metaData = { id: Date.now(), titulo: newMeta.titulo, actual: 0, objetivo: Number(newMeta.objetivo), fechaLimite: newMeta.fechaLimite, userId: user.id, completada: false, vencida: false };
      const updatedGoals = [...metas, metaData];
      setMetas(updatedGoals);
      const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...allGoals, metaData]));
      showToast("¡Meta creada exitosamente!", 'success');
      setNewMeta({ titulo: "", objetivo: "", fechaLimite: "" });
      setShowModal(false);
    } catch (error) { showToast("Error al crear la meta", 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.")) { return; }
    try {
      await simulateDelay(800);
      const filtered = metas.filter(m => m.id !== id);
      setMetas(filtered);
      const allGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || "[]");
      const newAllGoals = allGoals.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newAllGoals));
      showToast("Meta eliminada", 'info');
    } catch (error) { showToast("Error al eliminar la meta", 'error'); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-2xl font-bold text-gray-800">Mis Metas</h2><p className="text-gray-500">Visualiza y gestiona tus objetivos de ahorro</p></div>
        <Button onClick={() => setShowModal(true)} className="w-auto px-6"><Plus size={20} /> Nueva Meta</Button>
      </div>
      {loading ? <LoadingSpinner text="Cargando metas..." /> : metas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 p-12"><Target size={64} className="text-indigo-200 mb-4" /><h3 className="text-xl font-bold text-gray-700 mb-2">Aún no tienes metas</h3><p className="text-gray-500 mb-6">Crea tu primera meta de ahorro para empezar.</p><Button onClick={() => setShowModal(true)} className="w-auto">Crear Meta</Button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metas.map((meta) => {
            const porcentaje = Math.min(100, Math.round((meta.actual / meta.objetivo) * 100));
            const hoy = new Date().toISOString().split('T')[0];
            const vencida = !meta.completada && meta.fechaLimite && meta.fechaLimite < hoy;
            return (
              <div key={meta.id} onClick={() => onSelectGoal(meta)} className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden ${meta.completada ? 'border-green-200' : vencida ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="absolute top-4 right-4">{meta.completada ? <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Completada</span> : vencida ? <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1"><AlertTriangle size={12} /> Vencida</span> : <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1"><Clock size={12} /> En progreso</span>}</div>
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => handleDelete(e, meta.id)} className="text-red-300 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full shadow-sm transition-colors"><Trash2 size={18} /></button></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.completada ? 'bg-green-100 text-green-600' : vencida ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}><Target size={24} /></div>
                  <div><h3 className="font-bold text-gray-800 text-lg leading-tight">{meta.titulo}</h3><div className="flex items-center gap-2 mt-1"><Calendar size={12} className="text-gray-400" /><p className="text-xs text-gray-400">Hasta: {meta.fechaLimite}</p></div></div>
                </div>
                <div className="mt-4"><div className="flex justify-between text-sm font-bold mb-2"><span className="text-gray-700">${meta.actual.toLocaleString()}</span><span className={meta.completada ? 'text-green-600' : vencida ? 'text-amber-600' : 'text-indigo-600'}>{porcentaje}%</span></div><div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className={`h-3 rounded-full transition-all duration-1000 ease-out ${meta.completada ? 'bg-green-500' : vencida ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${porcentaje}%` }}></div></div></div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Nueva Meta de Ahorro</h3>
            <Input label="Nombre de la meta" placeholder="Ej. Viaje a Europa" value={newMeta.titulo} onChange={(e) => setNewMeta({ ...newMeta, titulo: e.target.value })} required disabled={saving} />
            <Input label="Objetivo ($)" type="number" placeholder="25000" value={newMeta.objetivo} onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })} required disabled={saving} />
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite <span className="text-red-500">*</span></label><div className="relative"><Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="date" required className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-60" value={newMeta.fechaLimite} onChange={(e) => setNewMeta({ ...newMeta, fechaLimite: e.target.value })} min={new Date().toISOString().split('T')[0]} disabled={saving} /></div><p className="text-xs text-gray-500 mt-1">Establece una fecha realista para alcanzar tu meta</p></div>
            <div className="flex gap-4 mt-8"><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button><Button onClick={handleAddMeta} loading={saving} disabled={saving}>Guardar Meta</Button></div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await simulateDelay(1000);
      const metasActualizadas = verificarEstadosMetas();
      const userGoals = metasActualizadas.filter(g => g.userId === user.id);
      const total = userGoals.reduce((acc, curr) => acc + curr.actual, 0);
      setTotalSaved(total);

      const allTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "[]");
      const userGoalIds = userGoals.map(g => g.id);
      const userTransactions = allTransactions
        .filter(t => userGoalIds.includes(t.metaId))
        .map(t => {
          const goal = userGoals.find(g => g.id === t.metaId);
          return { ...t, goalTitle: goal ? goal.titulo : 'Meta desconocida' };
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id)
        .slice(0, 5);
      setRecentTransactions(userTransactions);

      const tips = [
        { title: "La regla del 50/30/20", desc: "Destina 50% a necesidades, 30% a deseos y 20% a ahorros.", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
        { title: "Fondo de Emergencia", desc: "Ahorra al menos 3 meses de tus gastos fijos para imprevistos.", icon: Lock, color: "bg-green-100 text-green-700" },
        { title: "Interés Compuesto", desc: "Es el interés sobre el interés. ¡Empieza joven y deja que el tiempo trabaje a tu favor!", icon: TrendingUp, color: "bg-purple-100 text-purple-700" },
        { title: "Diversificación", desc: "No pongas todos los huevos en la misma canasta. Distribuye tu riesgo.", icon: Target, color: "bg-blue-100 text-blue-700" }
      ];
      setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
      setLoading(false);
    };
    loadDashboardData();
  }, [user.id]);

  return (
    <div className="space-y-8">
      {loading ? <LoadingSpinner text="Cargando dashboard..." /> : (
        <>
          <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl md:text-5xl font-bold">Hola, {user.name} 👋</h1>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold border border-white/20 flex items-center gap-1">
                        <Award size={16} className="text-yellow-300" /> Nivel {user.level || 1}
                    </div>
                </div>
                <p className="text-indigo-100 text-lg md:text-xl opacity-90">Tu salud financiera se ve excelente hoy. Sigue construyendo tu futuro.</p>
                <div className="mt-8 flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 inline-block">
                    <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Ahorro Total</p>
                    <p className="text-3xl md:text-4xl font-bold">${totalSaved.toLocaleString()}</p>
                  </div>
                </div>
            </div>
            <div className="hidden lg:block relative z-10"><div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20"><Award size={64} className="text-yellow-300" /></div></div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {dailyTip && (
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Lightbulb size={20} className="text-yellow-500"/> Consejo del Día</h3>
                  <div className={`p-4 rounded-xl ${dailyTip.color} mb-3`}><dailyTip.icon size={32} className="mb-2" /><h4 className="font-bold text-lg">{dailyTip.title}</h4></div>
                  <p className="text-gray-600 text-sm leading-relaxed">{dailyTip.desc}</p>
                </div>
              )}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2rem] border border-indigo-100">
                <h3 className="font-bold text-indigo-800 mb-2">Sigue Aprendiendo</h3>
                <p className="text-sm text-gray-600 mb-4">Descubre cursos y videos para mejorar tus finanzas.</p>
                <Button onClick={() => onNavigate('learn')} variant="secondary" className="w-full text-sm">Ir a Aprender</Button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-800 text-xl flex items-center gap-2"><History size={24} className="text-indigo-600"/> Actividad Reciente</h3><Button variant="ghost" className="w-auto text-sm" onClick={() => onNavigate('goals')}>Ver todo</Button></div>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12 opacity-60 flex flex-col items-center"><Target size={48} className="mb-3 text-gray-300"/><p className="text-gray-500">No tienes movimientos recientes.</p><p className="text-xs text-gray-400">Tus depósitos aparecerán aquí.</p></div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50 group">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors flex items-center justify-center text-green-600 font-bold"><Plus size={18} /></div><div><p className="font-bold text-gray-800">{t.goalTitle}</p><p className="text-xs text-gray-500">{t.fecha} • Ahorro</p></div></div><span className="font-bold text-green-600 text-lg">+${t.monto.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000);
  };
  const removeToast = (id) => { setToasts(prev => prev.filter(t => t.id !== id)); };

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) { setUser(JSON.parse(savedUser)); setCurrentView('dashboard'); }
  }, []);

  useEffect(() => {
    if (user) {
      verificarEstadosMetas();
      const interval = setInterval(verificarEstadosMetas, 3600000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); setCurrentView('dashboard'); };
  const handleLogout = () => { setTimeout(() => { setUser(null); localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); setCurrentView('login'); showToast("Sesión cerrada correctamente", 'info'); }, 800); };
  const handleUpdateUser = (updatedUser) => { setUser(updatedUser); };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'goals': return <GoalsScreen user={user} onBack={() => setCurrentView('dashboard')} onSelectGoal={(g) => { setSelectedGoal(g); setCurrentView('goalDetails'); }} showToast={showToast} />;
      case 'goalDetails': return selectedGoal ? <GoalDetailsScreen goal={selectedGoal} onBack={() => setCurrentView('goals')} onUpdateGoal={(g) => setSelectedGoal(g)} showToast={showToast} user={user} onUpdateUser={handleUpdateUser} /> : <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'profile': return <ProfileScreen user={user} onUpdateUser={handleUpdateUser} showToast={showToast} />;
      case 'simulator': return <SimulatorScreen showToast={showToast} />;
      case 'learn': return <LearnScreen />;
      default: return <div className="p-10 text-center text-gray-500">Sección en construcción</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {!user ? (
        currentView === 'register' ? (
            <RegisterScreen onRegisterSuccess={() => { showToast("¡Registro exitoso! Ahora puedes iniciar sesión", 'success'); setCurrentView('login'); }} onNavigateToLogin={() => setCurrentView('login')} showToast={showToast} />
        ) : (
            <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setCurrentView('register')} showToast={showToast} />
        )
      ) : (
        <>
            <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} user={user} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-30">
                <div className="flex items-center gap-2 font-bold text-indigo-700"><TrendingUp size={20} /> EduFinanciera</div>
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">{renderContent()}</div>
                </div>
            </main>
        </>
      )}
    </div>
  );
}