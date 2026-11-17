import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  firstFlightJourneyScenarios,
  firstFlightScenarios,
  firstFlightStages,
  getCompletedFirstFlightStageIds,
} from './firstFlightGame.ts';

test('the five First Flight story stages cover every existing learning scenario once', () => {
    assert.deepEqual(firstFlightStages.map((stage) => stage.id), [
      'preflight',
      'taxi',
      'takeoff',
      'climb',
      'prepare-to-land',
    ]);
    assert.deepEqual(firstFlightStages.map((stage) => stage.scenarioIds), [
      ['preflight', 'cockpit-instruments'],
      ['instructor-communication'],
      ['takeoff-readiness'],
      ['weather-awareness'],
      ['safe-decision-making'],
    ]);
    assert.equal(firstFlightJourneyScenarios.length, firstFlightScenarios.length);
    assert.equal(new Set(firstFlightJourneyScenarios.map((scenario) => scenario.id)).size, firstFlightScenarios.length);
});

test('a stage badge is earned after every decision in that stage is answered', () => {
    assert.deepEqual(getCompletedFirstFlightStageIds({ preflight: 'report-and-wait' }), []);

    assert.deepEqual(
      getCompletedFirstFlightStageIds({
        preflight: 'report-and-wait',
        'cockpit-instruments': 'ask-cross-check',
      }),
      ['preflight'],
    );
});

test('a stage badge tracks progress even when an answer needs review', () => {
    assert.deepEqual(
      getCompletedFirstFlightStageIds({
        preflight: 'ignore-it',
        'cockpit-instruments': 'ignore-it',
        'instructor-communication': 'pretend-understood',
        'weather-awareness': 'tell-instructor',
      }),
      ['preflight', 'taxi', 'climb'],
    );
});

test('a stage remains in progress while any of its decisions is unanswered', () => {
    assert.deepEqual(
      getCompletedFirstFlightStageIds({
        preflight: 'report-and-wait',
        'instructor-communication': 'ask-to-clarify',
        'weather-awareness': 'tell-instructor',
        'takeoff-readiness': 'pause-and-tell',
        'cockpit-instruments': 'ask-cross-check',
      }),
      ['preflight', 'taxi', 'takeoff', 'climb'],
    );
});
