// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validateName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Full Name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Full Name must be at least 3 characters';
  }
  if (trimmed.length > 80) {
    return 'Full Name must not exceed 80 characters';
  }
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < 2) {
    return 'Full Name must contain at least 2 alphabetic characters';
  }
  if (!/^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/.test(trimmed)) {
    return 'Full Name can only contain letters and normal spaces between names';
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Email address is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return 'Mobile number is required';
  }
  const trimmed = phone.trim();
  if (!/^\d+$/.test(trimmed)) {
    return 'Mobile number must contain only digits';
  }
  if (trimmed.length !== 10) {
    return 'Mobile number must be exactly 10 digits';
  }
  if (!/^[6-9]/.test(trimmed)) {
    return 'Mobile number must start with a digit between 6 and 9';
  }
  if (/^(\d)\1{9}$/.test(trimmed)) {
    return 'Mobile number cannot be a repeated invalid pattern';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  return null;
};

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateAll = (currentForm = form) => {
    const newErrors = {};
    const nameErr = validateName(currentForm.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(currentForm.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(currentForm.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(currentForm.password);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validateConfirmPassword(currentForm.confirmPassword, currentForm.password);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let fieldErr = null;
    if (field === 'name') fieldErr = validateName(form.name);
    if (field === 'email') fieldErr = validateEmail(form.email);
    if (field === 'phone') fieldErr = validatePhone(form.phone);
    if (field === 'password') fieldErr = validatePassword(form.password);
    if (field === 'confirmPassword') fieldErr = validateConfirmPassword(form.confirmPassword, form.password);

    setErrors((prev) => ({ ...prev, [field]: fieldErr }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (touched[name]) {
      let fieldErr = null;
      if (name === 'name') fieldErr = validateName(value);
      if (name === 'email') fieldErr = validateEmail(value);
      if (name === 'phone') fieldErr = validatePhone(value);
      if (name === 'password') {
        fieldErr = validatePassword(value);
        if (touched.confirmPassword) {
          const confirmErr = validateConfirmPassword(form.confirmPassword, value);
          setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
        }
      }
      if (name === 'confirmPassword') fieldErr = validateConfirmPassword(value, form.password);

      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    setLoading(true);
    try {
      const trimmedName = form.name.trim();
      const trimmedEmail = form.email.trim().toLowerCase();
      const trimmedPhone = form.phone.trim();

      const user = await register(trimmedName, trimmedEmail, trimmedPhone, form.password);
      // Public registration defaults to pregnant woman
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/woman');
    } catch (err) {
      console.error(err);
      const apiMessage = err.response?.data?.message;
      const apiField = err.response?.data?.field;
      if (apiField && apiMessage) {
        setErrors((prev) => ({ ...prev, [apiField]: apiMessage }));
      }
      setError(apiMessage || 'Registration failed. Please check backend connection.');
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
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
              onBlur={() => handleBlur('name')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                touched.name && errors.name
                  ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/20'
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              required
            />
            {touched.name && errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
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
              onBlur={() => handleBlur('email')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                touched.email && errors.email
                  ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/20'
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              required
            />
            {touched.email && errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-pink-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              maxLength={10}
              placeholder="e.g. 9876543210 (10 digits)"
              value={form.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                touched.phone && errors.phone
                  ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/20'
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              required
            />
            {touched.phone && errors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Role Display */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-pink-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min 8 chars (uppercase, lowercase, number)"
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                touched.password && errors.password
                  ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/20'
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              required
            />
            {touched.password && errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
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
              onBlur={() => handleBlur('confirmPassword')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                touched.confirmPassword && errors.confirmPassword
                  ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/20'
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
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
