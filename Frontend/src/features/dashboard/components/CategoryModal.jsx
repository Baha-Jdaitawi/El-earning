import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import Button from '../../../shared/components/Button.jsx';

const inputClasses = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

const CategoryModal = ({ isOpen, onClose, onSubmit, initial }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initial, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Category' : 'Add Category'} size="sm">
      <p className="mb-5 text-sm text-gray-500">
        {isEdit ? 'Update the details for this category.' : 'Create a new category to organize courses.'}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-name" className="text-sm font-medium text-gray-700">Name</label>
          <input
            id="cat-name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Web Development"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-desc" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="cat-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of what this category covers..."
            className={`${inputClasses} resize-y leading-relaxed`}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>
            {isEdit ? 'Save Changes' : 'Add Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;