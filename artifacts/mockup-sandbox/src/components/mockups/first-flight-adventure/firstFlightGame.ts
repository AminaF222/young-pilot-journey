export type FirstFlightChoice = {
  id: string;
  text: string;
  feedback: string;
};

export type FirstFlightScenario = {
  id: string;
  category: string;
  title: string;
  setup: string;
  prompt: string;
  choices: FirstFlightChoice[];
  correctChoiceId: string;
};

export type FirstFlightStageId =
  | 'preflight'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'prepare-to-land';

export type FirstFlightStage = {
  id: FirstFlightStageId;
  label: string;
  badgeName: string;
  scenarioIds: readonly string[];
};

export type FirstFlightRunResult = {
  correct: number;
  total: number;
  points: number;
  maxPoints: number;
  percentage: number;
};

export type FirstFlightProgress = {
  completedRuns: number;
  bestPoints: number;
  bestPercentage: number;
  latestPoints: number | null;
  latestPercentage: number | null;
};

type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const FIRST_FLIGHT_PROGRESS_KEY = 'young-pilot-first-flight-progress';
export const FIRST_FLIGHT_POINTS_PER_ANSWER = 100;
export const FIRST_FLIGHT_MAX_POINTS = 6 * FIRST_FLIGHT_POINTS_PER_ANSWER;

export const INITIAL_FIRST_FLIGHT_PROGRESS: FirstFlightProgress = {
  completedRuns: 0,
  bestPoints: 0,
  bestPercentage: 0,
  latestPoints: null,
  latestPercentage: null,
};

export const firstFlightScenarios: FirstFlightScenario[] = [
  {
    id: 'preflight',
    category: 'PRE-FLIGHT PREPARATION',
    title: 'Start with a careful look',
    setup: 'You are with your instructor before a training flight. During the airplane-specific preflight, you notice something that does not look the way you expected.',
    prompt: 'What is the best next step?',
    choices: [
      {
        id: 'report-and-wait',
        text: 'Tell your instructor what you noticed and wait for their direction.',
        feedback: 'That is a careful choice. Share anything unexpected with your instructor and follow the checklist and guidance for that airplane.',
      },
      {
        id: 'adjust-it',
        text: 'Try to adjust it yourself so the walk-around can keep moving.',
        feedback: 'Do not make an adjustment or attempt a repair on your own. Point it out and let your instructor guide what happens next.',
      },
      {
        id: 'ignore-it',
        text: 'Ignore it because the airplane was probably checked earlier.',
        feedback: 'A previous flight does not tell you the airplane’s current condition. Report what you noticed so the instructor can assess it.',
      },
      {
        id: 'assume-ready',
        text: 'Assume the airplane is ready and focus on the lesson.',
        feedback: 'Readiness should not be assumed. The instructor uses the applicable checklist and resolves concerns before deciding to fly.',
      },
    ],
    correctChoiceId: 'report-and-wait',
  },
  {
    id: 'weather-awareness',
    category: 'WEATHER AWARENESS',
    title: 'Notice what has changed',
    setup: 'In this story’s climb chapter, you notice the sky looks different from what you expected and are not sure what it means for the lesson.',
    prompt: 'How should you respond?',
    choices: [
      {
        id: 'insist-scheduled',
        text: 'Insist on flying because the lesson is already scheduled.',
        feedback: 'A schedule is never a reason to overlook a concern. Tell your instructor what you noticed and let them make a safe plan.',
      },
      {
        id: 'tell-instructor',
        text: 'Tell your instructor and let them decide whether to continue, change plans, delay, or cancel.',
        feedback: 'Good judgment. Weather decisions depend on the conditions, airplane, and training situation; share your observation and follow your instructor’s decision.',
      },
      {
        id: 'guess-from-app',
        text: 'Make your own go/no-go decision from one weather app.',
        feedback: 'A single app or quick guess is not enough to assess a flight. Bring the concern to your instructor, who can evaluate the whole situation.',
      },
      {
        id: 'weather-doesnt-matter',
        text: 'Continue if the airplane looks fine; weather is a separate issue.',
        feedback: 'Weather is part of safe flight planning. An airplane that looks ready does not settle whether conditions are suitable.',
      },
    ],
    correctChoiceId: 'tell-instructor',
  },
  {
    id: 'cockpit-instruments',
    category: 'COCKPIT INSTRUMENTS',
    title: 'Ask about the panel',
    setup: 'While the airplane is parked for the preflight lesson, your instructor is introducing the cockpit instruments. One indication is different from the example you studied.',
    prompt: 'What is a useful learning response?',
    choices: [
      {
        id: 'declare-broken',
        text: 'Decide that the instrument is broken based on one glance.',
        feedback: 'One observation by a beginner is not enough to diagnose an instrument. Explain what you noticed and let the instructor interpret it.',
      },
      {
        id: 'ignore-indication',
        text: 'Ignore that indication and assume the other instruments tell the whole story.',
        feedback: 'Pilots learn to understand and cross-check instrument information rather than dismissing something unexpected. Ask your instructor about it.',
      },
      {
        id: 'ask-cross-check',
        text: 'Ask your instructor what it indicates and how it fits with the other instruments.',
        feedback: 'Exactly. Instruments provide information that needs context. Your instructor can explain the airplane’s panel and how pilots cross-check indications.',
      },
      {
        id: 'change-controls',
        text: 'Move controls to see if the indication changes.',
        feedback: 'Do not experiment with airplane controls. The airplane is parked; ask your instructor to explain the indication safely.',
      },
    ],
    correctChoiceId: 'ask-cross-check',
  },
  {
    id: 'instructor-communication',
    category: 'COMMUNICATE WITH YOUR INSTRUCTOR',
    title: 'Speak up when unsure',
    setup: 'Before the story’s taxi scene moves on, your instructor explains what will happen next, but part of it is not clear to you.',
    prompt: 'What should you do before continuing?',
    choices: [
      {
        id: 'pretend-understood',
        text: 'Pretend you understood so you do not slow anyone down.',
        feedback: 'It is safer and more useful to ask than to guess. Your instructor needs to know when something is unclear.',
      },
      {
        id: 'ask-to-clarify',
        text: 'Say you are unsure and ask your instructor to explain or demonstrate again.',
        feedback: 'That is good communication. Questions help your instructor teach at the right pace, and you should understand before continuing.',
      },
      {
        id: 'guess-and-act',
        text: 'Guess what was meant and try it without checking.',
        feedback: 'Guessing can create confusion. Pause and confirm the instruction with your instructor first.',
      },
      {
        id: 'wait-until-later',
        text: 'Wait until after the flight to mention that you were confused.',
        feedback: 'If something is unclear, raise it before continuing. Your instructor can clarify while you are still discussing the plan.',
      },
    ],
    correctChoiceId: 'ask-to-clarify',
  },
  {
    id: 'takeoff-readiness',
    category: 'TAKEOFF READINESS',
    title: 'Pause when something is uncertain',
    setup: 'Before takeoff, you realize you do not understand what comes next, or you are unsure about the airplane’s readiness.',
    prompt: 'What is the safest response?',
    choices: [
      {
        id: 'copy-another-airplane',
        text: 'Copy what another airplane is doing and continue.',
        feedback: 'Another airplane’s situation may be different. Do not use someone else’s actions to resolve uncertainty about your own flight.',
      },
      {
        id: 'hurry-along',
        text: 'Hurry so you do not delay the lesson.',
        feedback: 'Pressure to stay on schedule is not a reason to continue when something is uncertain. Tell your instructor and pause.',
      },
      {
        id: 'assume-instructor-will-stop',
        text: 'Continue silently because the instructor will notice if anything is wrong.',
        feedback: 'Your instructor is there to guide you, but they also need to hear your concerns. Speak up and wait for clear direction.',
      },
      {
        id: 'pause-and-tell',
        text: 'Pause and tell your instructor; do not take off while readiness or conditions are uncertain.',
        feedback: 'Correct. Never continue toward takeoff when the airplane, conditions, plan, or your understanding is uncertain. Follow your instructor’s directions.',
      },
    ],
    correctChoiceId: 'pause-and-tell',
  },
  {
    id: 'safe-decision-making',
    category: 'SAFE DECISION-MAKING',
    title: 'Put safety ahead of the schedule',
    setup: 'As the story prepares for its final airport scene, a concern comes up or you no longer feel comfortable continuing the lesson.',
    prompt: 'Which choice supports a safe learning environment?',
    choices: [
      {
        id: 'hide-concern',
        text: 'Keep the concern to yourself so the lesson can go ahead.',
        feedback: 'Hiding a concern prevents your instructor from helping. Speak up promptly, even if it means the plan changes.',
      },
      {
        id: 'insist-on-flying',
        text: 'Insist that the flight must happen because you came to the airport.',
        feedback: 'Arriving at the airport does not mean a flight has to happen. Safe decisions can include changing the lesson or rescheduling.',
      },
      {
        id: 'share-and-follow',
        text: 'Tell your instructor and follow their decision to pause, change the plan, or reschedule.',
        feedback: 'Good decision-making includes sharing new information and being willing to pause. Your instructor will guide the next step.',
      },
      {
        id: 'make-own-plan',
        text: 'Change the plan without discussing it with your instructor.',
        feedback: 'This is a training flight with an instructor. Discuss the concern and follow their direction rather than making an uncoordinated change.',
      },
    ],
    correctChoiceId: 'share-and-follow',
  },
];

// These are story chapters for a fictional learning game, not a real flight
// sequence or a set of operating procedures. Each stage keeps its existing
// educational scenario(s) and awards an in-game progress badge when answered.
export const firstFlightStages: readonly FirstFlightStage[] = [
  {
    id: 'preflight',
    label: 'Preflight',
    badgeName: 'Thoughtful Planner',
    scenarioIds: ['preflight', 'cockpit-instruments'],
  },
  {
    id: 'taxi',
    label: 'Taxi',
    badgeName: 'Good Listener',
    scenarioIds: ['instructor-communication'],
  },
  {
    id: 'takeoff',
    label: 'Takeoff',
    badgeName: 'Safety First',
    scenarioIds: ['takeoff-readiness'],
  },
  {
    id: 'climb',
    label: 'Climb',
    badgeName: 'Curious Learner',
    scenarioIds: ['weather-awareness'],
  },
  {
    id: 'prepare-to-land',
    label: 'Preparing to land',
    badgeName: 'Mindful Decision-Maker',
    scenarioIds: ['safe-decision-making'],
  },
];

export const firstFlightJourneyScenarios: FirstFlightScenario[] = firstFlightStages.flatMap((stage) =>
  stage.scenarioIds.map((scenarioId) => {
    const scenario = firstFlightScenarios.find((item) => item.id === scenarioId);
    if (!scenario) throw new Error(`First Flight stage refers to unknown scenario: ${scenarioId}`);
    return scenario;
  }),
);

export function getCompletedFirstFlightStageIds(
  answers: Readonly<Record<string, string>>,
): FirstFlightStageId[] {
  return firstFlightStages
    .filter((stage) => stage.scenarioIds.every((scenarioId) => Boolean(answers[scenarioId])))
    .map((stage) => stage.id);
}

export function calculateFirstFlightScore(
  answers: Readonly<Record<string, string>>,
): FirstFlightRunResult {
  const correct = firstFlightScenarios.reduce((total, scenario) => (
    total + (answers[scenario.id] === scenario.correctChoiceId ? 1 : 0)
  ), 0);
  const total = firstFlightScenarios.length;
  const maxPoints = total * FIRST_FLIGHT_POINTS_PER_ANSWER;
  const points = correct * FIRST_FLIGHT_POINTS_PER_ANSWER;

  return {
    correct,
    total,
    points,
    maxPoints,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}

export function recordFirstFlightCompletion(
  progress: FirstFlightProgress,
  result: FirstFlightRunResult,
): FirstFlightProgress {
  const newBest = result.points > progress.bestPoints;
  return {
    completedRuns: progress.completedRuns + 1,
    bestPoints: newBest ? result.points : progress.bestPoints,
    bestPercentage: newBest ? result.percentage : progress.bestPercentage,
    latestPoints: result.points,
    latestPercentage: result.percentage,
  };
}

function emptyProgress(): FirstFlightProgress {
  return { ...INITIAL_FIRST_FLIGHT_PROGRESS };
}

export function parseFirstFlightProgress(value: string | null): FirstFlightProgress {
  if (!value) return emptyProgress();
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || typeof parsed !== 'object') return emptyProgress();
    const progress = parsed as Partial<FirstFlightProgress>;
    const completedRuns = progress.completedRuns;
    const bestPoints = progress.bestPoints;
    const bestPercentage = progress.bestPercentage;
    const latestPoints = progress.latestPoints;
    const latestPercentage = progress.latestPercentage;
    const isPointScore = (score: unknown): score is number =>
      typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= FIRST_FLIGHT_MAX_POINTS;
    const isPercentage = (score: unknown): score is number =>
      typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 100;
    if (
      typeof completedRuns !== 'number' ||
      !Number.isInteger(completedRuns) ||
      completedRuns < 0 ||
      !isPointScore(bestPoints) ||
      !isPercentage(bestPercentage) ||
      !(latestPoints === null || isPointScore(latestPoints)) ||
      !(latestPercentage === null || isPercentage(latestPercentage))
    ) {
      return emptyProgress();
    }
    const percentForPoints = (points: number) =>
      Math.round((points / FIRST_FLIGHT_MAX_POINTS) * 100);
    if (
      (completedRuns === 0 &&
        (bestPoints !== 0 || bestPercentage !== 0 ||
          latestPoints !== null || latestPercentage !== null)) ||
      (completedRuns > 0 &&
        (latestPoints === null || latestPercentage === null ||
          bestPoints < latestPoints ||
          bestPercentage !== percentForPoints(bestPoints) ||
          latestPercentage !== percentForPoints(latestPoints)))
    ) {
      return emptyProgress();
    }
    return {
      completedRuns,
      bestPoints,
      bestPercentage,
      latestPoints,
      latestPercentage,
    };
  } catch {
    return emptyProgress();
  }
}

function getBrowserStorage(): ProgressStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadFirstFlightProgress(
  storage: ProgressStorage | null = getBrowserStorage(),
): FirstFlightProgress {
  try {
    return parseFirstFlightProgress(storage?.getItem(FIRST_FLIGHT_PROGRESS_KEY) ?? null);
  } catch {
    return emptyProgress();
  }
}

export function saveFirstFlightProgress(
  progress: FirstFlightProgress,
  storage: ProgressStorage | null = getBrowserStorage(),
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(FIRST_FLIGHT_PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
