import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../../features/auth/hooks/useAuth.js';

const NAV_LINKS = [
  
  { label: 'Courses', href: '/courses' },
  { label: 'Dashboard', href: '/dashboard' },
];

const ROLE_STYLES = {
  student: 'bg-sky-100 text-sky-700',
  instructor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

const getInitials = (name) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const Avatar = ({ user, className }) => {
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <span className={`flex items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white ${className}`}>
      {getInitials(user.name)}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[role]}`}>
    {role}
  </span>
);

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-gray-900">
          <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <path d="M12 3 2 8l10 5 10-5-10-5Z" fill="currentColor" opacity={0.9} />
            <path d="M6 11v4.5c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5V11" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-bold tracking-tight">LearnHub</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-50"
              >
                <Avatar user={user} className="h-8 w-8" />
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <svg className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{user.name}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Login
              </Link>
              <Link to="/register" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-50 md:hidden"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              {mobileOpen ? (
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-1 py-2">
                  <Avatar user={user} className="h-10 w-10" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{user.name}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="rounded-md px-4 py-2 text-center text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;