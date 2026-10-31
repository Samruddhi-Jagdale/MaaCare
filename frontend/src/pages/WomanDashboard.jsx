// src/pages/WomanDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Heart,
  FileText,
  Activity,
  AlertCircle,
  Pill,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import PregnancyJourneyTracker from '../components/PregnancyJourneyTracker';
import DigitalHealthRecord from '../components/DigitalHealthRecord';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WomanDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/woman/profile');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Could not load pregnancy records. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const checkups = data?.checkups || [];
  const filteredCheckups =
    statusFilter === 'ALL' ? checkups : checkups.filter((c) => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-pink-50/40 text-gray-800 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Overdue Reminder Banner */}
        {data?.overdueCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3.5 rounded-2xl text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Follow-up Reminder:</span> You have {data.overdueCount}{' '}
                past checkup visit(s) requiring attention. Your assigned health worker will assist
                you with scheduling.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Feature 1: Pregnancy Journey Tracker Component */}
            <PregnancyJourneyTracker
              woman={data?.pregnancyDetails}
              checkups={checkups}
            />

            {/* Feature 2: Digital Maternal Health Record Component */}
            {data?.pregnancyDetails?.age ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm">
                <DigitalHealthRecord
                  woman={data?.pregnancyDetails}
                  checkups={checkups}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm text-center">
                <div className="flex flex-col items-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-pink-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">Antenatal Intake Registration Pending</h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Your detailed health record will be completed by your assigned health worker during your first antenatal visit.
                  </p>
                </div>
              </div>
            )}

            {/* Feature 3: Appointment & Visit History Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-pink-600" />
                    <span>Checkup & Appointment Timeline</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Complete chronological history of antenatal visits, observations, and care plans
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'Upcoming', 'Completed', 'Overdue', 'Missed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        statusFilter === status
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCheckups.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No checkup records found matching filter '{statusFilter}'.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCheckups.map((c) => (
                    <div
                      key={c._id}
                      className="border border-gray-100 rounded-2xl p-5 hover:border-pink-200 transition bg-white shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
                          <h4 className="font-bold text-gray-900 text-sm">{c.type}</h4>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          📅 {new Date(c.date).toLocaleDateString()} {c.time ? `at ${c.time}` : ''}
                        </span>
                      </div>

                      {/* Vitals summary if recorded */}
                      {(c.bloodPressure || c.weight || c.hemoglobin) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-xl mb-3">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Blood Pressure</span>
                            <span className="font-bold text-gray-800">{c.bloodPressure || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Weight</span>
                            <span className="font-bold text-gray-800">
                              {c.weight ? `${c.weight} kg` : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Hemoglobin</span>
                            <span className="font-bold text-gray-800">
                              {c.hemoglobin ? `${c.hemoglobin} g/dL` : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Next Follow-up</span>
                            <span className="font-bold text-teal-700">
                              {c.nextFollowUpDate
                                ? new Date(c.nextFollowUpDate).toLocaleDateString()
                                : '—'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Supplements recorded */}
                      {Array.isArray(c.supplements) && c.supplements.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] uppercase font-bold text-pink-700 tracking-wider">
                            Supplements Prescribed:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {c.supplements.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-pink-50 border border-pink-100 rounded-lg text-xs font-semibold text-pink-800"
                              >
                                {s.name} ({s.dosage})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor / Worker clinical notes */}
                      {c.notes && (
                        <p className="text-xs text-gray-700 italic bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                          <span className="font-semibold not-italic text-gray-900">
                            Health Worker Notes:
                          </span>{' '}
                          {c.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
