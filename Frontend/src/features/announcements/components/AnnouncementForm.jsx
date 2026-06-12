import { useState, useEffect } from 'react';

const AnnouncementForm = ({ onSubmit, onCancel, loading, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="text-sm font-semibold text-gray-900">
        {initialData ? 'Edit Announcement' : 'New Announcement'}
      </h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          autoFocus
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. New lesson added, deadline extended..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Message</label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-70"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Post Announcement'}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;