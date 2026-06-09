import api from '../../../lib/axios.js';

export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const logoutApi = () => api.post('/auth/logout');
export const getMeApi = () => api.get('/auth/me');
export const updateProfileApi = (data) => api.put('/auth/me', data);
export const changePasswordApi = (data) => api.put('/auth/me/password', data);