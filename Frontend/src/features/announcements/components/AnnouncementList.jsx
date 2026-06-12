import { useState } from 'react';
import { useSelector } from 'react-redux';

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="m14 8 2.8 2.8" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const AnnouncementCard = ({ announcement, onEdit, onDelete, canManage }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = announcement.content.length > 200;

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {announcement.instructor_avatar ? (
            <img src={announcement.instructor_avatar} alt={announcement.instructor_name} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-amber-800">
              {getInitials(announcement.instructor_name)}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
            <p className="text-xs text-gray-500">{announcement.instructor_name} · {formatDate(announcement.created_at)}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(announcement)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-amber-100 hover:text-gray-700"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete(announcement.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-rose-100 hover:text-rose-600"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {isLong && !expanded
            ? `${announcement.content.substring(0, 200)}...`
            : announcement.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-xs font-medium text-amber-700 hover:text-amber-800"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
};

const AnnouncementList = ({ announcements, loading, onEdit, onDelete, canManage }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 rounded bg-amber-200" />
                <div className="h-2.5 w-24 rounded bg-amber-100" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-amber-100" />
              <div className="h-3 w-3/4 rounded bg-amber-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;