import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { LayoutDashboard, Server, Bell, FileText, LogOut, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// --- COMPONENTS ---

// iOS-style Sidebar Layout
const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 text-blue-600">
          <Activity size={28} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">AppMonitor</h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink to="/applications" icon={<Server size={20} />} label="Applications" />
          <SidebarLink to="/alerts" icon={<Bell size={20} />} label="Alerts" />
          <SidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" />
        </nav>

        <div className="pt-6 border-t border-slate-200/60">
          <SidebarLink to="/login" icon={<LogOut size={20} />} label="Logout" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
        isActive 
          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
          : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

// --- PAGES ---

const Dashboard = () => {
  const chartData = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
    datasets: [{
      label: 'Avg Response Time (ms)',
      data: [120, 135, 125, 250, 140, 130, 125],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      tension: 0.4, // Smooth curved line
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { borderDash: [5, 5], color: '#e2e8f0' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">System Overview</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Apps Monitored" value="12" status="Active" color="text-green-500" />
        <MetricCard title="Active Alerts" value="2" status="Needs Attention" color="text-red-500" />
        <MetricCard title="System Uptime" value="99.9%" status="Last 30 days" color="text-slate-500" />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-8">
        <h3 className="text-lg font-semibold mb-6">Global Response Times</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, status, color }) => (
  <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-40">
    <span className="text-slate-500 font-medium">{title}</span>
    <span className="text-4xl font-bold text-slate-800">{value}</span>
    <span className={`text-sm font-medium ${color}`}>{status}</span>
  </div>
);

const Applications = () => (
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold">Applications</h2>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm">
        + Add App
      </button>
    </div>
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <p className="text-slate-500">Application list will be rendered here...</p>
    </div>
  </div>
);

const Alerts = () => (
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold mb-8">Alert Management</h2>
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <p className="text-slate-500">Active alerts and notification rules will appear here...</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold mb-8">System Reports</h2>
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <p className="text-slate-500">Historical data and export tools will appear here...</p>
    </div>
  </div>
);

const Login = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-slate-100 w-full max-w-md">
      <div className="flex justify-center mb-8 text-blue-600"><Activity size={48} /></div>
      <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Sign In to AppMonitor</h2>
      <div className="space-y-4">
        <input type="email" placeholder="Email" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
        <input type="password" placeholder="Password" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
        <NavLink to="/" className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors mt-4">
          Login
        </NavLink>
      </div>
    </div>
  </div>
);

// --- MAIN ROUTER ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}