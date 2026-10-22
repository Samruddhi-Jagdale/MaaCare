// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise from localStorage on first render
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5001/api/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    const { token, ...userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await axios.post('http://localhost:5001/api/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password,
      role: 'woman', // Public registration default
    });
    const { token, ...userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
