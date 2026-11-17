import type { QuizQuestion, QuizScore } from './data';

export type QuizReviewMode = 'all' | 'missed';

export type QuizRoundState = {
  questionIndex: number;
  answers: Record<string, string>;
  reviewMode: QuizReviewMode;
};

export type QuizRoundAction =
  | { type: 'answer'; questionId: string; answer: string }
  | { type: 'advance'; questionId: string; questionCount: number }
  | { type: 'set-review-mode'; mode: QuizReviewMode }
  | { type: 'retry' };

export type QuizReviewEntry = {
  questionId: string;
  questionNumber: number;
  prompt: string;
  studentAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
};

export function createInitialQuizRound(): QuizRoundState {
  return {
    questionIndex: 0,
    answers: {},
    reviewMode: 'all',
  };
}

export function quizRoundReducer(
  state: QuizRoundState,
  action: QuizRoundAction,
): QuizRoundState {
  switch (action.type) {
    case 'answer':
      if (state.answers[action.questionId] !== undefined) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case 'advance':
      if (
        state.answers[action.questionId] === undefined ||
        state.questionIndex >= action.questionCount
      ) {
        return state;
      }
      return {
        ...state,
        questionIndex: Math.min(state.questionIndex + 1, action.questionCount),
        reviewMode: 'all',
      };
    case 'set-review-mode':
      return { ...state, reviewMode: action.mode };
    case 'retry':
      return createInitialQuizRound();
  }
}

export function calculateQuizScore(
  questionList: readonly QuizQuestion[],
  answers: Readonly<Record<string, string>>,
): Omit<QuizScore, 'date'> {
  const correct = questionList.reduce(
    (total, question) =>
      total + (answers[question.id] === question.correctAnswer ? 1 : 0),
    0,
  );
  const total = questionList.length;

  return {
    correct,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}

export function buildQuizReview(
  questionList: readonly QuizQuestion[],
  answers: Readonly<Record<string, string>>,
): QuizReviewEntry[] {
  return questionList.map((question, index) => {
    const studentAnswer = answers[question.id] ?? null;
    return {
      questionId: question.id,
      questionNumber: index + 1,
      prompt: question.prompt,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect: studentAnswer === question.correctAnswer,
    };
  });
}

export function getVisibleQuizReview(
  entries: readonly QuizReviewEntry[],
  mode: QuizReviewMode,
): QuizReviewEntry[] {
  return mode === 'missed' ? entries.filter((entry) => !entry.isCorrect) : [...entries];
}
