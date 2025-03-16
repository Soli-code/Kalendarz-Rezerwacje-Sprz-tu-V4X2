import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minut

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zablokowany
    const storedLockout = localStorage.getItem('adminLoginLockout');
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem('adminLoginLockout');
        setLoginAttempts(0);
      }
    }
  }, []);

  const handleLoginFailure = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      setLockoutUntil(lockoutTime);
      localStorage.setItem('adminLoginLockout', lockoutTime.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Sprawdź czy użytkownik nie jest zablokowany
    if (lockoutUntil && lockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Zbyt wiele nieudanych prób. Spróbuj ponownie za ${minutesLeft} minut.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Sprawdź czy użytkownik jest administratorem
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.is_admin) {
        throw new Error('Brak uprawnień administratora');
      }

      // Jeśli logowanie udane, wyczyść licznik prób
      setLoginAttempts(0);
      localStorage.removeItem('adminLoginLockout');

      // Zapisz timestamp ostatniego udanego logowania
      await supabase
        .from('admin_actions')
        .insert({
          action_type: 'login',
          action_details: {
            email: email,
            timestamp: new Date().toISOString(),
            ip_address: await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip)
          }
        });

      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(
          error.message === 'Invalid login credentials' 
            ? 'Nieprawidłowe dane logowania'
            : error.message === 'Brak uprawnień administratora'
            ? 'Brak uprawnień administratora'
            : 'Wystąpił nieoczekiwany błąd'
        );
      } else {
        setError('Wystąpił nieoczekiwany błąd');
      }
      handleLoginFailure();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Panel Administracyjny
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zaloguj się aby zarządzać systemem
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-solrent-orange focus:border-solrent-orange focus:z-10 sm:text-sm"
                placeholder="Adres email"
                disabled={isLoading || (lockoutUntil && lockoutUntil > Date.now())}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Hasło
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-solrent-orange focus:border-solrent-orange focus:z-10 sm:text-sm"
                placeholder="Hasło"
                disabled={isLoading || (lockoutUntil && lockoutUntil > Date.now())}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Błąd logowania
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || (lockoutUntil && lockoutUntil > Date.now())}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || (lockoutUntil && lockoutUntil > Date.now())
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-solrent-orange hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solrent-orange'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logowanie...
                </span>
              ) : lockoutUntil && lockoutUntil > Date.now() ? (
                'Konto tymczasowo zablokowane'
              ) : (
                'Zaloguj się'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin