import {
  useReducer,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Menu,
  MessageSquare,
  Plane,
  RotateCw,
  Shuffle,
  UserRound,
  X,
} from "lucide-react";
import {
  flashcards,
  lessons,
  questions,
  type QuizQuestion,
  type QuizScore,
} from "./data";
import {
  buildQuizReview,
  calculateQuizScore,
  createInitialQuizRound,
  getVisibleQuizReview,
  quizRoundReducer,
} from "./quizLogic";
import {
  advanceLanguageQuiz,
  alphabetFlashcards,
  createLanguageQuiz,
  getLanguageQuizMisses,
  languageQuestions,
  phoneticAlphabet,
  radioTerms,
  scoreLanguageQuiz,
  spellPhonetic,
} from "./pilotLanguage";
import {
  createDecodeChallenges,
  getMissedDecodeChallenges,
  scoreDecodeGame,
} from "./decodeGame";
import {
  getAreasToReview,
  getLearningRecommendation,
  getQuestionsToPractice,
} from "./learningGuidance";
import FirstFlightGame from "./FirstFlightGame";
import {
  FIRST_FLIGHT_MAX_POINTS,
  loadFirstFlightProgress,
  recordFirstFlightCompletion,
  saveFirstFlightProgress,
  type FirstFlightRunResult,
} from "./firstFlightGame";
import aminaPortrait from "./assets/amina-white-shirt.jpg";
import aminaFlightSuitSunsetPhoto from "./assets/amina-flight-suit-sunset.png";
import enginePhoto from "./assets/learning-engine.jpg";
import flashcardPhoto from "./assets/learning-flashcards.jpg";
import cockpitPhoto from "./assets/learning-cockpit.jpg";
import pathwaySunsetPhoto from "./assets/learning-pathway-sunset.jpg";
import homepagePilotsPhoto from "./assets/homepage-student-pilots.jpg";
import ContactTopics from "./components/ContactTopics";
import AminaPhoto from "./components/AminaPhoto";
import ExploreAviationPage from "./pages/ExploreAviationPage";
import AviationWeatherPage from "./pages/AviationWeatherPage";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/study", label: "Study" },
  { href: "/weather", label: "Weather" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Quick quiz" },
  { href: "/first-flight", label: "First Flight" },
  { href: "/pathway", label: "Pilot pathway" },
  { href: "/programs", label: "Programs" },
  { href: "/explore-aviation", label: "Explore Aviation Programs" },
  { href: "/story", label: "Amina's story" },
  { href: "/progress", label: "My progress" },
  { href: "/contact", label: "Contact" },
];

const aminaFullStory = [
  {
    label: "Why I started",
    body: "When I first started exploring aviation, the information I needed was scattered. Lessons were in one place, pilot vocabulary in another, and youth programs and STEM opportunities somewhere else. As a young student, it was hard to know where to begin, and it could feel overwhelming.",
  },
  {
    label: "What was hard",
    body: "Building Young Pilot Journey was a challenge. I had to research aviation resources and check that they came from trustworthy sources. I planned what the app should include, built features one at a time, tested how each button and game responded, and worked through technical problems when something did not behave the way I expected.",
  },
  {
    label: "What I learned",
    body: "Each problem taught me something, about aviation and about building technology. I learned to slow down, test carefully, and keep improving instead of giving up. The same patience is helping me keep working toward my goal of becoming a pilot.",
  },
  {
    label: "Who it is for",
    body: "I want other young people to discover aviation, explore pilot careers, and find real resources to take their first steps. If this app helps one student feel less lost and more curious, it is doing what I hoped it would.",
  },
];

const missionPoints = [
  "Make aviation education easier for young students to explore.",
  "Bring lessons, terminology, career information, and opportunities together in one place.",
  "Help students discover aviation programs and trusted resources.",
  "Encourage students who are not sure where to begin.",
];

// Set this to the verified official GoFundMe URL once provided. Leave empty to keep the button disabled.
const GOFUNDME_URL: string = "https://gofund.me/d67f423f5";

const aminaStoryParagraphs = [
  "My name is Amina. I am a Maryland high school student with a dream of becoming a pilot. As I explore aviation, I am learning about airplanes, cockpit instruments, aviation terminology, and the steps involved in working toward a pilot license.",
  "I created Young Pilot Journey to help other young people who are curious about aviation discover where to begin. I wanted to bring beginner-friendly lessons, flashcards, quizzes, pilot vocabulary, and information about youth flight and STEM opportunities together in one place.",
  "My goal is to make learning about aviation less overwhelming and encourage more young people to explore their dreams of flying. I hope this app inspires the next generation of pilots to take their first steps toward the sky.",
];

function loadScores(): QuizScore[] {
  try {
    const value = localStorage.getItem("young-pilot-scores");
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed.filter(
        (item): item is QuizScore =>
          item !== null &&
          typeof item === "object" &&
          typeof item.date === "string" &&
          Number.isInteger(item.correct) &&
          Number.isInteger(item.total) &&
          item.total > 0 &&
          item.correct >= 0 &&
          item.correct <= item.total &&
          item.percentage === Math.round((item.correct / item.total) * 100) &&
          (!("missedQuestionIds" in item) ||
            (Array.isArray(item.missedQuestionIds) &&
              item.missedQuestionIds.every(
                (id: unknown) =>
                  typeof id === "string" &&
                  questions.some((question) => question.id === id),
              ))),
      );
  } catch {
    /* Storage may be disabled or full. The app still works for this visit. */
  }
  return [];
}

function saveScore(score: QuizScore) {
  try {
    const prior = loadScores();
    localStorage.setItem(
      "young-pilot-scores",
      JSON.stringify([score, ...prior].slice(0, 30)),
    );
    return true;
  } catch {
    return false;
  }
}

const LESSON_STORAGE_KEY = "young-pilot-completed-lessons";

function loadCompletedLessons(): string[] {
  try {
    const value = localStorage.getItem(LESSON_STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(
        parsed.filter(
          (id): id is string =>
            typeof id === "string" &&
            lessons.some((lesson) => lesson.id === id),
        ),
      ),
    ];
  } catch {
    return [];
  }
}

function saveCompletedLessons(ids: string[]) {
  try {
    localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* Study remains available without storage. */
  }
}

function LearningRecommendationCard({
  recommendation,
  onOpenLesson,
  onAction,
}: {
  recommendation: ReturnType<typeof getLearningRecommendation>;
  onOpenLesson?: (lessonId: string) => void;
  onAction?: () => void;
}) {
  const lessonId = recommendation.lessonId;
  const handleClick = onAction
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onAction();
      }
    : lessonId && onOpenLesson
      ? (event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          onOpenLesson(lessonId);
        }
      : undefined;
  return (
    <section
      className={`learning-recommendation learning-recommendation-${recommendation.kind}`}
      aria-label="Personalized next step"
      aria-live="polite"
      data-testid="learning-recommendation"
    >
      <div className="learning-recommendation-copy">
        <span className="eyebrow">Your personalized next step</span>
        <h3>{recommendation.title}</h3>
        <p>{recommendation.description}</p>
      </div>
      <Link
        href={recommendation.href}
        className="button button-primary"
        onClick={handleClick}
        data-testid="link-learning-recommendation"
      >
        {recommendation.actionLabel} <ArrowRight size={15} />
      </Link>
    </section>
  );
}

function CockpitDiagram() {
  return (
    <svg
      className="aircraft-diagram"
      viewBox="0 0 760 230"
      role="img"
      aria-label="Simple illustration of a training airplane instrument panel"
    >
      <rect x="20" y="19" width="720" height="192" rx="18" fill="#e7f2f5" />
      <path
        d="M38 177c58-65 116-91 174-91h336c64 0 116 33 174 91v22H38z"
        fill="#d1e7ec"
      />
      <path d="M32 180h696v24H32z" fill="#31566d" />
      {[135, 252, 369, 486, 603].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy="151"
            r="31"
            fill="#fff"
            stroke="#517b8d"
            strokeWidth="3"
          />
          <circle cx={x} cy="151" r="3" fill="#426d80" />
          <path
            d={`M${x} 151l${i % 2 ? 10 : -8} -15`}
            stroke="#d58456"
            strokeWidth="2.7"
            strokeLinecap="round"
          />
          <path
            d={`M${x - 17} 164h5m22 0h5M${x} 127v5`}
            stroke="#7594a1"
            strokeWidth="2"
          />
        </g>
      ))}
      <text
        x="380"
        y="196"
        textAnchor="middle"
        fill="#e5f1f4"
        fontSize="10"
        fontFamily="monospace"
      >
        A TRAINING AIRPLANE PANEL · SCHEMATIC
      </text>
    </svg>
  );
}

function DecodeMessageGame() {
  const [challenges, setChallenges] = useState(() => createDecodeChallenges());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState(false);
  const [reviewMode, setReviewMode] = useState<"all" | "missed">("missed");
  const finished = questionIndex >= challenges.length;
  const question = challenges[questionIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const result = scoreDecodeGame(challenges, answers);
  const missed = getMissedDecodeChallenges(challenges, answers);
  const reviewItems = reviewMode === "missed" ? missed : challenges;
  const chooseAnswer = (answer: string) => {
    if (!question || selectedAnswer) return;
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  };
  const advance = () => {
    if (selectedAnswer) setQuestionIndex((current) => current + 1);
  };
  const retry = () => {
    setChallenges(createDecodeChallenges());
    setQuestionIndex(0);
    setAnswers({});
    setReviewing(false);
    setReviewMode("missed");
  };
  return (
    <section
      className="language-section decode-game"
      aria-labelledby="decode-game-heading"
      data-testid="decode-pilot-message"
    >
      <div className="language-section-heading">
        <span className="eyebrow">03 · Listen, decode, learn</span>
        <h3 id="decode-game-heading">Decode the Pilot Message</h3>
        <p>
          Answer 10 quick challenges in both directions: letter to aviation
          word, and aviation word back to letter. Each correct answer earns 10
          points.
        </p>
      </div>
      <aside
        className="decode-safety"
        role="note"
        data-testid="decode-radio-disclaimer"
      >
        <strong>Practice game only—not radio training.</strong>
        This activity uses the FAA’s published ICAO spelling alphabet for
        learning. It is not a substitute for formal flight instruction, actual
        aviation radio training, or official radio procedures.
        <a
          href="https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_2.html"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-decode-faa-reference"
        >
          FAA AIM · Section 4-2-7: Phonetic Alphabet <ExternalLink size={13} />
        </a>
      </aside>
      {!finished && question ? (
        <div className="decode-game-panel" data-testid="decode-game-question">
          <div className="decode-game-topline">
            <span data-testid="text-decode-position">
              CHALLENGE {String(questionIndex + 1).padStart(2, "0")} /{" "}
              {String(challenges.length).padStart(2, "0")}
            </span>
            <span data-testid="text-decode-points">
              {result.points} / {result.maxPoints} points
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Decode game progress"
            aria-valuenow={questionIndex}
            aria-valuemin={0}
            aria-valuemax={challenges.length}
          >
            <div
              className="progress-fill"
              style={{ width: `${(questionIndex / challenges.length) * 100}%` }}
            />
          </div>
          <div className="decode-question-card">
            <span className="eyebrow">
              {question.direction === "letter-to-word"
                ? "Letter → aviation word"
                : "Aviation word → letter"}
            </span>
            <h4 data-testid="text-decode-prompt">{question.prompt}</h4>
            <div
              className="decode-choice-grid"
              role="group"
              aria-label={`Answer choices for challenge ${questionIndex + 1}`}
            >
              {question.choices.map((choice, index) => {
                const isCorrect =
                  selectedAnswer && choice === question.correctAnswer;
                const isWrong =
                  selectedAnswer === choice &&
                  choice !== question.correctAnswer;
                return (
                  <button
                    type="button"
                    key={choice}
                    className={`decode-choice ${isCorrect ? "correct" : ""} ${isWrong ? "incorrect" : ""}`}
                    onClick={() => chooseAnswer(choice)}
                    disabled={Boolean(selectedAnswer)}
                    aria-pressed={selectedAnswer === choice}
                    data-testid={`decode-answer-${question.id}-${index}`}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {choice}
                  </button>
                );
              })}
            </div>
            {selectedAnswer && (
              <div
                className={`feedback ${selectedAnswer === question.correctAnswer ? "good" : "try-again"}`}
                role="status"
                data-testid="decode-answer-feedback"
              >
                <strong>
                  {selectedAnswer === question.correctAnswer
                    ? "Correct—10 points!"
                    : `Not quite. The correct answer is ${question.correctAnswer}.`}
                </strong>
                {question.explanation}
              </div>
            )}
            {selectedAnswer && (
              <button
                type="button"
                className="button button-primary language-next"
                onClick={advance}
                data-testid="button-decode-next"
              >
                {questionIndex === challenges.length - 1
                  ? "See final score"
                  : "Next challenge"}{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="decode-game-finished" data-testid="decode-game-result">
          <div className="decode-score-card">
            <div
              className="decode-points"
              data-testid="text-decode-final-points"
            >
              {result.points}
              <span> / {result.maxPoints} pts</span>
            </div>
            <div>
              <span className="eyebrow">
                Final score · {result.percentage}%
              </span>
              <h4>
                {result.correct} of {result.total} correct
              </h4>
              <p>
                Review the answers you missed, then try a fresh set when you’re
                ready.
              </p>
            </div>
          </div>
          <div className="decode-game-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={retry}
              data-testid="button-decode-retry"
            >
              <RotateCw size={15} /> Try again
            </button>
            <button
              type="button"
              className="button button-secondary"
              aria-expanded={reviewing && reviewMode === "missed"}
              onClick={() => {
                if (reviewing && reviewMode === "missed") setReviewing(false);
                else {
                  setReviewMode("missed");
                  setReviewing(true);
                }
              }}
              data-testid="button-decode-review-missed"
            >
              Review missed answers ({missed.length})
            </button>
            <button
              type="button"
              className="button button-secondary"
              aria-expanded={reviewing && reviewMode === "all"}
              onClick={() => {
                if (reviewing && reviewMode === "all") setReviewing(false);
                else {
                  setReviewMode("all");
                  setReviewing(true);
                }
              }}
              data-testid="button-decode-review-all"
            >
              Review all challenges
            </button>
          </div>
          {reviewing && (
            <div
              className="decode-review-list"
              aria-label="Decode game answer review"
              data-testid="decode-game-review"
            >
              {reviewItems.length ? (
                reviewItems.map((item) => (
                  <article
                    className="decode-review-card"
                    key={item.id}
                    data-testid={`decode-review-${item.id}`}
                  >
                    <div className="review-question-meta">
                      <span>
                        {item.direction === "letter-to-word"
                          ? "LETTER TO WORD"
                          : "WORD TO LETTER"}
                      </span>
                      <span>
                        {answers[item.id] === item.correctAnswer
                          ? "Correct"
                          : "Review this answer"}
                      </span>
                    </div>
                    <h4>{item.prompt}</h4>
                    <p>
                      <strong>Your answer:</strong>{" "}
                      {answers[item.id] ?? "Not answered"}
                    </p>
                    <p>
                      <strong>Correct answer:</strong> {item.correctAnswer}
                    </p>
                    <p>{item.explanation}</p>
                  </article>
                ))
              ) : (
                <p
                  className="decode-no-misses"
                  data-testid="text-decode-no-misses"
                >
                  No missed answers this round. Review all challenges to see the
                  complete answer key.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PilotLanguageLesson() {
  const [letter, setLetter] = useState("A");
  const [practice, setPractice] = useState("");
  const [quiz, setQuiz] = useState(createLanguageQuiz);
  const [reviewing, setReviewing] = useState(false);
  const selectedEntry = phoneticAlphabet.find(
    (entry) => entry.letter === letter,
  )!;
  const currentQuestion = languageQuestions[quiz.index];
  const selectedAnswer = currentQuestion
    ? quiz.answers[currentQuestion.id]
    : undefined;
  const finished = quiz.index >= languageQuestions.length;
  const converted = spellPhonetic(practice);
  const selectAnswer = (answer: string) => {
    if (!currentQuestion || selectedAnswer) return;
    setQuiz((state) => ({
      ...state,
      answers: { ...state.answers, [currentQuestion.id]: answer },
    }));
  };
  const resetQuiz = () => {
    setQuiz(createLanguageQuiz());
    setReviewing(false);
  };
  return (
    <section
      className="pilot-language"
      aria-label="Pilot language and radio practice"
      data-testid="pilot-language-lesson"
    >
      <aside
        className="disclaimer language-safety"
        role="note"
        data-testid="radio-training-notice"
      >
        <strong>
          Educational introduction only—not formal flight training.
        </strong>
        This lesson is not a substitute for official radio procedures. Learn
        actual procedures from a qualified instructor and current official
        publications. Real communications depend on location, aircraft,
        situation, and formal training.
      </aside>
      <section className="language-section" aria-labelledby="alphabet-heading">
        <div className="language-section-heading">
          <span className="eyebrow">01 · Clear letters</span>
          <h3 id="alphabet-heading">The aviation alphabet</h3>
          <p>
            Select any letter to see its standard aviation word and
            pronunciation guide.
          </p>
        </div>
        <div className="alphabet-layout">
          <div
            className="alphabet-grid"
            role="group"
            aria-label="Choose a letter in the phonetic alphabet"
          >
            {phoneticAlphabet.map((entry) => (
              <button
                type="button"
                key={entry.letter}
                className={`alphabet-key ${letter === entry.letter ? "active" : ""}`}
                aria-pressed={letter === entry.letter}
                aria-label={`Letter ${entry.letter}, ${entry.word}, pronounced ${entry.pronunciation}`}
                onClick={() => setLetter(entry.letter)}
                data-testid={`alphabet-letter-${entry.letter}`}
              >
                <span className="alphabet-key-letter">{entry.letter}</span>
                <span className="alphabet-key-word">{entry.word}</span>
                <small className="alphabet-key-pronunciation">
                  {entry.pronunciation}
                </small>
              </button>
            ))}
          </div>
          <div
            className="alphabet-detail"
            aria-live="polite"
            data-testid="alphabet-detail"
          >
            <span className="alphabet-detail-letter">
              {selectedEntry.letter}
            </span>
            <div>
              <span className="eyebrow">Say it clearly</span>
              <h4 data-testid="text-phonetic-word">{selectedEntry.word}</h4>
              <p data-testid="text-phonetic-pronunciation">
                {selectedEntry.pronunciation}
              </p>
            </div>
          </div>
        </div>
        <p className="language-footnote" data-testid="text-official-spellings">
          These are the official FAA/ICAO spellings: Alfa, Juliett, and Xray.
          Alpha and Juliet are common variants.
        </p>
      </section>

      <section className="language-section" aria-labelledby="spelling-heading">
        <div className="language-section-heading">
          <span className="eyebrow">02 · Try it yourself</span>
          <h3 id="spelling-heading">Spell a word</h3>
          <p>
            Enter a name or short word to see each letter’s phonetic word and
            pronunciation.
          </p>
        </div>
        <label className="practice-label" htmlFor="phonetic-practice-input">
          Name or short word
        </label>
        <input
          id="phonetic-practice-input"
          className="practice-input"
          type="text"
          maxLength={24}
          value={practice}
          onChange={(event) => setPractice(event.target.value)}
          placeholder="For example: SKY"
          autoComplete="off"
          data-testid="input-phonetic-practice"
        />
        <p className="privacy-note" data-testid="text-practice-privacy">
          This value is handled only in local component state. It is not saved
          or sent. You can use any word instead of your name.
        </p>
        {practice && (
          <div
            className="spelling-results"
            aria-live="polite"
            aria-label="Phonetic spelling result"
            data-testid="phonetic-practice-result"
          >
            {converted.length ? (
              converted.map((item, index) => (
                <div
                  className="spelling-result"
                  key={`${index}-${item.letter}`}
                  data-testid={`spelling-result-${index}`}
                >
                  <strong>{item.letter}</strong>
                  <span>{item.word}</span>
                  <small>{item.pronunciation}</small>
                </div>
              ))
            ) : (
              <p data-testid="text-no-letters">
                Type letters A–Z to see their phonetic words.
              </p>
            )}
          </div>
        )}
        <p className="language-example" data-testid="text-registration-example">
          <strong>Example:</strong> SKY is spelled Sierra · Kilo · Yankee.
        </p>
      </section>

      <DecodeMessageGame />

      <section
        className="language-section"
        aria-labelledby="radio-terms-heading"
      >
        <div className="language-section-heading">
          <span className="eyebrow">04 · A few useful words</span>
          <h3 id="radio-terms-heading">Beginner radio terms</h3>
          <p>
            Short definitions with classroom-scale examples—not complete real
            ATC calls or instructions.
          </p>
        </div>
        <dl className="radio-terms">
          {radioTerms.map((item) => (
            <div
              className="radio-term"
              key={item.term}
              data-testid={`radio-term-${item.term.toLowerCase().replaceAll(" ", "-")}`}
            >
              <dt>{item.term}</dt>
              <dd>
                <span>{item.meaning}</span>
                <small>{item.example}</small>
              </dd>
            </div>
          ))}
        </dl>
        <div className="official-links" aria-label="Official FAA references">
          <a
            href="https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_2.html"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-faa-phonetic-reference"
          >
            FAA AIM · Phonetic alphabet <ExternalLink size={14} />
          </a>
          <a
            href="https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/index.html"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-faa-glossary-reference"
          >
            FAA Pilot/Controller Glossary <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section
        className="language-section language-quiz"
        aria-labelledby="language-quiz-heading"
        data-testid="language-quiz"
      >
        <div className="language-section-heading">
          <span className="eyebrow">05 · Check your understanding</span>
          <h3 id="language-quiz-heading">Quick quiz</h3>
          <p>
            Choose one answer for each question. Your result stays here for this
            lesson only.
          </p>
        </div>
        {!finished ? (
          <div
            className="language-question"
            key={currentQuestion.id}
            data-testid="language-quiz-question"
          >
            <div className="language-quiz-progress">
              QUESTION {String(quiz.index + 1).padStart(2, "0")} /{" "}
              {String(languageQuestions.length).padStart(2, "0")}
            </div>
            <h4>{currentQuestion.prompt}</h4>
            <div
              className="language-answers"
              role="group"
              aria-label={`Answers for question ${quiz.index + 1}`}
            >
              {currentQuestion.choices.map((choice, index) => {
                const correct =
                  selectedAnswer && choice === currentQuestion.correct;
                const wrong =
                  selectedAnswer === choice &&
                  choice !== currentQuestion.correct;
                return (
                  <button
                    type="button"
                    key={choice}
                    className={`language-answer ${correct ? "correct" : ""} ${wrong ? "incorrect" : ""}`}
                    onClick={() => selectAnswer(choice)}
                    disabled={Boolean(selectedAnswer)}
                    aria-pressed={selectedAnswer === choice}
                    data-testid={`language-answer-${currentQuestion.id}-${index}`}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {choice}
                  </button>
                );
              })}
            </div>
            {selectedAnswer && (
              <div
                className={`feedback ${selectedAnswer === currentQuestion.correct ? "good" : "try-again"}`}
                role="status"
                data-testid="language-answer-feedback"
              >
                <strong>
                  {selectedAnswer === currentQuestion.correct
                    ? "That’s right."
                    : "Not quite."}
                </strong>
                {currentQuestion.explanation}
              </div>
            )}
            {selectedAnswer && (
              <button
                type="button"
                className="button button-primary language-next"
                onClick={() => setQuiz(advanceLanguageQuiz)}
                data-testid="button-language-next"
              >
                {quiz.index === languageQuestions.length - 1
                  ? "See final score"
                  : "Next question"}{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="language-result" data-testid="language-quiz-result">
            <span
              className="language-score"
              data-testid="text-language-quiz-score"
            >
              {scoreLanguageQuiz(quiz).correct} /{" "}
              {scoreLanguageQuiz(quiz).total}
            </span>
            <div>
              <h4>Practice round complete</h4>
              <p data-testid="text-language-quiz-final-score">
                {scoreLanguageQuiz(quiz).percentage}% correct. Review any missed
                answers below, then try again whenever you’re ready.
              </p>
            </div>
            <button
              className="button button-primary"
              type="button"
              onClick={resetQuiz}
              data-testid="button-language-quiz-retry"
            >
              <RotateCw size={15} /> Try again
            </button>
            <button
              className="button button-secondary"
              type="button"
              aria-expanded={reviewing}
              onClick={() => setReviewing((shown) => !shown)}
              data-testid="button-language-review"
            >
              {reviewing ? "Hide answer review" : "Review missed answers"}
            </button>
            {reviewing && (
              <div
                className="language-review"
                aria-label="Quiz answer review"
                data-testid="language-quiz-review"
              >
                {getLanguageQuizMisses(quiz).length ? (
                  getLanguageQuizMisses(quiz).map((item) => (
                    <article
                      key={item.id}
                      className="language-review-card"
                      data-testid={`language-review-${item.id}`}
                    >
                      <h5>{item.prompt}</h5>
                      <p>
                        <strong>Your answer:</strong>{" "}
                        {item.answer ?? "Not answered"}
                      </p>
                      <p>
                        <strong>Correct answer:</strong> {item.correct}
                      </p>
                      <p>{item.explanation}</p>
                    </article>
                  ))
                ) : (
                  <p
                    className="language-all-correct"
                    data-testid="text-language-all-correct"
                  >
                    Every answer was correct. There are no missed answers to
                    review.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" data-testid="link-brand-home">
          <span className="brand-mark">
            <Plane size={20} strokeWidth={2.4} />
          </span>
          <span>Young Pilot Journey</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${location === item.href ? "active" : ""}`}
              data-testid={`nav-${item.href.slice(1) || "home"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href="/story#support"
          className="header-support"
          data-testid="nav-support"
        >
          Support
        </a>
        <button
          className="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="button-menu"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        {menuOpen && (
          <nav className="mobile-drawer" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${location === item.href ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
                data-testid={`mobile-nav-${item.href.slice(1) || "home"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="footer">
        <span>Young Pilot Journey</span>
        <p>
          An educational study resource—not a substitute for official FAA
          materials or flight instruction.
        </p>
        <Link
          href="/contact"
          className="footer-contact-link"
          data-testid="link-footer-contact"
        >
          Contact &amp; feedback
        </Link>
        <p className="footer-copyright">
          © 2026 Young Pilot Journey. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function HomePage() {
  const completed = loadCompletedLessons();
  const scores = loadScores();
  const best = scores.length
    ? Math.max(...scores.map((score) => score.percentage))
    : null;
  return (
    <div className="page">
      <section className="hero" data-testid="section-home-hero">
        <div className="hero-copy">
          <span className="eyebrow">Your first flight starts here</span>
          <h1>
            Make Room
            <br />
            for <span className="gold-word">Takeoff</span>
          </h1>
          <p className="hero-tagline">Your Journey to a Career of a Lifetime</p>
          <p className="lead">
            Curious about flying? Learn the parts, ideas, and language pilots
            use—one clear concept at a time.
          </p>
          <div className="hero-cta">
            <Link
              href="/study"
              className="button button-primary"
              data-testid="link-start-studying"
            >
              Start Learning <ArrowRight size={16} />
            </Link>
            <Link
              href="/pathway"
              className="button button-secondary"
              data-testid="link-explore-pathway"
            >
              Explore the Pathway
            </Link>
          </div>
        </div>
        <div className="hero-art hero-art-home">
          <img
            src={homepagePilotsPhoto}
            alt="Two student pilots beside a training airplane"
          />
        </div>
      </section>
      <nav className="home-feature-strip" aria-label="Explore aviation learning">
        <Link href="/study" data-testid="home-feature-lessons">
          <BookOpen aria-hidden="true" />
          <span><strong>Interactive Lessons</strong><small>Learn real aviation concepts</small></span>
        </Link>
        <Link href="/flashcards" data-testid="home-feature-flashcards">
          <RotateCw aria-hidden="true" />
          <span><strong>Flashcards &amp; Quizzes</strong><small>Build your knowledge</small></span>
        </Link>
        <Link href="/pathway" data-testid="home-feature-pathway">
          <Plane aria-hidden="true" />
          <span><strong>Pilot Pathway</strong><small>See the steps to get certified</small></span>
        </Link>
        <Link href="/programs" data-testid="home-feature-stem">
          <FlaskConical aria-hidden="true" />
          <span><strong>STEM Opportunities</strong><small>Find youth programs and resources</small></span>
        </Link>
      </nav>
      <section className="dashboard-strip" aria-label="Your learning progress">
        <div className="dashboard-intro">
          <span className="eyebrow">Your flight log</span>
          <h2>Small steps count.</h2>
          <p>Your learning progress is saved on this device.</p>
        </div>
        <Link
          href="/progress"
          className="dashboard-stat"
          data-testid="home-completed-lessons"
        >
          <span
            className="stat-value"
            data-testid="text-home-completed-lessons"
          >
            {completed.length}
            <small> / {lessons.length}</small>
          </span>
          <span>lessons completed</span>
          <span className="mini-track">
            <i
              style={{ width: `${(completed.length / lessons.length) * 100}%` }}
            />
          </span>
        </Link>
        <Link
          href="/progress"
          className="dashboard-stat"
          data-testid="home-best-score"
        >
          <span className="stat-value" data-testid="text-home-best-score">
            {best === null ? "—" : `${best}%`}
          </span>
          <span>best quiz score</span>
          <span className="stat-caption">
            {scores.length
              ? `${scores.length} practice ${scores.length === 1 ? "round" : "rounds"}`
              : "Your first quiz awaits"}
          </span>
        </Link>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Pick up where curiosity leads</span>
          <h2>Build your pilot vocabulary</h2>
        </div>
        <p>Short, friendly lessons. Real aviation basics.</p>
      </div>
      <section className="learning-grid" aria-label="Learning destinations">
        <Link href="/study" className="learn-card" data-testid="card-study">
          <span className="learn-card-photo"><img src={enginePhoto} alt="" /></span>
          <span className="card-index">01 / EXPLORE</span>
          <span className="card-icon">
            <BookOpen size={19} />
          </span>
          <h3>Learn the fundamentals</h3>
          <p>
            Airplane parts, instruments, vocabulary, and the forces of flight.
          </p>
        </Link>
        <Link
          href="/flashcards"
          className="learn-card"
          data-testid="card-flashcards"
        >
          <span className="learn-card-photo"><img src={flashcardPhoto} alt="" /></span>
          <span className="card-index">02 / REMEMBER</span>
          <span className="card-icon">
            <RotateCw size={19} />
          </span>
          <h3>Flip through flashcards</h3>
          <p>
            Practice essential terms at your own pace. Shuffle when you’re
            ready.
          </p>
        </Link>
        <Link href="/quiz" className="learn-card learn-card-quiz" data-testid="card-quiz">
          <span className="learn-card-photo"><img src={cockpitPhoto} alt="" /></span>
          <span className="card-index">03 / CHECK IN</span>
          <span className="card-icon">
            <Compass size={19} />
          </span>
          <h3>Try a quick quiz</h3>
          <p>Seven short questions, with an explanation after every answer.</p>
        </Link>
        <Link href="/pathway" className="learn-card learn-card-pathway" data-testid="card-pathway">
          <span className="learn-card-photo"><img src={pathwaySunsetPhoto} alt="" /></span>
          <span className="card-index">04 / LOOK AHEAD</span>
          <span className="card-icon">
            <Plane size={19} />
          </span>
          <h3>Explore the pilot pathway</h3>
          <p>
            Get a general picture of the learning and training steps toward a
            certificate.
          </p>
        </Link>
      </section>
      <section
        className="home-story-section"
        aria-labelledby="home-amina-heading"
        data-testid="section-home-amina"
      >
        <AminaStoryCard placement="homepage" photoSrc={aminaPortrait} />
      </section>
      <section className="home-note">
        <div>
          <strong>There’s no rush to the runway.</strong>
          <p>
            Explore a possible pilot-certificate journey and see the broad
            steps. The right requirements depend on the certificate and your
            circumstances.
          </p>
        </div>
        <div className="home-note-actions">
          <Link
            href="/first-flight"
            className="button button-secondary"
            data-testid="link-play-first-flight"
          >
            <Plane size={15} /> Play Your First Flight
          </Link>
          <Link
            href="/pathway"
            className="button"
            data-testid="link-pathway-note"
          >
            See the general steps <ArrowRight size={15} />
          </Link>
          <Link
            href="/programs"
            className="button button-secondary"
            data-testid="link-programs-home"
          >
            Free flights &amp; STEM <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StudyPage() {
  const [selected, setSelected] = useState(() => {
    const requestedLessonId = new URLSearchParams(window.location.search).get(
      "lesson",
    );
    return lessons.some((item) => item.id === requestedLessonId)
      ? requestedLessonId!
      : lessons[0].id;
  });
  const [completed, setCompleted] = useState<string[]>(loadCompletedLessons);
  const lesson = lessons.find((item) => item.id === selected) || lessons[0];
  const isCompleted = completed.includes(lesson.id);
  const toggleCompleted = () => {
    const next = isCompleted
      ? completed.filter((id) => id !== lesson.id)
      : [...completed, lesson.id];
    setCompleted(next);
    saveCompletedLessons(next);
  };
  return (
    <div className="page">
      <div className="page-intro">
        <span className="eyebrow">Study guide · 5 short lessons</span>
        <h1>Start with the basics.</h1>
        <p className="lead">
          Get comfortable with the airplane, the panel, and the language pilots
          use.
        </p>
      </div>
      <Link
        href="/weather"
        className="study-weather-link"
        data-testid="link-study-weather"
      >
        <span>
          <strong>Aviation weather basics</strong>
          <small>
            Decode METAR wind, visibility, clouds, and storms, then take a short
            quiz.
          </small>
        </span>
        <ArrowRight size={18} />
      </Link>
      <div className="study-layout">
        <aside className="lesson-list" aria-label="Lessons">
          {lessons.map((item, index) => (
            <button
              key={item.id}
              className={`lesson-tab ${selected === item.id ? "active" : ""}`}
              onClick={() => setSelected(item.id)}
              aria-current={selected === item.id ? "step" : undefined}
              data-testid={`lesson-tab-${item.id}`}
            >
              <span>{item.topic}</span>
              <small>
                LESSON 0{index + 1}
                {completed.includes(item.id) ? " · COMPLETE" : ""}
              </small>
            </button>
          ))}
        </aside>
        <article
          className="lesson-content"
          data-testid={`lesson-content-${lesson.id}`}
        >
          <span className="eyebrow">{lesson.topic}</span>
          <h2>{lesson.title}</h2>
          <p>{lesson.body}</p>
          <button
            className={`completion-button ${isCompleted ? "is-complete" : ""}`}
            type="button"
            onClick={toggleCompleted}
            aria-pressed={isCompleted}
            data-testid={`button-complete-lesson-${lesson.id}`}
          >
            {isCompleted ? <CheckCircle2 size={18} /> : <Check size={18} />}{" "}
            {isCompleted ? "Lesson completed" : "Mark lesson complete"}
          </button>
          {lesson.id === "airplane-parts" && (
            <svg
              className="aircraft-diagram"
              viewBox="0 0 760 210"
              role="img"
              aria-label="Top-down diagram showing wings, fuselage, tail, and engine of a small airplane"
            >
              <rect
                x="20"
                y="18"
                width="720"
                height="174"
                rx="18"
                fill="#edf7fa"
              />
              <path
                d="M373 46c-7 0-10 7-11 18l-11 49-167 22v17l171-12 4 26h28l5-26 171 12v-17l-168-22-12-49c-2-12-5-18-10-18z"
                fill="#78b8ca"
                stroke="#377993"
                strokeWidth="3"
              />
              <path
                d="M362 154l-50 19 8 7 61-14m17-12 50 19-8 7-61-14"
                fill="#ecc775"
                stroke="#377993"
                strokeWidth="2"
              />
              <g fill="#385f72" fontSize="11" fontFamily="monospace">
                <text x="70" y="117">
                  WING
                </text>
                <text x="520" y="116">
                  FUSELAGE
                </text>
                <text x="328" y="185">
                  TAIL
                </text>
                <text x="385" y="42">
                  ENGINE
                </text>
              </g>
              <path
                d="M139 115h212m-70 52h42m61-126v17"
                stroke="#557f90"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          )}
          {lesson.id === "cockpit-instruments" && <CockpitDiagram />}
          {lesson.id === "pilot-language-radio" && <PilotLanguageLesson />}
          <div className="key-point" data-testid={`key-point-${lesson.id}`}>
            <strong>Keep in mind</strong>
            {lesson.keyPoint}
          </div>
          {isCompleted && (
            <LearningRecommendationCard
              recommendation={getLearningRecommendation(
                completed,
                loadScores(),
              )}
              onOpenLesson={setSelected}
            />
          )}
        </article>
      </div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}
      >
        <Link
          href="/flashcards"
          className="button button-primary"
          data-testid="link-study-flashcards"
        >
          Practice with flashcards <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function FlashcardsPage() {
  const [deckName, setDeckName] = useState<"basics" | "alphabet">("basics");
  const sourceDeck = deckName === "basics" ? flashcards : alphabetFlashcards;
  const [deck, setDeck] = useState(sourceDeck);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = deck[index];
  const switchDeck = (name: "basics" | "alphabet") => {
    setDeckName(name);
    setDeck(name === "basics" ? flashcards : alphabetFlashcards);
    setIndex(0);
    setRevealed(false);
  };
  const step = (direction: number) => {
    setIndex((current) => (current + direction + deck.length) % deck.length);
    setRevealed(false);
  };
  const shuffle = () => {
    const next = [...deck];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setDeck(next);
    setIndex(0);
    setRevealed(false);
  };
  return (
    <div className="page">
      <div className="page-intro">
        <span className="eyebrow">Practice · {deck.length} cards</span>
        <h1>One term at a time.</h1>
        <p className="lead">
          Read the front, make a guess, then turn it over. There’s no timer and
          no score.
        </p>
      </div>
      <section className="flashcard-wrap" aria-label="Flashcard practice">
        <div
          className="deck-switch"
          role="group"
          aria-label="Choose a flashcard deck"
          data-testid="flashcard-deck-switch"
        >
          <button
            type="button"
            className={`deck-option ${deckName === "basics" ? "active" : ""}`}
            aria-pressed={deckName === "basics"}
            onClick={() => switchDeck("basics")}
            data-testid="button-deck-basics"
          >
            Aviation basics <small>{flashcards.length} cards</small>
          </button>
          <button
            type="button"
            className={`deck-option ${deckName === "alphabet" ? "active" : ""}`}
            aria-pressed={deckName === "alphabet"}
            onClick={() => switchDeck("alphabet")}
            data-testid="button-deck-alphabet"
          >
            Aviation alphabet <small>{alphabetFlashcards.length} cards</small>
          </button>
        </div>
        <div className="flashcard-toolbar">
          <span data-testid="text-card-position">
            CARD {String(index + 1).padStart(2, "0")} /{" "}
            {String(deck.length).padStart(2, "0")}
          </span>
          <button
            className="button button-quiet"
            onClick={shuffle}
            data-testid="button-shuffle"
          >
            <Shuffle size={15} /> Shuffle deck
          </button>
        </div>
        <button
          className="flashcard"
          onClick={() => setRevealed(!revealed)}
          aria-label={
            revealed
              ? deckName === "alphabet"
                ? "Show letter"
                : "Show term"
              : deckName === "alphabet"
                ? "Reveal aviation word and pronunciation"
                : "Reveal definition"
          }
          data-testid="button-flip-card"
        >
          <span className="flashcard-label">
            {deckName === "alphabet"
              ? revealed
                ? "Aviation word · pronunciation"
                : "Letter"
              : revealed
                ? "Definition"
                : "Aviation term"}
          </span>
          <span className="flashcard-term" data-testid="text-flashcard-term">
            {card.term}
          </span>
          {revealed && (
            <span
              className="flashcard-definition"
              data-testid="text-flashcard-definition"
            >
              {card.definition}
            </span>
          )}
          <span className="flashcard-hint">
            {revealed
              ? deckName === "alphabet"
                ? "Tap to return to the letter"
                : "Tap to return to the term"
              : deckName === "alphabet"
                ? "Try to recall its aviation word"
                : "Tap to reveal the definition"}
          </span>
        </button>
        <div className="flashcard-actions">
          <button
            className="control-button"
            onClick={() => step(-1)}
            data-testid="button-previous-card"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          <button
            className="control-button"
            onClick={() => setRevealed(!revealed)}
            data-testid="button-reveal-card"
          >
            {revealed
              ? "Show term"
              : deckName === "alphabet"
                ? "Reveal word"
                : "Reveal"}
          </button>
          <button
            className="control-button"
            onClick={() => step(1)}
            data-testid="button-next-card"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

function QuizPage() {
  const [startingPractice] = useState(() => {
    const practiceQuestions = getQuestionsToPractice(loadScores());
    return {
      practiceQuestions,
      requested:
        new URLSearchParams(window.location.search).get("mode") === "missed" &&
        practiceQuestions.length > 0,
    };
  });
  const [practiceQuestions, setPracticeQuestions] = useState<QuizQuestion[]>(
    startingPractice.practiceQuestions,
  );
  const [isPracticingMissed, setIsPracticingMissed] = useState(
    startingPractice.requested,
  );
  const [fullRound, dispatchFull] = useReducer(
    quizRoundReducer,
    createInitialQuizRound(),
  );
  const [practiceRound, dispatchPractice] = useReducer(
    quizRoundReducer,
    createInitialQuizRound(),
  );
  const round = isPracticingMissed ? practiceRound : fullRound;
  const activeQuestions = isPracticingMissed ? practiceQuestions : questions;
  const dispatchRound = isPracticingMissed ? dispatchPractice : dispatchFull;
  const scoreRecorded = useRef(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const [currentScore, setCurrentScore] = useState<QuizScore | null>(null);
  const finished = round.questionIndex >= activeQuestions.length;
  const question =
    activeQuestions[
      Math.min(round.questionIndex, activeQuestions.length - 1)
    ] ?? questions[0];
  const selected = round.answers[question.id] ?? null;
  const result = calculateQuizScore(activeQuestions, round.answers);
  const review = buildQuizReview(activeQuestions, round.answers);
  const visibleReview = getVisibleQuizReview(review, round.reviewMode);
  const missedCount = review.filter((entry) => !entry.isCorrect).length;
  const storedScores = loadScores();
  const recommendationScores = currentScore
    ? [
        currentScore,
        ...storedScores.filter((score) => score.date !== currentScore.date),
      ]
    : storedScores;
  const quizRecommendation = getLearningRecommendation(
    loadCompletedLessons(),
    recommendationScores,
  );
  const choose = (choice: string) => {
    if (selected) return;
    dispatchRound({ type: "answer", questionId: question.id, answer: choice });
  };
  const startMissedPractice = () => {
    const missedQuestions = questions.filter(
      (item) => fullRound.answers[item.id] !== item.correctAnswer,
    );
    if (missedQuestions.length === 0) return;
    setPracticeQuestions(missedQuestions);
    dispatchPractice({ type: "retry" });
    setIsPracticingMissed(true);
  };
  const advance = () => {
    if (!selected) return;
    const isLastQuestion = round.questionIndex === activeQuestions.length - 1;
    if (isLastQuestion && !isPracticingMissed && !scoreRecorded.current) {
      scoreRecorded.current = true;
      const score: QuizScore = {
        date: new Date().toISOString(),
        ...result,
        missedQuestionIds: questions
          .filter((item) => fullRound.answers[item.id] !== item.correctAnswer)
          .map((item) => item.id),
      };
      setCurrentScore(score);
      setStorageNotice(!saveScore(score));
    }
    dispatchRound({
      type: "advance",
      questionId: question.id,
      questionCount: activeQuestions.length,
    });
  };
  const retry = () => {
    setStorageNotice(false);
    if (isPracticingMissed) {
      dispatchPractice({ type: "retry" });
      return;
    }
    scoreRecorded.current = false;
    setCurrentScore(null);
    dispatchFull({ type: "retry" });
  };
  return (
    <div className="page">
      <div className="page-intro">
        <span className="eyebrow">Knowledge check · no pressure</span>
        <h1>See what’s sticking.</h1>
        <p className="lead">
          Choose the best answer. You’ll get a useful explanation either way.
        </p>
      </div>
      <section className="quiz-panel" data-testid="quiz-panel">
        {!finished ? (
          <>
            {isPracticingMissed && (
              <p
                className="practice-context"
                data-testid="missed-practice-note"
              >
                <strong>Focused practice:</strong> this round uses questions
                missed on your latest full quiz. Its score won’t be added to
                full-quiz history.
              </p>
            )}
            <div className="quiz-topline">
              <span data-testid="text-quiz-question">
                QUESTION {String(round.questionIndex + 1).padStart(2, "0")} /{" "}
                {String(activeQuestions.length).padStart(2, "0")}
              </span>
              <span data-testid="text-correct-so-far">
                {result.correct} correct so far
              </span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={round.questionIndex}
              aria-valuemin={0}
              aria-valuemax={activeQuestions.length}
            >
              <div
                className="progress-fill"
                style={{
                  width: `${(round.questionIndex / activeQuestions.length) * 100}%`,
                }}
              />
            </div>
            <div className="quiz-card">
              <span className="eyebrow">
                {isPracticingMissed
                  ? "Practice a missed answer"
                  : "Think it through"}
              </span>
              <h2>{question.prompt}</h2>
              <div className="answer-list">
                {question.choices.map((choice, index) => {
                  const isCorrect =
                    selected && choice === question.correctAnswer;
                  const isWrong =
                    selected === choice && choice !== question.correctAnswer;
                  return (
                    <button
                      key={choice}
                      className={`answer-option ${isCorrect ? "correct" : ""} ${isWrong ? "incorrect" : ""} ${selected === choice ? "selected" : ""}`}
                      onClick={() => choose(choice)}
                      disabled={Boolean(selected)}
                      data-testid={`answer-choice-${question.id}-${index}`}
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{choice}</span>
                      {isCorrect && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <div
                  className={`feedback ${selected === question.correctAnswer ? "good" : "try-again"}`}
                  role="status"
                  data-testid="quiz-answer-feedback"
                >
                  <strong>
                    {selected === question.correctAnswer
                      ? "That’s right."
                      : "Not quite—and now you know."}
                  </strong>
                  {question.explanation}
                </div>
              )}
              <div className="quiz-footer">
                <span style={{ color: "#80939e", fontSize: 12 }}>
                  {selected
                    ? "Answer recorded for this round"
                    : "Select one answer to continue"}
                </span>
                {selected && (
                  <button
                    className="button button-primary"
                    onClick={advance}
                    data-testid="button-next-question"
                  >
                    {round.questionIndex === activeQuestions.length - 1
                      ? "See my result"
                      : "Next question"}{" "}
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div data-testid="quiz-complete">
            <div className="quiz-card">
              <div className="score-hero">
                <div className="score-number" data-testid="text-quiz-score">
                  {result.percentage}%
                </div>
                <div>
                  <span className="eyebrow">
                    {isPracticingMissed
                      ? "Focused practice complete"
                      : "Round complete"}
                  </span>
                  <h2 style={{ fontSize: 29, margin: "9px 0 0" }}>
                    {isPracticingMissed
                      ? "Good work reviewing."
                      : "Good work showing up."}
                  </h2>
                  <p data-testid="text-quiz-result-count">
                    You answered {result.correct} out of {result.total}{" "}
                    correctly. Every explanation is another piece of the
                    picture.
                  </p>
                </div>
              </div>
              {storageNotice && (
                <p className="key-point" role="status">
                  Your result is shown here, but this browser couldn’t save it
                  for later.
                </p>
              )}
              {isPracticingMissed && (
                <p
                  className="practice-context"
                  data-testid="practice-score-not-saved"
                >
                  Focused practice is for review only; it does not change your
                  saved full-quiz history.
                </p>
              )}
              <div className="quiz-result-actions">
                {!isPracticingMissed ? (
                  <>
                    <button
                      className="button button-primary"
                      onClick={retry}
                      data-testid="button-retry-quiz"
                    >
                      <RotateCw size={15} /> Try again
                    </button>
                    {missedCount > 0 && (
                      <button
                        className="button button-secondary"
                        onClick={startMissedPractice}
                        data-testid="button-practice-missed"
                      >
                        <BookOpen size={15} /> Practice missed questions
                      </button>
                    )}
                    <Link
                      href="/progress"
                      className="button button-secondary"
                      data-testid="link-view-progress"
                    >
                      View saved progress
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      className="button button-primary"
                      onClick={retry}
                      data-testid="button-retry-missed-quiz"
                    >
                      <RotateCw size={15} /> Practice these again
                    </button>
                    <Link
                      href="/quiz"
                      className="button button-secondary"
                      onClick={() => setIsPracticingMissed(false)}
                      data-testid="button-return-full-quiz"
                    >
                      Return to full quiz
                    </Link>
                  </>
                )}
              </div>
            </div>
            {!isPracticingMissed && (
              <LearningRecommendationCard
                recommendation={quizRecommendation}
                onAction={
                  quizRecommendation.kind === "practice"
                    ? startMissedPractice
                    : undefined
                }
              />
            )}
            <section
              className="quiz-review"
              aria-labelledby="quiz-review-title"
              data-testid="quiz-review"
            >
              <div className="quiz-review-header">
                <div>
                  <span className="eyebrow">Learn from every answer</span>
                  <h2 id="quiz-review-title">
                    {isPracticingMissed
                      ? "Review your practice round"
                      : "Review your answers"}
                  </h2>
                </div>
                <div
                  className="review-filters"
                  role="group"
                  aria-label="Choose which answers to review"
                >
                  <button
                    className={`review-filter ${round.reviewMode === "all" ? "active" : ""}`}
                    aria-pressed={round.reviewMode === "all"}
                    onClick={() =>
                      dispatchRound({ type: "set-review-mode", mode: "all" })
                    }
                    data-testid="button-review-all"
                  >
                    All questions
                  </button>
                  <button
                    className={`review-filter ${round.reviewMode === "missed" ? "active" : ""}`}
                    aria-pressed={round.reviewMode === "missed"}
                    onClick={() =>
                      dispatchRound({ type: "set-review-mode", mode: "missed" })
                    }
                    data-testid="button-review-missed"
                  >
                    Review missed questions <span>{missedCount}</span>
                  </button>
                </div>
              </div>
              {visibleReview.length ? (
                <div className="review-list">
                  {visibleReview.map((entry) => (
                    <article
                      className={`review-card ${entry.isCorrect ? "review-correct" : "review-missed"}`}
                      key={entry.questionId}
                      data-testid={`review-question-${entry.questionId}`}
                    >
                      <div className="review-question-meta">
                        <span>
                          QUESTION{" "}
                          {String(entry.questionNumber).padStart(2, "0")}
                        </span>
                        <span>
                          {entry.isCorrect ? "Correct" : "Review this answer"}
                        </span>
                      </div>
                      <h3>{entry.prompt}</h3>
                      <div className="review-answers">
                        <p>
                          <strong>Your answer</strong>
                          <span>{entry.studentAnswer ?? "Not answered"}</span>
                        </p>
                        <p>
                          <strong>Correct answer</strong>
                          <span
                            data-testid={`review-correct-answer-${entry.questionId}`}
                          >
                            {entry.correctAnswer}
                          </span>
                        </p>
                      </div>
                      <p className="review-explanation">
                        <strong>Why:</strong> {entry.explanation}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="review-empty" data-testid="review-no-missed">
                  <Check size={20} />
                  <p>
                    <strong>No missed questions this round.</strong>
                    <span>
                      You got every answer right. Use “All questions” to review
                      the explanations.
                    </span>
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

const pathwaySteps = [
  {
    title: "Build aviation basics",
    tag: "START HERE",
    body: "Learn how aircraft parts, instruments, weather, and the four forces of flight fit together. The FAA Pilot’s Handbook of Aeronautical Knowledge is an official reference for continued study.",
    href: "/study",
    actionLabel: "Open beginner lessons",
    external: false,
  },
  {
    title: "Explore ground school",
    tag: "STUDY",
    body: "Ground school organizes topics such as aerodynamics, weather, navigation, regulations, and safe decision-making. Students can begin learning these ideas before flight training; course formats and requirements vary.",
    href: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak",
    actionLabel: "Open the FAA Pilot’s Handbook of Aeronautical Knowledge",
    external: true,
  },
  {
    title: "Learn about the student pilot certificate",
    tag: "BEFORE SOLO",
    body: "The FAA says a student pilot certificate is needed before flying solo, but not simply to take flying lessons. For the certificate, FAA eligibility starts at age 16 for powered aircraft and 14 for gliders or balloons, and includes being able to read, speak, and understand English.",
    href: "https://www.faa.gov/pilots/become/student_cert",
    actionLabel: "Read FAA student pilot certificate guidance",
    external: true,
  },
  {
    title: "Understand medical eligibility",
    tag: "CHECK EARLY",
    body: "A student pilot certificate and an aviation medical certificate are separate. Whether a medical certificate is needed, and which requirements apply, depends on the certificate and type of flying. Review current FAA guidance and ask an Aviation Medical Examiner about personal medical questions.",
    href: "https://www.faa.gov/pilots/medical_certification",
    actionLabel: "Read FAA medical certification guidance",
    external: true,
  },
  {
    title: "Train with a flight instructor",
    tag: "FLIGHT TRAINING",
    body: "A certificated flight instructor guides ground and in-air practice. Before a student may fly solo, the instructor must check required knowledge and preparation and make the applicable logbook endorsements.",
    href: "https://www.faa.gov/pilots/become/student_training",
    actionLabel: "Read FAA student training and solo guidance",
    external: true,
  },
  {
    title: "Prepare for FAA tests",
    tag: "KNOWLEDGE + SKILLS",
    body: "Depending on the certificate sought, applicants may need to pass an FAA knowledge test and a practical test with an examiner. Eligibility, experience, test content, and privileges vary by certificate and circumstances.",
    href: "https://www.faa.gov/pilots/become",
    actionLabel: "Review FAA certificate, training, and test requirements",
    external: true,
  },
];

function PathwayPage() {
  return (
    <div className="page">
      <div className="page-intro">
        <span className="eyebrow">A map, not a checklist</span>
        <h1>A possible path to the pilot seat.</h1>
        <p className="lead">
          Here’s a general view of how someone might explore a pilot certificate
          journey in the United States.
        </p>
      </div>
      <section className="pathway" aria-label="General pilot certificate steps">
        {pathwaySteps.map((step, index) => (
          <article
            className="path-step"
            key={step.title}
            data-testid={`pathway-step-${index + 1}`}
          >
            <span className="step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            {step.external ? (
              <a
                className="step-tag step-tag-link"
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                title={step.actionLabel}
                aria-label={`${step.tag}: ${step.actionLabel}; opens in a new tab`}
                data-testid={`pathway-step-action-${index + 1}`}
              >
                {step.tag}
                <ExternalLink size={11} aria-hidden="true" />
              </a>
            ) : (
              <Link
                className="step-tag step-tag-link"
                href={step.href}
                title={step.actionLabel}
                aria-label={`${step.tag}: ${step.actionLabel}`}
                data-testid={`pathway-step-action-${index + 1}`}
              >
                {step.tag}
                <ArrowRight size={11} aria-hidden="true" />
              </Link>
            )}
          </article>
        ))}
      </section>
      <aside className="disclaimer" data-testid="notice-faa-requirements">
        <strong>
          Important: this is general education, not official guidance.
        </strong>{" "}
        FAA requirements vary by certificate and circumstances, and rules can
        change. Age, eligibility, medical certification, training, tests, and
        other details depend on the certificate sought. Confirm current
        requirements with the FAA and a qualified flight instructor or Aviation
        Medical Examiner when appropriate.
      </aside>
      <section
        className="pathway-resources"
        aria-labelledby="pathway-resources-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">Official references</span>
            <h2 id="pathway-resources-title">Check the current FAA guidance</h2>
          </div>
        </div>
        <div className="program-resource-grid pathway-resource-grid">
          <OfficialResourceLink
            href="https://www.faa.gov/pilots/become"
            title="FAA: Become a Pilot"
            description="Compare general eligibility, training, and testing information for pilot certificates."
            testId="pathway-link-faa-become"
            icon={<Plane size={18} />}
          />
          <OfficialResourceLink
            href="https://www.faa.gov/pilots/become/student_cert"
            title="FAA: Student Pilot Certificate"
            description="Read when a student certificate is required and the current eligibility and application steps."
            testId="pathway-link-student-certificate"
            icon={<GraduationCap size={18} />}
          />
          <OfficialResourceLink
            href="https://www.faa.gov/pilots/become/student_training"
            title="FAA: Student Pilot Training and Limits"
            description="Review FAA information about preparation and instructor endorsements before solo."
            testId="pathway-link-student-training"
            icon={<BookOpen size={18} />}
          />
          <OfficialResourceLink
            href="https://www.faa.gov/pilots/medical_certification"
            title="FAA: Medical Certification"
            description="Find official medical certification information and Aviation Medical Examiner resources."
            testId="pathway-link-medical"
            icon={<CheckCircle2 size={18} />}
          />
          <OfficialResourceLink
            href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak"
            title="FAA: Pilot’s Handbook of Aeronautical Knowledge"
            description="Read an official FAA handbook covering core aeronautical knowledge."
            testId="pathway-link-phak"
            icon={<BookOpen size={18} />}
          />
        </div>
      </section>
      <div style={{ marginTop: 23 }}>
        <Link
          href="/study"
          className="button button-primary"
          data-testid="link-pathway-study"
        >
          Build your aviation basics <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

type OfficialResourceLinkProps = {
  href: string;
  title: string;
  description: string;
  testId: string;
  icon: ReactNode;
};

function OfficialResourceLink({
  href,
  title,
  description,
  testId,
  icon,
}: OfficialResourceLinkProps) {
  return (
    <a
      className="program-resource-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title}, opens in a new tab`}
      data-testid={testId}
    >
      <span className="program-resource-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="program-resource-copy">
        <strong>{title}</strong>
        <span>{description}</span>
        <small>Official resource · opens in a new tab</small>
      </span>
      <ExternalLink
        size={16}
        className="program-resource-external"
        aria-hidden="true"
      />
    </a>
  );
}

function ProgramsPage() {
  return (
    <div className="page programs-page">
      <div className="page-intro">
        <span className="eyebrow">Beyond the classroom</span>
        <h1>Free Flights &amp; Aviation STEM Programs</h1>
        <p className="lead">
          Explore an introductory flight and official learning resources that
          connect aviation with science, technology, engineering, and math.
        </p>
        <p className="programs-explore-link">
          <Link
            href="/explore-aviation"
            data-testid="link-programs-explore-aviation"
          >
            Looking for Maryland schools, degrees, and flight training? Explore
            Aviation Programs <ArrowRight size={14} />
          </Link>
        </p>
      </div>

      <section
        className="program-section"
        aria-labelledby="young-eagles-heading"
        data-testid="program-eaa-young-eagles"
      >
        <div className="program-section-heading">
          <span className="program-section-icon">
            <Plane size={22} />
          </span>
          <div>
            <span className="eyebrow">An introduction to flying</span>
            <h2 id="young-eagles-heading">EAA Young Eagles Flight Program</h2>
          </div>
        </div>
        <p className="program-description">
          Eligible youth ages 8–17 may receive a free introductory flight with
          an EAA volunteer pilot. Flight availability and arrangements depend on
          participating local chapters and volunteers.
        </p>
        <div className="program-callout" role="note">
          <strong>A first-flight experience, not flight training</strong>
          <p>
            A Young Eagles flight is an introduction to aviation—not flight
            instruction or a lesson toward a pilot certificate. It does not earn
            a certificate.
          </p>
        </div>
        <h3 className="program-subheading">
          Learn about flights and local events
        </h3>
        <p className="program-description">
          Students and parents can read EAA’s program information, use the Find
          a Flight page to register or contact a nearby Young Eagles
          coordinator, and check the official event calendar for local
          opportunities. Parents can also review EAA’s family information before
          making plans.
        </p>
        <div
          className="program-resource-grid"
          aria-label="Official Young Eagles links"
        >
          <OfficialResourceLink
            href="https://www.eaa.org/eaa/youth/free-ye-flights"
            title="Young Eagles program information"
            description="Read about the program and introductory flights for youth."
            testId="program-link-eaa-overview"
            icon={<Plane size={18} />}
          />
          <OfficialResourceLink
            href="https://www.eaa.org/eaa/youth/free-ye-flights/become-a-young-eagle"
            title="Find a flight or local coordinator"
            description="Use EAA’s flight request and local chapter information."
            testId="program-link-eaa-flights"
            icon={<Compass size={18} />}
          />
          <OfficialResourceLink
            href="https://www.eaa.org/eaa/youth/free-ye-flights/young-eagles-schedule"
            title="Young Eagles event calendar"
            description="Look for participating chapter events and rallies."
            testId="program-link-eaa-events"
            icon={<BookOpen size={18} />}
          />
          <OfficialResourceLink
            href="https://www.eaa.org/eaa/youth/free-ye-flights/EAA-Young-Eagles-Information-for-Parents"
            title="Information for parents"
            description="Review EAA’s parent-focused information and FAQs."
            testId="program-link-eaa-parents"
            icon={<CheckCircle2 size={18} />}
          />
        </div>
      </section>

      <section
        className="program-section"
        aria-labelledby="aviation-stem-heading"
        data-testid="program-aviation-stem"
      >
        <div className="program-section-heading">
          <span className="program-section-icon program-section-icon-gold">
            <FlaskConical size={22} />
          </span>
          <div>
            <span className="eyebrow">Learn · build · explore</span>
            <h2 id="aviation-stem-heading">Aviation STEM Programs</h2>
          </div>
        </div>
        <p className="program-description">
          Aviation brings STEM to life: science helps explain lift, weather, and
          propulsion; math supports navigation and planning; engineering and
          technology shape aircraft, instruments, and airspace systems. These
          skills can support pilot decision-making and connect to many aviation
          careers, including aircraft design and maintenance, air traffic, and
          aerospace technology.
        </p>
        <p className="program-description">
          Explore official student resources for activities, experiments,
          projects, and aerospace learning. Offerings can vary by age, location,
          schedule, and availability, so check each organization’s current
          information. These links are starting points, not a promise of
          enrollment or free benefits.
        </p>
        <div
          className="program-resource-grid stem-resource-grid"
          aria-label="Official aviation STEM learning resources"
        >
          <OfficialResourceLink
            href="https://www.faa.gov/education/students"
            title="FAA STEM and aviation careers"
            description="Explore FAA STEM AVSED resources and aviation career connections."
            testId="program-link-faa-students"
            icon={<Plane size={18} />}
          />
          <OfficialResourceLink
            href="https://www.faa.gov/education/students/activities/highschool"
            title="FAA high-school STEM activities"
            description="Find grade-level aviation projects, puzzles, and hands-on experiments."
            testId="program-link-faa-activities"
            icon={<BookOpen size={18} />}
          />
          <OfficialResourceLink
            href="https://www.nasa.gov/learning-resources/nasa-stem-opportunities-activities/"
            title="NASA STEM opportunities and activities"
            description="Browse student learning resources related to aerospace, engineering, science, and technology."
            testId="program-link-nasa-stem"
            icon={<FlaskConical size={18} />}
          />
        </div>
      </section>
    </div>
  );
}

function AminaStoryPage() {
  return (
    <div className="page amina-story-page">
      <div className="page-intro">
        <span className="eyebrow">A student perspective</span>
        <h1>Meet Amina: The Student Behind the App</h1>
        <p className="lead">
          Amina shares why she created a welcoming place for young people to
          begin exploring aviation.
        </p>
      </div>
      <AminaStoryCard placement="story" photoSrc={aminaPortrait} />
      <section
        className="amina-full-story"
        aria-labelledby="amina-full-story-title"
        data-testid="section-amina-full-story"
      >
        <div className="amina-full-story-head">
          <span className="eyebrow">In Amina’s words</span>
          <h2 id="amina-full-story-title">How Young Pilot Journey took off</h2>
        </div>
        <ol className="amina-story-chapters">
          {aminaFullStory.map((chapter, index) => (
            <li key={chapter.label} data-testid={`story-chapter-${index + 1}`}>
              <span className="amina-chapter-num">0{index + 1}</span>
              <div>
                <h3>{chapter.label}</h3>
                <p>{chapter.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <figure
          className="amina-story-additional-photo"
          data-testid="story-additional-photo"
        >
          <img
            src={aminaFlightSuitSunsetPhoto}
            alt="Amina wearing a navy-blue flight suit beside an airplane at sunset"
            width={1024}
            height={1024}
            loading="eager"
            decoding="async"
          />
          <figcaption>Amina’s aviation journey at sunset</figcaption>
        </figure>
      </section>
      <section
        className="amina-mission"
        aria-labelledby="amina-mission-title"
        data-testid="section-mission"
      >
        <div>
          <span className="eyebrow">Our mission</span>
          <h2 id="amina-mission-title">
            Make aviation approachable for the next generation of pilots.
          </h2>
        </div>
        <ul>
          {missionPoints.map((point) => (
            <li key={point}>
              <Check size={15} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </section>
      <section
        className="amina-fundraising"
        id="support"
        aria-labelledby="fundraising-title"
        data-testid="section-fundraising"
      >
        <div className="amina-fundraising-copy">
          <span className="eyebrow">Support</span>
          <h2 id="fundraising-title">HELP KEEP YOUNG PILOT JOURNEY FLYING</h2>
          <p>
            Support helps Amina continue pursuing her aviation goals and helps
            make aviation education and resources more accessible to young
            students.
          </p>
          <p className="amina-fundraising-note">
            {GOFUNDME_URL
              ? "The button opens Amina’s official fundraiser on GoFundMe, an external site."
              : "Once the official fundraiser link is configured, this section will direct visitors to GoFundMe."}{" "}
            This app does not process payments or collect financial information.
          </p>
        </div>
        <div className="amina-fundraising-action">
          {GOFUNDME_URL ? (
            <a
              className="button button-primary"
              href={GOFUNDME_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-gofundme"
            >
              Support Amina’s Journey on GoFundMe{" "}
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <>
              <button
                type="button"
                className="button button-primary"
                disabled
                aria-describedby="gofundme-status"
                data-testid="button-gofundme-disabled"
              >
                Support Amina’s Journey on GoFundMe
              </button>
              <small id="gofundme-status" data-testid="text-gofundme-status">
                Awaiting configuration: the official fundraiser link has not
                been added yet.
              </small>
            </>
          )}
        </div>
      </section>
      <section
        className="amina-youtube-callout"
        aria-labelledby="amina-youtube-title"
        data-testid="section-amina-youtube"
      >
        <div className="amina-youtube-copy">
          <span className="eyebrow">Journey into Amina’s World</span>
          <h2 id="amina-youtube-title">Follow Amina’s Aviation Journey</h2>
          <p>
            Follow Amina as she learns about aviation and works toward her dream
            of becoming a pilot.
          </p>
        </div>
        <a
          className="amina-youtube-link"
          href="https://youtube.com/@journeyintoaminasworld?si=bGcvZXSEJcRbHCdv"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-amina-youtube"
        >
          Watch Amina’s Journey on YouTube{" "}
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}

function AminaStoryCard({
  placement,
  photoSrc,
}: {
  placement: "homepage" | "story";
  photoSrc?: string;
}) {
  return (
    <section
      className={`amina-story-card ${placement === "homepage" ? "amina-story-card-home" : ""}`}
      aria-label="Amina's story"
      data-testid={
        placement === "homepage"
          ? "home-amina-story-card"
          : "section-amina-story"
      }
    >
      {photoSrc ? (
        <AminaPhoto defaultSrc={photoSrc} />
      ) : (
        <aside
          className="amina-photo-placeholder"
          aria-label="Optional photo area for Amina"
          data-testid="story-photo-placeholder"
        >
          <span className="amina-photo-icon">
            <UserRound size={42} />
          </span>
          <strong>Optional photo area</strong>
        </aside>
      )}
      <div className="amina-story-copy">
        <span className="eyebrow">
          {placement === "homepage" ? "Student perspective" : "Meet Amina"}
        </span>
        {(placement === "homepage"
          ? [aminaStoryParagraphs[0]]
          : aminaStoryParagraphs
        ).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <h2 id={placement === "homepage" ? "home-amina-heading" : undefined}>
          {placement === "homepage"
            ? "Meet Amina: The Student Behind the App"
            : "Make Room for Takeoff!"}
        </h2>
        <div className="amina-story-actions">
          {placement === "homepage" ? (
            <>
              <Link
                href="/story"
                className="button button-primary"
                data-testid="link-home-meet-amina"
              >
                Meet Amina <ArrowRight size={15} />
              </Link>
              <Link
                href="/study"
                className="button button-secondary"
                data-testid="link-home-story-study"
              >
                Explore the lessons
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/study"
                className="button button-primary"
                data-testid="link-story-study"
              >
                Explore the lessons <ArrowRight size={15} />
              </Link>
              <Link
                href="/programs"
                className="button button-secondary"
                data-testid="link-story-programs"
              >
                Explore programs
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <div className="page contact-page" data-testid="contact-page">
      <div className="page-intro">
        <span className="eyebrow">Questions, problems, or ideas?</span>
        <h1>Contact &amp; Feedback</h1>
        <p className="lead">
          We want Young Pilot Journey to be clear and useful for students. Open
          a topic below for quick answers, study links, and what to note down so
          your feedback is ready to share.
        </p>
      </div>
      <ContactTopics />
      <aside
        className="contact-method-placeholder"
        aria-labelledby="contact-method-heading"
        data-testid="contact-method-placeholder"
      >
        <span className="contact-placeholder-icon" aria-hidden="true">
          <MessageSquare size={23} />
        </span>
        <div>
          <span className="eyebrow">Contact method not configured</span>
          <h2 id="contact-method-heading">Messages are not being collected</h2>
          <p>
            A monitored contact email or form has not been set up yet, so this
            page does not send or store messages. Nothing you type here goes
            anywhere.
          </p>
          <p className="contact-placeholder-instruction">
            For now, use the topics above to find answers, and keep notes on any
            problem or idea. Amina’s YouTube channel is for following her
            journey and is not a contact method.
          </p>
        </div>
      </aside>
      <p className="contact-privacy-note">
        Please don’t share passwords, private contact details, or other
        sensitive information in feedback. If you’re under 18, ask a parent or
        guardian before using a public contact method added later.
      </p>
    </div>
  );
}

function ProgressPage() {
  const [scores, setScores] = useState(() => loadScores());
  const firstFlightProgress = loadFirstFlightProgress();
  const completed = loadCompletedLessons();
  const best = scores.length
    ? Math.max(...scores.map((score) => score.percentage))
    : 0;
  const average = scores.length
    ? Math.round(
        scores.reduce((total, score) => total + score.percentage, 0) /
          scores.length,
      )
    : 0;
  const latest = scores[0];
  const scoreChange =
    scores.length > 1 ? scores[0].percentage - scores[1].percentage : null;
  const reviewAreas = getAreasToReview(scores);
  const practiceQuestions = getQuestionsToPractice(scores);
  const recommendation = getLearningRecommendation(completed, scores);
  const clearScores = () => {
    try {
      localStorage.removeItem("young-pilot-scores");
    } catch {
      /* No storage access; keep current display unchanged. */
    }
    setScores([]);
  };
  return (
    <div className="page">
      <div className="page-intro">
        <span className="eyebrow">Your study log · stays on this device</span>
        <h1>My Aviation Journey</h1>
        <p className="lead">
          Track completed lessons, quiz results, topics to review, and a
          suggested next step. Progress stays in this browser—no account needed.
        </p>
      </div>
      <section
        className="completion-overview"
        aria-labelledby="completion-heading"
        data-testid="progress-lessons"
      >
        <div className="completion-copy">
          <span className="eyebrow">Learning milestones</span>
          <h2 id="completion-heading">Lessons completed</h2>
          <p data-testid="text-completed-lessons">
            {completed.length} of {lessons.length} lessons marked complete
          </p>
        </div>
        <div className="completion-meter">
          <strong data-testid="text-completed-lessons-count">
            {completed.length}
            <span> / {lessons.length}</span>
          </strong>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Lessons completed"
            aria-valuenow={completed.length}
            aria-valuemin={0}
            aria-valuemax={lessons.length}
          >
            <div
              className="progress-fill"
              style={{ width: `${(completed.length / lessons.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="completion-list">
          {lessons.map((lesson) => (
            <div
              className={`completion-item ${completed.includes(lesson.id) ? "done" : ""}`}
              key={lesson.id}
              data-testid={`lesson-progress-${lesson.id}`}
            >
              <span className="completion-check">
                {completed.includes(lesson.id) ? (
                  <Check size={14} />
                ) : (
                  lesson.topic.slice(0, 1)
                )}
              </span>
              <span>{lesson.topic}</span>
              <span>
                {completed.includes(lesson.id) ? "Complete" : "Not yet"}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section
        className="first-flight-progress-panel"
        aria-labelledby="first-flight-progress-title"
        data-testid="progress-first-flight"
      >
        <div className="first-flight-progress-copy">
          <span className="eyebrow">Interactive game</span>
          <h2 id="first-flight-progress-title">Your First Flight</h2>
          <p>
            {firstFlightProgress.completedRuns
              ? `${firstFlightProgress.completedRuns} completed game${firstFlightProgress.completedRuns === 1 ? "" : "s"} · best score ${firstFlightProgress.bestPercentage}%`
              : "Your game completions and best score will be saved on this device."}
          </p>
          <strong
            className={`first-flight-progress-badge ${firstFlightProgress.completedRuns ? "earned" : ""}`}
            data-testid="text-first-flight-badge-status"
          >
            {firstFlightProgress.completedRuns
              ? "First Flight badge earned"
              : "Badge not earned yet"}
          </strong>
        </div>
        <div className="first-flight-progress-score">
          <span>Best score</span>
          <strong data-testid="text-first-flight-best-score">
            {firstFlightProgress.completedRuns
              ? `${firstFlightProgress.bestPercentage}%`
              : "—"}
          </strong>
          <small data-testid="text-first-flight-best-points">
            {firstFlightProgress.completedRuns
              ? `${firstFlightProgress.bestPoints} / ${FIRST_FLIGHT_MAX_POINTS} points`
              : "Complete a game to start"}
          </small>
        </div>
        <Link
          href="/first-flight"
          className="button button-primary"
          data-testid="link-progress-first-flight"
        >
          {firstFlightProgress.completedRuns
            ? "Play again"
            : "Play Your First Flight"}{" "}
          <ArrowRight size={15} />
        </Link>
      </section>
      <section
        className="journey-guidance-grid"
        aria-label="Personalized next steps and review topics"
        data-testid="journey-guidance"
      >
        <LearningRecommendationCard recommendation={recommendation} />
        <section
          className="review-areas-card"
          aria-labelledby="review-areas-title"
          data-testid="progress-review-areas"
        >
          <div className="review-areas-heading">
            <span className="eyebrow">Focused revision</span>
            <h2 id="review-areas-title">Areas to review</h2>
          </div>
          {reviewAreas.length ? (
            <div className="review-area-list">
              {reviewAreas.map((area) => (
                <Link
                  href={`/study?lesson=${area.lessonId}`}
                  className="review-area-link"
                  key={area.lessonId}
                  data-testid={`link-review-area-${area.lessonId}`}
                >
                  <span>
                    <strong>{area.topic}</strong>
                    <small>
                      {area.missedQuestionCount} question
                      {area.missedQuestionCount === 1 ? "" : "s"} to revisit
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ))}
              {practiceQuestions.length > 0 && (
                <Link
                  href="/quiz?mode=missed"
                  className="review-practice-link"
                  data-testid="link-progress-practice-missed"
                >
                  <BookOpen size={16} /> Practice {practiceQuestions.length}{" "}
                  missed question{practiceQuestions.length === 1 ? "" : "s"}{" "}
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          ) : (
            <p
              className="review-areas-empty"
              data-testid="text-no-review-areas"
            >
              {latest && latest.percentage < 100
                ? "This earlier quiz result does not include question-level details. Take a new quiz to get specific review topics."
                : latest
                  ? "No missed topics from your latest full quiz. Keep going with your next lesson or take another knowledge check."
                  : "Review topics will appear here after a full quiz identifies questions to revisit."}
            </p>
          )}
        </section>
      </section>
      {scores.length ? (
        <section data-testid="progress-content">
          <div className="score-hero">
            <div className="score-number" data-testid="text-best-score">
              {best}%
            </div>
            <div>
              <span className="eyebrow">Best full-quiz result</span>
              <h2 style={{ fontSize: 27, margin: "8px 0 0" }}>
                Each round builds a little more confidence.
              </h2>
              <p>
                {scores.length} {scores.length === 1 ? "round" : "rounds"}{" "}
                completed · {average}% average
              </p>
              {scoreChange !== null && (
                <p
                  className={`score-trend ${scoreChange > 0 ? "improved" : scoreChange < 0 ? "lower" : ""}`}
                  data-testid="text-score-trend"
                >
                  {scoreChange > 0
                    ? `Up ${scoreChange} percentage point${scoreChange === 1 ? "" : "s"} from the previous full quiz.`
                    : scoreChange < 0
                      ? `Down ${Math.abs(scoreChange)} percentage point${scoreChange === -1 ? "" : "s"} from the previous full quiz.`
                      : "Same score as the previous full quiz."}
                </p>
              )}
              <p className="practice-history-note">
                Focused missed-question practice scores are not added to
                full-quiz history.
              </p>
            </div>
          </div>
          <div className="section-heading" style={{ marginTop: 32 }}>
            <div>
              <span className="eyebrow">Recent rounds</span>
              <h2 style={{ fontSize: 29 }}>A record of your practice</h2>
            </div>
            <button
              className="button button-secondary"
              onClick={clearScores}
              data-testid="button-clear-progress"
            >
              Clear history
            </button>
          </div>
          <div className="score-list">
            {scores.map((score, index) => (
              <article
                className="score-row"
                key={`${score.date}-${index}`}
                data-testid={`score-row-${index}`}
              >
                <div>
                  <strong className="score-result">
                    {score.correct} / {score.total} correct
                  </strong>
                  <div>
                    <time dateTime={score.date}>
                      {new Date(score.date).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                </div>
                <span className="score-result">{score.percentage}%</span>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state" data-testid="progress-empty">
          <span className="empty-icon">
            <GraduationCap size={24} />
          </span>
          <h2>Your first round is waiting.</h2>
          <p>
            Take a quick quiz to start a private study log on this device. Your
            results stay in this browser.
          </p>
          <Link
            href="/quiz"
            className="button button-primary"
            data-testid="link-empty-progress-quiz"
          >
            Take a quick quiz <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <p
        style={{
          fontSize: 12,
          color: "#8295a0",
          marginTop: 19,
          lineHeight: 1.6,
        }}
        data-testid="text-local-storage-note"
      >
        If browser storage is unavailable, you can still study and complete a
        quiz; results just won’t persist between visits.
      </p>
    </div>
  );
}

function FirstFlightPage() {
  const [progress, setProgress] = useState(loadFirstFlightProgress);
  const complete = (result: FirstFlightRunResult) => {
    const next = recordFirstFlightCompletion(progress, result);
    setProgress(next);
    return saveFirstFlightProgress(next);
  };
  return <FirstFlightGame progress={progress} onComplete={complete} />;
}

function NotFoundPage() {
  return (
    <div className="page empty-state" style={{ marginTop: 55 }}>
      <span className="empty-icon">
        <Plane size={24} />
      </span>
      <h2>That heading is off course.</h2>
      <p>
        This page isn’t in the study guide. Let’s get you back to familiar
        airspace.
      </p>
      <Link
        className="button button-primary"
        href="/"
        data-testid="link-not-found-home"
      >
        Return home <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function App() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/study" component={StudyPage} />
        <Route path="/weather" component={AviationWeatherPage} />
        <Route path="/flashcards" component={FlashcardsPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/first-flight" component={FirstFlightPage} />
        <Route path="/pathway" component={PathwayPage} />
        <Route path="/programs" component={ProgramsPage} />
        <Route path="/explore-aviation" component={ExploreAviationPage} />
        <Route path="/story" component={AminaStoryPage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Shell>
  );
}

export default App;
