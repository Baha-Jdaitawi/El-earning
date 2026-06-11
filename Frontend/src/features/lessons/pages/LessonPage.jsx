import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getLessonApi, getModulesApi } from '../api/lessonsApi.js';
import { getQuizzesApi } from '../../quizzes/api/quizzesApi.js';
import { submitQuizService } from '../../quizzes/services/quizService.js';
import QuizForm from '../../quizzes/components/QuizForm.jsx';
import QuizResults from '../../quizzes/components/QuizResults.jsx';
import api from '../../../lib/axios.js';

const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} fill="currentColor" />
    <path d="m8 12 2.5 2.5L16 9" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayCircleIcon = ({ className }) => (
  <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.6} />
    <path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" />
  </svg>
);

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

const Spinner = () => (
  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const formatDuration = (seconds) => {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Assignment submission form
const AssignmentSubmitForm = ({ assignment, onSubmit, submitting }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(assignment.id, content);
    setSubmitted(true);
    setOpen(false);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
        Submitted successfully
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{assignment.title}</p>
          {assignment.description && (
            <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {assignment.due_date && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Due {new Date(assignment.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {assignment.max_points} pts
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          {open ? 'Cancel' : 'Submit'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-4">
          <label className="text-sm font-medium text-gray-700">Your submission</label>
          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or paste your submission here..."
            className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {submitting && <Spinner />}
              Submit Assignment
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [lesson, setLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [existingSubmissions, setExistingSubmissions] = useState([]);
  const [progress, setProgress] = useState({});
  const [completing, setCompleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  useEffect(() => {
    loadLesson();
    loadModules();
  }, [lessonId, courseId]);

  const loadLesson = async () => {
    try {
      const res = await getLessonApi(parseInt(lessonId));
      setLesson(res.data.data);

      // Load quizzes
      const quizRes = await getQuizzesApi(parseInt(lessonId));
      setQuizzes(quizRes.data.data || []);
      setResult(null);

      // Load assignments
      const assignRes = await api.get(`/assignments/lesson/${lessonId}`);
      setAssignments(assignRes.data.data || []);

      // Load existing submissions for this lesson's assignments
      const subRes = await api.get('/submissions/my').catch(() => ({ data: { data: [] } }));
      setExistingSubmissions(subRes.data.data || []);

      // Check for previous quiz attempt
      const attemptRes = await api.get(`/quizzes/lesson/${lessonId}/attempt`).catch(() => null);
      if (attemptRes?.data?.data) {
        setPreviousAttempt(attemptRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadModules = async () => {
    try {
      const res = await getModulesApi(parseInt(courseId));
      const modulesData = res.data.data || [];

      const modulesWithLessons = await Promise.all(
        modulesData.map(async (m) => {
          const lessonRes = await api.get(`/lessons/module/${m.id}`);
          return { ...m, lessons: lessonRes.data.data || [] };
        })
      );

      setModules(modulesWithLessons);
      setAllLessons(modulesWithLessons.flatMap((m) => m.lessons));

      const progressRes = await api.get(`/progress/course/${courseId}`);
      const progressData = progressRes.data.data?.lessons || [];
      const progressMap = {};
      progressData.forEach((l) => { progressMap[l.lesson_id] = l.completed; });
      setProgress(progressMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post(`/progress/lesson/${lessonId}/complete`, { time_spent: 0 });
      setProgress((prev) => ({ ...prev, [parseInt(lessonId)]: true }));
    } catch (err) {
      console.error(err);
    }
    setCompleting(false);
  };

  const handleNavigate = (direction) => {
    const currentIndex = allLessons.findIndex((l) => l.id === parseInt(lessonId));
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < allLessons.length) {
      navigate(`/learn/${courseId}/lesson/${allLessons[targetIndex].id}`);
    }
  };

  const handleSubmitQuiz = async (answers) => {
    setSubmitting(true);
    try {
      const data = await submitQuizService(parseInt(lessonId), answers);
      setResult({ score: data.earnedPoints, total: data.totalPoints, results: data.results });
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleSubmitAssignment = async (assignmentId, content) => {
    setAssignmentSubmitting(true);
    try {
      await api.post('/submissions', { assignment_id: parseInt(assignmentId), content });
    } catch (err) {
      console.error(err);
    }
    setAssignmentSubmitting(false);
  };

  const isAssignmentSubmitted = (assignmentId) => {
    return existingSubmissions.some((s) => s.assignment_id === assignmentId);
  };

  const currentIndex = allLessons.findIndex((l) => l.id === parseInt(lessonId));
  const isComplete = progress[parseInt(lessonId)] === true;

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">

        {/* Sidebar */}
        <aside className="w-full flex-shrink-0 border-b border-gray-100 bg-white lg:max-h-screen lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Course</p>
            <h2 className="text-sm font-semibold text-gray-900">{lesson.course_title}</h2>
            <button
              onClick={() => navigate(`/learn/${courseId}/chat`)}
              className="mt-3 flex w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
              </svg>
              Course Chat
            </button>
          </div>
          <nav className="flex flex-col gap-4 px-3 py-4">
            {modules.map((module, mIndex) => (
              <div key={module.id}>
                <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Module {mIndex + 1} · {module.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {module.lessons.map((l) => {
                    const isCurrent = l.id === parseInt(lessonId);
                    const isCompleted = progress[l.id] === true;
                    return (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/learn/${courseId}/lesson/${l.id}`)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left w-full ${isCurrent ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <span className="flex-shrink-0">
                          {isCompleted
                            ? <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            : isCurrent
                              ? <PlayCircleIcon className="h-4 w-4 text-indigo-600" />
                              : <PlayCircleIcon className="h-4 w-4 text-gray-300" />
                          }
                        </span>
                        <span className="flex-1 truncate">{l.title}</span>
                        {l.video_duration > 0 && (
                          <span className="flex-shrink-0 text-xs text-gray-400">{formatDuration(l.video_duration)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{lesson.title}</h1>

            {/* Video */}
            <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gray-900">
              {lesson.video_url ? (
                <iframe src={lesson.video_url} className="h-full w-full" allowFullScreen title={lesson.title} />
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/60">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
                    <svg className="h-7 w-7 translate-x-0.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
                    </svg>
                  </span>
                  <span className="text-sm">No video for this lesson</span>
                </div>
              )}
            </div>

            {/* Mark complete */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {isComplete ? "You've completed this lesson." : 'Finished watching? Mark it done.'}
              </p>
              <button
                onClick={handleComplete}
                disabled={completing || isComplete}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70'
                  }`}
              >
                {completing ? <><Spinner /> Saving...</> : isComplete ? <><CheckIcon /> Completed</> : 'Mark as Complete'}
              </button>
            </div>

            {/* Content */}
            {lesson.content && (
              <article className="mt-8 border-t border-gray-100 pt-8">
                <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
              </article>
            )}

            {/* Assignments */}
            {assignments.length > 0 && (
              <section className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Assignments
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {assignments.length}
                  </span>
                </h2>
                <div className="flex flex-col gap-4">
                  {assignments.map((assignment) => (
                    isAssignmentSubmitted(assignment.id) ? (
                      <div key={assignment.id} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-xs text-emerald-600">Already submitted</p>
                        </div>
                      </div>
                    ) : (
                      <AssignmentSubmitForm
                        key={assignment.id}
                        assignment={assignment}
                        onSubmit={handleSubmitAssignment}
                        submitting={assignmentSubmitting}
                      />
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Navigation */}
            <nav className="mt-10 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
              <button
                onClick={() => handleNavigate('prev')}
                disabled={currentIndex <= 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft /> Previous Lesson
              </button>
              <button
                onClick={() => handleNavigate('next')}
                disabled={currentIndex >= allLessons.length - 1}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Lesson <ChevronRight />
              </button>
            </nav>
          </div>
        </main>

        {/* Quiz panel */}
        {quizzes.length > 0 && (
          <aside className="w-full flex-shrink-0 border-t border-gray-100 bg-white lg:max-h-screen lg:w-96 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Lesson Quiz</h2>
              <p className="text-xs text-gray-500">{quizzes.length} {quizzes.length === 1 ? 'question' : 'questions'}</p>
            </div>
            <div className="px-5 py-5">
              {result ? (
                <QuizResults
                  result={result}
                  onRetake={() => setResult(null)}
                />
              ) : (
                <QuizForm
                  quizzes={quizzes}
                  onSubmit={handleSubmitQuiz}
                  submitting={submitting}
                />
              )}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default LessonPage;