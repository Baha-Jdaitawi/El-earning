import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../../store/slices/coursesSlice.js';
import { getCategoriesApi } from '../../dashboard/api/dashboardApi.js';
import CourseCard from '../components/CourseCard.jsx';
import CourseFilters from '../components/CourseFilters.jsx';

const ChevronLeft = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <div className="aspect-video animate-pulse bg-gray-200" />
    <div className="flex flex-col gap-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="h-5 w-14 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
};

const CoursesPage = () => {
  const dispatch = useDispatch();
  const { courses, meta, loading } = useSelector((state) => state.courses);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', level: '', sort: 'created_at' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCategoriesApi().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(fetchCourses({
      page,
      limit: 12,
      search: query || undefined,
      category_id: filters.category || undefined,
      level: filters.level || undefined,
      is_published: true,
    }));
  }, [dispatch, page, query, filters]);

  const handleSearch = (q) => {
    setQuery(q);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Browse Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Explore our catalog and find your next skill to master.</p>
        </header>

        <div className="mb-6">
          <CourseFilters
            categories={categories}
            filters={filters}
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </div>

        {!loading && (
          <p className="mb-4 text-sm text-gray-500">
            {meta?.total > 0
              ? `Showing ${courses.length} of ${meta.total.toLocaleString()} courses`
              : 'No courses found'}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-gray-900">No courses found</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}

        {!loading && courses.length > 0 && meta?.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
            </button>

            {getPageNumbers(page, meta.totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="px-2 text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight />
            </button>
          </nav>
        )}

      </div>
    </div>
  );
};

export default CoursesPage;