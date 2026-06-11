import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useDirectChat } from '../hooks/useChat.js';
import { getContactsApi } from '../api/chatApi.js';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const DirectChatPage = () => {
  const { userId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { messages, loading, sendMessage, bottomRef } = useDirectChat(userId);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    getContactsApi()
      .then((res) => {
        const contacts = res.data.data || [];
        const found = contacts.find((c) => String(c.contact_id) === String(userId));
        if (found) setContact(found);
      })
      .catch(() => {});
  }, [userId]);

  const shouldShowDate = (index) => {
    if (index === 0) return true;
    const prev = new Date(messages[index - 1].created_at).toDateString();
    const curr = new Date(messages[index].created_at).toDateString();
    return prev !== curr;
  };

  const shouldShowAvatar = (index) => {
    if (index === 0) return true;
    return messages[index - 1].sender_id !== messages[index].sender_id;
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          {contact?.contact_avatar ? (
            <img src={contact.contact_avatar} alt={contact.contact_name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {getInitials(contact?.contact_name || 'User')}
            </span>
          )}
          <div>
            <h1 className="text-base font-semibold text-gray-900">{contact?.contact_name || 'Direct Message'}</h1>
            <p className="text-xs text-gray-500 capitalize">{contact?.contact_role || ''}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-base font-semibold text-gray-900">No messages yet</p>
            <p className="mt-1 text-sm text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                showDate={shouldShowDate(index)}
                showAvatar={shouldShowAvatar(index)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} placeholder="Send a message..." />
    </div>
  );
};

export default DirectChatPage;