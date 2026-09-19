import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Logo from '../assets/logo.png';

export default function Login({ setAuth }) {
  // 🔥 Defaults removed! Start with empty strings.
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('umucuruzi_token', res.data.token);
        setAuth(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please check your login details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Umucuruzi" className="w-24 h-24 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              placeholder="Enter username (e.g. admin)" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent" 
              required 
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-[#FF6B35] text-white p-3 rounded-lg font-bold hover:bg-[#e55a2a] transition shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}