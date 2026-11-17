import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FIRST_FLIGHT_MAX_POINTS,
  FIRST_FLIGHT_PROGRESS_KEY,
  INITIAL_FIRST_FLIGHT_PROGRESS,
  calculateFirstFlightScore,
  firstFlightScenarios,
  loadFirstFlightProgress,
  parseFirstFlightProgress,
  recordFirstFlightCompletion,
  saveFirstFlightProgress,
} from './firstFlightGame.ts';

test('the first-flight course has six complete beginner scenarios', () => {
  assert.deepEqual(firstFlightScenarios.map((scenario) => scenario.id), [
    'preflight',
    'weather-awareness',
    'cockpit-instruments',
    'instructor-communication',
    'takeoff-readiness',
    'safe-decision-making',
  ]);
  for (const scenario of firstFlightScenarios) {
    assert.equal(scenario.choices.length, 4);
    assert.ok(scenario.choices.some((choice) => choice.id === scenario.correctChoiceId));
    assert.ok(scenario.setup.length > 30);
    assert.ok(scenario.choices.every((choice) => choice.feedback.length > 20));
  }
});

test('every correct choice earns one hundred points and a perfect score', () => {
  const answers = Object.fromEntries(
    firstFlightScenarios.map((scenario) => [scenario.id, scenario.correctChoiceId]),
  );
  assert.deepEqual(calculateFirstFlightScore(answers), {
    correct: 6,
    total: 6,
    points: FIRST_FLIGHT_MAX_POINTS,
    maxPoints: FIRST_FLIGHT_MAX_POINTS,
    percentage: 100,
  });
});

test('partial, incorrect, and unanswered choices score accurately', () => {
  const answers = Object.fromEntries(firstFlightScenarios.map((scenario, index) => [
    scenario.id,
    index < 3
      ? scenario.correctChoiceId
      : scenario.choices.find((choice) => choice.id !== scenario.correctChoiceId)!.id,
  ]));
  assert.deepEqual(calculateFirstFlightScore(answers), {
    correct: 3,
    total: 6,
    points: 300,
    maxPoints: 600,
    percentage: 50,
  });
  assert.deepEqual(calculateFirstFlightScore({}), {
    correct: 0,
    total: 6,
    points: 0,
    maxPoints: 600,
    percentage: 0,
  });
});

test('progress parsing rejects malformed or out-of-range saved values', () => {
  assert.deepEqual(parseFirstFlightProgress(null), INITIAL_FIRST_FLIGHT_PROGRESS);
  assert.deepEqual(parseFirstFlightProgress('not json'), INITIAL_FIRST_FLIGHT_PROGRESS);
  assert.deepEqual(parseFirstFlightProgress(JSON.stringify({
    completedRuns: -1,
    bestPoints: 900,
    bestPercentage: 120,
    latestPoints: null,
    latestPercentage: null,
  })), INITIAL_FIRST_FLIGHT_PROGRESS);
});

test('completion count increases and best score never falls', () => {
  const firstRun = calculateFirstFlightScore(Object.fromEntries(
    firstFlightScenarios.map((scenario, index) => [
      scenario.id,
      index < 4 ? scenario.correctChoiceId : 'wrong',
    ]),
  ));
  const perfectRun = calculateFirstFlightScore(Object.fromEntries(
    firstFlightScenarios.map((scenario) => [scenario.id, scenario.correctChoiceId]),
  ));
  const lowRun = calculateFirstFlightScore({});

  const afterFirst = recordFirstFlightCompletion(INITIAL_FIRST_FLIGHT_PROGRESS, firstRun);
  assert.deepEqual(afterFirst, {
    completedRuns: 1,
    bestPoints: 400,
    bestPercentage: 67,
    latestPoints: 400,
    latestPercentage: 67,
  });
  const afterPerfect = recordFirstFlightCompletion(afterFirst, perfectRun);
  const afterLow = recordFirstFlightCompletion(afterPerfect, lowRun);
  assert.deepEqual(afterLow, {
    completedRuns: 3,
    bestPoints: 600,
    bestPercentage: 100,
    latestPoints: 0,
    latestPercentage: 0,
  });
});

test('progress reads and writes through the app’s local browser storage key', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const completed = recordFirstFlightCompletion(
    INITIAL_FIRST_FLIGHT_PROGRESS,
    calculateFirstFlightScore({}),
  );
  assert.equal(saveFirstFlightProgress(completed, storage), true);
  assert.equal(values.has(FIRST_FLIGHT_PROGRESS_KEY), true);
  assert.deepEqual(loadFirstFlightProgress(storage), completed);
  assert.equal(saveFirstFlightProgress(completed, null), false);
});
