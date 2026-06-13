import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../../features/auth/hooks/useAuth.js';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown.jsx';

const ChatIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

const NAV_BY_ROLE = {
  student: [
    { label: 'Dashboard', href: '/dashboard', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={4} y={4} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={4} width={7} height={5} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={11} width={7} height={9} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={4} y={13} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /></svg> },
    { label: 'Assignments', href: '/assignments', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={5} y={5} width={14} height={16} rx={2} stroke="currentColor" strokeWidth={1.8} /><path d="M9 5V3.8A.8.8 0 0 1 9.8 3h4.4a.8.8 0 0 1 .8.8V5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /><path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /></svg> },
    { label: 'Progress', href: '/progress', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M5 5v14h14" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><path d="M8 14l3-3 2 2 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { label: 'Messages', href: '/messages', icon: <ChatIcon /> },
    { label: 'Wishlist', href: '/wishlist', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ],
  instructor: [
    { label: 'Dashboard', href: '/instructor/dashboard', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={4} y={4} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={4} width={7} height={5} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={11} width={7} height={9} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={4} y={13} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /></svg> },
    { label: 'My Courses', href: '/instructor/courses', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg> },
    { label: 'Create Course', href: '/instructor/courses/create', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={4} y={4} width={16} height={16} rx={3} stroke="currentColor" strokeWidth={1.8} /><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /></svg> },
    { label: 'Submissions', href: '/instructor/submissions', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 13.5 6.5 6h11L20 13.5M4 13.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5M4 13.5h4l1.5 2.5h5L16 13.5h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { label: 'Messages', href: '/instructor/messages', icon: <ChatIcon /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x={4} y={4} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={4} width={7} height={5} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={13} y={11} width={7} height={9} rx={1.5} stroke="currentColor" strokeWidth={1.8} /><rect x={4} y={13} width={7} height={7} rx={1.5} stroke="currentColor" strokeWidth={1.8} /></svg> },
    { label: 'Users', href: '/admin/users', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={9} cy={8} r={3.2} stroke="currentColor" strokeWidth={1.8} /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" /></svg> },
    { label: 'Courses', href: '/admin/courses', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg> },
    { label: 'Categories', href: '/admin/categories', icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 4h7l9 9-7 7-9-9V4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /><circle cx={8.5} cy={8.5} r={1.3} fill="currentColor" /></svg> },
    { label: 'Messages', href: '/admin/messages', icon: <ChatIcon /> },
  ],
};

const ROLE_STYLES = {
  student: 'bg-sky-100 text-sky-700',
  instructor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const SidebarContent = ({ user, navItems, onLogout, onNavigate }) => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 4 2 9l10 5 10-5-10-5Z" fill="currentColor" />
            <path d="M6 11.5V16c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5v-4.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="flex-1 text-lg font-bold tracking-tight text-gray-900">LearnHub</span>
        <NotificationDropdown />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => onNavigate?.()}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {getInitials(user?.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 8l-4 4 4 4M6 12h11" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.student;

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 4 2 9l10 5 10-5-10-5Z" fill="currentColor" />
              <path d="M6 11.5V16c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5v-4.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-gray-900">LearnHub</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-100 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent user={user} navItems={navItems} onLogout={handleLogout} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 top-14 flex w-72 max-w-[80%] flex-col shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            </button>
            <SidebarContent user={user} navItems={navItems} onLogout={handleLogout} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;