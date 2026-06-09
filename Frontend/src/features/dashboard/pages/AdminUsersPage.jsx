import { useEffect, useState } from 'react';
import { getUsersApi } from '../api/dashboardApi.js';
import api from '../../../lib/axios.js';
import UserTableRow, { RoleBadge, UserAvatar } from '../components/UserTableRow.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';

const SearchIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle cx={11} cy={11} r={7} stroke="currentColor" strokeWidth={1.8} />
    <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const ChevronDown = () => (
  <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TableSkeleton = () => (
  <div className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-gray-200" />
          <div className="h-2.5 w-48 rounded bg-gray-100" />
        </div>
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-7 w-20 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const limit = 10;

  useEffect(() => {
    loadUsers();
  }, [search, role, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ page, limit, role: role || undefined, search: search || undefined });
      setUsers(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${pendingDelete}`);
      setPendingDelete(null);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async (id) => {
    try {
      await api.patch(`/users/${id}/promote`);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemote = async (id) => {
    try {
      await api.patch(`/users/${id}/demote`);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pendingUser = users.find((u) => u.id === pendingDelete);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">Search, filter, and manage every account on LearnHub.</p>
        </header>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="relative sm:w-48">
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <TableSkeleton />
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <h2 className="text-base font-semibold text-gray-900">No users found</h2>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Joined</th>
                      <th className="px-5 py-3">Last Login</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        onDelete={(id) => setPendingDelete(id)}
                        onPromote={handlePromote}
                        onDemote={handleDemote}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {users.map((user) => (
                  <li key={user.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      <span>Last login {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role === 'student' && (
                        <button onClick={() => handlePromote(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                          Promote
                        </button>
                      )}
                      {user.role === 'instructor' && (
                        <button onClick={() => handleDemote(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                          Demote
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button onClick={() => setPendingDelete(user.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{from}</span>–
                  <span className="font-medium text-gray-700">{to}</span> of{' '}
                  <span className="font-medium text-gray-700">{total}</span> users
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${i + 1 === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={pendingUser ? `Are you sure you want to delete ${pendingUser.name}? This cannot be undone.` : ''}
      />

    </div>
  );
};

export default AdminUsersPage;