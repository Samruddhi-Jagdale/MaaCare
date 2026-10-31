// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Search,
  Plus,
  Trash2,
  Activity,
  Send,
  PieChart,
  TrendingUp,
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [stats, setStats] = useState({
    totalWomen: 0,
    totalWorkers: 0,
    inactiveWorkers: 0,
    upcomingCheckups: 0,
    overdueCheckups: 0,
    completedCheckups: 0,
    missedCheckups: 0,
    cancelledCheckups: 0,
    totalCheckups: 0,
    workload: [],
    trends: [],
    trimesterDistribution: { trimester1: 0, trimester2: 0, trimester3: 0, unspecified: 0 },
  });

  const [women, setWomen] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [womenUsers, setWomenUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Tab: 'overview' | 'women' | 'workers'
  const [activeTab, setActiveTab] = useState('overview');

  // Search & Filter
  const [womanSearch, setWomanSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Broadcast Announcement Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', targetRole: 'all' });
  const [broadcasting, setBroadcasting] = useState(false);

  // Forms
  const [newWorkerForm, setNewWorkerForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [newWomanForm, setNewWomanForm] = useState({
    name: '',
    userId: '',
    age: '',
    phone: '',
    address: '',
    pregnancyWeek: '',
    expectedDeliveryDate: '',
    bloodGroup: 'B+',
    assignedWorker: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (dateParams = {}) => {
    try {
      setLoading(true);
      setError('');

      let statsUrl = '/api/admin/stats';
      const params = new URLSearchParams();
      if (dateParams.startDate) params.append('startDate', dateParams.startDate);
      if (dateParams.endDate) params.append('endDate', dateParams.endDate);
      if (params.toString()) statsUrl += `?${params.toString()}`;

      const [statsRes, womenRes, workersRes, usersRes] = await Promise.all([
        api.get(statsUrl),
        api.get('/api/admin/women'),
        api.get('/api/admin/workers'),
        api.get('/api/admin/women-users'),
      ]);

      setStats(statsRes.data);
      setWomen(womenRes.data);
      setWorkers(workersRes.data);
      setWomenUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not load administrative analytics and records.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateFilter = (e) => {
    e.preventDefault();
    fetchDashboardData(dateRange);
  };

  const handleResetDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchDashboardData({});
  };

  const handleExportCSV = async (type) => {
    try {
      const endpoint = type === 'women' ? '/api/admin/export/women' : '/api/admin/export/checkups';
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maacare_${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Exported ${type} report successfully!`);
    } catch (err) {
      console.error(err);
      setError('Failed to download CSV export.');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const res = await api.post('/api/notifications/broadcast', broadcastForm);
      setSuccess(res.data.message);
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', targetRole: 'all' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/admin/workers', newWorkerForm);
      setSuccess(`Health Worker "${newWorkerForm.name}" created successfully.`);
      setNewWorkerForm({ name: '', email: '', phone: '', password: '' });
      fetchDashboardData(dateRange);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create worker account');
    }
  };

  const handleToggleWorkerStatus = async (worker) => {
    const action = worker.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${worker.name}'s account?`)) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/api/admin/workers/${worker._id}/toggle-status`);
      setSuccess(res.data.message);
      fetchDashboardData(dateRange);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update worker status');
    }
  };

  const handleCreateWoman = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/admin/women', newWomanForm);
      setSuccess('Maternal healthcare clinical record enrolled successfully!');
      setNewWomanForm({
        name: '',
        userId: '',
        age: '',
        phone: '',
        address: '',
        pregnancyWeek: '',
        expectedDeliveryDate: '',
        bloodGroup: 'B+',
        assignedWorker: '',
      });
      fetchDashboardData(dateRange);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create maternal record');
    }
  };

  const handleAssignWorker = async (womanId, workerId) => {
    try {
      await api.post(`/api/admin/women/${womanId}/assign/${workerId}`);
      setSuccess('Health worker assignment updated!');
      fetchDashboardData(dateRange);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleDeleteWoman = async (womanId, name) => {
    if (!window.confirm(`Are you sure you want to remove the record for "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/women/${womanId}`);
      setSuccess('Maternal record removed successfully.');
      fetchDashboardData(dateRange);
    } catch (err) {
      setError('Failed to delete maternal record');
    }
  };

  const filteredWomen = women.filter((w) =>
    (w.name || w.user?.name || '').toLowerCase().includes(womanSearch.toLowerCase()) ||
    (w.phone || w.user?.phone || '').includes(womanSearch) ||
    (w.address || '').toLowerCase().includes(womanSearch.toLowerCase())
  );

  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.email.toLowerCase().includes(workerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-pink-50/40 text-gray-800 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              System Administration & Surveillance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Maternal Health Surveillance Console
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live district monitoring, health worker allocation, and programmatic reporting
            </p>
          </div>

          {/* Export & Broadcast Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExportCSV('women')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export Mothers (CSV)</span>
            </button>
            <button
              onClick={() => handleExportCSV('checkups')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-pink-600" />
              <span>Export Visits (CSV)</span>
            </button>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Announcement</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-rose-800">Dismiss</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="font-bold text-emerald-900">Dismiss</button>
          </div>
        )}

        {/* Date Filter Bar */}
        <form
          onSubmit={handleApplyDateFilter}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-700">Analytics Date Filter:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
            >
              Apply Filter
            </button>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                type="button"
                onClick={handleResetDateFilter}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Top 5 High-Impact Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Enrolled Mothers</p>
            <p className="text-3xl font-black text-pink-600 mt-1">{stats.totalWomen}</p>
            <p className="text-[10px] text-gray-400 mt-1">Active maternal cards</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Health Workers</p>
            <p className="text-3xl font-black text-teal-600 mt-1">{stats.totalWorkers}</p>
            <p className="text-[10px] text-teal-700 mt-1">{stats.inactiveWorkers} inactive</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Upcoming Visits</p>
            <p className="text-3xl font-black text-blue-600 mt-1">{stats.upcomingCheckups}</p>
            <p className="text-[10px] text-gray-400 mt-1">Scheduled next 30 days</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Overdue Follow-ups</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{stats.overdueCheckups}</p>
            <p className="text-[10px] text-amber-800 font-medium mt-1">Require immediate worker visit</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Completed Checkups</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.completedCheckups}</p>
            <p className="text-[10px] text-emerald-700 mt-1">Successful care delivery</p>
          </div>
        </div>

        {/* Trimester Distribution & Trends Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trimester Distribution */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <PieChart className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-sm text-gray-800">Trimester Distribution of Enrolled Mothers</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-teal-700">1st Trimester (Weeks 1-12)</span>
                  <span>{stats.trimesterDistribution?.trimester1 || 0} mothers</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, ((stats.trimesterDistribution?.trimester1 || 0) / Math.max(1, stats.totalWomen)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-pink-700">2nd Trimester (Weeks 13-26)</span>
                  <span>{stats.trimesterDistribution?.trimester2 || 0} mothers</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, ((stats.trimesterDistribution?.trimester2 || 0) / Math.max(1, stats.totalWomen)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-purple-700">3rd Trimester (Weeks 27-40+)</span>
                  <span>{stats.trimesterDistribution?.trimester3 || 0} mothers</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, ((stats.trimesterDistribution?.trimester3 || 0) / Math.max(1, stats.totalWomen)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6-Month Real Aggregate Monthly Trend */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-sm text-gray-800">6-Month Service Delivery Activity</h3>
            </div>

            <div className="grid grid-cols-6 gap-2 text-center text-xs pt-4">
              {stats.trends?.map((tItem, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex items-end space-x-1 h-28 w-full justify-center">
                    {/* Checkups Bar */}
                    <div
                      className="w-3 bg-teal-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.min(100, tItem.checkups * 10 + 8)}%` }}
                      title={`${tItem.checkups} checkups`}
                    />
                    {/* Mothers Bar */}
                    <div
                      className="w-3 bg-pink-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.min(100, tItem.newMothers * 15 + 8)}%` }}
                      title={`${tItem.newMothers} new mothers`}
                    />
                  </div>
                  <span className="font-bold text-gray-700 mt-2 text-[11px]">{tItem.month}</span>
                  <span className="text-[10px] text-gray-400">{tItem.checkups} visits</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4 pt-2 text-[11px] text-gray-500">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-xs inline-block mr-1" />
                Antenatal Checkups
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-pink-400 rounded-xs inline-block mr-1" />
                Enrolled Mothers
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health Worker Caseload Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('women')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'women'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Maternal Health Profiles ({women.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'workers'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Health Worker Accounts ({workers.length})</span>
          </button>
        </div>

        {/* TAB 1: Workload Analytics */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Community Health Worker Workload Distribution</h3>
            <p className="text-xs text-gray-500">
              Balanced caseload tracking: Assigned mothers, pending visits, and overdue follow-ups
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Worker Name</th>
                    <th className="p-3">Email & Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Assigned Mothers</th>
                    <th className="p-3 text-center">Pending Visits</th>
                    <th className="p-3 text-center">Completed Visits</th>
                    <th className="p-3 text-center">Overdue Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.workload?.map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{w.name}</td>
                      <td className="p-3 text-gray-600">
                        <div>{w.email}</div>
                        <div className="text-[10px] text-gray-400">{w.phone || 'No phone'}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            w.isActive ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {w.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-teal-800">{w.assignedWomenCount}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{w.pendingAppointments}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{w.completedVisits || 0}</td>
                      <td className="p-3 text-center font-bold text-amber-700">{w.overdueVisits || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Maternal Profiles */}
        {activeTab === 'women' && (
          <div className="space-y-6">
            {/* Enroll New Mother Form */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Enroll New Maternal Clinical Profile</h3>

              <form onSubmit={handleCreateWoman} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Select Registered User *</label>
                  <select
                    required
                    value={newWomanForm.userId}
                    onChange={(e) => {
                      const sel = womenUsers.find((u) => u._id === e.target.value);
                      setNewWomanForm({
                        ...newWomanForm,
                        userId: e.target.value,
                        name: sel ? sel.name : '',
                        phone: sel ? sel.phone : '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="">-- Choose User Account --</option>
                    {womenUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Maternal Age *</label>
                  <input
                    type="number"
                    required
                    min="14"
                    max="60"
                    placeholder="e.g. 25"
                    value={newWomanForm.age}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Blood Group *</label>
                  <select
                    value={newWomanForm.bloodGroup}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Gestation Week</label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    placeholder="e.g. 16"
                    value={newWomanForm.pregnancyWeek}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, pregnancyWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Expected Delivery Date (EDD)</label>
                  <input
                    type="date"
                    value={newWomanForm.expectedDeliveryDate}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Assign Health Worker</label>
                  <select
                    value={newWomanForm.assignedWorker}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, assignedWorker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="">-- Unassigned --</option>
                    {workers.filter((w) => w.isActive).map((w) => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Enroll Mother Clinical Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Enrolled Mothers Directory Table with Search & Inline Assignment */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Enrolled Mothers Directory</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, phone..."
                    value={womanSearch}
                    onChange={(e) => setWomanSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Mother Name</th>
                      <th className="p-3">Age & Blood Group</th>
                      <th className="p-3">Gestation / EDD</th>
                      <th className="p-3">Contact & Address</th>
                      <th className="p-3">Assigned Worker</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWomen.map((w) => (
                      <tr key={w._id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{w.name}</td>
                        <td className="p-3">
                          {w.age} yrs &bull; <span className="font-bold text-pink-700">{w.bloodGroup}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-purple-700">Week {w.pregnancyWeek || '—'}</span>
                          <div className="text-[10px] text-gray-400">
                            EDD: {w.expectedDeliveryDate ? new Date(w.expectedDeliveryDate).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div>{w.phone}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{w.address || '—'}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={w.assignedWorker?._id || 'unassigned'}
                            onChange={(e) => handleAssignWorker(w._id, e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white"
                          >
                            <option value="unassigned">-- Unassigned --</option>
                            {workers.filter((wk) => wk.isActive).map((wk) => (
                              <option key={wk._id} value={wk._id}>{wk.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteWoman(w._id, w.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Health Worker Accounts */}
        {activeTab === 'workers' && (
          <div className="space-y-6">
            {/* Create Worker Account Form */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Provision Authorized Health Worker Account</h3>

              <form onSubmit={handleCreateWorker} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sister Asha Name"
                    value={newWorkerForm.name}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="asha@maacare.org"
                    value={newWorkerForm.email}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="98XXXXXXXX"
                    value={newWorkerForm.phone}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newWorkerForm.password}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Create Worker Credentials
                  </button>
                </div>
              </form>
            </div>

            {/* Workers Directory Table */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Authorized Health Workers</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Worker Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWorkers.map((worker) => (
                      <tr key={worker._id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{worker.name}</td>
                        <td className="p-3 text-gray-600">{worker.email}</td>
                        <td className="p-3 text-gray-600">{worker.phone || '—'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              worker.isActive ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {worker.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleWorkerStatus(worker)}
                            className={`px-3 py-1 rounded-xl font-bold ${
                              worker.isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                            }`}
                          >
                            {worker.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Announcement Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-gray-900 text-base">Broadcast Announcement</h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Target Audience</label>
                  <select
                    value={broadcastForm.targetRole}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="all">All Platform Users</option>
                    <option value="woman">Pregnant Mothers Only</option>
                    <option value="worker">Health Workers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Calcium Supplement Distribution Camp"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Announcement Message *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details about camp dates, venue, and required documents..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {broadcasting ? 'Dispatching...' : 'Dispatch to Inboxes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
