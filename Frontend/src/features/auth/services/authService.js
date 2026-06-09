import { registerApi, loginApi, logoutApi, getMeApi, updateProfileApi, changePasswordApi } from '../api/authApi.js';

export const registerService = async (data) => {
  const res = await registerApi(data);
  return res.data.data;
};

export const loginService = async (data) => {
  const res = await loginApi(data);
  return res.data.data;
};

export const logoutService = async () => {
  await logoutApi();
};

export const getMeService = async () => {
  const res = await getMeApi();
  return res.data.data;
};

export const updateProfileService = async (data) => {
  const res = await updateProfileApi(data);
  return res.data.data;
};

export const changePasswordService = async (data) => {
  const res = await changePasswordApi(data);
  return res.data;
};