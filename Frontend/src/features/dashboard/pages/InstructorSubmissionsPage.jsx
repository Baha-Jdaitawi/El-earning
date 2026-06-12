import { useEffect, useState } from 'react';
import { getPendingSubmissionsApi, getGradedSubmissionsApi, gradeSubmissionApi } from '../../assignments/api/assignmentsApi.js';
import AIFeedback from '../../ai/components/AIFeedback.jsx';
import Button from '../../../shared/components/Button.jsx';

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const Avatar = ({ name, avatar }) => {
  if (avatar) return <img src={avatar} alt={name} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />;
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
      {getInitials(name)}
    </span>
  );
};

const LateBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
    Late
  </span>
);

const gradeColor = (grade) => {
  if (grade >= 90) return 'bg-emerald-100 text-emerald-700';
  if (grade >= 70) return 'bg-indigo-100 text-indigo-700';
  if (grade >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

const inputClasses = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

const GradingForm = ({ submissionId, grading, onSubmit, onCancel, initialGrade = '' }) => {
  const [grade, setGrade] = useState(initialGrade);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (initialGrade !== '') setGrade(String(initialGrade));
  }, [initialGrade]);

  const gradeNum = parseInt(grade, 10);
  const isValid = grade !== '' && !isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || grading) return;
    onSubmit({ grade: gradeNum, feedback: feedback.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Grade (0–100)</label>
        <input
          type="number"
          min={0}
          max={100}
          required
          autoFocus
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="e.g. 85"
          className={`${inputClasses} sm:max-w-[160px]`}
        />
        {grade !== '' && !isValid && <span className="text-xs text-rose-600">Enter a number between 0 and 100.</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Feedback</label>
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share feedback to help the student improve..."
          className={`${inputClasses} resize-y leading-relaxed`}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={grading} disabled={!isValid}>Submit Grade</Button>
      </div>
    </form>
  );
};

const PendingCard = ({ submission, grading, isExpanded, onToggle, onGrade }) => {
  const [appliedGrade, setAppliedGrade] = useState('');

  return (
    <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <Avatar name={submission.student_name} avatar={submission.student_avatar} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{submission.assignment_title}</h3>
              {submission.is_late && <LateBadge />}
            </div>
            <p className="mt-0.5 text-sm text-gray-600">{submission.student_name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>{submission.course_title}</span>
              <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {!isExpanded && (
          <Button size="sm" onClick={onToggle}>Grade</Button>
        )}
      </div>

      {/* Submission content */}
      {submission.content && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Student Submission</p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{submission.content}</p>
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 flex flex-col gap-4">
          <AIFeedback
            submission={submission}
            assignment={{
              title: submission.assignment_title,
              description: submission.assignment_description,
              max_points: submission.max_points || 100,
            }}
            onApplyGrade={(grade) => setAppliedGrade(grade)}
          />
          <GradingForm
            submissionId={submission.id}
            grading={grading}
            onSubmit={onGrade}
            onCancel={onToggle}
            initialGrade={appliedGrade}
          />
        </div>
      )}
    </li>
  );
};

const GradedCard = ({ submission }) => (
  <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 gap-3">
        <Avatar name={submission.student_name} avatar={submission.student_avatar} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{submission.assignment_title}</h3>
            {submission.is_late && <LateBadge />}
          </div>
          <p className="mt-0.5 text-sm text-gray-600">{submission.student_name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>{submission.course_title}</span>
            <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <span className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-base font-bold ${gradeColor(submission.grade)}`}>
        {submission.grade}<span className="text-xs font-medium">/100</span>
      </span>
    </div>

    {submission.content && (
      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Student Submission</p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{submission.content}</p>
      </div>
    )}

    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500">Feedback</p>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
        {submission.feedback || <span className="italic text-gray-400">No feedback provided.</span>}
      </p>
      {submission.graded_at && (
        <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
          Graded {new Date(submission.graded_at).toLocaleDateString()}
        </p>
      )}
    </div>
  </li>
);

const CardSkeleton = () => (
  <li className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-1 gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-48 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-100" />
          <div className="h-2.5 w-56 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-9 w-20 rounded-lg bg-gray-200" />
    </div>
  </li>
);

const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
    <h2 className="mt-4 text-base font-semibold text-gray-900">
      {tab === 'pending' ? "No pending submissions" : "No graded submissions"}
    </h2>
    <p className="mt-1 max-w-sm text-sm text-gray-500">
      {tab === 'pending'
        ? "You're all caught up. New submissions will appear here."
        : "Once you grade a submission, it will show up here."}
    </p>
  </div>
);

const InstructorSubmissionsPage = () => {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [graded, setGraded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const [pendingRes, gradedRes] = await Promise.all([
        getPendingSubmissionsApi(),
        getGradedSubmissionsApi(),
      ]);
      setPending(pendingRes.data.data || []);
      setGraded(gradedRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGrade = async (id, data) => {
    setGrading(true);
    try {
      await gradeSubmissionApi(id, data);
      setExpandedId(null);
      loadSubmissions();
    } catch (err) {
      console.error(err);
    }
    setGrading(false);
  };

  const tabs = [
    { value: 'pending', label: 'Pending', count: pending.length },
    { value: 'graded', label: 'Graded', count: graded.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">Review and grade assignment submissions from your students.</p>
        </header>

        <div className="mb-6 flex gap-1 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setExpandedId(null); }}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tab === t.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <ul className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </ul>
        ) : tab === 'pending' ? (
          pending.length === 0 ? <EmptyState tab="pending" /> : (
            <ul className="flex flex-col gap-4">
              {pending.map((s) => (
                <PendingCard
                  key={s.id}
                  submission={s}
                  grading={grading}
                  isExpanded={expandedId === s.id}
                  onToggle={() => setExpandedId((prev) => prev === s.id ? null : s.id)}
                  onGrade={(data) => handleGrade(s.id, data)}
                />
              ))}
            </ul>
          )
        ) : (
          graded.length === 0 ? <EmptyState tab="graded" /> : (
            <ul className="flex flex-col gap-4">
              {graded.map((s) => <GradedCard key={s.id} submission={s} />)}
            </ul>
          )
        )}

      </div>
    </div>
  );
};

export default InstructorSubmissionsPage;