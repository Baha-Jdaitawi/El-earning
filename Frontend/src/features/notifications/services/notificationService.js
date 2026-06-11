import {
  getNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from '../api/notificationsApi.js';

export const getNotificationsService = async () => {
  const res = await getNotificationsApi();
  return res.data.data;
};

export const getUnreadCountService = async () => {
  const res = await getUnreadCountApi();
  return res.data.data.count;
};

export const markAsReadService = async (id) => {
  await markAsReadApi(id);
};

export const markAllAsReadService = async () => {
  await markAllAsReadApi();
};

export const deleteNotificationService = async (id) => {
  await deleteNotificationApi(id);
};