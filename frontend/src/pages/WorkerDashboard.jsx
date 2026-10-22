// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [women, setWomen] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState({ upcoming: [], overdue: [], completed: [], all: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWoman, setSelectedWoman] = useState(null);
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active view tab: 'patients' | 'appointments' | 'overdue'
  const [activeTab, setActiveTab] = useState('patients');

  // Schedule Appointment form state
  const [checkupForm, setCheckupForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'Routine Antenatal Care',
    bloodPressure: '',
    weight: '',
    notes: '',
    status: 'Upcoming',
    nextFollowUpDate: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Edit / Complete Modal state
  const [editingCheckup, setEditingCheckup] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    status: '',
    bloodPressure: '',
    weight: '',
    notes: '',
    nextFollowUpDate: '',
    followUpNotes: '',
  });

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const [womenRes, apptRes] = await Promise.all([
        axios.get('http://localhost:5001/api/worker/women'),
        axios.get('http://localhost:5001/api/worker/appointments'),
      ]);
      setWomen(womenRes.data);
      setAppointmentsData(apptRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned patient records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWoman = async (woman) => {
    setSelectedWoman(woman);
    setSuccess('');
    setError('');
    try {
      const res = await axios.get(`http://localhost:5001/api/worker/women/${woman._id}`);
      setCheckups(res.data.checkups || []);
    } catch (err) {
      console.error(err);
      setError('Could not load medical timeline for selected mother.');
    }
  };

  const handleAddCheckup = async (e) => {
    e.preventDefault();
    if (!selectedWoman) return;
    setFormSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5001/api/worker/checkups', {
        womanId: selectedWoman._id,
        ...checkupForm,
      });
      setSuccess(`Appointment scheduled successfully for ${selectedWoman.name}!`);
      // Reset form
      setCheckupForm({
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'Routine Antenatal Care',
        bloodPressure: '',
        weight: '',
        notes: '',
        status: 'Upcoming',
        nextFollowUpDate: '',
      });
      // Refresh timeline and appointments
      const res = await axios.get(`http://localhost:5001/api/worker/women/${selectedWoman._id}`);
      setCheckups(res.data.checkups || []);
      const apptRes = await axios.get('http://localhost:5001/api/worker/appointments');
      setAppointmentsData(apptRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not schedule appointment');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = (checkup) => {
    setEditingCheckup(checkup);
    setEditForm({
      date: checkup.date ? new Date(checkup.date).toISOString().split('T')[0] : '',
      time: checkup.time || '10:00 AM',
      status: checkup.status || 'Upcoming',
      bloodPressure: checkup.bloodPressure || '',
      weight: checkup.weight || '',
      notes: checkup.notes || '',
      nextFollowUpDate: checkup.nextFollowUpDate ? new Date(checkup.nextFollowUpDate).toISOString().split('T')[0] : '',
      followUpNotes: checkup.followUpNotes || '',
    });
  };

  const handleUpdateCheckup = async (e) => {
    e.preventDefault();
    if (!editingCheckup) return;

    if (editForm.status === 'Cancelled' && editingCheckup.status !== 'Cancelled') {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this appointment? This action marks the visit as cancelled in clinical records.'
      );
      if (!confirmCancel) return;
    }

    setEditSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:5001/api/worker/checkups/${editingCheckup._id}`, editForm);
      setSuccess('Appointment status and medical notes updated successfully!');
      setEditingCheckup(null);
      // Refresh current patient checkups if active
      if (selectedWoman) {
        const res = await axios.get(`http://localhost:5001/api/worker/women/${selectedWoman._id}`);
        setCheckups(res.data.checkups || []);
      }
      const apptRes = await axios.get('http://localhost:5001/api/worker/appointments');
      setAppointmentsData(apptRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredWomen = women.filter((w) =>
    (w.name || w.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.phone || w.user?.phone || '').includes(searchTerm)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-teal-50/40 font-sans text-gray-800">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-teal-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-2xl font-black text-pink-600">
              Maa<span className="text-teal-600">Care</span>
            </Link>
            <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
              Field Health Worker Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Sister <span className="text-teal-700 font-bold">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner with Live Count Badges */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Field Health Worker Dashboard
            </h1>
            <p className="text-teal-100 text-sm">
              Manage your assigned expectant mothers, schedule visits, and complete overdue follow-ups.
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-xl text-center">
              <span className="text-xl font-black">{women.length}</span>
              <span className="block text-[10px] uppercase text-teal-100">Assigned</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-xl text-center">
              <span className="text-xl font-black">{appointmentsData.upcoming.length}</span>
              <span className="block text-[10px] uppercase text-teal-100">Upcoming</span>
            </div>
            <div className={`px-3 py-2 rounded-xl text-center ${appointmentsData.overdue.length > 0 ? 'bg-amber-500/80' : 'bg-white/20'}`}>
              <span className="text-xl font-black">{appointmentsData.overdue.length}</span>
              <span className="block text-[10px] uppercase text-white">Overdue</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* View Tabs */}
        <div className="flex border-b border-gray-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 transition ${
              activeTab === 'patients'
                ? 'border-b-2 border-teal-600 text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Assigned Mothers & Clinical Chart ({women.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 transition ${
              activeTab === 'appointments'
                ? 'border-b-2 border-teal-600 text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Appointments ({appointmentsData.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 transition ${
              activeTab === 'overdue'
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overdue Follow-ups ({appointmentsData.overdue.length})
          </button>
        </div>

        {/* TAB 1: PATIENTS & CLINICAL CHART */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Assigned Mothers List */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-teal-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Assigned Mothers</h2>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                  {filteredWomen.length} found
                </span>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-400"
              />

              {loading ? (
                <p className="text-xs text-gray-500 py-4 text-center">Loading assigned mothers...</p>
              ) : filteredWomen.length > 0 ? (
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {filteredWomen.map((w) => {
                    const isSelected = selectedWoman?._id === w._id;
                    return (
                      <div
                        key={w._id}
                        onClick={() => handleSelectWoman(w)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/70 shadow-sm'
                            : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900">{w.name || w.user?.name || 'Unnamed'}</h3>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                            Wk {w.pregnancyWeek || 'N/A'}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1">📞 {w.phone || w.user?.phone || 'No phone'}</p>
                        <p className="text-gray-400 truncate">🏠 {w.address || 'Address not listed'}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  No assigned mothers match search.
                </div>
              )}
            </div>

            {/* Right Column: Woman Details & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {selectedWoman ? (
                <>
                  {/* Mother Details Card */}
                  <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedWoman.name || selectedWoman.user?.name}</h2>
                        <p className="text-xs text-gray-500">
                          Email: {selectedWoman.user?.email || 'N/A'} • Phone: {selectedWoman.phone || selectedWoman.user?.phone || 'N/A'}
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full self-start sm:self-auto">
                        Blood Group: {selectedWoman.bloodGroup || 'N/A'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <span className="text-gray-400 block">Age</span>
                        <span className="font-bold text-gray-800">{selectedWoman.age} years</span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <span className="text-gray-400 block">Pregnancy Week</span>
                        <span className="font-bold text-purple-700">Week {selectedWoman.pregnancyWeek || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <span className="text-gray-400 block">Estimated Due Date</span>
                        <span className="font-bold text-teal-700">
                          {selectedWoman.expectedDeliveryDate
                            ? new Date(selectedWoman.expectedDeliveryDate).toLocaleDateString()
                            : 'Not recorded'}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <span className="text-gray-400 block">Village/Ward</span>
                        <span className="font-semibold text-gray-700 truncate block">
                          {selectedWoman.address || 'Unlisted'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Appointment Form */}
                  <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900">Schedule Antenatal Appointment</h3>
                    <form onSubmit={handleAddCheckup} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Appointment Date *</label>
                          <input
                            type="date"
                            value={checkupForm.date}
                            onChange={(e) => setCheckupForm({ ...checkupForm, date: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 10:30 AM"
                            value={checkupForm.time}
                            onChange={(e) => setCheckupForm({ ...checkupForm, time: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Appointment Type *</label>
                          <select
                            value={checkupForm.type}
                            onChange={(e) => setCheckupForm({ ...checkupForm, type: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                          >
                            <option value="Routine Antenatal Care">Routine Antenatal Care</option>
                            <option value="Ultrasound Scan">Ultrasound Scan</option>
                            <option value="Blood Test">Blood & Lab Test</option>
                            <option value="Tetanus / Vaccine">Tetanus / Vaccine</option>
                            <option value="Nutrition & Diet Advice">Nutrition & Diet Advice</option>
                            <option value="Post-Checkup Follow-up">Post-Checkup Follow-up</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Blood Pressure (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. 118/76"
                            value={checkupForm.bloodPressure}
                            onChange={(e) => setCheckupForm({ ...checkupForm, bloodPressure: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Weight in kg (Optional)</label>
                          <input
                            type="number"
                            placeholder="e.g. 59"
                            value={checkupForm.weight}
                            onChange={(e) => setCheckupForm({ ...checkupForm, weight: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-1">Next Follow-Up Date (Optional)</label>
                          <input
                            type="date"
                            value={checkupForm.nextFollowUpDate}
                            onChange={(e) => setCheckupForm({ ...checkupForm, nextFollowUpDate: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Clinical Notes & Advice</label>
                        <textarea
                          rows="2"
                          placeholder="Fetal heartbeat, hemoglobin, iron/calcium advice..."
                          value={checkupForm.notes}
                          onChange={(e) => setCheckupForm({ ...checkupForm, notes: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-50"
                      >
                        {formSubmitting ? 'Scheduling...' : 'Save & Schedule Appointment'}
                      </button>
                    </form>
                  </div>

                  {/* Patient Checkup Timeline */}
                  <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900">Checkup History for {selectedWoman.name}</h3>
                    {checkups.length > 0 ? (
                      <div className="space-y-3">
                        {checkups.map((c) => (
                          <div key={c._id} className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : c.status === 'Overdue'
                                    ? 'bg-amber-100 text-amber-800'
                                    : c.status === 'Missed'
                                    ? 'bg-red-100 text-red-800'
                                    : c.status === 'Cancelled'
                                    ? 'bg-gray-100 text-gray-500'
                                    : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {c.status}
                                </span>
                                <h4 className="font-bold text-gray-900">{c.type}</h4>
                                <span className="text-gray-400">🕒 {c.time || '10:00 AM'}</span>
                              </div>
                              <p className="text-gray-500">
                                📅 Scheduled: {new Date(c.date).toLocaleDateString()}
                                {c.nextFollowUpDate && ` • Next Follow-Up: ${new Date(c.nextFollowUpDate).toLocaleDateString()}`}
                              </p>
                              <p className="text-gray-600">
                                BP: <span className="font-semibold">{c.bloodPressure || 'N/A'}</span> • Weight: <span className="font-semibold">{c.weight ? `${c.weight} kg` : 'N/A'}</span>
                              </p>
                              {c.notes && <p className="text-gray-500 italic">Notes: {c.notes}</p>}
                              {c.followUpNotes && <p className="text-teal-700 italic">Follow-up: {c.followUpNotes}</p>}
                            </div>

                            <button
                              onClick={() => openEditModal(c)}
                              className="px-3 py-1 bg-white border border-gray-200 hover:border-teal-400 text-teal-700 rounded-lg text-xs font-semibold shadow-sm transition self-end sm:self-center"
                            >
                              Update Status / Notes
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4">No appointments recorded for this mother yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-teal-100 shadow-sm text-center text-gray-500 space-y-2">
                  <div className="text-4xl">👈</div>
                  <h3 className="font-bold text-gray-700">Select an Expectant Mother</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Click any mother from your assigned list to access her pregnancy timeline, schedule new visits, and manage antenatal records.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPCOMING APPOINTMENTS LIST */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">All Scheduled Upcoming Visits</h3>
            {appointmentsData.upcoming.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="p-3">Mother Name</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Visit Type</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointmentsData.upcoming.map((appt) => (
                      <tr key={appt._id} className="hover:bg-teal-50/20 transition">
                        <td className="p-3 font-semibold text-gray-800">
                          {appt.woman?.name || 'Patient'}
                          <span className="block text-[10px] text-gray-400">Wk {appt.woman?.pregnancyWeek || 'N/A'}</span>
                        </td>
                        <td className="p-3">
                          📅 {new Date(appt.date).toLocaleDateString()} at {appt.time || '10:00 AM'}
                        </td>
                        <td className="p-3 font-medium text-teal-800">{appt.type}</td>
                        <td className="p-3 text-gray-500">{appt.woman?.phone || 'No phone'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEditModal(appt)}
                            className="px-2.5 py-1 bg-teal-50 text-teal-700 font-semibold rounded hover:bg-teal-100"
                          >
                            Complete / Reschedule
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No upcoming visits scheduled.</p>
            )}
          </div>
        )}

        {/* TAB 3: OVERDUE FOLLOW-UPS LIST */}
        {activeTab === 'overdue' && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Overdue Follow-ups Requiring Outreach</h3>
              <p className="text-xs text-gray-500">
                Scheduled appointment dates that have passed without documented completion. Reach out to the mother to reschedule or record outcomes.
              </p>
            </div>

            {appointmentsData.overdue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50/50 text-amber-900 border-b border-amber-100">
                    <tr>
                      <th className="p-3">Mother Name</th>
                      <th className="p-3">Originally Scheduled</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Phone & Village</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointmentsData.overdue.map((appt) => (
                      <tr key={appt._id} className="hover:bg-amber-50/20 transition">
                        <td className="p-3 font-semibold text-gray-800">
                          {appt.woman?.name || 'Patient'}
                          <span className="block text-[10px] text-red-500 font-semibold">OVERDUE</span>
                        </td>
                        <td className="p-3 text-amber-800 font-medium">
                          📅 {new Date(appt.date).toLocaleDateString()}
                        </td>
                        <td className="p-3">{appt.type}</td>
                        <td className="p-3 text-gray-500">
                          📞 {appt.woman?.phone || 'N/A'} • {appt.woman?.address || 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEditModal(appt)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm transition"
                          >
                            Record Follow-Up
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-green-600 font-medium">
                ✅ Excellent! No overdue follow-ups pending for your patients.
              </div>
            )}
          </div>
        )}

        {/* Edit / Reschedule / Complete Modal */}
        {editingCheckup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-teal-100">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-gray-900 text-base">Update Appointment & Follow-Up</h3>
                <button
                  onClick={() => setEditingCheckup(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCheckup} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Appointment Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400 font-medium"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Missed">Missed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Reschedule Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="e.g. 120/80"
                      value={editForm.bloodPressure}
                      onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Visit Outcome & Clinical Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Findings during this checkup..."
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Next Follow-Up Date</label>
                    <input
                      type="date"
                      value={editForm.nextFollowUpDate}
                      onChange={(e) => setEditForm({ ...editForm, nextFollowUpDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Follow-Up Action Plan</label>
                    <input
                      type="text"
                      placeholder="e.g. Call mother on Monday"
                      value={editForm.followUpNotes}
                      onChange={(e) => setEditForm({ ...editForm, followUpNotes: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingCheckup(null)}
                    disabled={editSubmitting}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
