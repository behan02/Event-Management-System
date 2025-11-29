import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/useAuthStore';

const Login = () => {
  const { login, loading, error, isAuthenticated, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(formData);
  };

  const handleChange = (event) => {
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your events.</p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="jane@eventix.com"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 text-white py-2 font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="text-indigo-600 font-semibold hover:underline"
            onClick={() => navigate('/signup')}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;