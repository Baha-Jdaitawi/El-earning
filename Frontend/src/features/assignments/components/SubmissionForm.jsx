const ChatIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const SubmissionForm = ({ submission }) => {
  const graded = submission.grade !== null && submission.grade !== undefined;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{submission.assignment_title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <BookIcon /> {submission.course_title}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircleIcon /> Submitted {formatDate(submission.submitted_at)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {graded ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {submission.grade}/{submission.max_points} pts
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pending
            </span>
          )}
        </div>
      </div>

      {submission.feedback && (
        <div className="mt-4 flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3.5">
          <span className="flex-shrink-0 text-indigo-500"><ChatIcon /></span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Instructor Feedback</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{submission.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;