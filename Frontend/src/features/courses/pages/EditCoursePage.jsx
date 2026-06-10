import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourse, updateCourse, deleteCourse } from '../../../store/slices/coursesSlice.js';
import { getCategoriesApi } from '../../dashboard/api/dashboardApi.js';
import CourseForm from '../components/CourseForm.jsx';
import Button from '../../../shared/components/Button.jsx';

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditCoursePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { course, loading, error } = useSelector((state) => state.courses);
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchCourse(parseInt(id)));
    getCategoriesApi().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, [id]);

const handleSubmit = async (data) => {
  const result = await dispatch(updateCourse({ id: parseInt(id), data }));
  if (result.meta.requestStatus === 'fulfilled') {
    setSuccess('Course updated successfully. Redirecting...');
    setTimeout(() => navigate('/instructor/dashboard'), 2000);
  }
};

  const handleDelete = async () => {
  const result = await dispatch(deleteCourse(parseInt(id)));
  if (result.meta.requestStatus === 'fulfilled') {
    navigate('/instructor/dashboard');
  }
};

  if (!course) return null;

  const initialData = {
    id: course.id,
    title: course.title,
    description: course.description,
    category_id: course.category_id,
    level: course.level,
    duration_weeks: course.duration_weeks,
    price: course.price,
    thumbnail: course.thumbnail,
    is_published: course.is_published,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Edit Course</h1>
          <p className="mt-1 text-sm text-gray-500">Update the details for "{course.title}".</p>
        </header>

        <CourseForm
          categories={categories}
          loading={loading}
          error={error}
          success={success}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />

        {/* Danger zone */}
        <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Delete this course</h2>
          <p className="mt-1 text-sm text-gray-500">
            Once deleted, this course and all its content will be permanently removed.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <TrashIcon /> Delete Course
            </button>
          ) : (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-rose-700">
                Are you sure? This will permanently delete "{course.title}".
              </p>
              <div className="flex flex-shrink-0 gap-3">
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button
                  variant="danger"
                  loading={loading}
                  onClick={handleDelete}
                >
                  Yes, delete
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EditCoursePage;