import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';
import { updatePassword, validatePassword } from '../lib/auth';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Walidacja haseł
    if (newPassword !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('\n'));
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      navigate('/admin');
    } catch (err) {
      setError('Nie udało się zmienić hasła. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zmiana hasła
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Wprowadź nowe hasło
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="new-password" className="sr-only">
                Nowe hasło
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-solrent-orange focus:border-solrent-orange focus:z-10 sm:text-sm"
                placeholder="Nowe hasło"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Potwierdź hasło
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-solrent-orange focus:border-solrent-orange focus:z-10 sm:text-sm"
                placeholder="Potwierdź hasło"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Błąd zmiany hasła
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
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-solrent-orange hover:bg-orange-700'
              }`}
            >
              {isLoading ? 'Zapisywanie...' : 'Zmień hasło'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;