// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalWomen: 0,
    totalWorkers: 0,
    inactiveWorkers: 0,
    upcomingCheckups: 0,
    overdueCheckups: 0,
    completedCheckups: 0,
    totalCheckups: 0,
    workload: [],
  });
  const [women, setWomen] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [womenUsers, setWomenUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [womanSearch, setWomanSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'women' | 'workers'

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, womenRes, workersRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/stats'),
        axios.get('http://localhost:5001/api/admin/women'),
        axios.get('http://localhost:5001/api/admin/workers'),
        axios.get('http://localhost:5001/api/admin/women-users'),
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

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5001/api/admin/workers', newWorkerForm);
      setSuccess(`Health Worker "${newWorkerForm.name}" created successfully with secure credentials.`);
      setNewWorkerForm({ name: '', email: '', phone: '', password: '' });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create worker account');
    }
  };

  const handleToggleWorkerStatus = async (worker) => {
    const action = worker.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${worker.name}'s account? Patient records will remain safe.`)) return;
    setError('');
    setSuccess('');
    try {
      const res = await axios.patch(`http://localhost:5001/api/admin/workers/${worker._id}/toggle-status`);
      setSuccess(res.data.message);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update worker status');
    }
  };

  const handleCreateWoman = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5001/api/admin/women', newWomanForm);
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
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create maternal record');
    }
  };

  const handleAssignWorker = async (womanId, workerId) => {
    try {
      await axios.post(`http://localhost:5001/api/admin/women/${womanId}/assign/${workerId}`);
      setSuccess('Health worker assignment updated!');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleDeleteWoman = async (womanId, name) => {
    if (!window.confirm(`Are you sure you want to remove the record for "${name}"? This will also remove associated checkup records.`)) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/women/${womanId}`);
      setSuccess('Maternal record removed successfully.');
      fetchDashboardData();
    } catch (err) {
      setError('Failed to delete maternal record');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div className="min-h-screen bg-pink-50/40 font-sans text-gray-800">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-2xl font-black text-pink-600">
              Maa<span className="text-teal-600">Care</span>
            </Link>
            <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
              System Admin Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Signed in as <span className="text-pink-700 font-bold">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Analytics Top Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Mothers Enrolled</p>
            <h3 className="text-2xl sm:text-3xl font-black text-pink-600 mt-1">{stats.totalWomen}</h3>
            <span className="text-[11px] text-gray-400">Total clinical files</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Active Workers</p>
            <h3 className="text-2xl sm:text-3xl font-black text-teal-600 mt-1">{stats.totalWorkers}</h3>
            <span className="text-[11px] text-gray-400">{stats.inactiveWorkers || 0} deactivated</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Upcoming Visits</p>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{stats.upcomingCheckups}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Scheduled checkups</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Overdue Follow-ups</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.overdueCheckups}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Require worker outreach</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm col-span-2 lg:col-span-1">
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Completed Care</p>
            <h3 className="text-2xl sm:text-3xl font-black text-green-600 mt-1">{stats.completedCheckups}</h3>
            <span className="text-[11px] text-gray-400">Recorded checkups</span>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Worker Workload Analytics
          </button>
          <button
            onClick={() => setActiveTab('women')}
            className={`pb-3 transition ${
              activeTab === 'women'
                ? 'border-b-2 border-pink-600 text-pink-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Maternal Health Profiles ({women.length})
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`pb-3 transition ${
              activeTab === 'workers'
                ? 'border-b-2 border-teal-600 text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Health Workers ({workers.length})
          </button>
        </div>

        {/* TAB 1: WORKLOAD ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Health Worker Workload Distribution</h3>
              <p className="text-xs text-gray-500">
                Live metrics derived from actual assigned patient counts and active appointment queues.
              </p>
            </div>

            {stats.workload && stats.workload.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="p-3">Worker Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Assigned Mothers</th>
                      <th className="p-3 text-center">Pending / Overdue Visits</th>
                      <th className="p-3 text-right">Workload Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.workload.map((wk) => (
                      <tr key={wk._id} className="hover:bg-purple-50/20 transition">
                        <td className="p-3 font-semibold text-gray-900">
                          👩‍⚕️ {wk.name}
                        </td>
                        <td className="p-3 text-gray-500">
                          {wk.email} {wk.phone ? `• ${wk.phone}` : ''}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              wk.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {wk.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-teal-700 text-sm">
                          {wk.assignedWomenCount}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-700 text-sm">
                          {wk.pendingAppointments}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              wk.assignedWomenCount > 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {wk.assignedWomenCount > 5 ? 'High Demand' : 'Balanced'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No worker workload records available.</p>
            )}
          </div>
        )}

        {/* TAB 2: MATERNAL RECORDS CRUD */}
        {activeTab === 'women' && (
          <div className="space-y-6">
            {/* Enroll Woman Form */}
            <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">Enroll Expectant Mother Clinical File</h3>
              <form onSubmit={handleCreateWoman} className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select User Account *</label>
                    <select
                      value={newWomanForm.userId}
                      onChange={(e) => {
                        const selUser = womenUsers.find((u) => u._id === e.target.value);
                        setNewWomanForm({
                          ...newWomanForm,
                          userId: e.target.value,
                          name: selUser ? selUser.name : '',
                          phone: selUser?.phone || newWomanForm.phone,
                        });
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                      required
                    >
                      <option value="">-- Choose registered account --</option>
                      {womenUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mother Age (Years) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={newWomanForm.age}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, age: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={newWomanForm.phone}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pregnancy Week</label>
                    <input
                      type="number"
                      placeholder="e.g. 16"
                      value={newWomanForm.pregnancyWeek}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, pregnancyWeek: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Due Date</label>
                    <input
                      type="date"
                      value={newWomanForm.expectedDeliveryDate}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, expectedDeliveryDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={newWomanForm.bloodGroup}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, bloodGroup: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign Health Worker</label>
                    <select
                      value={newWomanForm.assignedWorker}
                      onChange={(e) => setNewWomanForm({ ...newWomanForm, assignedWorker: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">-- Optional: Assign worker --</option>
                      {workers.filter((w) => w.isActive !== false).map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Village / Ward / Street address"
                    value={newWomanForm.address}
                    onChange={(e) => setNewWomanForm({ ...newWomanForm, address: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg text-xs transition shadow-sm"
                >
                  Create Clinical Profile
                </button>
              </form>
            </div>

            {/* List & Search */}
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">Enrolled Expectant Mothers</h3>
                  <span className="text-xs text-gray-500">({filteredWomen.length} found)</span>
                </div>
                <input
                  type="text"
                  placeholder="Search mothers by name, phone, or address..."
                  value={womanSearch}
                  onChange={(e) => setWomanSearch(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-72 focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {filteredWomen.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                      <tr>
                        <th className="p-3">Mother Name</th>
                        <th className="p-3">Age & Phone</th>
                        <th className="p-3">Week / Blood Group</th>
                        <th className="p-3">Assigned Worker</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWomen.map((w) => (
                        <tr key={w._id} className="hover:bg-pink-50/30 transition">
                          <td className="p-3 font-semibold text-gray-800">
                            {w.name || w.user?.name}
                            <span className="block text-[10px] text-gray-400 font-normal">{w.address || 'No address'}</span>
                          </td>
                          <td className="p-3">
                            {w.age} yrs • {w.phone || w.user?.phone || 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-purple-700">Wk {w.pregnancyWeek || 'N/A'}</span> • {w.bloodGroup || 'N/A'}
                          </td>
                          <td className="p-3">
                            <select
                              value={w.assignedWorker?._id || 'unassigned'}
                              onChange={(e) => handleAssignWorker(w._id, e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-400"
                            >
                              <option value="unassigned">-- Unassigned --</option>
                              {workers.filter((worker) => worker.isActive !== false).map((worker) => (
                                <option key={worker._id} value={worker._id}>
                                  {worker.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteWoman(w._id, w.name || w.user?.name)}
                              className="text-red-600 hover:text-red-800 font-medium hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  No maternal health records match your search filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WORKERS MANAGEMENT */}
        {activeTab === 'workers' && (
          <div className="space-y-6">
            {/* Create Worker Card */}
            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Authorized Health Worker</h3>
                <p className="text-xs text-gray-500">
                  Worker accounts have field privileges to schedule appointments and document antenatal care.
                </p>
              </div>

              <form onSubmit={handleCreateWorker} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Worker Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Meena"
                    value={newWorkerForm.name}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Worker Email *</label>
                  <input
                    type="email"
                    placeholder="worker@maacare.org"
                    value={newWorkerForm.email}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Worker Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543211"
                    value={newWorkerForm.phone}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newWorkerForm.password}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-xs transition shadow-sm"
                  >
                    Add Health Worker
                  </button>
                </div>
              </form>
            </div>

            {/* Workers Table with Search & Status Toggle */}
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">Current Health Workers</h3>
                  <span className="text-xs text-gray-500">({filteredWorkers.length} total)</span>
                </div>
                <input
                  type="text"
                  placeholder="Search workers by name or email..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-64 focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {filteredWorkers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                      <tr>
                        <th className="p-3">Worker Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Account Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWorkers.map((worker) => (
                        <tr key={worker._id} className="hover:bg-teal-50/20 transition">
                          <td className="p-3 font-semibold text-gray-800">
                            👩‍⚕️ {worker.name}
                          </td>
                          <td className="p-3 text-teal-800 font-medium">
                            {worker.email}
                          </td>
                          <td className="p-3 text-gray-500">
                            {worker.phone || 'No phone'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                worker.isActive !== false
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {worker.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleWorkerStatus(worker)}
                              className={`text-xs font-semibold px-3 py-1 rounded transition ${
                                worker.isActive !== false
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {worker.isActive !== false ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  No health workers found matching search.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
