// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Role-based redirection
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/woman');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials or backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-pink-100 p-8 space-y-5">
        <div className="text-center">
          <Link to="/" className="text-3xl font-extrabold text-pink-700 tracking-tight">
            Maa<span className="text-teal-600">Care</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your maternal care portal</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white font-medium bg-pink-600 rounded-lg hover:bg-pink-700 active:scale-[0.99] transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center mb-2">
            Demo Logins:
          </p>
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg space-y-1">
            <p><span className="font-semibold text-pink-700">Admin:</span> admin@maacare.org / adminpassword123</p>
            <p><span className="font-semibold text-teal-700">Health Worker:</span> worker@maacare.org / workerpassword123</p>
          </div>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
