import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Calendar, Package, CheckCircle, XCircle, 
  Clock, MessageSquare, History, ArrowLeft, AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerDetails {
  id: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name?: string;
    company_nip?: string;
  };
  status: string;
  start_date: string;
  end_date: string;
  total_price: number;
  items: Array<{
    equipment_name: string;
    quantity: number;
    price_per_day: number;
    deposit: number;
  }>;
  history: Array<{
    changed_at: string;
    previous_status: string;
    new_status: string;
    comment: string;
    changed_by: string;
  }>;
}

const CustomerDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Array<{ content: string; created_at: string }>>([]);
  const [availableStatuses] = useState([
    { 
      id: 'pending', 
      label: 'Oczekujące', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    },
    { 
      id: 'confirmed', 
      label: 'Potwierdzone', 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    { 
      id: 'picked_up', 
      label: 'Odebrane', 
      color: 'bg-blue-100 text-blue-800',
      icon: Package
    },
    { 
      id: 'completed', 
      label: 'Zakończone', 
      color: 'bg-indigo-100 text-indigo-800',
      icon: CheckCircle
    },
    { 
      id: 'cancelled', 
      label: 'Anulowane', 
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    },
    { 
      id: 'archived', 
      label: 'Historyczne', 
      color: 'bg-gray-100 text-gray-800',
      icon: History
    }
  ]);

  useEffect(() => {
    loadCustomerDetails();
    loadComments();
  }, [id]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('reservation_notes')
        .select('*')
        .eq('reservation_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Nie udało się załadować komentarzy');
    }
  };

  const loadCustomerDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_reservations_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDetails(data);
    } catch (err) {
      console.error('Error loading customer details:', err);
      setError('Nie udało się załadować szczegółów klienta');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setSubmitting(true);
      const { error } = await supabase.rpc('update_reservation_status', {
        p_reservation_id: id,
        p_new_status: newStatus,
        p_comment: `Status zmieniony na: ${newStatus}`
      });

      if (error) throw error;
      await loadCustomerDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Nie udało się zaktualizować statusu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reservation_notes')
        .insert({
          reservation_id: id,
          content: newComment
        });

      if (error) throw error;
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Nie udało się dodać komentarza');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solrent-orange"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Powrót do listy
        </button>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Nie znaleziono szczegółów klienta</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Przycisk powrotu */}
      <button
        onClick={() => {
          if (location.state?.from) {
            navigate(location.state.from);
          } else {
            navigate(-1);
          }
        }}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Powrót do listy
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dane klienta */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Dane klienta</h2>
            <User className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Imię i nazwisko</p>
              <p className="font-medium">{details.customer.first_name} {details.customer.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{details.customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium">{details.customer.phone}</p>
            </div>
            {details.customer.company_name && (
              <>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Nazwa firmy</p>
                  <p className="font-medium">{details.customer.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NIP</p>
                  <p className="font-medium">{details.customer.company_nip}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Szczegóły rezerwacji */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Szczegóły rezerwacji</h2>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableStatuses.map(status => {
                  const StatusIcon = status.icon;
                  const isActive = details.status === status.id;
                  return (
                    <button
                      key={status.id}
                      onClick={() => handleStatusChange(status.id)}
                      disabled={submitting || details.status === status.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? `${status.color} ring-2 ring-offset-2 ring-${status.color.split(' ')[0]}`
                          : `hover:${status.color} bg-white border border-gray-200`
                      }`}
                    >
                      <StatusIcon className={`w-4 h-4 mr-1.5 ${isActive ? '' : 'text-gray-400'}`} />
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data rozpoczęcia</p>
              <p className="font-medium">
                {new Date(details.start_date).toLocaleDateString('pl-PL')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data zakończenia</p>
              <p className="font-medium">
                {new Date(details.end_date).toLocaleDateString('pl-PL')}
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Całkowita wartość</p>
              <p className="text-xl font-bold text-solrent-orange">
                {details.total_price} zł
              </p>
            </div>
          </div>
        </div>

        {/* Lista sprzętu */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Zarezerwowany sprzęt</h2>
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {details.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.equipment_name}</p>
                  <p className="text-sm text-gray-500">Ilość: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.price_per_day} zł/dzień</p>
                  {item.deposit > 0 && (
                    <p className="text-sm text-orange-600">Kaucja: {item.deposit} zł</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Komentarze */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Komentarze</h2>
            <MessageSquare className="w-6 h-6 text-gray-400" />
          </div>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Dodaj komentarz..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-solrent-orange"
              rows={3}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="mt-2 w-full py-2 bg-solrent-orange text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dodaj komentarz
            </button>
          </form>

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString('pl-PL')}
                  </p>
                  <p className="mt-1">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Brak komentarzy</p>
            )
            }
          </div>
        </div>

        {/* Historia zmian */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full p-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            aria-expanded={isHistoryExpanded}
            aria-controls={details.history?.length ? "history-panel" : undefined}
          >
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                Historia zmian
                {details.history?.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({details.history.length})
                  </span>
                )}
              </h2>
            </div>
            {details.history?.length > 0 && (
              <motion.div
                animate={{ rotate: isHistoryExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            )}
          </button>

          <AnimatePresence>
            {isHistoryExpanded && details.history && details.history.length > 0 && (
              <motion.div
                id="history-panel"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-4">
                  {details.history.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.changed_at).toLocaleString()}
                        </p>
                        <p>
                          Status zmieniony z "{entry.previous_status}" na "{entry.new_status}"
                        </p>
                        {entry.comment && (
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsView