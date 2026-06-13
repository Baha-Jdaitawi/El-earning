import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../lib/axios.js';
import AIQuizGenerator from '../../ai/components/AIQuizGenerator.jsx';

const inputClasses = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const labelClasses = 'text-sm font-medium text-gray-700';
const iconBtn = 'flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700';

const QUIZ_TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  text: 'Text',
};

const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const GripIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx={9} cy={6} r={1.4} fill="currentColor" />
    <circle cx={15} cy={6} r={1.4} fill="currentColor" />
    <circle cx={9} cy={12} r={1.4} fill="currentColor" />
    <circle cx={15} cy={12} r={1.4} fill="currentColor" />
    <circle cx={9} cy={18} r={1.4} fill="currentColor" />
    <circle cx={15} cy={18} r={1.4} fill="currentColor" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.6} />
    <path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QuizIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1v.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    <circle cx={12} cy={16.5} r={1} fill="currentColor" />
  </svg>
);

const DocIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h8l4 4v14H6V3Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const CursorClickIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M9 4v3M4 9h3M6.5 6.5 8 8M9 11l9 4-4 1.5L12.5 21 9 11Z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
    <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
      <p className="text-sm text-gray-700">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
      </div>
    </div>
  </div>
);

const ModuleForm = ({ initial = '', onSave, onCancel }) => {
  const [title, setTitle] = useState(initial);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim());
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Module Title</label>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to JavaScript" className={inputClasses} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={!title.trim()} className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {initial ? 'Save Module' : 'Add Module'}
        </button>
      </div>
    </form>
  );
};

const LessonInlineForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim());
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 mt-1">
      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Lesson Title</label>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Variables and Data Types" className={inputClasses} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={!title.trim()} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60">Add Lesson</button>
      </div>
    </form>
  );
};

const AssignmentForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), due_date: dueDate, max_points: parseInt(maxPoints, 10) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Title</label>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title..." className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what students need to submit..." className={`${inputClasses} resize-y leading-relaxed`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Max Points</label>
          <input type="number" min={0} value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} className={inputClasses} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Assignment</button>
      </div>
    </form>
  );
};

const LessonDetail = ({ lesson, onSaveLesson, onAddQuiz, onDeleteQuiz, onAddAssignment, onDeleteAssignment }) => {
  const [form, setForm] = useState({
    title: lesson.title,
    content: lesson.content || '',
    video_url: lesson.video_url || '',
    video_duration: lesson.video_duration || '',
  });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setForm({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      video_duration: lesson.video_duration || '',
    });
    setSaved(false);
  }, [lesson.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSaveLesson(lesson.id, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const durationInMinutes = form.video_duration ? Math.round(form.video_duration / 60) : '';

  const handleDurationChange = (e) => {
    const minutes = e.target.value;
    setForm({ ...form, video_duration: minutes ? parseInt(minutes) * 60 : '' });
  };

  const handleDeleteQuiz = (quizId) => {
    setConfirm({ message: 'Delete this quiz question?', onConfirm: () => { onDeleteQuiz(quizId); setConfirm(null); } });
  };

  const handleDeleteAssignment = (assignmentId) => {
    setConfirm({ message: 'Delete this assignment?', onConfirm: () => { onDeleteAssignment(assignmentId); setConfirm(null); } });
  };

  return (
    <div className="flex flex-col gap-8">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Lesson Details</h2>
        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses}>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClasses} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses}>Content</label>
            <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the lesson content..." className={`${inputClasses} resize-y leading-relaxed`} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Video URL</label>
              <input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Video Duration (minutes)</label>
              <input type="number" min={0} value={durationInMinutes} onChange={handleDurationChange} placeholder="e.g. 60" className={inputClasses} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckIcon /> Saved successfully!
              </span>
            )}
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70">
              {saving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <QuizIcon className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900">Quizzes</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{lesson.quizzes?.length || 0}</span>
        </div>
        <div className="flex flex-col gap-3">
          {(!lesson.quizzes || lesson.quizzes.length === 0) && (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">No quizzes yet. Use the AI generator below.</p>
          )}
          {lesson.quizzes?.map((quiz) => (
            <div key={quiz.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{quiz.question}</p>
                <p className="mt-1 text-sm text-gray-500">Answer: <span className="text-gray-700">{quiz.correct_answer || '—'}</span></p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{QUIZ_TYPE_LABELS[quiz.quiz_type] || quiz.quiz_type}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{quiz.points} pts</span>
                </div>
              </div>
              <button onClick={() => handleDeleteQuiz(quiz.id)} className={`${iconBtn} hover:text-rose-600`}>
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <AIQuizGenerator onSaveQuiz={onAddQuiz} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <DocIcon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{lesson.assignments?.length || 0}</span>
          </div>
          {!showAssignmentForm && (
<button onClick={() => setShowAssignmentForm(true)} className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
  <PlusIcon className="h-4 w-4" /><span className="hidden sm:inline">Add Assignment</span>
</button>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {(!lesson.assignments || lesson.assignments.length === 0) && !showAssignmentForm && (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">No assignments yet.</p>
          )}
          {lesson.assignments?.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{a.title}</p>
                {a.description && <p className="mt-1 text-sm text-gray-500">{a.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {a.due_date && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Due {a.due_date}</span>}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{a.max_points} pts</span>
                </div>
              </div>
              <button onClick={() => handleDeleteAssignment(a.id)} className={`${iconBtn} hover:text-rose-600`}>
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          {showAssignmentForm && (
            <AssignmentForm onSave={(a) => { onAddAssignment(a); setShowAssignmentForm(false); }} onCancel={() => setShowAssignmentForm(false)} />
          )}
        </div>
      </section>
    </div>
  );
};

const CourseBuilderPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [addingLessonTo, setAddingLessonTo] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { loadCourse(); }, [id]);

  const loadCourse = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.data);
      const modulesRes = await api.get(`/modules/course/${id}`);
      const modulesData = modulesRes.data.data || [];
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (m) => {
          const lessonRes = await api.get(`/lessons/module/${m.id}`);
          const lessons = lessonRes.data.data || [];
          const lessonsWithContent = await Promise.all(
            lessons.map(async (l) => {
              const [quizRes, assignRes] = await Promise.all([
                api.get(`/quizzes/lesson/${l.id}`).catch(() => ({ data: { data: [] } })),
                api.get(`/assignments/lesson/${l.id}`).catch(() => ({ data: { data: [] } })),
              ]);
              return { ...l, quizzes: quizRes.data.data || [], assignments: assignRes.data.data || [] };
            })
          );
          return { ...m, lessons: lessonsWithContent };
        })
      );
      setModules(modulesWithLessons);
      const expanded = {};
      modulesWithLessons.forEach((m) => { expanded[m.id] = true; });
      setExpandedModules(expanded);
    } catch (err) { console.error(err); }
  };

  const toggleModule = (moduleId) => setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const handleAddModule = async (title) => {
    try {
      await api.post('/modules', { course_id: parseInt(id), title, order_index: modules.length + 1 });
      setShowAddModule(false);
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const handleEditModule = async (moduleId, title) => {
    try {
      await api.put(`/modules/${moduleId}`, { title });
      setEditingModuleId(null);
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const deleteModule = (moduleId) => {
    setConfirm({
      message: 'Delete this module and all its lessons?',
      onConfirm: async () => {
        try {
          await api.delete(`/modules/${moduleId}`);
          if (selectedLesson && modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === selectedLesson.id)) {
            setSelectedLesson(null);
          }
          loadCourse();
        } catch (err) { console.error(err); }
        setConfirm(null);
      }
    });
  };

  const handleAddLesson = async (moduleId, title) => {
    try {
      const m = modules.find((m) => m.id === moduleId);
      const res = await api.post('/lessons', { module_id: moduleId, title, order_index: (m?.lessons?.length || 0) + 1 });
      setAddingLessonTo(null);
      await loadCourse();
      setSelectedLesson({ ...res.data.data, quizzes: [], assignments: [] });
    } catch (err) { console.error(err); }
  };

  const deleteLesson = (lessonId) => {
    setConfirm({
      message: 'Delete this lesson?',
      onConfirm: async () => {
        try {
          await api.delete(`/lessons/${lessonId}`);
          if (selectedLesson?.id === lessonId) setSelectedLesson(null);
          loadCourse();
        } catch (err) { console.error(err); }
        setConfirm(null);
      }
    });
  };

  const saveLesson = async (lessonId, data) => {
    try {
      await api.put(`/lessons/${lessonId}`, data);
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const addQuiz = async (quiz) => {
    try {
      await api.post('/quizzes', { ...quiz, lesson_id: selectedLesson.id });
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const deleteQuiz = async (quizId) => {
    try {
      await api.delete(`/quizzes/${quizId}`);
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const addAssignment = async (assignment) => {
    try {
      await api.post('/assignments', { ...assignment, lesson_id: selectedLesson.id });
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await api.delete(`/assignments/${assignmentId}`);
      loadCourse();
    } catch (err) { console.error(err); }
  };

  const handleDrop = async (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...modules];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setModules(next);
    setDragIndex(null);
    setDragOverIndex(null);
    try {
      await Promise.all(next.map((m, i) => api.put(`/modules/${m.id}`, { order_index: i + 1 })));
    } catch (err) { console.error(err); }
  };

  const getUpdatedLesson = () => {
    if (!selectedLesson) return null;
    for (const m of modules) {
      const found = m.lessons.find((l) => l.id === selectedLesson.id);
      if (found) return found;
    }
    return selectedLesson;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Course Builder</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{course?.title || 'Loading...'}</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="flex flex-col gap-3">
          {modules.map((module, index) => {
            const isExpanded = expandedModules[module.id];
            const isDragOver = dragOverIndex === index && dragIndex !== index;
            const isEditing = editingModuleId === module.id;

            return (
              <div
                key={module.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                onDrop={() => handleDrop(index)}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${isDragOver ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'} ${dragIndex === index ? 'opacity-50' : ''}`}
              >
                {isEditing ? (
                  <div className="p-3">
                    <ModuleForm
                      initial={module.title}
                      onSave={(title) => handleEditModule(module.id, title)}
                      onCancel={() => setEditingModuleId(null)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-2.5">
                    <button
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      className="flex h-7 w-6 cursor-grab items-center justify-center text-gray-300 hover:text-gray-500"
                    >
                      <GripIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleModule(module.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      <span className="truncate font-semibold text-gray-900">{module.title}</span>
                      <span className="flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">{module.lessons.length}</span>
                    </button>
                    <button onClick={() => { setEditingModuleId(module.id); setShowAddModule(false); }} className={iconBtn}>
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteModule(module.id)} className={`${iconBtn} hover:text-rose-600`}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {isExpanded && !isEditing && (
                  <div className="border-t border-gray-100 px-2 py-2">
                    <ul className="flex flex-col gap-1">
                      {module.lessons.map((lesson) => {
                        const isSelected = lesson.id === selectedLesson?.id;
                        return (
                          <li key={lesson.id}>
                            <div className={`group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                              <button onClick={() => setSelectedLesson(lesson)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                <PlayIcon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className={`truncate text-sm ${isSelected ? 'font-medium text-indigo-700' : 'text-gray-700'}`}>{lesson.title}</span>
                                {lesson.video_duration > 0 && (
                                  <span className="flex flex-shrink-0 items-center gap-0.5 text-xs text-gray-400">
                                    <ClockIcon className="h-3 w-3" />
                                    {Math.floor(lesson.video_duration / 60)}m
                                  </span>
                                )}
                              </button>
                              <div className="flex flex-shrink-0 items-center opacity-0 group-hover:opacity-100">
                                <button onClick={() => deleteLesson(lesson.id)} className={`${iconBtn} hover:text-rose-600`}>
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {addingLessonTo === module.id ? (
                      <LessonInlineForm
                        onSave={(title) => handleAddLesson(module.id, title)}
                        onCancel={() => setAddingLessonTo(null)}
                      />
                    ) : (
                      <button
                        onClick={() => { setAddingLessonTo(module.id); setShowAddModule(false); }}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        <PlusIcon className="h-4 w-4" /> Add Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {showAddModule ? (
            <ModuleForm onSave={handleAddModule} onCancel={() => setShowAddModule(false)} />
          ) : (
            <button
              onClick={() => { setShowAddModule(true); setEditingModuleId(null); setAddingLessonTo(null); }}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <PlusIcon className="h-4 w-4" /> Add Module
            </button>
          )}
        </aside>

        <main>
          {selectedLesson ? (
            <LessonDetail
              key={selectedLesson.id}
              lesson={getUpdatedLesson()}
              onSaveLesson={saveLesson}
              onAddQuiz={addQuiz}
              onDeleteQuiz={deleteQuiz}
              onAddAssignment={addAssignment}
              onDeleteAssignment={deleteAssignment}
            />
          ) : (
            <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <CursorClickIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-gray-900">Select a lesson</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">Choose a lesson from the left to edit its details, quizzes, and assignments.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseBuilderPage;