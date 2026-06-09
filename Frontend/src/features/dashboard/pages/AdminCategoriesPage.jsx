import { useEffect, useState } from 'react';
import CategoryModal from '../components/CategoryModal.jsx';
import api from '../../../lib/axios.js';

const PlusIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const PencilIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TableSkeleton = () => (
  <div className="animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
        <div className="h-3 w-32 rounded bg-gray-200" />
        <div className="flex-1 h-2.5 rounded bg-gray-100" />
        <div className="h-3 w-12 rounded bg-gray-200" />
        <div className="h-7 w-16 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

const RowActions = ({ category, confirmingId, onEdit, onDelete, onConfirm, onCancel }) => {
  if (confirmingId === category.id) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs font-medium text-gray-500">Delete?</span>
        <button onClick={onCancel} className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={() => onConfirm(category.id)} className="rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700">
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => onEdit(category)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
        <PencilIcon /> Edit
      </button>
      <button onClick={() => onDelete(category.id)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
        <TrashIcon /> Delete
      </button>
    </div>
  );
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories?withCount=true');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAdd = async (data) => {
    try {
      await api.post('/categories', data);
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (data) => {
    try {
      await api.put(`/categories/${editingCategory.id}`, data);
      setModalOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setConfirmingId(null);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Categories Management</h1>
            <p className="mt-1 text-sm text-gray-500">Organize your courses into clear, browsable categories.</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon /> Add Category
          </button>
        </header>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <TableSkeleton />
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <h2 className="text-base font-semibold text-gray-900">No categories yet</h2>
              <p className="mt-1 text-sm text-gray-500">Create your first category to start organizing courses.</p>
              <button onClick={openAdd} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                <PlusIcon /> Add Category
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Courses</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 max-w-md">
                          {cat.description || <span className="italic text-gray-400">No description</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {cat.course_count || 0} courses
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <RowActions
                            category={cat}
                            confirmingId={confirmingId}
                            onEdit={openEdit}
                            onDelete={(id) => setConfirmingId(id)}
                            onConfirm={handleDelete}
                            onCancel={() => setConfirmingId(null)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {cat.description || <span className="italic text-gray-400">No description</span>}
                        </p>
                      </div>
                      <span className="inline-flex flex-shrink-0 items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {cat.course_count || 0}
                      </span>
                    </div>
                    <RowActions
                      category={cat}
                      confirmingId={confirmingId}
                      onEdit={openEdit}
                      onDelete={(id) => setConfirmingId(id)}
                      onConfirm={handleDelete}
                      onCancel={() => setConfirmingId(null)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCategory(null); }}
        onSubmit={editingCategory ? handleEdit : handleAdd}
        initial={editingCategory}
      />

    </div>
  );
};

export default AdminCategoriesPage;