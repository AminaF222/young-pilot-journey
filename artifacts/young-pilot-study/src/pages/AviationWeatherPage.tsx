import { useState } from 'react';
import { AlertTriangle, ArrowRight, Cloud, CloudFog, CloudLightning, Eye, ExternalLink, Info, RotateCw, Wind } from 'lucide-react';
import {
  AWC_HOME_URL, AWC_METAR_HELP_URL, AWC_METAR_VIEWER_URL, EXAMPLE_METAR, PRACTICE_STATION, PRACTICE_STATION_NAME,
  advanceWeatherQuiz, answerWeatherQuestion, createWeatherQuiz, exampleBreakdown, getWeatherQuizReview,
  scoreWeatherQuiz, weatherCodes, weatherQuestions,
} from '../aviationWeather';
import '../aviation-weather.css';

const topics = [
  { icon: Wind, title: 'Wind', body: 'Reported as the direction the wind blows FROM, in degrees true, then speed in knots (KT). G adds gusts: 27015G25KT means from 270 at 15 knots, gusting 25. VRB means variable direction.' },
  { icon: Eye, title: 'Visibility', body: 'US reports give visibility in statute miles (SM). Fog (FG), mist (BR), rain (RA), and haze (HZ) can all reduce how far you can see.' },
  { icon: Cloud, title: 'Clouds and ceiling', body: 'FEW, SCT, BKN, and OVC describe sky coverage. The three digits are the cloud base in hundreds of feet AGL: BKN015 is 1,500 ft. The ceiling is the lowest BKN or OVC layer, or vertical visibility (VV).' },
  { icon: CloudLightning, title: 'Thunderstorms', body: 'TS marks a thunderstorm; CB is a cumulonimbus cloud. They can bring lightning, strong gusts, turbulence, heavy rain, and hail. Learn these hazards from official sources and instructors rather than any simple label.' },
];

export default function AviationWeatherPage() {
  const [quiz, setQuiz] = useState(createWeatherQuiz);
  const [reviewing, setReviewing] = useState(false);
  const finished = quiz.index >= weatherQuestions.length;
  const q = weatherQuestions[quiz.index];
  const selected = q ? quiz.answers[q.id] : undefined;
  const score = scoreWeatherQuiz(quiz);
  const retry = () => { setQuiz(createWeatherQuiz()); setReviewing(false); };

  return <div className="page wx-page">
    <div className="page-intro"><span className="eyebrow">Aviation weather · reading the sky in code</span><h1>Read a weather report.</h1><p className="lead">Pilots check weather before every flight. Learn how METARs describe wind, visibility, clouds, and storms, then practice with the official source.</p></div>

    <section className="wx-live-notice" aria-labelledby="wx-live-heading" data-testid="section-weather-live-notice">
      <div className="wx-live-icon"><Info size={22}/></div>
      <div className="wx-live-copy">
        <span className="eyebrow">Current reports</span>
        <h2 id="wx-live-heading" data-testid="text-no-live-weather">Live airport weather is not displayed in this app.</h2>
        <p>Open the official METAR viewer, enter <strong>{PRACTICE_STATION}</strong> ({PRACTICE_STATION_NAME}), and find the observation time in DDHHMMZ format. Check the full date and source shown on the official page. The time you opened the page is not the time the weather was observed.</p>
        <div className="wx-cta-row">
          <a className="button wx-gold" href={AWC_METAR_VIEWER_URL} target="_blank" rel="noopener noreferrer" data-testid="link-awc-metar-viewer">Official METAR viewer <ExternalLink size={15}/></a>
          <a className="button wx-outline" href={AWC_HOME_URL} target="_blank" rel="noopener noreferrer" data-testid="link-awc-home">Aviation Weather Center <ExternalLink size={15}/></a>
        </div>
      </div>
    </section>

    <aside className="disclaimer" role="note" data-testid="text-weather-disclaimer"><strong>Educational only, not a flight planning or safety decision tool.</strong>Conditions can change quickly. Real flights use current official products and an appropriate preflight weather briefing with a qualified instructor. This page never labels weather as safe or unsafe.</aside>

    <section className="wx-section" aria-labelledby="wx-types">
      <span className="eyebrow">01 · Two products</span><h2 id="wx-types">Observation vs forecast</h2>
      <div className="wx-compare">
        <div className="wx-compare-card" data-testid="card-metar"><span className="wx-tag">METAR</span><h3>What was observed</h3><p>A routine report of conditions measured at one station at a specific time, usually every hour.</p></div>
        <div className="wx-compare-card alt" data-testid="card-taf"><span className="wx-tag">TAF</span><h3>What is forecast</h3><p>A forecast of expected conditions near an airport over a period of time. A forecast is not an observation.</p></div>
      </div>
    </section>

    <section className="wx-section" aria-labelledby="wx-example">
      <span className="eyebrow">02 · Decode it</span><h2 id="wx-example">Breaking down a METAR</h2>
      <div className="wx-example" data-testid="section-fictional-metar">
        <div className="wx-fiction-badge"><AlertTriangle size={14}/> Fictional teaching example, not current weather</div>
        <code className="wx-metar" data-testid="text-example-metar">{EXAMPLE_METAR}</code>
        <ol className="wx-parts">{exampleBreakdown.map((p) => <li key={p.code} data-testid={`metar-part-${p.code}`}><code>{p.code}</code><div><strong>{p.label}</strong><p>{p.meaning}</p></div></li>)}</ol>
      </div>
    </section>

    <section className="wx-section" aria-labelledby="wx-topics">
      <span className="eyebrow">03 · The big four</span><h2 id="wx-topics">What each part tells a pilot</h2>
      <div className="wx-topic-grid">{topics.map(({ icon: Icon, title, body }) => <article className="wx-topic" key={title} data-testid={`card-weather-${title.toLowerCase().split(' ')[0]}`}><span className="wx-topic-icon"><Icon size={20}/></span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="wx-section" aria-labelledby="wx-codes">
      <span className="eyebrow">04 · Quick reference</span><h2 id="wx-codes">Common codes</h2>
      <dl className="wx-codes">{weatherCodes.map((c) => <div key={c.code} className={`wx-code wx-code-${c.group}`} data-testid={`code-${c.code}`}><dt>{c.code}</dt><dd>{c.meaning}</dd></div>)}</dl>
      <p className="wx-ref"><CloudFog size={15}/> Verified reference: <a href={AWC_METAR_HELP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-awc-metar-help">Aviation Weather Center · METAR help <ExternalLink size={13}/></a></p>
    </section>

    <section className="wx-section language-quiz" aria-labelledby="wx-quiz" data-testid="weather-quiz">
      <span className="eyebrow">05 · Check your understanding</span><h2 id="wx-quiz">Weather quiz</h2>
      {!finished && q ? <div className="language-question" key={q.id}>
        <div className="language-quiz-progress" data-testid="text-weather-quiz-progress">QUESTION {String(quiz.index + 1).padStart(2, '0')} / {String(weatherQuestions.length).padStart(2, '0')}</div>
        <div className="progress-track" role="progressbar" aria-label="Weather quiz progress" aria-valuenow={quiz.index} aria-valuemin={0} aria-valuemax={weatherQuestions.length}><div className="progress-fill" style={{ width: `${quiz.index / weatherQuestions.length * 100}%` }}/></div>
        <h4>{q.prompt}</h4>
        <div className="language-answers" role="group" aria-label={`Answers for question ${quiz.index + 1}`}>
          {q.choices.map((choice, i) => {
            const correct = selected && choice === q.correct;
            const wrong = selected === choice && choice !== q.correct;
            return <button type="button" key={choice} className={`language-answer ${correct ? 'correct' : ''} ${wrong ? 'incorrect' : ''}`} onClick={() => setQuiz((s) => answerWeatherQuestion(s, choice))} disabled={Boolean(selected)} aria-pressed={selected === choice} data-testid={`weather-answer-${q.id}-${i}`}><span>{String.fromCharCode(65 + i)}</span>{choice}</button>;
          })}
        </div>
        {selected && <div className={`feedback ${selected === q.correct ? 'good' : 'try-again'}`} role="status" data-testid="weather-answer-feedback"><strong>{selected === q.correct ? 'That is right.' : `Not quite. The correct answer is: ${q.correct}.`}</strong>{q.explanation}</div>}
        {selected && <button type="button" className="button button-primary language-next" onClick={() => setQuiz((s) => advanceWeatherQuiz(s))} data-testid="button-weather-next">{quiz.index === weatherQuestions.length - 1 ? 'See final score' : 'Next question'} <ArrowRight size={15}/></button>}
      </div> : <div className="language-result" data-testid="weather-quiz-result">
        <span className="language-score" data-testid="text-weather-quiz-score">{score.correct} / {score.total}</span>
        <div><h4>Quiz complete</h4><p>{score.percentage}% correct. This result is not saved to your progress.</p></div>
        <button className="button button-primary" type="button" onClick={retry} data-testid="button-weather-retry"><RotateCw size={15}/> Try again</button>
        <button className="button button-secondary" type="button" aria-expanded={reviewing} onClick={() => setReviewing((r) => !r)} data-testid="button-weather-review">{reviewing ? 'Hide review' : 'Review answers'}</button>
        {reviewing && <div className="language-review" data-testid="weather-quiz-review">{getWeatherQuizReview(quiz).map((r) => <article key={r.id} className="language-review-card" data-testid={`weather-review-${r.id}`}><h5>{r.prompt}</h5><p><strong>Your answer:</strong> {r.answer ?? 'Not answered'} {r.isCorrect ? '(correct)' : ''}</p><p><strong>Correct answer:</strong> {r.correct}</p><p>{r.explanation}</p></article>)}</div>}
      </div>}
    </section>
  </div>;
}
