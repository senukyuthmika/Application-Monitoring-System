import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { Activity, Bell, CheckCircle2, FileText, LayoutDashboard, LogOut, PlayCircle, Plus, Server, ShieldAlert, Trash2, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const API_URL = 'http://localhost:5000/api';

const demoDashboard = {
  total_applications: 3,
  up_applications: 2,
  down_applications: 1,
  active_alerts: 1,
  avg_response_time: 186,
  response_time_chart: [
    { label: '10:00', response_time: 120 },
    { label: '10:10', response_time: 150 },
    { label: '10:20', response_time: 290 },
    { label: '10:30', response_time: 135 },
    { label: '10:40', response_time: 160 },
  ],
};

const demoApplications = [
  { application_id: 1, name: 'Student Management System', url: 'http://localhost:3000', type: 'Web App', status: 'ACTIVE', monitoring_interval: 60 },
  { application_id: 2, name: 'Admin Portal', url: 'https://example.com', type: 'Web App', status: 'ACTIVE', monitoring_interval: 60 },
  { application_id: 3, name: 'Payment API', url: 'https://api.example.com/health', type: 'API', status: 'ACTIVE', monitoring_interval: 120 },
];

const demoAlerts = [
  { alert_id: 1, application_name: 'Student Management System', severity: 'HIGH', status: 'OPEN', message: 'Application is unavailable.', created_at: new Date().toISOString() },
];

const demoHistory = [
  { history_id: 1, application_name: 'Student Management System', status: 'DOWN', response_time: 5030, status_code: null, checked_at: new Date().toISOString() },
  { history_id: 2, application_name: 'Admin Portal', status: 'UP', response_time: 143, status_code: 200, checked_at: new Date().toISOString() },
];

const demoLogs = [
  { log_id: 1, application_name: 'Student Management System', log_level: 'ERROR', message: 'Health check failed.', created_at: new Date().toISOString() },
  { log_id: 2, application_name: 'Admin Portal', log_level: 'INFO', message: 'Responded with status 200.', created_at: new Date().toISOString() },
];

const demoUsers = [
  { user_id: 1, name: 'System Admin', email: 'admin@gmail.com', role: 'ADMIN', created_at: new Date().toISOString() },
  { user_id: 2, name: 'Monitoring User', email: 'user@gmail.com', role: 'USER', created_at: new Date().toISOString() },
];

const getToken = () => localStorage.getItem('token');
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};
const isAdmin = () => getUser()?.role === 'ADMIN';

const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

const useApiData = (path, fallback) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState('');

  const load = async () => {
    if (!getToken()) {
      setData(fallback);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setData(await apiRequest(path));
    } catch (err) {
      setError(err.message);
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [path]);

  return { data, setData, loading, error, reload: load };
};

const Layout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
    <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="grid size-10 place-items-center rounded-lg bg-blue-600 text-white">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">AppMonitor</h1>
            <p className="text-xs text-slate-500">Monitoring Console</p>
          </div>
        </div>
        <nav className="grid gap-1 sm:grid-cols-4 lg:grid-cols-1">
          <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink to="/applications" icon={<Server size={18} />} label="Applications" />
          <SidebarLink to="/users" icon={<Users size={18} />} label="Users" />
          <SidebarLink to="/alerts" icon={<Bell size={18} />} label="Alerts" />
          <SidebarLink to="/reports" icon={<FileText size={18} />} label="Reports" />
        </nav>
        <div className="mt-auto">
          <SidebarLink to="/login" icon={<LogOut size={18} />} label="Login" />
        </div>
      </div>
    </aside>
    <main className="flex-1 p-5 lg:p-8">
      <Outlet />
    </main>
  </div>
);

const SidebarLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const PageHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
  </div>
);

const MetricCard = ({ title, value, tone, icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <span className={`grid size-9 place-items-center rounded-lg ${tone}`}>{icon}</span>
    </div>
    <div className="mt-5 text-3xl font-bold text-slate-950">{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const isHealthy = status === 'UP' || status === 'ACTIVE' || status === 'RESOLVED';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const Dashboard = () => {
  const { data, loading, error } = useApiData('/monitoring/dashboard', demoDashboard);
  const chartRows = data.response_time_chart || [];
  const chartData = useMemo(() => ({
    labels: chartRows.map((row) => row.label),
    datasets: [{
      label: 'Average response time',
      data: chartRows.map((row) => row.response_time),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      borderWidth: 3,
      tension: 0.35,
      fill: true,
    }],
  }), [chartRows]);

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader title="System Overview" subtitle="Live availability, response time, and active alert status." />
      <Notice loading={loading} error={error} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Applications" value={data.total_applications} tone="bg-blue-50 text-blue-700" icon={<Server size={18} />} />
        <MetricCard title="Healthy" value={data.up_applications} tone="bg-emerald-50 text-emerald-700" icon={<CheckCircle2 size={18} />} />
        <MetricCard title="Down" value={data.down_applications} tone="bg-red-50 text-red-700" icon={<ShieldAlert size={18} />} />
        <MetricCard title="Active Alerts" value={data.active_alerts} tone="bg-amber-50 text-amber-700" icon={<Bell size={18} />} />
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-950">Response Time Trend</h3>
          <span className="text-sm text-slate-500">Average: {data.avg_response_time || 0} ms</span>
        </div>
        <div className="h-80">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </section>
  );
};

const Applications = () => {
  const { data, loading, error, reload } = useApiData('/applications', demoApplications);
  const [checkingId, setCheckingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    url: '',
    type: 'Web App',
    monitoring_interval: 60,
    status: 'ACTIVE',
  });
  const [formMessage, setFormMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const runCheck = async (id) => {
    try {
      setCheckingId(id);
      await apiRequest(`/monitoring/check/${id}`, { method: 'POST' });
      await reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckingId(null);
    }
  };

  const createApplication = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormMessage('');
      await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          monitoring_interval: Number(form.monitoring_interval),
        }),
      });
      setForm({
        name: '',
        description: '',
        url: '',
        type: 'Web App',
        monitoring_interval: 60,
        status: 'ACTIVE',
      });
      setFormMessage('Application created successfully.');
      await reload();
    } catch (err) {
      setFormMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Delete this application?')) return;

    try {
      await apiRequest(`/applications/${id}`, { method: 'DELETE' });
      await reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Applications" subtitle="Registered services and their monitoring configuration." />
      <Notice loading={loading} error={error} />
      <AdminPanel title="Add Application" lockedMessage="Login as ADMIN to create monitored applications.">
        <form onSubmit={createApplication} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          {formMessage && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 lg:col-span-2">{formMessage}</div>}
          <FormInput label="Application Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <FormInput label="Health Check URL" value={form.url} onChange={(value) => setForm({ ...form, url: value })} placeholder="http://localhost:3000/api/status" required />
          <FormInput label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Type
            <select className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option>Web App</option>
              <option>API</option>
              <option>Database</option>
              <option>Service</option>
            </select>
          </label>
          <FormInput label="Monitoring Interval Seconds" type="number" min="10" value={form.monitoring_interval} onChange={(value) => setForm({ ...form, monitoring_interval: value })} required />
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Status
            <select className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option>ACTIVE</option>
              <option>INACTIVE</option>
            </select>
          </label>
          <div className="lg:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={saving}>
              <Plus size={16} />
              {saving ? 'Saving' : 'Add Application'}
            </button>
          </div>
        </form>
      </AdminPanel>
      <DataTable
        columns={['Name', 'URL', 'Type', 'Interval', 'Status', 'Actions']}
        rows={data.map((app) => [
          app.name,
          <span className="break-all text-slate-500">{app.url}</span>,
          app.type || 'Web App',
          `${app.monitoring_interval || 60}s`,
          <StatusBadge status={app.status} />,
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={!getToken() || checkingId === app.application_id} onClick={() => runCheck(app.application_id)}>
              <PlayCircle size={16} />
              {checkingId === app.application_id ? 'Checking' : 'Check'}
            </button>
            {isAdmin() ? <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => deleteApplication(app.application_id)}><Trash2 size={16} />Delete</button> : ''}
          </div>,
        ])}
      />
    </section>
  );
};

const UsersPage = () => {
  const { data, loading, error, reload } = useApiData('/users', demoUsers);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [formMessage, setFormMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const createUser = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormMessage('');
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      });
      setFormMessage('User created successfully.');
      await reload();
    } catch (err) {
      setFormMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      await reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Users" subtitle="Create admin or normal user accounts for the monitoring system." />
      <Notice loading={loading} error={error} />
      <AdminPanel title="Create User" lockedMessage="Login as ADMIN to create users.">
        <form onSubmit={createUser} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          {formMessage && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 lg:col-span-2">{formMessage}</div>}
          <FormInput label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <FormInput label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
          <FormInput label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Role
            <select className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option>USER</option>
              <option>ADMIN</option>
            </select>
          </label>
          <div className="lg:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={saving}>
              <Plus size={16} />
              {saving ? 'Saving' : 'Create User'}
            </button>
          </div>
        </form>
      </AdminPanel>
      <DataTable
        columns={['Name', 'Email', 'Role', 'Created', 'Actions']}
        rows={data.map((user) => [
          user.name,
          user.email,
          user.role,
          formatDate(user.created_at),
          isAdmin() ? <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => deleteUser(user.user_id)}><Trash2 size={16} />Delete</button> : '',
        ])}
      />
    </section>
  );
};

const Alerts = () => {
  const { data, setData, loading, error } = useApiData('/monitoring/alerts', demoAlerts);

  const resolveAlert = async (alertId) => {
    try {
      await apiRequest(`/monitoring/alerts/${alertId}/resolve`, { method: 'PATCH' });
      setData((alerts) => alerts.map((alert) => alert.alert_id === alertId ? { ...alert, status: 'RESOLVED' } : alert));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader title="Alert Management" subtitle="Availability incidents raised automatically by the monitoring job." />
      <Notice loading={loading} error={error} />
      <DataTable
        columns={['Application', 'Severity', 'Status', 'Message', 'Created', '']}
        rows={data.map((item) => [
          item.application_name,
          item.severity,
          <StatusBadge status={item.status} />,
          item.message,
          formatDate(item.created_at),
          item.status === 'OPEN' ? <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60" disabled={!getToken()} onClick={() => resolveAlert(item.alert_id)}>Resolve</button> : '',
        ])}
      />
    </section>
  );
};

const Reports = () => {
  const history = useApiData('/monitoring/history', demoHistory);
  const logs = useApiData('/monitoring/logs', demoLogs);

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <div>
        <PageHeader title="System Reports" subtitle="Recent health checks and application logs for audit evidence." />
        <Notice loading={history.loading || logs.loading} error={history.error || logs.error} />
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-slate-950">Monitoring History</h3>
        <DataTable
          columns={['Application', 'Status', 'Response', 'Code', 'Checked']}
          rows={history.data.map((row) => [
            row.application_name,
            <StatusBadge status={row.status} />,
            `${row.response_time || 0} ms`,
            row.status_code || '-',
            formatDate(row.checked_at),
          ])}
        />
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-slate-950">Application Logs</h3>
        <DataTable
          columns={['Application', 'Level', 'Message', 'Created']}
          rows={logs.data.map((row) => [
            row.application_name,
            row.log_level,
            row.message,
            formatDate(row.created_at),
          ])}
        />
      </div>
    </section>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-blue-600 text-white"><Activity /></div>
          <div>
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="text-sm text-slate-500">Use your admin account to manage monitoring.</p>
          </div>
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4">
          <input className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <input className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <button className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={loading}>{loading ? 'Signing in' : 'Login'}</button>
        </div>
      </form>
    </div>
  );
};

const DataTable = ({ columns, rows }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left font-semibold text-slate-600">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={columns.length}>No records found.</td></tr>
          ) : rows.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-middle text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminPanel = ({ title, lockedMessage, children }) => {
  if (!isAdmin()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <span className="font-semibold">{title}: </span>
        {lockedMessage}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-slate-950">{title}</h3>
      {children}
    </div>
  );
};

const FormInput = ({ label, value, onChange, type = 'text', ...props }) => (
  <label className="grid gap-1 text-sm font-medium text-slate-700">
    {label}
    <input
      className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...props}
    />
  </label>
);

const Notice = ({ loading, error }) => {
  if (loading) return <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">Loading live monitoring data...</div>;
  if (error) return <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Showing demo data. Login and start the backend to load live data. Details: {error}</div>;
  if (!getToken()) return <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Showing demo data until you login.</div>;
  return null;
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
