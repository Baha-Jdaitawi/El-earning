import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AssignmentCard from '../components/AssignmentCard.jsx';
import SubmissionForm from '../components/SubmissionForm.jsx';
import { getUpcomingAssignmentsService, getMySubmissionsService, submitAssignmentService } from '../services/assignmentService.js';

const CheckCircleIcon = () => (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InboxIcon = () => (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
    <path d="M4 13.5 6.5 6h11L20 13.5M4 13.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5M4 13.5h4l1.5 2.5h5L16 13.5h4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyState = ({ Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <Icon />
    </span>
    <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
  </div>
);

const AssignmentsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUpcomingAssignmentsService(10).then(setUpcoming).catch(() => {});
    getMySubmissionsService().then(setSubmitted).catch(() => {});
  }, []);

  const handleSubmit = async (assignment_id, content) => {
    setSubmitting(true);
    try {
      await submitAssignmentService({ assignment_id: parseInt(assignment_id), content });
      setUpcoming((prev) => prev.filter((a) => a.id !== parseInt(assignment_id)));
      const updated = await getMySubmissionsService();
      setSubmitted(updated);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'submitted', label: 'Submitted', count: submitted.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">Track what's due and review your graded work.</p>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t.label}
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {tab === 'upcoming' ? (
          upcoming.length > 0 ? (
            <div className="flex flex-col gap-4">
              {upcoming.map((a) => (
                <AssignmentCard key={a.id} assignment={a} submitting={submitting} onSubmit={handleSubmit} />
              ))}
            </div>
          ) : (
            <EmptyState Icon={CheckCircleIcon} title="You're all caught up" message="There are no upcoming assignments due. Check back later for new work." />
          )
        ) : (
          submitted.length > 0 ? (
            <div className="flex flex-col gap-4">
              {submitted.map((s) => (
                <SubmissionForm key={s.id} submission={s} />
              ))}
            </div>
          ) : (
            <EmptyState Icon={InboxIcon} title="Nothing submitted yet" message="Once you submit an assignment, it will appear here with its grade and feedback." />
          )
        )}

      </div>
    </div>
  );
};

export default AssignmentsPage;