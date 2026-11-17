import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink, Info, MapPin, SearchX, Users } from 'lucide-react';
import { aviationPrograms } from '../aviationPrograms';
import '../explore-aviation.css';

type Program = (typeof aviationPrograms)[number];
const categories = ['All', 'High school', 'College degree', 'Flight training', 'Youth enrichment'] as const;
type Filter = (typeof categories)[number];

const regionGroups = [
  { id: 'pg', title: 'Prince George’s County', note: 'Starting closest to home.', match: (r: string) => r === 'Prince George’s County' },
  { id: 'nearby', title: 'Prince George’s County & nearby Maryland', note: 'A short trip from the county.', match: (r: string) => r === 'Prince George’s County & nearby' || r === 'Nearby Maryland' },
  { id: 'state', title: 'Across Maryland', note: 'Statewide options.', match: (r: string) => r === 'Across Maryland' },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ExploreAviationPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const visible = useMemo(() => aviationPrograms.filter((p) => filter === 'All' || p.category === filter), [filter]);
  const groups = regionGroups.map((g) => ({ ...g, items: visible.filter((p) => g.match(p.region)) })).filter((g) => g.items.length);

  return <div className="page explore-page" data-testid="explore-aviation-page">
    <div className="page-intro">
      <span className="eyebrow">Maryland · Starting in Prince George’s County</span>
      <h1>Explore Aviation Programs</h1>
      <p className="lead">A starting directory of schools, degrees, flight training, and youth experiences. Start close to home, then look across the state.</p>
    </div>

    <aside className="explore-notice" role="note" data-testid="explore-notice">
      <Info size={20} aria-hidden="true"/>
      <div>
        <strong>A starting point, not a complete list.</strong>
        <p>This directory is small and still growing. An engineering program is not flight training. Each provider sets its own admissions, eligibility, and fees. Their official pages have the current application details, contacts, and dates. We do not list deadlines or costs here.</p>
        <p>Looking for free introductory flights and STEM resources? See <Link href="/programs" className="explore-inline-link">Free Flights &amp; STEM</Link>.</p>
      </div>
    </aside>

    <div className="explore-filter" role="group" aria-label="Filter by program type">
      {categories.map((c) => {
        const count = c === 'All' ? aviationPrograms.length : aviationPrograms.filter((p) => p.category === c).length;
        return <button type="button" key={c} className={`explore-chip${filter === c ? ' is-active' : ''}`} aria-pressed={filter === c} onClick={() => setFilter(c)} data-testid={`filter-explore-${slug(c)}`}>
          {c}<span>{count}</span>
        </button>;
      })}
    </div>
    <p className="explore-count" aria-live="polite" data-testid="text-explore-count">Showing {visible.length} of {aviationPrograms.length} programs{filter !== 'All' ? ` · ${filter}` : ''}</p>

    {groups.length ? groups.map((g) => <section key={g.id} className="explore-group" aria-labelledby={`explore-group-${g.id}`} data-testid={`explore-group-${g.id}`}>
      <div className="explore-group-head"><h2 id={`explore-group-${g.id}`}>{g.title}</h2><span>{g.note}</span></div>
      <div className="explore-grid">{g.items.map((p) => <ProgramCard key={p.name} program={p}/>)}</div>
    </section>) : <div className="explore-empty" role="status" data-testid="explore-empty">
      <span className="explore-empty-icon"><SearchX size={24} aria-hidden="true"/></span>
      <h2>No programs in this category yet</h2>
      <p>This directory is still growing. Try another type, or view everything.</p>
      <button type="button" className="button button-primary" onClick={() => setFilter('All')} data-testid="button-explore-show-all">Show all programs</button>
    </div>}
  </div>;
}

function ProgramCard({ program }: { program: Program }) {
  const id = slug(program.name);
  return <article className="explore-card" aria-labelledby={`program-${id}`} data-testid={`card-program-${id}`}>
    <span className={`explore-category cat-${slug(program.category)}`}>{program.category}</span>
    <h3 id={`program-${id}`}>{program.name}</h3>
    <p className="explore-location"><MapPin size={14} aria-hidden="true"/> {program.location}</p>
    <p className="explore-description">{program.description}</p>
    <div className="explore-eligibility"><span><Users size={13} aria-hidden="true"/> Who it’s for</span><p>{program.eligibility}</p></div>
    <a className="button button-primary explore-cta" href={program.website} target="_blank" rel="noopener noreferrer" data-testid={`link-program-${id}`}>
      {program.nextStep} <ExternalLink size={14} aria-hidden="true"/><span className="sr-only"> (official website, opens in a new tab)</span>
    </a>
  </article>;
}
