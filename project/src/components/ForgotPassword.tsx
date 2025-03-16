import React, { useState } from 'react';
import { Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../lib/auth';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Nie udało się wysłać linku resetującego hasło. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <Link to="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót do logowania
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resetowanie hasła
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Wprowadź swój adres email, aby otrzymać link do resetowania hasła
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Link do resetowania hasła został wysłany
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Sprawdź swoją skrzynkę email i postępuj zgodnie z instrukcjami.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-solrent-orange focus:border-solrent-orange focus:z-10 sm:text-sm"
                  placeholder="Adres email"
                  disabled={isLoading}
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
                      Błąd resetowania hasła
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
                {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;