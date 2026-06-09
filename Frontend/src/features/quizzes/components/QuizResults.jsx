import Button from '../../../shared/components/Button.jsx';

const QuizResults = ({ result, onRetake }) => {
  const percentage = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const passed = percentage >= 60;

  return (
    <div className="flex flex-col gap-4">
      {/* Score card */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">Your Score</p>
        <p className={`mt-1 text-4xl font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
          {percentage}%
        </p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          {result.score} / {result.total} points
        </p>
        <p className={`mt-2 text-sm ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
          {passed ? '🎉 Great work! You passed.' : 'Keep practicing and try again.'}
        </p>
      </div>

      {/* Question breakdown */}
      <div className="flex flex-col gap-2">
        {result.results.map((r, i) => (
          <div
            key={r.quizId}
            className={`rounded-lg border px-4 py-3 text-sm ${
              r.isCorrect
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-rose-200 bg-rose-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`font-medium ${r.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                {i + 1}. {r.question}
              </p>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                r.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {r.isCorrect ? '+' + r.maxPoints : '0'} pts
              </span>
            </div>
            {!r.isCorrect && (
              <p className="mt-1 text-xs text-rose-600">
                Correct answer: <span className="font-medium">{r.correctAnswer}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={onRetake} className="w-full">
        Retake Quiz
      </Button>
    </div>
  );
};

export default QuizResults;