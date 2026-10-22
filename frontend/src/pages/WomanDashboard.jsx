// src/pages/WomanDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WomanDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/woman/profile');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not load pregnancy records. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pink-50/60 font-sans text-gray-800">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-2xl font-black text-pink-600">
              Maa<span className="text-teal-600">Care</span>
            </Link>
            <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-full">
              Expectant Mother Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Welcome, <span className="text-pink-700 font-bold">{user?.name}</span>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner with Greeting */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Namaste, {user?.name || 'Mother'}! 🌸
            </h1>
            <p className="text-pink-100 text-sm">
              Your comprehensive maternal timeline, medical appointment schedule, and antenatal history.
            </p>
          </div>

          {/* Quick Pill for Next Visit */}
          {data?.nextAppointment && (
            <div className="bg-white/20 backdrop-blur px-4 py-2.5 rounded-xl border border-white/20 self-start md:self-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-pink-100 block">Next Scheduled Checkup</span>
              <span className="text-sm font-bold text-white">
                📅 {new Date(data.nextAppointment.date).toLocaleDateString()} at {data.nextAppointment.time || '10:00 AM'}
              </span>
            </div>
          )}
        </div>

        {/* Overdue Reminder Banner if any */}
        {data?.overdueCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="font-bold">Follow-up Reminder:</span> You have {data.overdueCount} scheduled checkup visit(s) whose date has elapsed. Your health worker will contact you or assist with rescheduling.
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading your health records...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Pregnancy Details & Health Worker Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Clinical Card */}
              <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900">Pregnancy Information</h2>
                  <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded">
                    Active Clinical Card
                  </span>
                </div>

                {data?.pregnancyDetails ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Maternal Age:</span>
                      <span className="font-semibold">{data.pregnancyDetails.age} years</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Contact Phone:</span>
                      <span className="font-semibold">{data.pregnancyDetails.phone || user?.phone || 'Not recorded'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Blood Group:</span>
                      <span className="font-bold text-pink-700">{data.pregnancyDetails.bloodGroup || 'Not recorded'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Current Gestation:</span>
                      <span className="font-bold text-purple-700 text-sm">
                        {data.pregnancyDetails.pregnancyWeek ? `Week ${data.pregnancyDetails.pregnancyWeek}` : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Estimated Delivery Date (EDD):</span>
                      <span className="font-semibold text-teal-700">
                        {data.pregnancyDetails.expectedDeliveryDate
                          ? new Date(data.pregnancyDetails.expectedDeliveryDate).toLocaleDateString()
                          : 'To be estimated'}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-500 block mb-1">Residential Address:</span>
                      <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                        {data.pregnancyDetails.address || 'Address not registered'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500 text-xs">
                    <p className="mb-2">No clinical card linked yet.</p>
                    <p className="text-gray-400">
                      The hospital or health worker will register your clinical pregnancy details during your intake visit.
                    </p>
                  </div>
                )}
              </div>

              {/* Assigned Health Worker Box */}
              <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm space-y-3">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Your Assigned Health Worker</h3>
                {data?.pregnancyDetails?.assignedWorker ? (
                  <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                      👩‍⚕️
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 text-sm">{data.pregnancyDetails.assignedWorker.name}</p>
                      <p className="text-teal-800">{data.pregnancyDetails.assignedWorker.email}</p>
                      {data.pregnancyDetails.assignedWorker.phone && (
                        <p className="text-gray-600 mt-1">📞 Contact: {data.pregnancyDetails.assignedWorker.phone}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 text-center">
                    A community health worker will be assigned to support you shortly.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Checkups & Appointments Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Checkups & Appointment Timeline</h2>
                  <p className="text-xs text-gray-400">Chronological history of antenatal visits and future checkups</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                  {data?.checkups?.length || 0} Records
                </span>
              </div>

              {data?.checkups && data.checkups.length > 0 ? (
                <div className="space-y-3">
                  {data.checkups.map((c) => (
                    <div
                      key={c._id}
                      className="border border-gray-100 rounded-xl p-4 hover:border-pink-200 transition bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              c.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : c.status === 'Overdue'
                                ? 'bg-amber-100 text-amber-800'
                                : c.status === 'Missed'
                                ? 'bg-red-100 text-red-800'
                                : c.status === 'Cancelled'
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {c.status}
                          </span>
                          <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{c.type}</h3>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          📅 {new Date(c.date).toLocaleDateString()} {c.time ? `at ${c.time}` : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg mb-2">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Blood Pressure:</span>
                          <span className="font-semibold text-gray-800">{c.bloodPressure || 'Pending measurement'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Weight:</span>
                          <span className="font-semibold text-gray-800">{c.weight ? `${c.weight} kg` : 'Pending measurement'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Next Follow-Up:</span>
                          <span className="font-semibold text-teal-700">
                            {c.nextFollowUpDate ? new Date(c.nextFollowUpDate).toLocaleDateString() : 'None scheduled'}
                          </span>
                        </div>
                      </div>

                      {c.notes && (
                        <p className="text-xs text-gray-600 italic mt-1">
                          <span className="font-semibold not-italic text-gray-700">Worker Advice:</span> {c.notes}
                        </p>
                      )}
                      {c.followUpNotes && (
                        <p className="text-xs text-teal-800 italic mt-0.5">
                          <span className="font-semibold not-italic text-teal-900">Follow-up Action:</span> {c.followUpNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">🩺</div>
                  <h4 className="font-semibold text-gray-700 mb-1">No Checkup Records Yet</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    When your assigned health worker schedules your visits or records maternal checkups, your vitals and appointments will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WomanDashboard;
