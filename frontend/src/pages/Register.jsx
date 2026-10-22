// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.phone, form.password);
      // Public registration defaults to pregnant woman
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/woman');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <div className="text-center mb-6">
          <Link to="/" className="text-3xl font-extrabold text-pink-700 tracking-tight">
            Maa<span className="text-teal-600">Care</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Register as an expectant mother for maternal care monitoring
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-pink-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Anjali Sharma"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-pink-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="anjali@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="w-full bg-pink-50 border border-pink-200 rounded-lg px-3 py-2 text-sm text-pink-900 font-medium flex items-center justify-between">
              <span>Pregnant Woman (Default)</span>
              <span className="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded">Public</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Admin & Health Worker accounts are authorized and assigned centrally.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-pink-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-pink-600">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white font-medium rounded-lg py-2.5 hover:bg-pink-700 active:scale-[0.99] transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
