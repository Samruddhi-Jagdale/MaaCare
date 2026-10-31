// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Activity, Globe, LogOut, BookOpen, User, PhoneCall, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/woman';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.role === 'admin') return t('roleAdmin');
    if (user.role === 'worker') return t('roleWorker');
    return t('roleWoman');
  };

  const getRoleBadgeStyle = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (user.role === 'worker') return 'bg-teal-100 text-teal-700 border-teal-200';
    return 'bg-pink-100 text-pink-700 border-pink-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-105 transition">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-pink-600 to-teal-600 bg-clip-text text-transparent">
                  MaaCare
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase -mt-1 hidden sm:block">
                  Maternal Health
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            {user && (
              <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle()}`}>
                {getRoleLabel()}
              </span>
            )}
          </div>

          {/* Emergency Helpline Pill */}
          <a
            href="tel:108"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
            title="National Emergency Obstetric Ambulance"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-rose-600" />
            <span>Emergency 108 / 102</span>
          </a>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-2 sm:space-x-4">
            <Link
              to={getDashboardPath()}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                location.pathname === getDashboardPath()
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
              }`}
            >
              {t('navDashboard')}
            </Link>

            <Link
              to="/education"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                location.pathname === '/education'
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('navEducation')}</span>
            </Link>

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700 transition"
              title="Toggle English / मराठी"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center pl-2 border-l border-gray-200 space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-400">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {user && <NotificationBell />}
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold"
            >
              {language === 'en' ? 'MR' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-pink-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {user && (
            <div className="py-2 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                {t('navLogout')}
              </button>
            </div>
          )}
          <Link
            to={getDashboardPath()}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50"
          >
            {t('navDashboard')}
          </Link>
          <Link
            to="/education"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            {t('navEducation')}
          </Link>
          <a
            href="tel:108"
            className="block px-3 py-2 rounded-lg text-sm font-bold text-rose-600 bg-rose-50"
          >
            Emergency Helpline: 108 / 102
          </a>
        </div>
      )}
    </header>
  );
}
