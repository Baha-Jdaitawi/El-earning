import { useState, useEffect } from 'react';
import {
  getAnnouncementsService,
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
} from '../services/announcementService.js';

const useAnnouncements = (course_id) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course_id) return;
    loadAnnouncements();
  }, [course_id]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncementsService(course_id);
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createAnnouncement = async (data) => {
    const announcement = await createAnnouncementService({ ...data, course_id: parseInt(course_id) });
    setAnnouncements((prev) => [announcement, ...prev]);
    return announcement;
  };

  const updateAnnouncement = async (id, data) => {
    const updated = await updateAnnouncementService(id, data);
    setAnnouncements((prev) => prev.map((a) => a.id === id ? updated : a));
    return updated;
  };

  const deleteAnnouncement = async (id) => {
    await deleteAnnouncementService(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return { announcements, loading, createAnnouncement, updateAnnouncement, deleteAnnouncement, reload: loadAnnouncements };
};

export default useAnnouncements;