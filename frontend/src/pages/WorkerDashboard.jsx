// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Pill,
  Stethoscope,
  ChevronRight,
  X,
  Phone,
  Baby,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import PregnancyJourneyTracker from '../components/PregnancyJourneyTracker';
import DigitalHealthRecord from '../components/DigitalHealthRecord';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [women, setWomen] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState({
    upcoming: [],
    overdue: [],
    completed: [],
    missed: [],
    cancelled: [],
    all: [],
  });
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
    hemoglobin: '',
    bloodSugar: '',
    fetalHeartRate: '',
    fundalHeight: '',
    supplements: '', // e.g. "Iron Folic Acid 1 tab daily, Calcium 500mg daily"
    prescriptions: '',
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
    hemoglobin: '',
    bloodSugar: '',
    fetalHeartRate: '',
    fundalHeight: '',
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
      setError('');
      const [womenRes, apptRes] = await Promise.all([
        api.get('/api/worker/women'),
        api.get('/api/worker/appointments'),
      ]);
      setWomen(womenRes.data);
      setAppointmentsData(apptRes.data);

      // Auto-select first mother if none selected
      if (womenRes.data.length > 0 && !selectedWoman) {
        selectPatient(womenRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load health worker caseload data.');
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (woman) => {
    try {
      setSelectedWoman(woman);
      const res = await api.get(`/api/worker/women/${woman._id}`);
      setCheckups(res.data.checkups || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient records.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWoman) return;

    setFormSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Parse comma-separated supplements into structured array
      const parsedSupplements = checkupForm.supplements
        ? checkupForm.supplements
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((name) => ({ name, dosage: 'As prescribed', frequency: 'Daily' }))
        : [];

      const parsedPrescriptions = checkupForm.prescriptions
        ? checkupForm.prescriptions
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((name) => ({ medicineName: name, instructions: 'Follow advice' }))
        : [];

      await api.post('/api/worker/checkups', {
        womanId: selectedWoman._id,
        date: checkupForm.date,
        time: checkupForm.time,
        type: checkupForm.type,
        bloodPressure: checkupForm.bloodPressure,
        weight: checkupForm.weight ? Number(checkupForm.weight) : undefined,
        hemoglobin: checkupForm.hemoglobin ? Number(checkupForm.hemoglobin) : undefined,
        bloodSugar: checkupForm.bloodSugar,
        fetalHeartRate: checkupForm.fetalHeartRate ? Number(checkupForm.fetalHeartRate) : undefined,
        fundalHeight: checkupForm.fundalHeight ? Number(checkupForm.fundalHeight) : undefined,
        supplements: parsedSupplements,
        prescriptions: parsedPrescriptions,
        notes: checkupForm.notes,
        status: checkupForm.status,
        nextFollowUpDate: checkupForm.nextFollowUpDate || undefined,
      });

      setSuccess('Appointment successfully scheduled and clinical record updated!');
      // Reset form
      setCheckupForm({
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'Routine Antenatal Care',
        bloodPressure: '',
        weight: '',
        hemoglobin: '',
        bloodSugar: '',
        fetalHeartRate: '',
        fundalHeight: '',
        supplements: '',
        prescriptions: '',
        notes: '',
        status: 'Upcoming',
        nextFollowUpDate: '',
      });

      // Refresh records
      await selectPatient(selectedWoman);
      const apptRes = await api.get('/api/worker/appointments');
      setAppointmentsData(apptRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to schedule appointment.');
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
      weight: checkup.weight !== undefined ? checkup.weight : '',
      hemoglobin: checkup.hemoglobin !== undefined ? checkup.hemoglobin : '',
      bloodSugar: checkup.bloodSugar || '',
      fetalHeartRate: checkup.fetalHeartRate !== undefined ? checkup.fetalHeartRate : '',
      fundalHeight: checkup.fundalHeight !== undefined ? checkup.fundalHeight : '',
      notes: checkup.notes || '',
      nextFollowUpDate: checkup.nextFollowUpDate
        ? new Date(checkup.nextFollowUpDate).toISOString().split('T')[0]
        : '',
      followUpNotes: checkup.followUpNotes || '',
    });
  };

  const handleUpdateCheckup = async (e) => {
    e.preventDefault();
    if (!editingCheckup) return;

    if (editForm.status === 'Cancelled') {
      const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
      if (!confirmCancel) return;
    }

    setEditSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/api/worker/checkups/${editingCheckup._id}`, {
        date: editForm.date,
        time: editForm.time,
        status: editForm.status,
        bloodPressure: editForm.bloodPressure,
        weight: editForm.weight !== '' ? Number(editForm.weight) : undefined,
        hemoglobin: editForm.hemoglobin !== '' ? Number(editForm.hemoglobin) : undefined,
        bloodSugar: editForm.bloodSugar,
        fetalHeartRate: editForm.fetalHeartRate !== '' ? Number(editForm.fetalHeartRate) : undefined,
        fundalHeight: editForm.fundalHeight !== '' ? Number(editForm.fundalHeight) : undefined,
        notes: editForm.notes,
        nextFollowUpDate: editForm.nextFollowUpDate || undefined,
        followUpNotes: editForm.followUpNotes,
      });

      setSuccess('Visit record updated successfully.');
      setEditingCheckup(null);

      if (selectedWoman) {
        await selectPatient(selectedWoman);
      }
      const apptRes = await api.get('/api/worker/appointments');
      setAppointmentsData(apptRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update checkup.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredWomen = women.filter((w) =>
    (w.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.phone || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-pink-50/40 text-gray-800 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner with Live Count Badges */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Community Healthcare Caseload</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1.5">
              Sister {user?.name}
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-0.5">
              Maternal Health Monitoring, Antenatal Visits & Follow-up Tracking
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap gap-2.5">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-teal-100 uppercase font-bold block">Assigned Mothers</span>
              <span className="text-xl font-black">{women.length}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-teal-100 uppercase font-bold block">Upcoming Visits</span>
              <span className="text-xl font-black">{appointmentsData.upcoming.length}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-amber-200 uppercase font-bold block">Overdue Follow-ups</span>
              <span className="text-xl font-black text-amber-200">{appointmentsData.overdue.length}</span>
            </div>
          </div>
        </div>

        {/* Global Notifications / Alerts */}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 space-x-4">
          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'patients'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Assigned Mothers & Clinical Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'appointments'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Upcoming Visits ({appointmentsData.upcoming.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'overdue'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Follow-ups ({appointmentsData.overdue.length})</span>
          </button>
        </div>

        {/* TAB 1: Patients & Clinical Chart */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Patient Directory */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-800">Assigned Caseload</h3>
                <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                  {filteredWomen.length} Patients
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Patient List */}
              <div className="max-h-[550px] overflow-y-auto space-y-2 pr-1">
                {filteredWomen.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No assigned mothers match search.</p>
                ) : (
                  filteredWomen.map((w) => {
                    const isSelected = selectedWoman?._id === w._id;
                    return (
                      <div
                        key={w._id}
                        onClick={() => selectPatient(w)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition border text-xs ${
                          isSelected
                            ? 'bg-teal-50/80 border-teal-300 shadow-xs ring-1 ring-teal-200'
                            : 'bg-white hover:bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-gray-900">{w.name}</p>
                          <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                            Week {w.pregnancyWeek || '—'}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{w.phone || 'No phone'}</span>
                        </p>
                        {w.expectedDeliveryDate && (
                          <p className="text-[10px] text-teal-700 font-semibold mt-1">
                            EDD: {new Date(w.expectedDeliveryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 8 Cols: Selected Patient Clinical Workspace */}
            <div className="lg:col-span-8 space-y-6">
              {selectedWoman ? (
                <>
                  {/* Integrated Feature 1: Pregnancy Journey Tracker for this Mother */}
                  <PregnancyJourneyTracker
                    woman={selectedWoman}
                    checkups={checkups}
                  />

                  {/* Integrated Feature 2: Digital Maternal Health Record */}
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                    <DigitalHealthRecord
                      woman={selectedWoman}
                      checkups={checkups}
                    />
                  </div>

                  {/* Schedule Antenatal Appointment Form */}
                  <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-teal-600" />
                        <h3 className="font-black text-gray-900 text-sm">
                          Schedule Antenatal Visit / Record Observations
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500">Patient: {selectedWoman.name}</span>
                    </div>

                    <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Checkup Date *</label>
                          <input
                            type="date"
                            required
                            value={checkupForm.date}
                            onChange={(e) => setCheckupForm({ ...checkupForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Time</label>
                          <input
                            type="text"
                            value={checkupForm.time}
                            onChange={(e) => setCheckupForm({ ...checkupForm, time: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="e.g. 10:30 AM"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Visit Type *</label>
                          <select
                            value={checkupForm.type}
                            onChange={(e) => setCheckupForm({ ...checkupForm, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            <option>Routine Antenatal Care</option>
                            <option>Ultrasound / TIFFA Scan</option>
                            <option>Blood & Glucose Screening (OGTT)</option>
                            <option>Immunization (TT/Td)</option>
                            <option>High-Risk Follow-up</option>
                          </select>
                        </div>
                      </div>

                      {/* Vitals row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-2xl">
                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Blood Pressure</label>
                          <input
                            type="text"
                            placeholder="e.g. 120/80"
                            value={checkupForm.bloodPressure}
                            onChange={(e) => setCheckupForm({ ...checkupForm, bloodPressure: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 58"
                            value={checkupForm.weight}
                            onChange={(e) => setCheckupForm({ ...checkupForm, weight: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Hemoglobin (g/dL)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 11.5"
                            value={checkupForm.hemoglobin}
                            onChange={(e) => setCheckupForm({ ...checkupForm, hemoglobin: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Fetal Heart (bpm)</label>
                          <input
                            type="number"
                            placeholder="e.g. 140"
                            value={checkupForm.fetalHeartRate}
                            onChange={(e) => setCheckupForm({ ...checkupForm, fetalHeartRate: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Supplements & Prescriptions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Supplements Prescribed (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Iron Folic Acid, Calcium 500mg"
                            value={checkupForm.supplements}
                            onChange={(e) => setCheckupForm({ ...checkupForm, supplements: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">
                            Prescriptions / Medicines (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Paracetamol 500mg SOS"
                            value={checkupForm.prescriptions}
                            onChange={(e) => setCheckupForm({ ...checkupForm, prescriptions: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Clinical Notes & Follow-up */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Clinical Observation Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Record findings, dietary counseling, fetal movement checks..."
                            value={checkupForm.notes}
                            onChange={(e) => setCheckupForm({ ...checkupForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Next Follow-Up Date</label>
                          <input
                            type="date"
                            value={checkupForm.nextFollowUpDate}
                            onChange={(e) => setCheckupForm({ ...checkupForm, nextFollowUpDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={formSubmitting}
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition shadow-sm disabled:opacity-50"
                        >
                          {formSubmitting ? 'Saving...' : 'Confirm & Schedule Appointment'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Checkup History Table */}
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm">Recorded Visit Timeline</h3>
                      <span className="text-xs text-gray-400">{checkups.length} visits on record</span>
                    </div>

                    <div className="space-y-3">
                      {checkups.map((c) => (
                        <div
                          key={c._id}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  c.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : c.status === 'Overdue'
                                    ? 'bg-amber-100 text-amber-800'
                                    : c.status === 'Missed'
                                    ? 'bg-rose-100 text-rose-800'
                                    : c.status === 'Cancelled'
                                    ? 'bg-gray-100 text-gray-500'
                                    : 'bg-teal-100 text-teal-800'
                                }`}
                              >
                                {c.status}
                              </span>
                              <span className="font-bold text-gray-900">{c.type}</span>
                            </div>
                            <p className="text-gray-500 mt-1">
                              📅 {new Date(c.date).toLocaleDateString()} {c.time && `at ${c.time}`}
                              {c.bloodPressure && ` &bull; BP: ${c.bloodPressure}`}
                              {c.weight && ` &bull; Wt: ${c.weight} kg`}
                            </p>
                            {c.notes && <p className="text-gray-600 italic mt-0.5">{c.notes}</p>}
                          </div>

                          <button
                            onClick={() => openEditModal(c)}
                            className="self-start sm:self-auto px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-teal-700 hover:bg-teal-50 shadow-2xs"
                          >
                            Update Visit Record
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center text-gray-400 text-sm border border-pink-100">
                  Select a patient from the caseload directory to view her maternal journey.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Upcoming Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Upcoming Antenatal Appointments</h3>
            {appointmentsData.upcoming.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No upcoming visits currently scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Mother Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Visit Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointmentsData.upcoming.map((appt) => (
                      <tr key={appt._id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{appt.woman?.name || 'Unknown'}</td>
                        <td className="p-3 text-gray-600">{appt.woman?.phone || '—'}</td>
                        <td className="p-3 font-medium text-gray-800">
                          {new Date(appt.date).toLocaleDateString()} {appt.time}
                        </td>
                        <td className="p-3 text-teal-800 font-semibold">{appt.type}</td>
                        <td className="p-3">
                          <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {appt.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEditModal(appt)}
                            className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700"
                          >
                            Complete / Reschedule
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Overdue Follow-ups */}
        {activeTab === 'overdue' && (
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-amber-900 text-base">Past Due Follow-up Required</h3>
            {appointmentsData.overdue.length === 0 ? (
              <div className="p-8 text-center text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                No overdue visits. All patient follow-ups are up to date!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50 text-amber-900 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Scheduled Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {appointmentsData.overdue.map((appt) => (
                      <tr key={appt._id} className="hover:bg-amber-50/50">
                        <td className="p-3 font-bold text-gray-900">{appt.woman?.name}</td>
                        <td className="p-3">{appt.woman?.phone}</td>
                        <td className="p-3 text-rose-700 font-bold">
                          {new Date(appt.date).toLocaleDateString()}
                        </td>
                        <td className="p-3">{appt.type}</td>
                        <td className="p-3">
                          <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Overdue
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEditModal(appt)}
                            className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700"
                          >
                            Record Visit / Reschedule
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Edit / Complete Appointment */}
        {editingCheckup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-black text-gray-900 text-base">
                  Update Checkup / Follow-up Record
                </h3>
                <button
                  onClick={() => setEditingCheckup(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCheckup} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Checkup Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Missed">Missed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="e.g. 118/76"
                      value={editForm.bloodPressure}
                      onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 60.5"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Health Worker Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    placeholder="Maternal status, counsel given..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={editForm.nextFollowUpDate}
                      onChange={(e) => setEditForm({ ...editForm, nextFollowUpDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Follow-up Action Plan</label>
                    <input
                      type="text"
                      value={editForm.followUpNotes}
                      onChange={(e) => setEditForm({ ...editForm, followUpNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="Action instructions"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingCheckup(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50"
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
}
