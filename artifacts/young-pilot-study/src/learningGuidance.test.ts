import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lessons, questions, type QuizScore } from './data.ts';
import {
  getAreasToReview,
  getLearningRecommendation,
  getMissedQuestionIds,
  getQuestionsToPractice,
} from './learningGuidance.ts';

function score(overrides: Partial<QuizScore> = {}): QuizScore {
  return {
    date: '2026-10-12T12:00:00.000Z',
    correct: 7,
    total: 7,
    percentage: 100,
    ...overrides,
  };
}

test('recommends the next uncompleted lesson when there are no quiz misses', () => {
  const nextLesson = lessons[1];
  const recommendation = getLearningRecommendation([lessons[0].id], [score()]);
  assert.equal(recommendation.kind, 'lesson');
  assert.equal(recommendation.lessonId, nextLesson.id);
  assert.equal(recommendation.href, `/study?lesson=${nextLesson.id}`);
});

test('maps recent missed questions to study areas and a focused practice round', () => {
  const latest = score({
    correct: 5,
    percentage: 71,
    missedQuestionIds: ['q-altimeter', 'q-heading'],
  });
  assert.deepEqual(getMissedQuestionIds([latest]), ['q-altimeter', 'q-heading']);
  assert.deepEqual(getQuestionsToPractice([latest]).map((question) => question.id), ['q-altimeter', 'q-heading']);
  assert.deepEqual(getAreasToReview([latest]), [
    { lessonId: 'cockpit-instruments', topic: 'Cockpit instruments', missedQuestionCount: 1 },
    { lessonId: 'aviation-vocabulary', topic: 'Aviation vocabulary', missedQuestionCount: 1 },
  ]);
  const recommendation = getLearningRecommendation([], [latest]);
  assert.equal(recommendation.kind, 'practice');
  assert.equal(recommendation.href, '/quiz?mode=missed');
});

test('ignores unknown saved question IDs instead of creating a broken practice set', () => {
  const latest = score({ correct: 6, percentage: 86, missedQuestionIds: ['unknown-question'] });
  assert.deepEqual(getMissedQuestionIds([latest]), []);
  assert.deepEqual(getQuestionsToPractice([latest]), []);
  assert.equal(getLearningRecommendation([], [latest]).href, '/quiz');
  assert.equal(questions.length, 7);
});

test('legacy partial scores recommend a fresh quiz because per-question details are unavailable', () => {
  const recommendation = getLearningRecommendation([], [score({ correct: 5, percentage: 71 })]);
  assert.equal(recommendation.title, 'Take a fresh knowledge check');
  assert.equal(recommendation.href, '/quiz');
});

test('recommends another full quiz after all lessons are completed', () => {
  const recommendation = getLearningRecommendation(lessons.map((lesson) => lesson.id), [score()]);
  assert.equal(recommendation.kind, 'quiz');
  assert.equal(recommendation.href, '/quiz');
});
