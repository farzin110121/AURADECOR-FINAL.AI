
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
// FIX: Corrected import path for UserRole type.
import { UserRole } from '../types/index';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('owner');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'supplier') {
      setRole('supplier');
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { email, password, role });
      // After successful registration, log the user in
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const response = await api.post('/auth/token', formData);
      await login(response.data.access_token);
      
      const redirectPath = role === 'owner' ? '/owner/dashboard' : '/supplier/dashboard';
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign up. This email might already be in use.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h2 className="text-4xl font-bold font-display text-center gold-gradient-text mb-8">Create Your Account</h2>
      <div className="grid grid-cols-2 gap-2 p-1 bg-card-bg border border-border-color rounded-full mb-8">
        <button onClick={() => setRole('owner')} className={`py-2 rounded-full text-sm font-semibold transition-colors ${role === 'owner' ? 'bg-primary-gold text-black' : 'text-text-muted'}`}>I'm an Owner</button>
        <button onClick={() => setRole('supplier')} className={`py-2 rounded-full text-sm font-semibold transition-colors ${role === 'supplier' ? 'bg-primary-gold text-black' : 'text-text-muted'}`}>I'm a Supplier</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-muted">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md bg-black/30 border-border-color shadow-sm py-2 px-3 focus:border-primary-gold focus:ring-primary-gold" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-muted">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md bg-black/30 border-border-color shadow-sm py-2 px-3 focus:border-primary-gold focus:ring-primary-gold" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <button type="submit" className="w-full justify-center px-4 py-3 font-semibold rounded-full text-black bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all">
            Sign Up as {role === 'owner' ? 'an Owner' : 'a Supplier'}
          </button>
        </div>
        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-gold hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;