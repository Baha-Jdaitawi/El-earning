import { useAssignmentFeedback } from '../hooks/useAI.js';

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

const gradeColor = (grade) => {
  if (grade >= 90) return 'text-emerald-600 bg-emerald-50';
  if (grade >= 70) return 'text-indigo-600 bg-indigo-50';
  if (grade >= 50) return 'text-amber-600 bg-amber-50';
  return 'text-rose-600 bg-rose-50';
};

const AIFeedback = ({ submission, assignment, onApplyGrade }) => {
  const { loading, error, feedback, getFeedback, clearFeedback } = useAssignmentFeedback();

  const handleGetFeedback = async () => {
    await getFeedback({
      submission_content: submission.content,
      assignment_title: assignment.title,
      assignment_description: assignment.description,
      max_points: assignment.max_points,
    });
  };

  if (feedback) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <h3 className="text-sm font-semibold text-gray-900">AI Feedback</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-3 py-1 text-sm font-bold ${gradeColor(feedback.suggested_grade)}`}>
              Suggested: {feedback.suggested_grade}/{assignment.max_points || 100}
            </span>
            <button
              onClick={() => onApplyGrade(feedback.suggested_grade)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              Apply Grade
            </button>
            <button
              onClick={clearFeedback}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-700">{feedback.summary}</p>

        {feedback.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">Strengths</p>
            <ul className="flex flex-col gap-1">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">Areas to Improve</p>
            <ul className="flex flex-col gap-1">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-amber-500">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.detailed_feedback && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Detailed Feedback</p>
            <p className="text-sm leading-relaxed text-gray-700">{feedback.detailed_feedback}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <SparkleIcon />
        <span className="text-sm font-medium text-indigo-700">Get AI feedback on this submission</span>
      </div>
      <button
        onClick={handleGetFeedback}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
      >
        {loading ? <><Spinner /> Analyzing...</> : <><SparkleIcon /> Analyze</>}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default AIFeedback;