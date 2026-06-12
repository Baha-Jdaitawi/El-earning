import {
  getAnnouncementsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
} from '../api/announcementsApi.js';

export const getAnnouncementsService = async (course_id) => {
  const res = await getAnnouncementsApi(course_id);
  return res.data.data;
};

export const createAnnouncementService = async (data) => {
  const res = await createAnnouncementApi(data);
  return res.data.data;
};

export const updateAnnouncementService = async (id, data) => {
  const res = await updateAnnouncementApi(id, data);
  return res.data.data;
};

export const deleteAnnouncementService = async (id) => {
  await deleteAnnouncementApi(id);
};