import assert from 'node:assert/strict';
import { test } from 'node:test';
import { phoneticAlphabet } from './pilotLanguage.ts';
import {
  createDecodeChallenges,
  DECODE_POINTS_PER_QUESTION,
  DECODE_QUESTION_COUNT,
  getMissedDecodeChallenges,
  scoreDecodeGame,
} from './decodeGame.ts';

test('creates ten mixed-direction challenges from distinct letters in the official alphabet', () => {
  const challenges = createDecodeChallenges(() => 0);
  assert.equal(challenges.length, DECODE_QUESTION_COUNT);
  assert.equal(new Set(challenges.map((challenge) => challenge.letter)).size, DECODE_QUESTION_COUNT);
  assert.equal(challenges.filter((challenge) => challenge.direction === 'letter-to-word').length, 5);
  assert.equal(challenges.filter((challenge) => challenge.direction === 'word-to-letter').length, 5);
  for (const challenge of challenges) {
    const official = phoneticAlphabet.find((entry) => entry.letter === challenge.letter);
    assert.ok(official);
    assert.equal(challenge.word, official.word);
    assert.equal(challenge.pronunciation, official.pronunciation);
    assert.equal(challenge.choices.length, 4);
    assert.equal(new Set(challenge.choices).size, 4);
    assert.ok(challenge.choices.includes(challenge.correctAnswer));
  }
});

test('awards points accurately and returns only missed challenges for review', () => {
  const challenges = createDecodeChallenges(() => 0.37);
  const answers = Object.fromEntries(challenges.map((challenge, index) => [
    challenge.id,
    index < 6 ? challenge.correctAnswer : challenge.choices.find((choice) => choice !== challenge.correctAnswer)!,
  ]));
  const score = scoreDecodeGame(challenges, answers);
  assert.equal(score.correct, 6);
  assert.equal(score.total, 10);
  assert.equal(score.points, 6 * DECODE_POINTS_PER_QUESTION);
  assert.equal(score.maxPoints, 100);
  assert.equal(score.percentage, 60);
  assert.equal(getMissedDecodeChallenges(challenges, answers).length, 4);
});

test('unanswered challenges count as missed and an empty game scores zero without division errors', () => {
  const challenges = createDecodeChallenges(() => 0.71);
  const score = scoreDecodeGame(challenges, {});
  assert.equal(score.correct, 0);
  assert.equal(score.points, 0);
  assert.equal(score.percentage, 0);
  assert.equal(getMissedDecodeChallenges(challenges, {}).length, challenges.length);
  assert.deepEqual(scoreDecodeGame([], {}), {
    correct: 0,
    total: 0,
    points: 0,
    maxPoints: 0,
    percentage: 0,
  });
});
