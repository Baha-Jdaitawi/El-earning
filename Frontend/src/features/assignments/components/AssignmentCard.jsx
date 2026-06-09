import { useState } from 'react';
import Button from '../../../shared/components/Button.jsx';
import Spinner from '../../../shared/components/Spinner.jsx';

const CalendarIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect x={4} y={5} width={16} height={16} rx={2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const PointsIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="m12 3 2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.5 9.1l5.9-.8L12 3Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const BookIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const LessonIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" />
  </svg>
);

const getDueStatus = (dueDate) => {
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return 'normal';
  const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 3) return 'soon';
  return 'normal';
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AssignmentCard = ({ assignment, submitting, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const dueStatus = getDueStatus(assignment.due_date);
  const dueColor = dueStatus !== 'normal' ? 'text-rose-600' : 'text-gray-500';
  const dueLabel = dueStatus === 'overdue' ? 'Overdue ' : dueStatus === 'soon' ? 'Due soon ' : 'Due ';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    onSubmit?.(assignment.id, content);
    setContent('');
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <BookIcon /> {assignment.course_title}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <LessonIcon /> {assignment.lesson_title}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {assignment.due_date && (
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${dueColor}`}>
                <CalendarIcon /> {dueLabel}{formatDate(assignment.due_date)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <PointsIcon /> {assignment.max_points} pts
            </span>
          </div>
        </div>
        <Button onClick={() => setOpen((o) => !o)} size="sm">
          {open ? 'Cancel' : 'Submit'}
        </Button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-4">
          <label className="text-sm font-medium text-gray-700">Your submission</label>
          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or paste your assignment submission here..."
            className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="mt-3 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} size="sm">Cancel</Button>
            <Button type="submit" loading={submitting} disabled={!content.trim()} size="sm">
              Submit Assignment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignmentCard;