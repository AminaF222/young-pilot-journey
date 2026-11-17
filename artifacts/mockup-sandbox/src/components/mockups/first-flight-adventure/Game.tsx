import { useRef, useState } from "react";
import { ArrowRight, Award, Check, CircleHelp, Plane, RotateCcw, ShieldCheck } from "lucide-react";
import {
  calculateFirstFlightScore,
  firstFlightScenarios,
  recordFirstFlightCompletion,
  type FirstFlightProgress,
  type FirstFlightRunResult,
} from "./firstFlightGame";
import "./first-flight-game.css";

type FirstFlightGameProps = {
  progress: FirstFlightProgress;
  onComplete: (result: FirstFlightRunResult) => boolean;
};

export default function FirstFlightGame({ progress, onComplete }: FirstFlightGameProps) {
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [savedProgress, setSavedProgress] = useState<FirstFlightProgress | null>(null);
  const completionCalled = useRef(false);

  const activeIndex = Math.min(position, firstFlightScenarios.length - 1);
  const scenario = firstFlightScenarios[activeIndex];
  const selectedId = answers[scenario.id];
  const selectedChoice = scenario.choices.find((choice) => choice.id === selectedId);
  const correctChoice = scenario.choices.find((choice) => choice.id === scenario.correctChoiceId);
  const isCorrect = selectedId === scenario.correctChoiceId;
  const result = calculateFirstFlightScore(answers);
  const progressPercent = ((activeIndex + (selectedId ? 1 : 0)) / firstFlightScenarios.length) * 100;
  const shownProgress = savedProgress ?? progress;

  const selectChoice = (choiceId: string) => {
    if (selectedId || finished) return;
    setAnswers((previous) => ({ ...previous, [scenario.id]: choiceId }));
  };

  const completeRun = () => {
    if (completionCalled.current) return;
    completionCalled.current = true;
    const finalResult = calculateFirstFlightScore(answers);
    let didSave = false;
    try {
      didSave = onComplete(finalResult);
    } catch {
      didSave = false;
    }
    setSaved(didSave);
    if (didSave) setSavedProgress(recordFirstFlightCompletion(progress, finalResult));
    setFinished(true);
  };

  const goNext = () => {
    if (!selectedId) return;
    if (activeIndex < firstFlightScenarios.length - 1) {
      setPosition((index) => index + 1);
      return;
    }
    completeRun();
  };

  const resetRun = () => {
    setPosition(0);
    setAnswers({});
    setFinished(false);
    setSaved(null);
    setSavedProgress(null);
    setStarted(true);
    completionCalled.current = false;
  };

  return (
    <div className="first-flight" data-testid="first-flight-game">
      <div className="first-flight__masthead">
        <div className="first-flight__brand-mark" aria-hidden="true"><Plane size={19} /></div>
        <div>
          <p className="first-flight__kicker">YOUNG PILOT JOURNEY <span> / </span> COCKPIT BRIEFING</p>
          <h1 className="first-flight__page-title">First Flight</h1>
        </div>
      </div>

      <div className="first-flight__safety" role="note" data-testid="first-flight-educational-notice">
        <ShieldCheck size={20} aria-hidden="true" />
        <p><strong>Learn safely, one decision at a time.</strong> This is an educational game, not a flight simulator or a substitute for instruction.</p>
      </div>

      {!started ? (
        <section className="first-flight__intro" aria-labelledby="first-flight-intro-title" data-testid="first-flight-intro">
          <div className="first-flight__intro-copy">
            <span className="first-flight__eyebrow"><CircleHelp size={14} /> SIX SCENARIOS · NO PRESSURE</span>
            <h2 id="first-flight-intro-title">Good judgment starts with a question.</h2>
            <p>Join your instructor for six learning moments about speaking up, noticing concerns, and making room for a safe plan. Choose what you think is best, then read the explanation.</p>
            <button className="first-flight__button first-flight__button--primary" onClick={() => setStarted(true)} data-testid="button-begin-first-flight">
              Begin <ArrowRight size={16} />
            </button>
          </div>
          <div className="first-flight__briefing-stamp" aria-hidden="true">
            <span>TRAINING</span><strong>01</strong><small>BRIEFING</small>
          </div>
          {progress.completedRuns > 0 && (
            <p className="first-flight__prior-note" data-testid="first-flight-prior-progress">
              Your study log: {progress.completedRuns} completed {progress.completedRuns === 1 ? "run" : "runs"} · best {progress.bestPoints} points ({progress.bestPercentage}%).
            </p>
          )}
        </section>
      ) : finished ? (
        <section className="first-flight__result" aria-labelledby="first-flight-result-title" data-testid="first-flight-complete">
          <div className="first-flight__result-heading">
            <span className="first-flight__badge"><Award size={17} /> FIRST FLIGHT BADGE</span>
            <p className="first-flight__eyebrow">BRIEFING COMPLETE</p>
            <h2 id="first-flight-result-title">You showed up ready to learn.</h2>
          </div>
          <div className="first-flight__score-panel">
            <div className="first-flight__score-ring" data-testid="first-flight-result-percentage">
              <strong>{result.percentage}<small>%</small></strong><span>overall</span>
            </div>
            <div className="first-flight__score-copy">
              <span className="first-flight__eyebrow">YOUR ROUND</span>
              <p className="first-flight__points" data-testid="first-flight-result-points">{result.points}<span> / {result.maxPoints} points</span></p>
              <p data-testid="first-flight-result-count">{result.correct} of {result.total} safe choices</p>
            </div>
          </div>
          <section className="first-flight__saved" aria-label="Saved First Flight progress" data-testid="first-flight-saved-progress">
            <div className="first-flight__saved-icon"><Check size={17} /></div>
            <div>
              <strong>{saved ? "Study log updated on this device" : "This round is complete"}</strong>
              <p data-testid="first-flight-saved-summary">
                {shownProgress.completedRuns} {shownProgress.completedRuns === 1 ? "completion" : "completions"} · best {shownProgress.bestPoints} points ({shownProgress.bestPercentage}%) · latest {shownProgress.latestPoints === null ? "no saved run yet" : `${shownProgress.latestPoints} points`}
              </p>
            </div>
          </section>
          {saved === false && <p className="first-flight__save-warning" role="status" data-testid="first-flight-save-warning">Your result could not be saved on this device. You can still review your score here.</p>}
          <button className="first-flight__button first-flight__button--primary" onClick={resetRun} data-testid="button-play-again">
            <RotateCcw size={16} /> Play Again
          </button>
        </section>
      ) : (
        <section className="first-flight__game" aria-label="First Flight scenarios" data-testid="first-flight-active">
          <div className="first-flight__progress-head">
            <div>
              <span className="first-flight__eyebrow">SCENARIO {String(activeIndex + 1).padStart(2, "0")} OF {String(firstFlightScenarios.length).padStart(2, "0")}</span>
              <p data-testid="first-flight-position">Briefing position <strong>{activeIndex + 1}</strong> / {firstFlightScenarios.length}</p>
            </div>
            <span className="first-flight__run-score" data-testid="first-flight-live-score">{result.correct} correct so far</span>
          </div>
          <div className="first-flight__progress-track" role="progressbar" aria-label="First Flight scenario progress" aria-valuemin={0} aria-valuemax={firstFlightScenarios.length} aria-valuenow={activeIndex + (selectedId ? 1 : 0)} data-testid="first-flight-progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <article className="first-flight__scenario" aria-labelledby={`first-flight-title-${scenario.id}`} data-testid={`first-flight-scenario-${scenario.id}`}>
            <div className="first-flight__scenario-meta"><span>{scenario.category}</span><span>FIELD NOTE {String(activeIndex + 1).padStart(2, "0")}</span></div>
            <h2 id={`first-flight-title-${scenario.id}`} data-testid="first-flight-scenario-title">{scenario.title}</h2>
            <p className="first-flight__setup" data-testid="first-flight-scenario-setup">{scenario.setup}</p>
            <h3 className="first-flight__prompt" data-testid="first-flight-scenario-prompt">{scenario.prompt}</h3>
            <div className="first-flight__choices" role="group" aria-label="Choose your response">
              {scenario.choices.map((choice, index) => {
                const selected = selectedId === choice.id;
                const revealBest = Boolean(selectedId) && choice.id === scenario.correctChoiceId;
                const wrongSelection = selected && !isCorrect;
                return (
                  <button
                    key={choice.id}
                    className={`first-flight__choice${selected ? " is-selected" : ""}${revealBest ? " is-correct" : ""}${wrongSelection ? " is-incorrect" : ""}`}
                    onClick={() => selectChoice(choice.id)}
                    disabled={Boolean(selectedId)}
                    aria-pressed={selected}
                    data-testid={`first-flight-choice-${scenario.id}-${choice.id}`}
                  >
                    <span className="first-flight__choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="first-flight__choice-text">{choice.text}</span>
                    {revealBest && <Check size={17} aria-label="Best answer" />}
                  </button>
                );
              })}
            </div>

            {selectedChoice && (
              <div className={`first-flight__feedback${isCorrect ? " is-good" : " is-review"}`} role="status" aria-live="polite" data-testid="first-flight-answer-feedback">
                <div className="first-flight__feedback-icon">{isCorrect ? <Check size={16} /> : <CircleHelp size={16} />}</div>
                <div>
                  <strong>{isCorrect ? "A thoughtful choice." : "Pause and take in the learning."}</strong>
                  <p data-testid="first-flight-selected-feedback">{selectedChoice.feedback}</p>
                  {!isCorrect && correctChoice && <p className="first-flight__best-answer" data-testid="first-flight-best-answer"><strong>Best answer:</strong> {correctChoice.text}</p>}
                </div>
              </div>
            )}

            <div className="first-flight__scenario-footer">
              <span>{selectedId ? "Answer recorded for this run" : "Choose one response to continue"}</span>
              {selectedId && (
                <button className="first-flight__button first-flight__button--primary" onClick={goNext} data-testid="button-next-first-flight">
                  {activeIndex === firstFlightScenarios.length - 1 ? "See my result" : "Next scenario"} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
