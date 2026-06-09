import { useDispatch, useSelector } from 'react-redux';
import { login, register, logout, getMe, clearError } from '../../../store/slices/authSlice.js';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (data) => {
    const result = await dispatch(login(data));
    if (result.meta.requestStatus === 'fulfilled') {
      if (result.payload.role === 'admin') navigate('/admin/dashboard');
      else if (result.payload.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/dashboard');
    }
  };

  const handleRegister = async (data) => {
    const result = await dispatch(register(data));
    if (result.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const fetchMe = () => dispatch(getMe());

  return {
    user,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchMe,
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;