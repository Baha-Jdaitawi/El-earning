import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
};

const ROLE_BADGE = {
  instructor: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-rose-100 text-rose-700',
};

const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatMessage = ({ message, isOwn, showDate, showAvatar, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleAvatarClick = () => {
    if (isOwn) return;
    const base = user?.role === 'instructor' || user?.role === 'admin'
      ? '/instructor/messages'
      : '/messages';
    navigate(`${base}/${message.sender_id}`);
  };

  return (
    <div className="flex flex-col gap-1">
      {showDate && (
        <div className="flex items-center justify-center my-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
            {formatDate(message.created_at)}
          </span>
        </div>
      )}

      <div className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 w-8">
          {showAvatar && !isOwn && (
            <button onClick={handleAvatarClick} className="group/avatar relative" title={`Message ${message.sender_name}`}>
              {message.sender_avatar ? (
                <img src={message.sender_avatar} alt={message.sender_name} className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover/avatar:ring-indigo-400 transition-all" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 ring-2 ring-transparent group-hover/avatar:ring-indigo-400 transition-all">
                  {getInitials(message.sender_name)}
                </span>
              )}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-xs text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none">
                DM
              </span>
            </button>
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwn && (
            <div className="flex items-center gap-1.5 px-1">
              <button
                onClick={handleAvatarClick}
                className="text-xs font-medium text-gray-700 hover:text-indigo-600 hover:underline"
              >
                {message.sender_name}
              </button>
              {ROLE_BADGE[message.sender_role] && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${ROLE_BADGE[message.sender_role]}`}>
                  {message.sender_role}
                </span>
              )}
            </div>
          )}
          <div className="flex items-end gap-1.5">
            {isOwn && onDelete && (
              <button
                onClick={onDelete}
                className="mb-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose-500"
              >
                <TrashIcon />
              </button>
            )}
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isOwn
                ? 'rounded-br-sm bg-indigo-600 text-white'
                : 'rounded-bl-sm bg-white border border-gray-100 text-gray-900 shadow-sm'
            }`}>
              {message.content}
            </div>
            {!isOwn && onDelete && (
              <button
                onClick={onDelete}
                className="mb-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose-500"
              >
                <TrashIcon />
              </button>
            )}
          </div>
          <span className="px-1 text-xs text-gray-400">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;