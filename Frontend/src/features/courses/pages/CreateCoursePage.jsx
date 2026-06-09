import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../../../store/slices/coursesSlice.js';
import { getCategoriesApi } from '../../dashboard/api/dashboardApi.js';
import CourseForm from '../components/CourseForm.jsx';

const CreateCoursePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.courses);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoriesApi().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    const result = await dispatch(createCourse(data));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/instructor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Create New Course</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in the details to add a new course.</p>
        </header>
        <CourseForm
          categories={categories}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default CreateCoursePage;