const ROLE_STYLES = {
  student: 'bg-sky-100 text-sky-700',
  instructor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const ArrowUpIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[role] || 'bg-gray-100 text-gray-700'}`}>
    {role}
  </span>
);

export const UserAvatar = ({ user }) => {
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
      {getInitials(user.name)}
    </span>
  );
};

const UserTableRow = ({ user, onDelete, onPromote, onDemote }) => {
  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
      <td className="px-5 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
      <td className="px-5 py-4 text-sm text-gray-500">
        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {user.role === 'student' && (
            <button onClick={() => onPromote(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
              <ArrowUpIcon /> Promote
            </button>
          )}
          {user.role === 'instructor' && (
            <button onClick={() => onDemote(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <ArrowDownIcon /> Demote
            </button>
          )}
          {user.role !== 'admin' && (
            <button onClick={() => onDelete(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <TrashIcon /> Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;