import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCourses,
  fetchCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  clearError,
  clearCourse,
} from '../../../store/slices/coursesSlice.js';

const useCourses = () => {
  const dispatch = useDispatch();
  const { courses, course, meta, loading, error } = useSelector((state) => state.courses);

  return {
    courses,
    course,
    meta,
    loading,
    error,
    fetchCourses: (params) => dispatch(fetchCourses(params)),
    fetchCourse: (id) => dispatch(fetchCourse(id)),
    createCourse: (data) => dispatch(createCourse(data)),
    updateCourse: (id, data) => dispatch(updateCourse({ id, data })),
    deleteCourse: (id) => dispatch(deleteCourse(id)),
    clearError: () => dispatch(clearError()),
    clearCourse: () => dispatch(clearCourse()),
  };
};

export default useCourses;