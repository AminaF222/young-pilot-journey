export const AWC_HOME_URL = 'https://aviationweather.gov/';
export const AWC_METAR_VIEWER_URL = 'https://aviationweather.gov/data/metar/';
export const AWC_METAR_HELP_URL = 'https://aviationweather.gov/help/data/#metar';
export const PRACTICE_STATION = 'KBWI';
export const PRACTICE_STATION_NAME = 'Baltimore/Washington International Thurgood Marshall Airport';

/** Fictional teaching example. Not a real or current observation. */
export const EXAMPLE_METAR = 'KBWI 121654Z 24008KT 10SM SCT030 20/12 A3012';

export interface MetarPart { code: string; label: string; meaning: string }

export const exampleBreakdown: MetarPart[] = [
  { code: 'KBWI', label: 'Station', meaning: 'Four-letter ICAO identifier for Baltimore/Washington International Thurgood Marshall Airport.' },
  { code: '121654Z', label: 'Day and time (DDHHMMZ)', meaning: 'Day 12 of the month at 16:54 UTC. Z means UTC (Zulu). The report does not include the month or year.' },
  { code: '24008KT', label: 'Wind', meaning: 'Wind FROM 240 degrees true at 8 knots. No G means no gusts were reported.' },
  { code: '10SM', label: 'Visibility', meaning: '10 statute miles, the unit used in US reports.' },
  { code: 'SCT030', label: 'Clouds', meaning: 'Scattered clouds with a base of 3,000 feet above ground level (030 = hundreds of feet). Scattered is not a ceiling.' },
  { code: '20/12', label: 'Temperature / dew point', meaning: '20 °C temperature and 12 °C dew point.' },
  { code: 'A3012', label: 'Altimeter', meaning: 'Altimeter setting of 30.12 inches of mercury.' },
];

export interface CodeEntry { code: string; meaning: string; group: 'wind' | 'visibility' | 'weather' | 'cloud' | 'report' }

export const weatherCodes: CodeEntry[] = [
  { code: 'KT', meaning: 'Knots, the unit for wind speed', group: 'wind' },
  { code: 'G', meaning: 'Gusts, e.g. 24012G20KT peaks at 20 knots', group: 'wind' },
  { code: 'VRB', meaning: 'Variable wind direction, e.g. VRB03KT', group: 'wind' },
  { code: 'SM', meaning: 'Statute miles of visibility (US)', group: 'visibility' },
  { code: 'RA', meaning: 'Rain', group: 'weather' },
  { code: 'FG', meaning: 'Fog', group: 'weather' },
  { code: 'BR', meaning: 'Mist', group: 'weather' },
  { code: 'HZ', meaning: 'Haze', group: 'weather' },
  { code: 'TS', meaning: 'Thunderstorm', group: 'weather' },
  { code: 'FEW', meaning: 'Few clouds, a small part of the sky', group: 'cloud' },
  { code: 'SCT', meaning: 'Scattered clouds', group: 'cloud' },
  { code: 'BKN', meaning: 'Broken clouds, can form a ceiling', group: 'cloud' },
  { code: 'OVC', meaning: 'Overcast, can form a ceiling', group: 'cloud' },
  { code: 'AUTO', meaning: 'Optional: report came from an automated station', group: 'report' },
];

export interface WeatherQuestion { id: string; prompt: string; choices: string[]; correct: string; explanation: string }

export const weatherQuestions: WeatherQuestion[] = [
  { id: 'wx-wind', prompt: 'In the fictional example 24008KT, what does 240 describe?',
    choices: ['The direction the wind blows toward', 'The direction the wind blows FROM, in degrees true', 'The runway number', 'The wind speed in knots'],
    correct: 'The direction the wind blows FROM, in degrees true',
    explanation: 'METAR wind direction is where the wind comes FROM, in degrees true. 08KT is the speed: 8 knots.' },
  { id: 'wx-ceiling', prompt: 'Which layer would be the ceiling in FEW010 SCT025 BKN040 OVC080?',
    choices: ['FEW010', 'SCT025', 'BKN040', 'OVC080'], correct: 'BKN040',
    explanation: 'The ceiling is the lowest broken (BKN) or overcast (OVC) layer, or vertical visibility. FEW and SCT do not count, so BKN040 (4,000 ft AGL) is the ceiling.' },
  { id: 'wx-time', prompt: 'What does 121654Z tell you?',
    choices: ['December 16 at 5:40 PM local', 'Day 12 at 16:54 UTC, with no month or year', 'Report number 121654', 'The forecast is valid for 12 hours'],
    correct: 'Day 12 at 16:54 UTC, with no month or year',
    explanation: 'The DDHHMMZ format gives day of month, hour, and minute in UTC. Check the full date and source on the official site.' },
  { id: 'wx-taf', prompt: 'How is a TAF different from a METAR?',
    choices: ['A TAF is a forecast; a METAR is an observation', 'A TAF is always more accurate', 'A TAF only lists clouds', 'They are the same product'],
    correct: 'A TAF is a forecast; a METAR is an observation',
    explanation: 'A METAR reports what was observed at a station at a time. A TAF forecasts expected conditions near an airport over a period.' },
];

export interface WeatherQuizState { index: number; answers: Record<string, string> }

export const createWeatherQuiz = (): WeatherQuizState => ({ index: 0, answers: {} });

export function answerWeatherQuestion(state: WeatherQuizState, choice: string, questions = weatherQuestions): WeatherQuizState {
  const q = questions[state.index];
  if (!q || state.answers[q.id] !== undefined || !q.choices.includes(choice)) return state;
  return { ...state, answers: { ...state.answers, [q.id]: choice } };
}

export function advanceWeatherQuiz(state: WeatherQuizState, questions = weatherQuestions): WeatherQuizState {
  const q = questions[state.index];
  if (!q || state.answers[q.id] === undefined) return state;
  return { ...state, index: state.index + 1 };
}

export function scoreWeatherQuiz(state: WeatherQuizState, questions = weatherQuestions) {
  const correct = questions.filter((q) => state.answers[q.id] === q.correct).length;
  return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
}

export function getWeatherQuizReview(state: WeatherQuizState, questions = weatherQuestions) {
  return questions.map((q) => ({ ...q, answer: state.answers[q.id], isCorrect: state.answers[q.id] === q.correct }));
}
