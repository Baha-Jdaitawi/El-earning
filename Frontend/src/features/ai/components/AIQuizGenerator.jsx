import { useState } from 'react';
import { useQuizGenerator } from '../hooks/useAI.js';

const SparkleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const AIQuizGenerator = ({ onSaveQuiz, lessonLevel = 'beginner' }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [level, setLevel] = useState(lessonLevel);
  const [open, setOpen] = useState(false);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const { loading, error, generatedQuizzes, generateQuiz, clearQuizzes } = useQuizGenerator();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const quizzes = await generateQuiz({ topic, count, level });
    if (quizzes) {
      setSelectedQuizzes(quizzes.map((_, i) => i));
    }
  };

  const handleToggleSelect = (index) => {
    setSelectedQuizzes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSaveSelected = () => {
    const toSave = generatedQuizzes.filter((_, i) => selectedQuizzes.includes(i));
    toSave.forEach((quiz) => onSaveQuiz({
      question: quiz.question,
      answer: quiz.answer,
      options: quiz.options,
      quiz_type: 'multiple_choice',
      points: quiz.points || 10,
    }));
    clearQuizzes();
    setTopic('');
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-sm font-medium text-indigo-700"
      >
        <SparkleIcon />
        AI Quiz Generator
        <svg className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Python loops, CSS flexbox, React hooks..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              >
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? <><Spinner /> Generating...</> : <><SparkleIcon /> Generate Questions</>}
          </button>

          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}

          {generatedQuizzes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Select questions to add ({selectedQuizzes.length}/{generatedQuizzes.length})
                </p>
                <button
                  onClick={() => setSelectedQuizzes(
                    selectedQuizzes.length === generatedQuizzes.length
                      ? []
                      : generatedQuizzes.map((_, i) => i)
                  )}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {selectedQuizzes.length === generatedQuizzes.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              {generatedQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  onClick={() => handleToggleSelect(index)}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedQuizzes.includes(index)
                      ? 'border-indigo-300 bg-white'
                      : 'border-gray-200 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedQuizzes.includes(index)}
                      onChange={() => handleToggleSelect(index)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{quiz.question}</p>
                      <p className="mt-1 text-xs text-emerald-600">✓ {quiz.answer}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {quiz.options?.filter((o) => o !== quiz.answer).map((opt, i) => (
                          <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{opt}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveSelected}
                disabled={selectedQuizzes.length === 0}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                Add {selectedQuizzes.length} Question{selectedQuizzes.length !== 1 ? 's' : ''} to Lesson
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;