import { lessons, questions, type QuizScore } from './data.ts';

const lessonByQuestionId: Record<string, string> = {
  'q-lift': 'airplane-parts',
  'q-altimeter': 'cockpit-instruments',
  'q-four-forces': 'flight-principles',
  'q-fuselage': 'airplane-parts',
  'q-heading': 'aviation-vocabulary',
  'q-airspeed': 'aviation-vocabulary',
  'q-rudder': 'airplane-parts',
};

export type ReviewArea = {
  lessonId: string;
  topic: string;
  missedQuestionCount: number;
};

export type LearningRecommendation = {
  kind: 'practice' | 'lesson' | 'quiz';
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  lessonId?: string;
};

export function getMissedQuestionIds(scores: readonly QuizScore[]): string[] {
  const savedIds = scores[0]?.missedQuestionIds;
  if (!Array.isArray(savedIds)) return [];
  const missed = new Set(savedIds);
  return questions.filter((question) => missed.has(question.id)).map((question) => question.id);
}

export function getQuestionsToPractice(scores: readonly QuizScore[]) {
  const missed = new Set(getMissedQuestionIds(scores));
  return questions.filter((question) => missed.has(question.id));
}

export function getAreasToReview(scores: readonly QuizScore[]): ReviewArea[] {
  const counts = new Map<string, number>();
  for (const questionId of getMissedQuestionIds(scores)) {
    const lessonId = lessonByQuestionId[questionId];
    if (lessonId) counts.set(lessonId, (counts.get(lessonId) ?? 0) + 1);
  }
  return lessons
    .filter((lesson) => counts.has(lesson.id))
    .map((lesson) => ({
      lessonId: lesson.id,
      topic: lesson.topic,
      missedQuestionCount: counts.get(lesson.id)!,
    }));
}

export function getLearningRecommendation(
  completedLessonIds: readonly string[],
  scores: readonly QuizScore[],
): LearningRecommendation {
  const latest = scores[0];
  const missedIds = getMissedQuestionIds(scores);
  const areas = getAreasToReview(scores);

  if (missedIds.length > 0) {
    const topics = areas.map((area) => area.topic);
    const topicMessage = topics.length
      ? ` Revisit ${topics.join(' and ')} as well.`
      : '';
    return {
      kind: 'practice',
      title: 'Practice missed questions',
      description: `Your latest full quiz has ${missedIds.length} question${missedIds.length === 1 ? '' : 's'} to revisit.${topicMessage} A focused round will help before your next full quiz.`,
      href: '/quiz?mode=missed',
      actionLabel: 'Practice missed questions',
    };
  }

  if (latest && latest.percentage < 100) {
    return {
      kind: 'quiz',
      title: 'Take a fresh knowledge check',
      description: 'This older result does not include question-level review details. A new quiz can show which topics to revisit.',
      href: '/quiz',
      actionLabel: 'Start a new quiz',
    };
  }

  const nextLesson = lessons.find((lesson) => !completedLessonIds.includes(lesson.id));
  if (nextLesson) {
    return {
      kind: 'lesson',
      title: `Next up: ${nextLesson.topic}`,
      description: 'Continue through the beginner lessons at your own pace. Your completed lessons stay on this device.',
      href: `/study?lesson=${nextLesson.id}`,
      actionLabel: 'Open next lesson',
      lessonId: nextLesson.id,
    };
  }

  return {
    kind: 'quiz',
    title: latest ? 'Keep your knowledge current' : 'Take your first quick quiz',
    description: latest
      ? 'You have marked every lesson complete. Another full quiz is a useful way to keep practicing.'
      : 'A short knowledge check can help you find which aviation topics to study first.',
    href: '/quiz',
    actionLabel: 'Take a quick quiz',
  };
}
