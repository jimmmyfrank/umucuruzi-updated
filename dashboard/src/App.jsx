import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import your pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Ads from './pages/Ads';
import Markets from './pages/Markets';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // <--- Add loading state

  useEffect(() => {
    // Check local storage for token
    const token = localStorage.getItem('umucuruzi_token');
    if (token) {
      setIsAuthenticated(true);
    }
    // Done checking, stop loading
    setLoading(false);
  }, []);

  // While checking the token, show nothing (or a loading spinner) 
  // to prevent the redirect from firing too early!
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-xl">Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/users" 
          element={isAuthenticated ? <Layout><Users /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ads" 
          element={isAuthenticated ? <Layout><Ads /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/markets" 
          element={isAuthenticated ? <Layout><Markets /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/categories" 
          element={isAuthenticated ? <Layout><Categories /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings" 
          element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;