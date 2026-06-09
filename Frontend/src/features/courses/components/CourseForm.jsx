import { useState, useEffect } from 'react';
import Button from '../../../shared/components/Button.jsx';

const ChevronDown = () => (
  <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const inputClasses = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

const CourseForm = ({ categories, loading, error, success, onSubmit, onCancel, initialData = {} }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner',
    duration_weeks: '',
    price: '',
    thumbnail: '',
    is_published: false,
    ...initialData,
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData?.id]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onSubmit({
      title: form.title,
      description: form.description,
      category_id: parseInt(form.category_id),
      level: form.level,
      duration_weeks: parseInt(form.duration_weeks) || 1,
      price: parseFloat(form.price) || 0,
      thumbnail: form.thumbnail || null,
      is_published: form.is_published,
    });
  };

  const isFree = form.price !== '' && parseFloat(form.price) === 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">

      {success && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Course Title</label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Full-Stack Web Development"
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            required
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what students will learn..."
            className={`${inputClasses} resize-y leading-relaxed`}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
            <div className="relative">
              <select
                id="category"
                required
                value={form.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className={`${inputClasses} appearance-none pr-9`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="level" className="text-sm font-medium text-gray-700">Level</label>
            <div className="relative">
              <select
                id="level"
                required
                value={form.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className={`${inputClasses} appearance-none pr-9`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <ChevronDown />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration (weeks)</label>
            <input
              id="duration"
              type="number"
              min={1}
              required
              value={form.duration_weeks}
              onChange={(e) => handleChange('duration_weeks', e.target.value)}
              placeholder="e.g. 8"
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="text-sm font-medium text-gray-700">Price (USD)</label>
            <input
              id="price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0"
              className={inputClasses}
            />
            <span className="text-xs text-gray-500">
              {isFree ? 'This course will be listed as Free.' : 'Enter 0 to make this course free.'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="thumbnail" className="text-sm font-medium text-gray-700">Thumbnail URL</label>
          <input
            id="thumbnail"
            type="url"
            value={form.thumbnail || ''}
            onChange={(e) => handleChange('thumbnail', e.target.value)}
            placeholder="https://example.com/thumbnail.png"
            className={inputClasses}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Published</p>
            <p className="text-xs text-gray-500">
              {form.is_published ? 'Visible to students.' : 'Saved as draft.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('is_published', !form.is_published)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${form.is_published ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {initialData?.id ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default CourseForm;