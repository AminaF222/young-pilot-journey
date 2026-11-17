import { useRef, useState } from "react";
import { ArrowRight, Award, Check, CircleHelp, Plane, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import {
  calculateFirstFlightScore,
  firstFlightJourneyScenarios,
  firstFlightStages,
  getCompletedFirstFlightStageIds,
  recordFirstFlightCompletion,
  type FirstFlightProgress,
  type FirstFlightRunResult,
} from "./firstFlightGame";
import "./adventure.css";

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

  const activeIndex = Math.min(position, firstFlightJourneyScenarios.length - 1);
  const scenario = firstFlightJourneyScenarios[activeIndex];
  const selectedId = answers[scenario.id];
  const selectedChoice = scenario.choices.find((choice) => choice.id === selectedId);
  const correctChoice = scenario.choices.find((choice) => choice.id === scenario.correctChoiceId);
  const isCorrect = selectedId === scenario.correctChoiceId;
  const result = calculateFirstFlightScore(answers);
  const progressPercent = ((activeIndex + (selectedId ? 1 : 0)) / firstFlightJourneyScenarios.length) * 100;
  const shownProgress = savedProgress ?? progress;
  const stageIndex = firstFlightStages.findIndex((stage) => stage.scenarioIds.includes(scenario.id));
  const activeStage = firstFlightStages[stageIndex];
  const earnedStageIds = getCompletedFirstFlightStageIds(answers);

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
    if (activeIndex < firstFlightJourneyScenarios.length - 1) {
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
      <header className="first-flight__masthead">
        <div className="first-flight__brand-mark" aria-hidden="true"><Plane size={19} /></div>
        <div>
          <p className="first-flight__kicker">YOUNG PILOT JOURNEY <span>/</span> STORY FLIGHT 01</p>
          <h1 className="first-flight__page-title">Your First Flight</h1>
        </div>
        <span className="first-flight__masthead-note"><i /> A learning adventure</span>
      </header>

      <div className="first-flight__safety" role="note" data-testid="first-flight-educational-notice">
        <ShieldCheck size={20} aria-hidden="true" />
        <p><strong>Story flight only—not flight training.</strong> The airplane moves only in this story. Never operate or take off in an aircraft without a qualified instructor; follow your instructor’s guidance.</p>
      </div>

      {!started ? (
        <section className="first-flight__intro" aria-labelledby="first-flight-intro-title" data-testid="first-flight-intro">
          <div className="first-flight__intro-scene">
            <FlightScene step={0} welcome />
            <div className="first-flight__scene-caption"><span>FIELD 01</span><span>READY WHEN YOU ARE</span></div>
          </div>
          <div className="first-flight__intro-copy">
            <span className="first-flight__eyebrow"><Sparkles size={14} /> SIX DECISIONS · NO PRESSURE</span>
            <h2 id="first-flight-intro-title">A little curiosity goes a long way.</h2>
            <p>Join a fictional training outing and explore the choices that help learning stay thoughtful. You’ll travel through five story stages, collect badges, and see why speaking up matters.</p>
            <div className="first-flight__intro-bottom">
              <button type="button" className="first-flight__button first-flight__button--primary" onClick={() => setStarted(true)} data-testid="button-begin-first-flight">
                Start Flight <ArrowRight size={16} />
              </button>
              <span className="first-flight__duration">6 quick decisions <i /> about 5 minutes</span>
            </div>
          </div>
          {progress.completedRuns > 0 && (
            <p className="first-flight__prior-note" data-testid="first-flight-prior-progress">
              Your study log: {progress.completedRuns} completed {progress.completedRuns === 1 ? "run" : "runs"} · best {progress.bestPoints} points ({progress.bestPercentage}%).
            </p>
          )}
        </section>
      ) : finished ? (
        <section className="first-flight__result" aria-labelledby="first-flight-result-title" data-testid="first-flight-complete">
          <div className="first-flight__result-art" aria-hidden="true"><FlightScene step={4} landing /></div>
          <div className="first-flight__result-heading">
            <span className="first-flight__badge" data-testid="first-flight-badge"><Award size={17} /> FIRST FLIGHT BADGE</span>
            <p className="first-flight__eyebrow">BRIEFING COMPLETE</p>
            <h2 id="first-flight-result-title">You made room for good judgment.</h2>
            <p className="first-flight__result-intro">Every flight story starts with curiosity—and the confidence to ask questions.</p>
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
          <div className="first-flight__earned-badges" aria-label="Badges earned this flight">
            {firstFlightStages.map((stage) => <span className="first-flight__earned-badge" key={stage.id}><Check size={13} /> {stage.badgeName}</span>)}
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
          <button type="button" className="first-flight__button first-flight__button--primary" onClick={resetRun} data-testid="button-play-again">
            <RotateCcw size={16} /> Play Again
          </button>
        </section>
      ) : (
        <section className="first-flight__game" aria-label="First Flight scenarios" data-testid="first-flight-active">
          <div className="first-flight__journey-top">
            <div className="first-flight__progress-head">
              <div>
                <span className="first-flight__eyebrow">DECISION {String(activeIndex + 1).padStart(2, "0")} OF {String(firstFlightJourneyScenarios.length).padStart(2, "0")}</span>
                <p data-testid="first-flight-position">Story progress <strong>{activeIndex + 1}</strong> / {firstFlightJourneyScenarios.length}</p>
              </div>
              <span className="first-flight__run-score" data-testid="first-flight-live-score"><strong>{result.points}</strong> pts <i /> {result.correct} of {result.total} safe choices</span>
            </div>
            <div className="first-flight__progress-track" role="progressbar" aria-label="First Flight scenario progress" aria-valuemin={0} aria-valuemax={firstFlightJourneyScenarios.length} aria-valuenow={activeIndex + (selectedId ? 1 : 0)} data-testid="first-flight-progress">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="first-flight__stage-rail" aria-label="Five story stages">
              {firstFlightStages.map((stage, index) => {
                const earned = earnedStageIds.includes(stage.id);
                return <div key={stage.id} className={`first-flight__stage${index === stageIndex ? " is-active" : ""}${earned ? " is-earned" : ""}`} aria-current={index === stageIndex ? "step" : undefined} data-testid={`first-flight-stage-badge-${stage.id}`}>
                  <span className="first-flight__stage-number">{earned ? <Check size={13} /> : `0${index + 1}`}</span>
                  <span className="first-flight__stage-label">{stage.label}</span>
                  {earned && <small>{stage.badgeName}</small>}
                </div>;
              })}
            </div>
          </div>
          <div className={`first-flight__landscape first-flight__landscape--${activeStage.id}`} data-testid="first-flight-story-scene" data-stage={activeStage.id}>
            <FlightScene step={stageIndex} />
            <div className="first-flight__landscape-note"><span>STORY FLIGHT</span><span>The airplane moves only in this story</span></div>
          </div>

          <article className="first-flight__scenario" aria-labelledby={`first-flight-title-${scenario.id}`} data-testid={`first-flight-scenario-${scenario.id}`}>
            <div className="first-flight__scenario-meta"><span className="first-flight__stage-chip">{activeStage.label}</span><span>{scenario.category}</span><span>FIELD NOTE {String(activeIndex + 1).padStart(2, "0")}</span></div>
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
                    type="button"
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
                  <strong>{isCorrect ? "A thoughtful choice. +100 points" : "Not quite—and that is how learning works."}</strong>
                  <p data-testid="first-flight-selected-feedback">{selectedChoice.feedback}</p>
                  {!isCorrect && correctChoice && <p className="first-flight__best-answer" data-testid="first-flight-best-answer"><strong>Better choice:</strong> {correctChoice.text}</p>}
                </div>
              </div>
            )}
            <div className="first-flight__scenario-footer">
              <span>{selectedId ? `${activeStage.badgeName} badge ${earnedStageIds.includes(activeStage.id) ? "earned" : "in progress"}` : "Every answer is a chance to learn"}</span>
              {selectedId && (
                <button type="button" className="first-flight__button first-flight__button--primary" onClick={goNext} data-testid="button-next-first-flight">
                  {activeIndex === firstFlightJourneyScenarios.length - 1 ? "Finish flight" : "Continue story"} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

function FlightScene({ step, welcome = false, landing = false }: { step: number; welcome?: boolean; landing?: boolean }) {
  const scene = landing ? "prepare-to-land" : ["preflight", "taxi", "takeoff", "climb", "prepare-to-land"][Math.min(step, 4)];
  const planePositions = [185, 250, 335, 420, 505];
  const planeY = [246, 236, 197, 145, 164];
  const x = landing ? 550 : planePositions[Math.min(step, planePositions.length - 1)];
  const y = landing ? 146 : planeY[Math.min(step, planeY.length - 1)];
  const sceneLabel = welcome
    ? "A training airplane waiting on the airport runway beside a hangar"
    : scene === "preflight"
      ? "A training airplane waiting by the runway before the story flight"
    : scene === "taxi"
      ? "A story airport with a distinct curving taxi path beside the runway"
      : scene === "takeoff"
        ? "A story airport runway filling the foreground"
        : scene === "climb"
          ? "Open sky above a small airport far below"
          : "The airport runway returning to view as the story prepares to land";
  return <svg className={`first-flight__illustration first-flight__illustration--${scene}${welcome ? " is-welcome" : ""}${landing ? " is-landing" : ""}`} viewBox="0 0 760 330" role="img" aria-label={sceneLabel}>
    <defs>
      <linearGradient id="ff-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9dd9ed"/><stop offset="1" stopColor="#e7f5f6"/></linearGradient>
      <linearGradient id="ff-runway" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#516d7c"/><stop offset="1" stopColor="#334f63"/></linearGradient>
    </defs>
    <rect width="760" height="330" fill="url(#ff-sky)"/>
    <circle cx="645" cy="64" r="30" fill="#f5d581"/>
    <g className={`first-flight__clouds${scene === "climb" ? " is-high" : ""}`} fill="#f8fcfb">
      <path d="M57 102c0-15 12-27 27-27 8-19 35-20 45-2 16-7 35 5 35 22 16 0 25 12 25 25H57z" opacity=".88"/>
      <path d="M474 96c0-12 10-22 22-22 8-18 34-18 43 0 15-5 30 6 30 20 14 0 21 9 21 20H474z" opacity=".68"/>
      {scene === "climb" && <><path d="M-5 46c0-17 14-31 31-31 10-21 40-21 50 1 18-7 38 7 38 25 17 0 27 12 27 27H-5z" opacity=".9"/><path d="M553 149c0-17 13-30 30-30 9-19 37-19 46 1 17-7 36 6 36 24 16 0 25 11 25 24H553z" opacity=".72"/></>}
    </g>
    {scene === "climb" ? <>
      <path d="M0 212c92-23 173-26 258-12 73 12 119 8 186-5 103-20 201-17 316 4v131H0z" fill="#a9c9ab"/>
      <path d="M0 246c118-21 216-20 326-4 134 19 273-10 434-18v106H0z" fill="#83a98b"/>
      <path d="M264 260l29-26h157l31 26-22 8H283z" fill="#7a8f90" opacity=".58"/>
      <path d="M324 258h8v2h-8zm20 2h10v2h-10zm23 1h12v2h-12z" fill="#f4edcf" opacity=".7"/>
      <g className="first-flight__distant-airport" opacity=".7">
        <path d="M305 247v-12l18-10 20 10v12z" fill="#eef1e8"/><path d="M302 235l21-12 23 12" fill="none" stroke="#d0a751" strokeWidth="3"/>
        <path d="M414 250v-12l17-9 18 9v12z" fill="#ecefe7"/>
      </g>
    </> : <>
      <path d="M0 226c91-29 153-19 227-6 78 15 141 12 222-4 97-19 200-14 311 11v103H0z" fill="#94bd9b"/>
      <path d="M0 265h760v65H0z" fill="#769b7d"/>
    </>}
    {scene === "taxi" ? <>
      <path d="M-20 330l102-89h610l104 89z" fill="url(#ff-runway)" opacity=".83"/>
      <path d="M139 330q55-44 114-78 35-20 72-11 24 6 61 0l115-24h132" fill="none" stroke="#cbd4d0" strokeWidth="45" strokeLinecap="round"/>
      <path d="M139 330q55-44 114-78 35-20 72-11 24 6 61 0l115-24h132" fill="none" stroke="#f0d27e" strokeWidth="3" strokeLinecap="round" strokeDasharray="12 10"/>
      <path d="M84 241h593" stroke="#f4f0d8" strokeWidth="3" strokeDasharray="11 11" opacity=".7"/>
      <text x="473" y="202" fill="#f9f5df" fontSize="8" fontFamily="monospace" letterSpacing="1">RUNWAY</text>
    </> : scene === "takeoff" ? <>
      <path d="M0 244h760v86H0z" fill="#718f77"/>
      <path d="M-44 330l169-105h510l169 105z" fill="url(#ff-runway)"/>
      <path d="M347 255h66v18h-66zm-24 31h114v18H323zm-35 32h184v18H288z" fill="#f5e8be" opacity=".96"/>
      <path d="M83 235h594" stroke="#f4f0d8" strokeWidth="3" strokeDasharray="11 11" opacity=".8"/>
    </> : scene === "prepare-to-land" ? <>
      <path d="M0 226c91-29 153-19 227-6 78 15 141 12 222-4 97-19 200-14 311 11v103H0z" fill="#94bd9b"/>
      <path d="M0 265h760v65H0z" fill="#769b7d"/>
      <path d="M30 330l120-76h460l120 76z" fill="url(#ff-runway)" opacity=".88"/>
      <path d="M355 270h38v12h-38zm-13 26h65v13h-65zm-18 31h101v14H324z" fill="#f5e8be" opacity=".9"/>
      <path d="M86 253h588" stroke="#f4f0d8" strokeWidth="2" strokeDasharray="9 10" opacity=".75"/>
    </> : <>
      <path d="M75 330l55-66h500l55 66z" fill="#98a6a2" opacity=".65"/>
      <path d="M84 241h593" stroke="#f4f0d8" strokeWidth="3" strokeDasharray="11 11" opacity=".82"/>
    </>}
    {scene !== "climb" && <g className={`first-flight__hangar${scene === "taxi" ? " is-taxi" : ""}${scene === "takeoff" ? " is-takeoff" : ""}`}>
      <path d="M28 202v-57l65-36 65 36v57z" fill="#f1f4ef" stroke="#6e8b95" strokeWidth="3"/>
      <path d="M38 146l55-30 55 30" fill="none" stroke="#d4aa56" strokeWidth="6"/>
      <path d="M52 202v-43l41-24 41 24v43z" fill="#abcbd0"/>
      <path d="M92 138v64m-40-42h81" stroke="#f5f8f5" strokeWidth="3"/>
      <text x="93" y="222" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#426173" letterSpacing="1">YOUNG PILOT</text>
    </g>}
    {scene !== "climb" && <g className="first-flight__tower">
      <path d="M683 235l12-69h33l12 69z" fill="#e8eee9" stroke="#6e8b95" strokeWidth="2"/>
      <path d="M675 167h73l-10-24h-53z" fill="#d8e9e8" stroke="#6e8b95" strokeWidth="2"/>
      <path d="M683 150h57" stroke="#d5a74d" strokeWidth="4"/>
      <rect x="699" y="180" width="9" height="10" fill="#7caeb8"/><rect x="716" y="180" width="9" height="10" fill="#7caeb8"/>
    </g>}
    {step > 1 && <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M586 126q9-11 18 0 9-11 18 0"/><path d="M620 98q6-8 12 0 6-8 12 0"/></g>}
    <g className="first-flight__plane" transform={`translate(${x} ${y})`}>
      <ellipse cx="5" cy="24" rx="48" ry="8" fill="#29475a" opacity=".14"/>
      <path d="M-47 2l51-5 43 8 7 6-44 1-17 7-7-2 7-8-40-1z" fill="#fffdf7" stroke="#244d69" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M-6 1l13-18 10 1-4 18m-16 5l11 16 9-1-2-14" fill="#d6e9ed" stroke="#244d69" strokeWidth="2"/>
      <path d="M34 5l14-7 6 2-3 8z" fill="#d8aa4c"/>
      <path d="M-42 2l11-1 5 3-15 1z" fill="#73bfd1"/>
      <circle cx="-38" cy="15" r="3" fill="#344f60"/><circle cx="29" cy="15" r="3" fill="#344f60"/>
      <path d="M-49-1l-9-7m0 0v15" fill="none" stroke="#d7a952" strokeWidth="2" strokeLinecap="round"/>
      <path d="M-55-8l-3 8 6-1" fill="#d7a952"/>
      <text x="0" y="8" textAnchor="middle" fill="#315a71" fontSize="5" fontWeight="700" fontFamily="monospace">YPJ</text>
    </g>
    {welcome && <g><path d="M199 205v-58" stroke="#fff" strokeWidth="2"/><path d="M200 148h58l-12 15 12 15h-58z" fill="#d9b15d"/><text x="224" y="164" textAnchor="middle" fill="#2d4e60" fontSize="7" fontWeight="700" fontFamily="monospace">YOUR STORY</text></g>}
    {scene === "prepare-to-land" && <g><path d="M538 216h80" stroke="#fff" strokeWidth="3" strokeDasharray="8 7"/><text x="577" y="206" textAnchor="middle" fill="#f7f1d8" fontSize="8" fontFamily="monospace" letterSpacing="1">HOME FIELD</text></g>}
  </svg>;
}
