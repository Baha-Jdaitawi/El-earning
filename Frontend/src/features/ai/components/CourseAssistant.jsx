import { useState, useRef, useEffect } from 'react';
import { useCourseAssistant } from '../hooks/useAI.js';

const SparkleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const SendIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const CourseAssistant = ({ courseTitle, lessonContent }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { loading, error, messages, askQuestion, clearMessages } = useCourseAssistant();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    await askQuestion({ question, course_title: courseTitle, lesson_content: lessonContent });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
      >
        <SparkleIcon />
        AI Course Assistant
        <svg className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Messages */}
          <div className="flex flex-col gap-3 p-4 max-h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
                  <SparkleIcon />
                </span>
                <p className="text-sm font-medium text-gray-900">Ask me anything about this lesson</p>
                <p className="mt-1 text-xs text-gray-500">I'll help you understand the content better.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  <Spinner /> Thinking...
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-rose-600 text-center">{error}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex items-end gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="flex-shrink-0 rounded-lg border border-gray-200 px-2.5 py-2 text-xs text-gray-500 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this lesson..."
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssistant;