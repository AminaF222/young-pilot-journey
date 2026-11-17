import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceWeatherQuiz, answerWeatherQuestion, createWeatherQuiz, EXAMPLE_METAR, exampleBreakdown,
  getWeatherQuizReview, scoreWeatherQuiz, weatherCodes, weatherQuestions, AWC_METAR_HELP_URL, AWC_METAR_VIEWER_URL,
} from './aviationWeather.ts';

test('quiz has 3-4 questions with four unique choices including the correct one', () => {
  assert.ok(weatherQuestions.length >= 3 && weatherQuestions.length <= 4);
  assert.equal(new Set(weatherQuestions.map((q) => q.id)).size, weatherQuestions.length);
  for (const q of weatherQuestions) {
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4);
    assert.ok(q.choices.includes(q.correct));
    assert.ok(q.explanation.length > 20);
  }
});

test('answers lock and cannot be changed', () => {
  const q = weatherQuestions[0];
  const wrong = q.choices.find((c) => c !== q.correct)!;
  let s = answerWeatherQuestion(createWeatherQuiz(), wrong);
  s = answerWeatherQuestion(s, q.correct);
  assert.equal(s.answers[q.id], wrong);
});

test('cannot advance without an answer; rejects unknown choices', () => {
  const s = createWeatherQuiz();
  assert.equal(advanceWeatherQuiz(s).index, 0);
  assert.equal(answerWeatherQuestion(s, 'nonsense'), s);
});

test('scores, reviews, and retry resets', () => {
  let s = createWeatherQuiz();
  weatherQuestions.forEach((q, i) => {
    s = answerWeatherQuestion(s, i === 0 ? q.choices.find((c) => c !== q.correct)! : q.correct);
    s = advanceWeatherQuiz(s);
  });
  assert.equal(s.index, weatherQuestions.length);
  const score = scoreWeatherQuiz(s);
  assert.equal(score.correct, weatherQuestions.length - 1);
  assert.equal(getWeatherQuizReview(s).filter((r) => !r.isCorrect).length, 1);
  assert.deepEqual(createWeatherQuiz(), { index: 0, answers: {} });
});

test('ceiling question uses lowest BKN/OVC layer', () => {
  const q = weatherQuestions.find((x) => x.id === 'wx-ceiling')!;
  assert.equal(q.correct, 'BKN040');
});

test('fictional example breakdown matches the example string', () => {
  assert.equal(exampleBreakdown.map((p) => p.code).join(' '), EXAMPLE_METAR);
  assert.match(exampleBreakdown[1].meaning, /no.*month|month or year/i);
  assert.match(exampleBreakdown[2].meaning, /FROM 240 degrees true at 8 knots/);
});

test('required codes and official links are present', () => {
  for (const c of ['KT','G','VRB','SM','FEW','SCT','BKN','OVC','RA','FG','BR','HZ','TS','AUTO']) assert.ok(weatherCodes.some((e) => e.code === c), c);
  assert.equal(AWC_METAR_VIEWER_URL, 'https://aviationweather.gov/data/metar/');
  assert.equal(AWC_METAR_HELP_URL, 'https://aviationweather.gov/help/data/#metar');
});
