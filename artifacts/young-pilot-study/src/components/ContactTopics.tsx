import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronDown, ExternalLink } from 'lucide-react';

type Topic = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  internal: { href: string; label: string }[];
  external: { href: string; label: string }[];
};

const topics: Topic[] = [
  {
    id: 'question',
    title: 'Ask a question',
    summary: 'Stuck on a lesson, term, or pathway idea? Start with these study spots.',
    steps: [
      'Reread the lesson section and try its flashcards to see the term in a new way.',
      'Look the word up in the official FAA Pilot/Controller Glossary.',
      'Bring bigger questions about training to a qualified flight instructor.',
    ],
    internal: [{ href: '/study', label: 'Study lessons' }, { href: '/flashcards', label: 'Flashcards' }, { href: '/pathway', label: 'Pilot pathway' }],
    external: [
      { href: 'https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/index.html', label: 'FAA Pilot/Controller Glossary' },
      { href: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak', label: "FAA Pilot's Handbook of Aeronautical Knowledge" },
    ],
  },
  {
    id: 'problem',
    title: 'Report a problem',
    summary: 'Something not working? A few quick checks often fix it.',
    steps: [
      'Refresh the page and try the action again.',
      'Progress and photo previews live in this browser. Private browsing or full storage can stop them from saving.',
      'Write down the page, what you clicked, and what happened, so it can be shared once a contact method is set up.',
    ],
    internal: [{ href: '/progress', label: 'Check my progress' }, { href: '/', label: 'Back to home' }],
    external: [],
  },
  {
    id: 'idea',
    title: 'Suggest an idea',
    summary: 'Have a topic you wish was here? Explore what already exists first.',
    steps: [
      'Note which lesson or game your idea connects to.',
      'Check official FAA student resources to see how the topic is taught.',
      'Keep your idea ready to share when a public contact method is added.',
    ],
    internal: [{ href: '/first-flight', label: 'Your First Flight' }, { href: '/programs', label: 'Programs' }],
    external: [{ href: 'https://www.faa.gov/education', label: 'FAA Education resources' }],
  },
];

export default function ContactTopics() {
  const [open, setOpen] = useState<string | null>(null);
  return <section className="contact-topics" aria-label="Feedback topics">
    {topics.map((topic, index) => {
      const isOpen = open === topic.id;
      const panelId = `contact-panel-${topic.id}`;
      return <article className={`contact-topic-card${isOpen ? ' is-open' : ''}`} key={topic.id} data-testid={`contact-topic-${topic.id}`}>
        <span className="contact-topic-number">0{index + 1}</span>
        <h2>
          <button type="button" className="contact-topic-toggle" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : topic.id)} data-testid={`button-contact-topic-${topic.id}`}>
            <span>{topic.title}</span><ChevronDown size={18} aria-hidden="true"/>
          </button>
        </h2>
        <p>{topic.summary}</p>
        <div id={panelId} className="contact-topic-panel" hidden={!isOpen} data-testid={`panel-contact-topic-${topic.id}`}>
          <ol>{topic.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <div className="contact-topic-links">
            {topic.internal.map((l) => <Link key={l.href} href={l.href} className="contact-topic-link">{l.label}</Link>)}
            {topic.external.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="contact-topic-link">{l.label} <ExternalLink size={12} aria-hidden="true"/></a>)}
          </div>
        </div>
      </article>;
    })}
  </section>;
}
