import React, { useState } from 'react';
import { User, Lock, CreditCard, Target, Award, BookOpen, TrendingUp, Plus, Trash2, ChevronLeft, LogOut } from 'lucide-react';

// --- COMPONENTES UI REUTILIZABLES ---
const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled }) => {
  const baseStyle = "w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:bg-gray-100"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        required={required}
        className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const Card = ({ title, icon: Icon, onClick, color = "bg-white" }) => (
  <div onClick={onClick} className={`${color} p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col items-center justify-center gap-3 aspect-square`}>
    <div className="p-3 bg-white/90 rounded-full shadow-sm">
      <Icon size={24} className="text-indigo-600" />
    </div>
    <span className="font-semibold text-gray-700 text-center text-sm">{title}</span>
  </div>
);

// --- PANTALLAS ---

const LoginScreen = ({ onLogin }) => {
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

    // Simulación de login exitoso después de 1 segundo
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: "Karla", email: form.email });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3">
            <TrendingUp className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">EduFinanciera</h1>
        <p className="text-center text-gray-500 mb-8">Tu futuro financiero empieza hoy</p>

        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess({ name: form.name, email: form.email });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre Completo"
            placeholder="Karla Pérez"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Crea una contraseña segura"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarme"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const GoalsScreen = ({ onBack, user }) => {
  const [metas, setMetas] = useState([
    { id: 1, titulo: "Viaje a la Playa", actual: 1500, objetivo: 5000 },
    { id: 2, titulo: "MacBook Pro", actual: 8000, objetivo: 25000 },
    { id: 3, titulo: "Fondo de Emergencia", actual: 500, objetivo: 10000 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newMeta, setNewMeta] = useState({ titulo: "", objetivo: "" });

  const calcularPorcentaje = (actual, objetivo) => Math.min(100, Math.round((actual / objetivo) * 100));

  const handleAddMeta = () => {
    if (!newMeta.titulo.trim() || !newMeta.objetivo) return;

    setMetas([...metas, {
      id: Date.now(),
      titulo: newMeta.titulo,
      actual: 0,
      objetivo: Number(newMeta.objetivo)
    }]);

    setNewMeta({ titulo: "", objetivo: "" });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setMetas(metas.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Mis Metas</h2>
      </div>

      <div className="p-4 space-y-4">
        {metas.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Aún no tienes metas. ¡Crea tu primera!</p>
        ) : (
          metas.map((meta) => {
            const porcentaje = calcularPorcentaje(meta.actual, meta.objetivo);
            return (
              <div key={meta.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{meta.titulo}</h3>
                    <p className="text-xs text-gray-500 font-medium">Meta: ${meta.objetivo.toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(meta.id)} className="text-red-400 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="relative pt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-indigo-600">${meta.actual.toLocaleString()}</span>
                    <span className="text-gray-400">{porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* Modal Nueva Meta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom-10 fade-in">
            <h3 className="text-lg font-bold mb-4">Nueva Meta</h3>
            <Input
              label="Nombre de la meta"
              placeholder="Ej. Viaje a Europa"
              value={newMeta.titulo}
              onChange={(e) => setNewMeta({ ...newMeta, titulo: e.target.value })}
              required
            />
            <Input
              label="Objetivo ($)"
              type="number"
              placeholder="25000"
              value={newMeta.objetivo}
              onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })}
              required
            />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleAddMeta}>Guardar Meta</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user, onLogout, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-6 rounded-b-[2.5rem] shadow-xl shadow-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-indigo-200 text-sm">Buenos días,</p>
            <h2 className="text-2xl font-bold">{user.name}</h2>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User size={20} />
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
          <p className="text-indigo-100 text-sm mb-1">Ahorro Total</p>
          <h3 className="text-3xl font-bold">$10,000.00</h3>
        </div>
      </div>

      <div className="p-6 -mt-4">
        <h3 className="font-bold text-gray-800 mb-4 px-2">Mi Espacio</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card title="Mi Perfil" icon={User} color="bg-blue-50" />
          <Card title="Mis Metas" icon={Target} color="bg-purple-50" onClick={() => onNavigate('goals')} />
          <Card title="Recompensas" icon={Award} color="bg-yellow-50" />
          <Card title="Insignias" icon={Lock} color="bg-pink-50" />
          <Card title="Simulador" icon={CreditCard} color="bg-green-50" />
          <Card title="Aprender" icon={BookOpen} color="bg-orange-50" />
        </div>
      </div>

      <div className="p-6 pt-0">
        <Button variant="danger" onClick={onLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="flex justify-center bg-gray-200 min-h-screen">
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen overflow-hidden">
        {currentView === 'login' && <LoginScreen onLogin={handleLogin} />}
        {currentView === 'register' && <RegisterScreen onRegisterSuccess={handleRegister} />}
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'goals' && (
          <GoalsScreen
            onBack={() => setCurrentView('dashboard')}
            user={user}
          />
        )}
        
        {/* Botón flotante para ir al registro desde login */}
        {currentView === 'login' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setCurrentView('register')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}