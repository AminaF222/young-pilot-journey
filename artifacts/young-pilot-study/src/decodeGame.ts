import { phoneticAlphabet, type PhoneticEntry } from './pilotLanguage.ts';

export type DecodeDirection = 'letter-to-word' | 'word-to-letter';
export type DecodeChallenge = {
  id: string;
  direction: DecodeDirection;
  letter: string;
  word: string;
  pronunciation: string;
  prompt: string;
  correctAnswer: string;
  choices: string[];
  explanation: string;
};

export const DECODE_QUESTION_COUNT = 10;
export const DECODE_POINTS_PER_QUESTION = 10;

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function answerFor(entry: PhoneticEntry, direction: DecodeDirection) {
  return direction === 'letter-to-word' ? entry.word : entry.letter;
}

export function createDecodeChallenges(random: () => number = Math.random): DecodeChallenge[] {
  const selectedEntries = shuffle(phoneticAlphabet, random).slice(0, DECODE_QUESTION_COUNT);
  return selectedEntries.map((entry, index) => {
    const direction: DecodeDirection = index % 2 === 0 ? 'letter-to-word' : 'word-to-letter';
    const distractors = shuffle(phoneticAlphabet.filter((candidate) => candidate.letter !== entry.letter), random).slice(0, 3);
    const correctAnswer = answerFor(entry, direction);
    const choices = shuffle([entry, ...distractors], random).map((candidate) => answerFor(candidate, direction));
    const prompt = direction === 'letter-to-word'
      ? `Which aviation word represents the letter ${entry.letter}?`
      : `Which letter does the aviation word ${entry.word} represent?`;
    return {
      id: `decode-${index + 1}-${entry.letter}`,
      direction,
      letter: entry.letter,
      word: entry.word,
      pronunciation: entry.pronunciation,
      prompt,
      correctAnswer,
      choices,
      explanation: `${entry.word} represents the letter ${entry.letter} in the ICAO phonetic alphabet. The FAA AIM pronunciation guide gives it as ${entry.pronunciation}.`,
    };
  });
}

export function scoreDecodeGame(
  challenges: readonly DecodeChallenge[],
  answers: Readonly<Record<string, string>>,
) {
  const correct = challenges.filter((challenge) => answers[challenge.id] === challenge.correctAnswer).length;
  const total = challenges.length;
  const points = correct * DECODE_POINTS_PER_QUESTION;
  const maxPoints = total * DECODE_POINTS_PER_QUESTION;
  return {
    correct,
    total,
    points,
    maxPoints,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}

export function getMissedDecodeChallenges(
  challenges: readonly DecodeChallenge[],
  answers: Readonly<Record<string, string>>,
) {
  return challenges.filter((challenge) => answers[challenge.id] !== challenge.correctAnswer);
}
