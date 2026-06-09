import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../../store/slices/authSlice.js';
import { updateProfileService, changePasswordService } from '../services/authService.js';
import { getLearningStatsApi } from '../../progress/api/progressApi.js';
import Button from '../../../shared/components/Button.jsx';

const ROLE_STYLES = {
  student: 'bg-sky-100 text-sky-700',
  instructor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const inputClasses = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

const EyeIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M4 4l16 16M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-2.6 3.3M6.2 7.7A16 16 0 0 0 2.5 12S6 19 12 19a9 9 0 0 0 3.4-.7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const StatCard = ({ label, value, accent, icon }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="text-xs leading-tight text-gray-500">{label}</p>
    </div>
  </div>
);

const StatusAlert = ({ status }) => {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${isError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
      <span>{status.message}</span>
    </div>
  );
};

const PasswordInput = ({ id, label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClasses} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds) return '0h';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  useEffect(() => {
    if (user?.role === 'student') {
      getLearningStatsApi().then((res) => setStats(res.data.data)).catch(() => {});
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      await updateProfileService({ name, email });
      dispatch(getMe());
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      await changePasswordService({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password.' });
    }
    setPasswordLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-20 w-20 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white">
                {getInitials(user?.name)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{user?.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
              <div className="mt-2 flex flex-col items-center gap-x-4 gap-y-1 text-sm text-gray-500 sm:flex-row">
                <span>{user?.email}</span>
                <span>Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        {stats && user?.role === 'student' && (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Enrolled" value={stats.total_enrolled || 0} accent="bg-indigo-50 text-indigo-600" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" /></svg>} />
            <StatCard label="Completed" value={stats.total_completed || 0} accent="bg-emerald-50 text-emerald-600" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>} />
            <StatCard label="Lessons Done" value={stats.lessons_completed || 0} accent="bg-sky-50 text-sky-600" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" /></svg>} />
            <StatCard label="Time Spent" value={formatTime(stats.total_time_spent)} accent="bg-amber-50 text-amber-600" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          </div>
        )}

        {/* Edit Profile */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <p className="mt-0.5 text-sm text-gray-500">Update your account's name and email address.</p>
          <form onSubmit={handleProfileSubmit} className="mt-5 flex flex-col gap-4">
            <StatusAlert status={profileStatus} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={profileLoading}>Save Changes</Button>
            </div>
          </form>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="mt-0.5 text-sm text-gray-500">Choose a strong password you don't use elsewhere.</p>
          <form onSubmit={handlePasswordSubmit} className="mt-5 flex flex-col gap-4">
            <StatusAlert status={passwordStatus} />
            <PasswordInput id="currentPassword" label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordInput id="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} />
            <PasswordInput id="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
            <div className="flex justify-end">
              <Button type="submit" loading={passwordLoading}>Update Password</Button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
};

export default ProfilePage;