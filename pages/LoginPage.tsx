
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/token', formData);
      await login(response.data.access_token);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    }
  };
  
  React.useEffect(() => {
      if (user) {
          const redirectPath = user.role === 'owner' ? '/owner/dashboard' : '/supplier/dashboard';
          navigate(redirectPath);
      }
  }, [user, navigate]);


  return (
    <div className="max-w-md mx-auto mt-20">
      <h2 className="text-4xl font-bold font-display text-center gold-gradient-text mb-8">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-muted">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-black/30 border-border-color shadow-sm py-2 px-3 focus:border-primary-gold focus:ring-primary-gold"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-muted">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-black/30 border-border-color shadow-sm py-2 px-3 focus:border-primary-gold focus:ring-primary-gold"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full justify-center px-4 py-3 font-semibold rounded-full text-black bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all"
          >
            Login
          </button>
        </div>
        <p className="text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-gold hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
