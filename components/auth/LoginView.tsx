import React, { useState } from 'react';
import { AuthService, User } from '../../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const user = await AuthService.register(name, email);
        onLoginSuccess(user);
      } else {
        const user = await AuthService.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await AuthService.loginWithGoogle();
      onLoginSuccess(user);
    } catch (err) {
      setError("Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f7f7f7] flex flex-col items-center justify-center p-6 z-[200]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 card-shadow animate-scaleIn">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-[#1e210d] rounded-xl flex items-center justify-center text-white mb-6 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1e210d]">
            {isRegistering ? 'Create your account' : 'Welcome to FocusPilot'}
          </h2>
          <p className="mt-2 text-[#717171] font-light text-[15px]">
            Master your productivity with precision.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-xl font-semibold text-[14px] text-[#484848] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1e210d] rounded-full animate-spin"></div>
            ) : (
              <>
                <svg viewBox="0 0 48 48" className="w-5 h-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[12px] text-[#717171] bg-white">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegistering && (
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all placeholder-gray-400 text-[14px]"
                placeholder="Full Name"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all placeholder-gray-400 text-[14px]"
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all placeholder-gray-400 text-[14px]"
              placeholder="Password"
            />

            {error && <p className="text-red-600 text-[13px] font-medium text-center mt-2">{error}</p>}

            <button
              disabled={loading || googleLoading}
              className="w-full py-3.5 bg-[#1e210d] text-white font-semibold rounded-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 text-[15px]"
            >
              {loading ? 'Processing...' : (isRegistering ? 'Sign up' : 'Log in')}
            </button>
          </form>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[14px] font-semibold text-[#1e210d] hover:underline"
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-[12px] font-medium text-[#717171] flex gap-6">
        <span>Privacy</span>
        <span>Terms</span>
        <span>&copy; 2025 FocusPilot Inc.</span>
      </div>
    </div>
  );
};