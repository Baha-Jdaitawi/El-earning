import { useState } from 'react';
import Button from '../../../shared/components/Button.jsx';

const QuizForm = ({ quizzes, onSubmit, submitting }) => {
  const [answers, setAnswers] = useState({});

  const allAnswered = quizzes.length > 0 && quizzes.every((q) => answers[q.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered || submitting) return;
    onSubmit(answers);
  };

  const getOptions = (quiz) => {
    if (quiz.quiz_type === 'true_false') {
      return [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }];
    }
    if (quiz.options) {
      return Array.isArray(quiz.options) ? quiz.options : JSON.parse(quiz.options);
    }
    return [];
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {quizzes.map((quiz, index) => {
        const options = getOptions(quiz);
        const selected = answers[quiz.id];

        return (
          <fieldset key={quiz.id} className="flex flex-col gap-2.5">
            <legend className="text-sm font-medium text-gray-900">
              {index + 1}. {quiz.question}
            </legend>

            {quiz.quiz_type === 'text' ? (
              <input
                type="text"
                value={selected || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [quiz.id]: e.target.value }))}
                placeholder="Type your answer..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {options.map((opt) => {
                  const optId = opt.id || opt.value || opt;
                  const optLabel = opt.label || opt.value || opt;
                  const isSelected = selected === optId;
                  return (
                    <label
                      key={optId}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${quiz.id}`}
                        value={optId}
                        checked={isSelected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [quiz.id]: optId }))}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="flex-1">{optLabel}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}

      <Button
        type="submit"
        loading={submitting}
        disabled={!allAnswered}
        className="w-full"
      >
        Submit Quiz
      </Button>
    </form>
  );
};

export default QuizForm;