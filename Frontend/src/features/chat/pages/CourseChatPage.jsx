import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useCourseChat } from '../hooks/useChat.js';
import { getSocket } from '../../../lib/socket.js';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CourseChatPage = () => {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { messages, setMessages, loading, sendMessage, bottomRef } = useCourseChat(courseId);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSend = (content) => {
    sendMessage(content);
  };

  const handleDeleteMessage = (messageId) => {
    const socket = getSocket();
    socket?.emit('delete_message', { message_id: messageId, course_id: parseInt(courseId) });
  };

  const handleClearChat = () => {
    const socket = getSocket();
    socket?.emit('clear_course_chat', parseInt(courseId));
    setConfirmClear(false);
  };

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

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Course Chat</h1>
            <p className="text-sm text-gray-500">Chat with your instructor and fellow students</p>
          </div>
          {isInstructor && !confirmClear && (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <TrashIcon /> Clear Chat
            </button>
          )}
          {isInstructor && confirmClear && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Clear all messages?</span>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              >
                Yes, clear
              </button>
            </div>
          )}
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
            <p className="mt-1 text-sm text-gray-500">Be the first to start the conversation!</p>
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
                onDelete={
                  message.sender_id === user?.id || isInstructor
                    ? () => handleDeleteMessage(message.id)
                    : null
                }
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} placeholder="Send a message to the course..." />
    </div>
  );
};

export default CourseChatPage;