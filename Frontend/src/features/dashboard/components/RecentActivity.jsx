const CheckCircleIcon = ({ className }) => (
  <svg className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <p className="p-8 text-center text-sm text-gray-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {activities.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-4">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{item.lesson_title}</p>
              <p className="truncate text-xs text-gray-500">{item.course_title}</p>
            </div>
            <span className="flex-shrink-0 text-xs text-gray-400">
              {new Date(item.completed_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;