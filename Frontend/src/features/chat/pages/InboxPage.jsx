import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContactsApi } from '../api/chatApi.js';

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ROLE_BADGE = {
  instructor: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-rose-100 text-rose-700',
  student: 'bg-emerald-100 text-emerald-700',
};

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const InboxPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContactsApi()
      .then((res) => setContacts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">Your direct message conversations.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-900">No messages yet</p>
            <p className="mt-1 text-sm text-gray-500">Start a conversation from a course chat.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <li key={contact.contact_id}>
                  <button
                    onClick={() => navigate(`/messages/${contact.contact_id}`)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      {contact.contact_avatar ? (
                        <img src={contact.contact_avatar} alt={contact.contact_name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {getInitials(contact.contact_name)}
                        </span>
                      )}
                      {parseInt(contact.unread_count) > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-gray-900 ${parseInt(contact.unread_count) > 0 ? 'font-semibold' : ''}`}>
                            {contact.contact_name}
                          </p>
                          <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${ROLE_BADGE[contact.contact_role] || 'bg-gray-100 text-gray-600'}`}>
                            {contact.contact_role}
                          </span>
                        </div>
                        <span className="flex-shrink-0 text-xs text-gray-400">
                          {formatTime(contact.last_message_at)}
                        </span>
                      </div>
                      {contact.last_message && (
                        <p className={`mt-0.5 truncate text-sm ${parseInt(contact.unread_count) > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                          {contact.last_message}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;