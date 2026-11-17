import assert from 'node:assert/strict';
import { test } from 'node:test';
import { questions } from './data.ts';
import {
  buildQuizReview,
  calculateQuizScore,
  createInitialQuizRound,
  getVisibleQuizReview,
  quizRoundReducer,
} from './quizLogic.ts';

test('scores perfect, partial, and empty rounds accurately', () => {
  const perfectAnswers = Object.fromEntries(
    questions.map((question) => [question.id, question.correctAnswer]),
  );
  assert.deepEqual(calculateQuizScore(questions, perfectAnswers), {
    correct: 7,
    total: 7,
    percentage: 100,
  });

  const oneMissed = { ...perfectAnswers, [questions[0].id]: 'The rudder' };
  assert.deepEqual(calculateQuizScore(questions, oneMissed), {
    correct: 6,
    total: 7,
    percentage: 86,
  });
  assert.deepEqual(calculateQuizScore(questions, {}), {
    correct: 0,
    total: 7,
    percentage: 0,
  });
  assert.deepEqual(calculateQuizScore([], {}), {
    correct: 0,
    total: 0,
    percentage: 0,
  });
});

test('review shows every correct answer and explanation, and missed mode filters accurately', () => {
  const answers = Object.fromEntries(
    questions.map((question) => [question.id, question.correctAnswer]),
  );
  answers[questions[0].id] = 'The rudder';

  const entries = buildQuizReview(questions, answers);
  assert.equal(entries.length, 7);
  assert.equal(entries[0].studentAnswer, 'The rudder');
  assert.equal(entries[0].correctAnswer, questions[0].correctAnswer);
  assert.equal(entries[0].explanation, questions[0].explanation);
  assert.equal(entries[0].isCorrect, false);
  assert.equal(getVisibleQuizReview(entries, 'all').length, 7);
  assert.deepEqual(
    getVisibleQuizReview(entries, 'missed').map((entry) => entry.questionId),
    [questions[0].id],
  );
});

test('retry resets the question, answers, and review filter', () => {
  let state = createInitialQuizRound();
  state = quizRoundReducer(state, {
    type: 'answer',
    questionId: questions[0].id,
    answer: 'The rudder',
  });
  state = quizRoundReducer(state, {
    type: 'advance',
    questionId: questions[0].id,
    questionCount: questions.length,
  });
  state = quizRoundReducer(state, { type: 'set-review-mode', mode: 'missed' });

  state = quizRoundReducer(state, { type: 'retry' });
  assert.deepEqual(state, createInitialQuizRound());
});

test('a question cannot be advanced before answering or answered twice', () => {
  const initial = createInitialQuizRound();
  const blocked = quizRoundReducer(initial, {
    type: 'advance',
    questionId: questions[0].id,
    questionCount: questions.length,
  });
  assert.deepEqual(blocked, initial);

  const answered = quizRoundReducer(initial, {
    type: 'answer',
    questionId: questions[0].id,
    answer: questions[0].correctAnswer,
  });
  const unchanged = quizRoundReducer(answered, {
    type: 'answer',
    questionId: questions[0].id,
    answer: 'The rudder',
  });
  assert.deepEqual(unchanged, answered);
});
