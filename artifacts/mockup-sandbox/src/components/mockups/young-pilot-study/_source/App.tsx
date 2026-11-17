import { useReducer, useRef, useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from './routerStub';
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, GraduationCap, Menu, Plane, RotateCw, Shuffle, X } from 'lucide-react';
import { flashcards, lessons, questions, type QuizScore } from './data';
import { buildQuizReview, calculateQuizScore, createInitialQuizRound, getVisibleQuizReview, quizRoundReducer } from './quizLogic';

const navItems = [
  { href: '/', label: 'Home' }, { href: '/study', label: 'Study' }, { href: '/flashcards', label: 'Flashcards' },
  { href: '/quiz', label: 'Quick quiz' }, { href: '/pathway', label: 'Pilot pathway' }, { href: '/progress', label: 'My progress' },
];

function loadScores(): QuizScore[] {
  try {
    const value = localStorage.getItem('young-pilot-scores');
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is QuizScore =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.date === 'string' &&
      Number.isInteger(item.correct) &&
      Number.isInteger(item.total) &&
      item.total > 0 &&
      item.correct >= 0 &&
      item.correct <= item.total &&
      item.percentage === Math.round((item.correct / item.total) * 100),
    );
  } catch { /* Storage may be disabled or full. The app still works for this visit. */ }
  return [];
}

function saveScore(score: QuizScore) {
  try {
    const prior = loadScores();
    localStorage.setItem('young-pilot-scores', JSON.stringify([score, ...prior].slice(0, 30)));
    return true;
  } catch { return false; }
}

function AircraftArt() {
  return <svg viewBox="0 0 520 350" role="img" aria-label="Illustration of a small training airplane above a cloud-lined horizon">
    <defs><linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c4e7f4"/><stop offset="1" stopColor="#edf8fa"/></linearGradient></defs>
    <ellipse cx="278" cy="286" rx="220" ry="26" fill="#a8d7e7" opacity=".4"/>
    <path d="M15 239c39-26 64-25 91-4 23-39 80-34 97-3 42-13 75 7 81 32H24z" fill="#fff" opacity=".76"/>
    <path d="M306 264c35-29 69-18 80 0 32-34 75-22 89 5h30v21H303z" fill="#fff" opacity=".88"/>
    <path d="M99 112c68-40 154-42 242-11l91 32c13 5 13 14 0 18l-79 25-74 77-18-4 32-78-86 7-39 39-15-2 17-47-70-14-26 11-11-7 23-24-39-7c-11-2-10-10 1-17z" fill="#fff" stroke="#397d9a" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M117 119c62-35 147-38 221-11l65 23-82 21-94 10-85-16-31-10z" fill="#4f9ab7"/>
    <path d="M293 162l-62 57 13 3 75-62z" fill="#e7b85e"/>
    <path d="M338 156l-64 5 56-13z" fill="#bfe7ef"/>
    <path d="M87 121l-13-2 19-19 11 1z" fill="#d8edf2"/>
    <circle cx="95" cy="141" r="3" fill="#274b61"/>
    <path d="M148 289c23-10 43-10 61 0m-40 13c17-7 31-7 44 0m193-24c14-8 27-7 37 0" fill="none" stroke="#85bfd0" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="413" cy="75" r="22" fill="#f1c76d" opacity=".85"/>
    <path d="M21 66h40m-20-20v40" stroke="#9fcbd9" strokeWidth="2" opacity=".8"/>
  </svg>;
}

function CockpitDiagram() {
  return <svg className="aircraft-diagram" viewBox="0 0 760 230" role="img" aria-label="Simple illustration of a training airplane instrument panel">
    <rect x="20" y="19" width="720" height="192" rx="18" fill="#e7f2f5"/>
    <path d="M38 177c58-65 116-91 174-91h336c64 0 116 33 174 91v22H38z" fill="#d1e7ec"/>
    <path d="M32 180h696v24H32z" fill="#31566d"/>
    {[135,252,369,486,603].map((x, i) => <g key={x}>
      <circle cx={x} cy="151" r="31" fill="#fff" stroke="#517b8d" strokeWidth="3"/>
      <circle cx={x} cy="151" r="3" fill="#426d80"/>
      <path d={`M${x} 151l${i % 2 ? 10 : -8} -15`} stroke="#d58456" strokeWidth="2.7" strokeLinecap="round"/>
      <path d={`M${x - 17} 164h5m22 0h5M${x} 127v5`} stroke="#7594a1" strokeWidth="2"/>
    </g>)}
    <text x="380" y="196" textAnchor="middle" fill="#e5f1f4" fontSize="10" fontFamily="monospace">A TRAINING AIRPLANE PANEL · SCHEMATIC</text>
  </svg>;
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-brand-home"><span className="brand-mark"><Plane size={20} strokeWidth={2.4}/></span><span>Young Pilot Study</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map((item) => <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? 'active' : ''}`} data-testid={`nav-${item.href.slice(1) || 'home'}`}>{item.label}</Link>)}</nav>
      <button className="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-menu">{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
      {menuOpen && <nav className="mobile-drawer" aria-label="Mobile navigation">{navItems.map((item) => <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? 'active' : ''}`} onClick={() => setMenuOpen(false)} data-testid={`mobile-nav-${item.href.slice(1) || 'home'}`}>{item.label}</Link>)}</nav>}
    </header>
    <main>{children}</main>
    <footer className="footer"><span>Young Pilot Study</span> · A clear first step into aviation learning. Educational only; not flight instruction.</footer>
  </div>;
}

function HomePage() {
  return <div className="page">
    <section className="hero" data-testid="section-home-hero">
      <div className="hero-copy"><span className="eyebrow">Your first flight starts here</span><h1>A little aviation.<br/>A lot of possibility.</h1><p className="lead">Curious about flying? Start with the parts, ideas, and words pilots use—one clear concept at a time.</p>
        <div className="hero-cta"><Link href="/study" className="button button-primary" data-testid="link-start-studying">Start learning <ArrowRight size={16}/></Link><Link href="/pathway" className="button button-secondary" data-testid="link-explore-pathway">Explore the pathway</Link></div>
      </div><div className="hero-art"><AircraftArt/></div>
    </section>
    <div className="section-heading"><div><span className="eyebrow">Pick up where curiosity leads</span><h2>Build your pilot vocabulary</h2></div><p>Short, friendly lessons. Real aviation basics.</p></div>
    <section className="learning-grid" aria-label="Learning destinations">
      <Link href="/study" className="learn-card" data-testid="card-study"><span className="card-index">01 / EXPLORE</span><span className="card-icon"><BookOpen size={19}/></span><h3>Learn the fundamentals</h3><p>Airplane parts, instruments, vocabulary, and the forces of flight.</p></Link>
      <Link href="/flashcards" className="learn-card" data-testid="card-flashcards"><span className="card-index">02 / REMEMBER</span><span className="card-icon"><RotateCw size={19}/></span><h3>Flip through flashcards</h3><p>Practice essential terms at your own pace. Shuffle when you’re ready.</p></Link>
      <Link href="/quiz" className="learn-card" data-testid="card-quiz"><span className="card-index">03 / CHECK IN</span><span className="card-icon"><Compass size={19}/></span><h3>Try a quick quiz</h3><p>Seven short questions, with an explanation after every answer.</p></Link>
    </section>
    <section className="home-note"><div><strong>There’s no rush to the runway.</strong><p>Explore a possible pilot-certificate journey and see the broad steps. The right requirements depend on the certificate and your circumstances.</p></div><Link href="/pathway" className="button" data-testid="link-pathway-note">See the general steps <ArrowRight size={15}/></Link></section>
  </div>;
}

function StudyPage() {
  const [selected, setSelected] = useState(lessons[0].id);
  const lesson = lessons.find((item) => item.id === selected) || lessons[0];
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">Study guide · 4 short lessons</span><h1>Start with the basics.</h1><p className="lead">Get comfortable with the airplane, the panel, and the language pilots use.</p></div>
    <div className="study-layout">
      <aside className="lesson-list" aria-label="Lessons">{lessons.map((item, index) => <button key={item.id} className={`lesson-tab ${selected === item.id ? 'active' : ''}`} onClick={() => setSelected(item.id)} data-testid={`lesson-tab-${item.id}`}><span>{item.topic}</span><small>LESSON 0{index + 1}</small></button>)}</aside>
      <article className="lesson-content" data-testid={`lesson-content-${lesson.id}`}><span className="eyebrow">{lesson.topic}</span><h2>{lesson.title}</h2><p>{lesson.body}</p>
        {lesson.id === 'airplane-parts' && <svg className="aircraft-diagram" viewBox="0 0 760 210" role="img" aria-label="Top-down diagram showing wings, fuselage, tail, and engine of a small airplane"><rect x="20" y="18" width="720" height="174" rx="18" fill="#edf7fa"/><path d="M373 46c-7 0-10 7-11 18l-11 49-167 22v17l171-12 4 26h28l5-26 171 12v-17l-168-22-12-49c-2-12-5-18-10-18z" fill="#78b8ca" stroke="#377993" strokeWidth="3"/><path d="M362 154l-50 19 8 7 61-14m17-12 50 19-8 7-61-14" fill="#ecc775" stroke="#377993" strokeWidth="2"/><g fill="#385f72" fontSize="11" fontFamily="monospace"><text x="70" y="117">WING</text><text x="520" y="116">FUSELAGE</text><text x="328" y="185">TAIL</text><text x="385" y="42">ENGINE</text></g><path d="M139 115h212m-70 52h42m61-126v17" stroke="#557f90" strokeWidth="1.5" strokeDasharray="4 4"/></svg>}
        {lesson.id === 'cockpit-instruments' && <CockpitDiagram/>}
        <div className="key-point" data-testid={`key-point-${lesson.id}`}><strong>Keep in mind</strong>{lesson.keyPoint}</div>
      </article>
    </div>
    <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}><Link href="/flashcards" className="button button-primary" data-testid="link-study-flashcards">Practice with flashcards <ArrowRight size={16}/></Link></div>
  </div>;
}

function FlashcardsPage() {
  const [deck, setDeck] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = deck[index];
  const step = (direction: number) => { setIndex((current) => (current + direction + deck.length) % deck.length); setRevealed(false); };
  const shuffle = () => {
    const next = [...deck];
    for (let i = next.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; }
    setDeck(next); setIndex(0); setRevealed(false);
  };
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">Practice · {flashcards.length} cards</span><h1>One term at a time.</h1><p className="lead">Read the front, make a guess, then turn it over. There’s no timer and no score.</p></div>
    <section className="flashcard-wrap" aria-label="Flashcard practice">
      <div className="flashcard-toolbar"><span data-testid="text-card-position">CARD {String(index + 1).padStart(2,'0')} / {String(deck.length).padStart(2,'0')}</span><button className="button button-quiet" onClick={shuffle} data-testid="button-shuffle"><Shuffle size={15}/> Shuffle deck</button></div>
      <button className="flashcard" onClick={() => setRevealed(!revealed)} aria-label={revealed ? 'Show term' : 'Reveal definition'} data-testid="button-flip-card">
        <span className="flashcard-label">{revealed ? 'Definition' : 'Aviation term'}</span><span className="flashcard-term" data-testid="text-flashcard-term">{revealed ? card.term : card.term}</span>{revealed && <span className="flashcard-definition" data-testid="text-flashcard-definition">{card.definition}</span>}<span className="flashcard-hint">{revealed ? 'Tap to return to the term' : 'Tap to reveal the definition'}</span>
      </button>
      <div className="flashcard-actions"><button className="control-button" onClick={() => step(-1)} data-testid="button-previous-card"><ArrowLeft size={16}/> Previous</button><button className="control-button" onClick={() => setRevealed(!revealed)} data-testid="button-reveal-card">{revealed ? 'Show term' : 'Reveal'}</button><button className="control-button" onClick={() => step(1)} data-testid="button-next-card">Next <ArrowRight size={16}/></button></div>
    </section>
  </div>;
}

function QuizPage() {
  const [round, dispatch] = useReducer(quizRoundReducer, createInitialQuizRound());
  const scoreRecorded = useRef(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const finished = round.questionIndex >= questions.length;
  const question = questions[Math.min(round.questionIndex, questions.length - 1)];
  const selected = round.answers[question.id] ?? null;
  const result = calculateQuizScore(questions, round.answers);
  const review = buildQuizReview(questions, round.answers);
  const visibleReview = getVisibleQuizReview(review, round.reviewMode);
  const missedCount = review.filter((entry) => !entry.isCorrect).length;
  const choose = (choice: string) => {
    if (selected) return;
    dispatch({ type: 'answer', questionId: question.id, answer: choice });
  };
  const advance = () => {
    if (!selected) return;
    const isLastQuestion = round.questionIndex === questions.length - 1;
    if (isLastQuestion && !scoreRecorded.current) {
      scoreRecorded.current = true;
      const score: QuizScore = { date: new Date().toISOString(), ...result };
      setStorageNotice(!saveScore(score));
    }
    dispatch({ type: 'advance', questionId: question.id, questionCount: questions.length });
  };
  const retry = () => {
    scoreRecorded.current = false;
    setStorageNotice(false);
    dispatch({ type: 'retry' });
  };
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">Knowledge check · no pressure</span><h1>See what’s sticking.</h1><p className="lead">Choose the best answer. You’ll get a useful explanation either way.</p></div>
    <section className="quiz-panel" data-testid="quiz-panel">
      {!finished ? <>
        <div className="quiz-topline"><span data-testid="text-quiz-question">QUESTION {String(round.questionIndex + 1).padStart(2,'0')} / {String(questions.length).padStart(2,'0')}</span><span data-testid="text-correct-so-far">{result.correct} correct so far</span></div>
        <div className="progress-track" role="progressbar" aria-valuenow={round.questionIndex} aria-valuemin={0} aria-valuemax={questions.length}><div className="progress-fill" style={{width:`${round.questionIndex / questions.length * 100}%`}}/></div>
        <div className="quiz-card"><span className="eyebrow">Think it through</span><h2>{question.prompt}</h2>
          <div className="answer-list">{question.choices.map((choice, index) => {
            const isCorrect = selected && choice === question.correctAnswer;
            const isWrong = selected === choice && choice !== question.correctAnswer;
            return <button key={choice} className={`answer-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'incorrect' : ''} ${selected === choice ? 'selected' : ''}`} onClick={() => choose(choice)} disabled={Boolean(selected)} data-testid={`answer-choice-${question.id}-${index}`}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{choice}</span>{isCorrect && <Check size={16}/>}</button>;
          })}</div>
          {selected && <div className={`feedback ${selected === question.correctAnswer ? 'good' : 'try-again'}`} role="status" data-testid="quiz-answer-feedback"><strong>{selected === question.correctAnswer ? 'That’s right.' : 'Not quite—and now you know.'}</strong>{question.explanation}</div>}
          <div className="quiz-footer"><span style={{color:'#80939e',fontSize:12}}>{selected ? 'Answer recorded for this round' : 'Select one answer to continue'}</span>{selected && <button className="button button-primary" onClick={advance} data-testid="button-next-question">{round.questionIndex === questions.length - 1 ? 'See my result' : 'Next question'} <ArrowRight size={15}/></button>}</div>
        </div>
      </> : <div data-testid="quiz-complete">
        <div className="quiz-card"><div className="score-hero"><div className="score-number" data-testid="text-quiz-score">{result.percentage}%</div><div><span className="eyebrow">Round complete</span><h2 style={{fontSize:29,margin:'9px 0 0'}}>Good work showing up.</h2><p data-testid="text-quiz-result-count">You answered {result.correct} out of {result.total} correctly. Every explanation is another piece of the picture.</p></div></div>
          {storageNotice && <p className="key-point" role="status">Your result is shown here, but this browser couldn’t save it for later.</p>}
          <div className="quiz-result-actions"><button className="button button-primary" onClick={retry} data-testid="button-retry-quiz"><RotateCw size={15}/> Try again</button><Link href="/progress" className="button button-secondary" data-testid="link-view-progress">View saved progress</Link></div>
        </div>
        <section className="quiz-review" aria-labelledby="quiz-review-title" data-testid="quiz-review">
          <div className="quiz-review-header"><div><span className="eyebrow">Learn from every answer</span><h2 id="quiz-review-title">Review your answers</h2></div>
            <div className="review-filters" role="group" aria-label="Choose which answers to review">
              <button className={`review-filter ${round.reviewMode === 'all' ? 'active' : ''}`} aria-pressed={round.reviewMode === 'all'} onClick={() => dispatch({ type: 'set-review-mode', mode: 'all' })} data-testid="button-review-all">All questions</button>
              <button className={`review-filter ${round.reviewMode === 'missed' ? 'active' : ''}`} aria-pressed={round.reviewMode === 'missed'} onClick={() => dispatch({ type: 'set-review-mode', mode: 'missed' })} data-testid="button-review-missed">Review missed questions <span>{missedCount}</span></button>
            </div>
          </div>
          {visibleReview.length ? <div className="review-list">{visibleReview.map((entry) => <article className={`review-card ${entry.isCorrect ? 'review-correct' : 'review-missed'}`} key={entry.questionId} data-testid={`review-question-${entry.questionId}`}>
            <div className="review-question-meta"><span>QUESTION {String(entry.questionNumber).padStart(2, '0')}</span><span>{entry.isCorrect ? 'Correct' : 'Review this answer'}</span></div>
            <h3>{entry.prompt}</h3>
            <div className="review-answers"><p><strong>Your answer</strong><span>{entry.studentAnswer ?? 'Not answered'}</span></p><p><strong>Correct answer</strong><span data-testid={`review-correct-answer-${entry.questionId}`}>{entry.correctAnswer}</span></p></div>
            <p className="review-explanation"><strong>Why:</strong> {entry.explanation}</p>
          </article>)}</div> : <div className="review-empty" data-testid="review-no-missed"><Check size={20}/><p><strong>No missed questions this round.</strong><span>You got every answer right. Use “All questions” to review the explanations.</span></p></div>}
        </section>
      </div>}
    </section>
  </div>;
}

const pathwaySteps = [
  { title:'Explore ground school', tag:'LEARN', body:'Ground school introduces topics such as aerodynamics, weather, navigation, regulations, and safe decision-making. A course or instructor can help organize your study.' },
  { title:'Understand medical certification', tag:'PLAN AHEAD', body:'Medical certificate requirements depend on the certificate sought and the kind of flying. An FAA Aviation Medical Examiner can explain the applicable process and answer personal questions.' },
  { title:'Begin flight training', tag:'WITH AN INSTRUCTOR', body:'Flight training is hands-on learning with a certificated flight instructor. Your instructor helps build knowledge, judgment, and practical skills at a safe pace.' },
  { title:'Prepare for the FAA knowledge test', tag:'KNOWLEDGE', body:'Many certificate paths include an FAA knowledge test. The exact subjects, eligibility, and test requirements depend on the certificate and current FAA rules.' },
  { title:'Take the practical test', tag:'SKILLS', body:'Eligible applicants typically demonstrate knowledge and flying skills with an FAA examiner or other authorized person. The test and prerequisites vary by certificate.' },
];

function PathwayPage() {
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">A map, not a checklist</span><h1>A possible path to the pilot seat.</h1><p className="lead">Here’s a general view of how someone might explore a pilot certificate journey in the United States.</p></div>
    <section className="pathway" aria-label="General pilot certificate steps">{pathwaySteps.map((step, index) => <article className="path-step" key={step.title} data-testid={`pathway-step-${index + 1}`}><span className="step-number">{String(index + 1).padStart(2,'0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><span className="step-tag">{step.tag}</span></article>)}</section>
    <aside className="disclaimer" data-testid="notice-faa-requirements"><strong>Important: this is general education, not official guidance.</strong> FAA requirements vary by certificate and circumstances, and rules can change. Age, eligibility, medical certification, training, tests, and other details depend on the certificate sought. Confirm current requirements with the FAA and a qualified flight instructor or Aviation Medical Examiner when appropriate.</aside>
    <div style={{marginTop:23}}><Link href="/study" className="button button-primary" data-testid="link-pathway-study">Build your aviation basics <ArrowRight size={16}/></Link></div>
  </div>;
}

function ProgressPage() {
  const [scores, setScores] = useState(() => loadScores());
  const best = scores.length ? Math.max(...scores.map((score) => score.percentage)) : 0;
  const average = scores.length ? Math.round(scores.reduce((total, score) => total + score.percentage, 0) / scores.length) : 0;
  const clearScores = () => { try { localStorage.removeItem('young-pilot-scores'); } catch { /* No storage access; keep current display unchanged. */ } setScores([]); };
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">Your study log · stays on this device</span><h1>Progress, at your pace.</h1><p className="lead">Quiz results are saved locally in this browser. No account, and no data sent anywhere.</p></div>
    {scores.length ? <section data-testid="progress-content">
      <div className="score-hero"><div className="score-number" data-testid="text-best-score">{best}%</div><div><span className="eyebrow">Best quiz result</span><h2 style={{fontSize:27,margin:'8px 0 0'}}>Each round builds a little more confidence.</h2><p>{scores.length} {scores.length === 1 ? 'round' : 'rounds'} completed · {average}% average</p></div></div>
      <div className="section-heading" style={{marginTop:32}}><div><span className="eyebrow">Recent rounds</span><h2 style={{fontSize:29}}>A record of your practice</h2></div><button className="button button-secondary" onClick={clearScores} data-testid="button-clear-progress">Clear history</button></div>
      <div className="score-list">{scores.map((score, index) => <article className="score-row" key={`${score.date}-${index}`} data-testid={`score-row-${index}`}><div><strong className="score-result">{score.correct} / {score.total} correct</strong><div><time dateTime={score.date}>{new Date(score.date).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}</time></div></div><span className="score-result">{score.percentage}%</span></article>)}</div>
    </section> : <section className="empty-state" data-testid="progress-empty"><span className="empty-icon"><GraduationCap size={24}/></span><h2>Your first round is waiting.</h2><p>Take a quick quiz to start a private study log on this device. Your results stay in this browser.</p><Link href="/quiz" className="button button-primary" data-testid="link-empty-progress-quiz">Take a quick quiz <ArrowRight size={16}/></Link></section>}
    <p style={{fontSize:12,color:'#8295a0',marginTop:19,lineHeight:1.6}} data-testid="text-local-storage-note">If browser storage is unavailable, you can still study and complete a quiz; results just won’t persist between visits.</p>
  </div>;
}

function NotFoundPage() {
  return <div className="page empty-state" style={{marginTop:55}}><span className="empty-icon"><Plane size={24}/></span><h2>That heading is off course.</h2><p>This page isn’t in the study guide. Let’s get you back to familiar airspace.</p><Link className="button button-primary" href="/" data-testid="link-not-found-home">Return home <ArrowRight size={15}/></Link></div>;
}

function App() {
  return <Shell><Switch>
    <Route path="/" component={HomePage}/>
    <Route path="/study" component={StudyPage}/>
    <Route path="/flashcards" component={FlashcardsPage}/>
    <Route path="/quiz" component={QuizPage}/>
    <Route path="/pathway" component={PathwayPage}/>
    <Route path="/progress" component={ProgressPage}/>
    <Route component={NotFoundPage}/>
  </Switch></Shell>;
}

export default App;
