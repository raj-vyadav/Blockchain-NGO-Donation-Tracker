import { useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { DemoStateProvider, useDemoState, formatINR, shortDate, type Evidence, type Milestone, type Project } from '@/lib/demo-state';
import { Route, Switch, useLocation, Router as WouterRouter, Link, useRoute } from 'wouter';
import { ArrowRight, ArrowUpRight, BadgeCheck, Banknote, BookOpen, BriefcaseBusiness, Building2, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, FileCheck2, FileImage, FileText, Fingerprint, FolderOpen, HandCoins, Landmark, LockKeyhole, MapPin, Pencil, Plus, RotateCcw, Save, Shield, ShieldCheck, Upload, Users, Vote as VoteIcon, X, XCircle } from 'lucide-react';

const queryClient = new QueryClient();
type Role = 'Donor' | 'NGO' | 'Verifier';
const roleNames: Record<Role, string> = { Donor: 'Mira Patel', NGO: 'Sakhi Education Trust', Verifier: 'Ananya Rao' };
const navGroups = [
  { label: 'GIVE', links: [{ href: '/', title: 'Discover projects', icon: BookOpen }, { href: '/donations', title: 'Contribution history', icon: HandCoins }] },
  { label: 'OPERATE', links: [{ href: '/ngo', title: 'NGO workspace', icon: Building2 }, { href: '/verify', title: 'Verify milestones', icon: ShieldCheck }] },
  { label: 'INSPECT', links: [{ href: '/ledger', title: 'Public ledger', icon: Fingerprint }] },
];

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><DemoStateProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></DemoStateProvider></TooltipProvider></QueryClientProvider>;
}
function Router() {
  return <RoutedErrorBoundary><Shell><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/projects/:id" component={ProjectPage} />
    <Route path="/donations" component={DonationsPage} />
    <Route path="/ngo" component={NgoPage} />
    <Route path="/verify" component={VerifyPage} />
    <Route path="/ledger" component={LedgerPage} />
    <Route component={NotFound} />
  </Switch></Shell></RoutedErrorBoundary>;
}
function Shell({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('clearpath-role') as Role) || 'Donor');
  const [location] = useLocation();
  const { reset } = useDemoState();
  const changeRole = (value: Role) => { setRole(value); localStorage.setItem('clearpath-role', value); };
  const current = navGroups.flatMap(g => g.links).find(l => l.href === location)?.title ?? (location.startsWith('/projects/') ? 'Project overview' : 'Workspace');
  return <div className="app-frame">
    <aside className="sidebar">
      <Link href="/" className="brand-lockup" data-testid="link-brand-home"><span className="brand-mark"><Landmark size={20} strokeWidth={2.1} /></span><span><b>clearpath</b><small>GIVING, ACCOUNTED FOR</small></span></Link>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav">{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-caption">{group.label}</span>{group.links.map(({ href, title, icon: Icon }) => <Link key={href} href={href} data-testid={`link-${title.toLowerCase().replaceAll(' ', '-')}`} className={`nav-link ${location === href || (href === '/' && location.startsWith('/projects/')) ? 'active' : ''}`}><Icon size={17} /><span>{title}</span>{location === href && <span className="nav-active-dot" />}</Link>)}</div>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-guard"><Shield size={16} /><span><b>Funds held safely</b><small>Released only after 2 of 3 approvals</small></span></div>
        <button className="reset-link" onClick={reset} data-testid="button-reset-demo"><RotateCcw size={14} /> Reset demo data</button>
        <div className="side-version">DEMO ENVIRONMENT <span>v1.0</span></div>
      </div>
    </aside>
    <main className="main-pane">
      <header className="topbar"><div className="crumb"><span>Clearpath</span><ChevronRight size={14} /><b>{current}</b></div><div className="topbar-right"><div className="demo-chip"><span className="live-dot" /> LIVE DEMO</div><label className="role-select-wrap"><span>Viewing as</span><select value={role} onChange={e => changeRole(e.target.value as Role)} data-testid="select-active-role">{(['Donor', 'NGO', 'Verifier'] as Role[]).map(r => <option key={r} value={r}>{r}</option>)}</select><ChevronDown size={14} /></label><button className="topbar-reset" onClick={reset} aria-label="Reset demo data" title="Reset demo data" data-testid="button-reset-demo-topbar"><RotateCcw size={14} /></button><div className="role-avatar" title={roleNames[role]}>{role === 'NGO' ? 'ST' : role === 'Verifier' ? 'AR' : 'MP'}</div></div></header>
      <div className="notice-strip"><LockKeyhole size={15} /><span><b>Demo only.</b> Transactions and chain references are simulated. No real money, wallets, or keys are involved.</span></div>
      <div className="page-content">{children}</div>
      <footer className="app-footer"><span><Landmark size={13} /> CLEARPATH TRANSPARENCY WORKSPACE</span><span>Every rupee traceable. Every release verified.</span></footer>
    </main>
  </div>;
}
function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}
function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`pill pill-${tone}`}>{children}</span>; }
function Metric({ label, value, detail, icon: Icon, tone = '' }: { label: string; value: string; detail: string; icon: typeof Banknote; tone?: string }) {
  return <div className={`metric ${tone}`}><div className="metric-top"><span>{label}</span><Icon size={17} /></div><strong data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</strong><small>{detail}</small></div>;
}
function totals(project: Project, donations: ReturnType<typeof useDemoState>['state']['donations']) {
  const donated = donations.filter(d => d.projectId === project.id).reduce((s, d) => s + d.amount, 0);
  const released = project.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);
  return { donated, released, locked: Math.max(donated - released, 0), progress: Math.min(Math.round(released / project.targetAmount * 100), 100) };
}
function HomePage() {
  const { state } = useDemoState();
  const [filter, setFilter] = useState('All projects');
  const featured = state.projects[0];
  const overallDonated = state.donations.reduce((s, d) => s + d.amount, 0);
  const released = state.projects.reduce((s, p) => s + p.milestones.filter(m => m.status === 'released').reduce((a, m) => a + m.amount, 0), 0);
  return <div className="page-wrap">
    <section className="hero-panel">
      <div className="hero-copy"><div className="hero-kicker"><span className="kicker-rule" /> TRANSPARENT GIVING, IN MOTION</div><h1>Good work.<br /><em>Proof first.</em></h1><p>Follow every contribution from the moment it arrives to the moment verified work is funded.</p><div className="hero-actions"><Link href="#projects" className="button button-gold" data-testid="link-browse-projects">Explore projects <ArrowRight size={16} /></Link><Link href="/ledger" className="hero-text-link" data-testid="link-hero-ledger">Inspect the ledger <ArrowUpRight size={15} /></Link></div></div>
      <div className="hero-art" aria-label="Illustration of a verified community school"><div className="art-sun" /><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-building"><div className="building-roof" /><div className="building-wall"><div className="building-sign">LEARN</div><div className="building-window" /><div className="building-window" /><div className="building-door" /></div><div className="building-base" /></div><div className="art-ground" /><div className="art-stamp"><Check size={13} /><span>VERIFIED<br />FUNDING</span></div><div className="art-index">FIELD NOTE 01 / KHAROLA</div></div>
      <div className="hero-bottom"><span><span className="hero-status-dot" /> OPEN TRANSPARENCY RECORD</span><span>01 / 04 MILESTONES RELEASED</span></div>
    </section>
    <section className="overview-strip" aria-label="Workspace totals"><Metric label="Raised so far" value={formatINR(overallDonated)} detail="Across active projects" icon={HandCoins} /><Metric label="Released on proof" value={formatINR(released)} detail="Independent approval recorded" icon={BadgeCheck} tone="metric-green" /><Metric label="Held in escrow" value={formatINR(Math.max(overallDonated - released, 0))} detail="Safe until milestone approval" icon={LockKeyhole} tone="metric-ochre" /><div className="overview-note"><div className="note-mark"><ShieldCheck size={18} /></div><b>Nothing moves on promise alone.</b><span>Two independent verifiers must accept evidence before a milestone is released.</span></div></section>
    <section id="projects" className="project-section"><div className="section-top"><div><div className="eyebrow">ON THE GROUND</div><h2>Projects you can follow</h2><p>See the plan, the proof, and what happens next.</p></div><div className="filter-tools"><span>{state.projects.length} active project{state.projects.length === 1 ? '' : 's'}</span><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter projects" data-testid="select-project-filter"><option>All projects</option><option>In progress</option><option>Awaiting proof</option></select></div></div>
      <div className="project-list">{state.projects.filter(p => filter === 'All projects' || (filter === 'Awaiting proof' ? p.milestones.some(m => m.status === 'review') : p.milestones.some(m => m.status !== 'released'))).map(p => <ProjectCard key={p.id} project={p} />)}</div>
    </section>
    <div className="home-bottom-row"><div className="quote-panel"><div className="quote-mark">“</div><p>Trust grows when the work is visible — and the money follows the proof.</p><span>THE CLEARPATH PROMISE</span></div><Link href="/ledger" className="ledger-teaser" data-testid="link-ledger-teaser"><div className="ledger-icon"><Fingerprint size={19} /></div><div><b>Follow the public record</b><span>Donations, evidence and decisions in one inspectable timeline.</span></div><ArrowRight size={17} /></Link></div>
    {featured && <div className="below-note">Currently featured: <b>{featured.title}</b> · {featured.location}</div>}
  </div>;
}
function ProjectCard({ project }: { project: Project }) {
  const { state } = useDemoState();
  const t = totals(project, state.donations);
  const review = project.milestones.find(m => m.status === 'review');
  return <article className="project-card" data-testid={`card-project-${project.id}`}><div className="project-card-art"><div className="mini-landscape"><span className="mini-sun" /><div className="mini-school"><i /><i /><i /></div><div className="mini-hill" /></div><div className="project-tag"><span className="tag-dot" /> EDUCATION</div><span className="image-caption">Kharola · Maharashtra</span></div><div className="project-card-body"><div className="project-meta"><span><MapPin size={13} /> {project.location}</span><Pill tone={review ? 'gold' : 'green'}>{review ? 'Review in progress' : 'Active funding'}</Pill></div><h3>{project.title}</h3><p className="ngo-byline">Led by <b>{project.ngoName}</b></p><p className="project-desc">{project.description}</p><div className="fund-progress-label"><span>Funds verified & released</span><b>{t.progress}%</b></div><div className="progress-track"><span style={{ width: `${t.progress}%` }} /></div><div className="card-funding-numbers"><span><b>{formatINR(t.donated)}</b><small>raised</small></span><span><b>{formatINR(project.targetAmount)}</b><small>target</small></span><span><b>{formatINR(t.locked)}</b><small>held safe</small></span></div><div className="card-foot"><span><CheckCircle2 size={14} /> {project.milestones.filter(m => m.status === 'released').length} of {project.milestones.length} milestones released</span><Link href={`/projects/${project.id}`} className="button button-outline" data-testid={`link-project-${project.id}`}>Project details <ArrowRight size={15} /></Link></div></div></article>;
}
function ProjectPage() {
  const [, params] = useRoute('/projects/:id');
  const { state, donate } = useDemoState();
  const project = state.projects.find(p => p.id === params?.id);
  const [amount, setAmount] = useState('1500');
  const [donor, setDonor] = useState('Mira Patel');
  const [message, setMessage] = useState('');
  if (!project) return <EmptyState icon={FolderOpen} title="Project not found" text="This project may have been removed from the demo." link="/" linkText="Back to projects" />;
  const t = totals(project, state.donations);
  const contribute = (e: FormEvent) => { e.preventDefault(); const n = Number(amount); if (n < 1 || !donor.trim()) return; donate(project.id, n, donor.trim()); setMessage(`Your ${formatINR(n)} contribution is now in the simulated ledger.`); };
  return <div className="page-wrap"><div className="backline"><Link href="/" data-testid="link-back-projects">← All projects</Link><span>PROJECT RECORD / {project.id.toUpperCase()}</span></div><PageHeading eyebrow={`EDUCATION · ${project.location.toUpperCase()}`} title={project.title} description={project.description} action={<Pill tone="green"><span className="status-dot" /> Active project</Pill>} />
    <div className="project-detail-grid"><div className="detail-main"><section className="fund-overview card-surface"><div className="fund-big"><span>COMMUNITY COMMITMENT</span><strong>{formatINR(t.donated)}</strong><small>of {formatINR(project.targetAmount)} target raised</small><div className="progress-track large"><span style={{ width: `${Math.min(t.donated / project.targetAmount * 100, 100)}%` }} /></div><div className="fund-summary"><span><i className="dot-green" /> {formatINR(t.released)} released</span><span><i className="dot-gold" /> {formatINR(t.locked)} held in escrow</span></div></div><div className="fund-side"><div className="fund-side-icon"><LockKeyhole size={17} /></div><b>Every release has a receipt.</b><p>Funds are held until submitted evidence earns 2 of 3 independent verifier approvals.</p><Link href="/ledger" className="inline-link" data-testid="link-project-ledger">View transaction ledger <ArrowRight size={14} /></Link></div></section>
      <section className="milestone-section"><div className="section-title-line"><div><div className="eyebrow">THE FUNDING PLAN</div><h2>Milestones & proof</h2></div><span className="section-count">{project.milestones.length} checkpoints</span></div><div className="milestone-list">{project.milestones.map((m, i) => <MilestoneCard key={m.id} milestone={m} index={i} />)}</div></section>
      <section className="support-panel"><div className="support-mark"><ShieldCheck size={19} /></div><div><b>Independent by design</b><p>Verifier decisions are recorded with a simulated chain reference and remain visible in the public ledger.</p></div><Link href="/verify" className="inline-link" data-testid="link-open-verifier">See review process <ArrowRight size={14} /></Link></section></div>
      <aside className="donate-card"><div className="donate-card-top"><span className="eyebrow">BACK THIS PROJECT</span><div className="donate-symbol"><HandCoins size={19} /></div></div><h3>Your gift stays accountable.</h3><p>Give to the project pool. It is not paid out until a milestone is independently verified.</p><form onSubmit={contribute}><label className="field-label" htmlFor="donor-name">Your name</label><input id="donor-name" value={donor} onChange={e => setDonor(e.target.value)} data-testid="input-donor-name" required /><label className="field-label" htmlFor="donation-amount">Contribution amount</label><div className="amount-input"><span>₹</span><input id="donation-amount" type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} data-testid="input-donation-amount" required /></div><div className="quick-amounts">{[500, 1500, 5000].map(n => <button type="button" key={n} onClick={() => setAmount(String(n))} className={amount === String(n) ? 'selected' : ''} data-testid={`button-quick-amount-${n}`}>₹{n.toLocaleString('en-IN')}</button>)}</div><button type="submit" className="button button-primary donate-submit" data-testid="button-submit-donation">Contribute securely <ArrowRight size={16} /></button></form>{message && <div className="success-message" data-testid="status-donation-success"><CheckCircle2 size={16} />{message}</div>}<div className="simulated-note"><LockKeyhole size={13} /> Simulated transaction · No payment is collected</div><div className="donate-foot"><span><ShieldCheck size={14} /> Verifier guarded</span><span>INR · ₹</span></div></aside></div>
    <RecentActivity projectId={project.id} />
  </div>;
}
function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const approvals = milestone.votes.filter(v => v.decision === 'approve').length;
  const rejections = milestone.votes.filter(v => v.decision === 'reject').length;
  const tone = milestone.status === 'released' ? 'green' : milestone.status === 'review' ? 'gold' : milestone.status === 'rejected' ? 'red' : 'neutral';
  const label = milestone.status === 'released' ? 'Released' : milestone.status === 'review' ? 'Under review' : milestone.status === 'rejected' ? 'Needs revision' : 'Locked';
  return <article className={`milestone-card ${milestone.status}`} data-testid={`milestone-${milestone.id}`}><div className="milestone-index">{String(index + 1).padStart(2, '0')}<span /></div><div className="milestone-content"><div className="milestone-top"><h3>{milestone.title}</h3><Pill tone={tone}>{milestone.status === 'released' && <Check size={12} />}{label}</Pill></div><div className="milestone-meta"><span><Banknote size={14} /> {formatINR(milestone.amount)}</span><span><Clock3 size={14} /> Due {shortDate(milestone.dueDate)}</span><span className={milestone.status === 'review' ? 'vote-count waiting' : 'vote-count'}><Users size={14} /> {approvals} of 2 approvals{rejections > 0 ? ` · ${rejections} rejected` : ''}</span></div>
      {milestone.evidence && <div className="evidence-compact"><div className="evidence-icon"><FileCheck2 size={16} /></div><div><b>Evidence submitted {shortDate(milestone.evidence.submittedAt)}</b><p>{milestone.evidence.description}</p><small><MapPin size={12} /> {milestone.evidence.location}</small><div className="attachment-inline">{milestone.evidence.attachments.map(a => <span key={a.name}><FileText size={12} />{a.name}</span>)}</div></div></div>}
      {milestone.rejectionReason && <div className="rejection-callout"><XCircle size={15} /><span><b>Funds remain locked.</b> {milestone.rejectionReason}</span></div>}
      {milestone.status === 'review' && <div className="approval-track"><div className="approval-progress"><span style={{ width: `${approvals / 2 * 100}%` }} /></div><span>{approvals}/2 approvals to release</span></div>}
    </div><div className="milestone-amount">{formatINR(milestone.amount)}<small>{milestone.status === 'released' ? 'transferred' : 'in escrow'}</small></div></article>;
}
function RecentActivity({ projectId }: { projectId: string }) {
  const { state } = useDemoState();
  const entries = state.ledger.filter(e => e.projectId === projectId).slice(0, 4);
  return <section className="recent-activity"><div className="section-title-line"><div><div className="eyebrow">RECENT RECORD</div><h2>Latest activity</h2></div><Link href="/ledger" className="inline-link" data-testid="link-all-activity">Full ledger <ArrowRight size={14} /></Link></div><LedgerRows entries={entries} compact /></section>;
}
function DonationsPage() {
  const { state } = useDemoState();
  const donations = state.donations;
  const donatedTotal = donations.reduce((s, d) => s + d.amount, 0);
  const releasedTotal = state.projects.reduce((s, p) => s + p.milestones.filter(m => m.status === 'released').reduce((a, m) => a + m.amount, 0), 0);
  const projects = state.projects;
  return <div className="page-wrap"><PageHeading eyebrow="DONOR ACCOUNT" title="Every gift, in full view." description="Review demo contributions alongside the decisions and disbursements behind every rupee." action={<Link href="/" className="button button-primary" data-testid="link-discover-more">Find a project <ArrowRight size={15} /></Link>} />
    <div className="metrics-row"><Metric label="Community contributions" value={formatINR(donatedTotal)} detail={`${donations.length} recorded contribution${donations.length === 1 ? '' : 's'}`} icon={HandCoins} /><Metric label="Released to work" value={formatINR(releasedTotal)} detail="Across all verified milestones" icon={ArrowUpRight} tone="metric-green" /><Metric label="Still protected" value={formatINR(Math.max(donatedTotal - releasedTotal, 0))} detail="Held until proof is accepted" icon={LockKeyhole} tone="metric-ochre" /></div>
    <section className="content-card history-card"><div className="card-heading"><div><div className="eyebrow">CONTRIBUTION HISTORY</div><h2>Every gift has a record</h2></div><Pill>{donations.length} transactions</Pill></div>{donations.length ? <div className="table-wrap"><table><thead><tr><th>DATE</th><th>PROJECT</th><th>AMOUNT</th><th>TRANSACTION REFERENCE</th><th>STATUS</th></tr></thead><tbody>{donations.map(d => <tr key={d.id} data-testid={`row-donation-${d.id}`}><td>{shortDate(d.createdAt)}</td><td><b>{projects.find(p => p.id === d.projectId)?.title ?? 'Project'}</b><small>{d.donorName}</small></td><td className="mono-amount">{formatINR(d.amount)}</td><td><code>{d.transactionHash}</code></td><td><Pill tone="gold"><LockKeyhole size={11} /> Held in pool</Pill></td></tr>)}</tbody></table></div> : <EmptyState icon={HandCoins} title="Your first contribution starts here" text="Choose a project and make a simulated contribution. It will appear here instantly." link="/" linkText="Explore projects" />}</section>
    <section className="release-history"><div className="card-heading"><div><div className="eyebrow">PROJECT PROGRESS</div><h2>What your giving has moved</h2></div></div><div className="release-projects">{projects.map(p => { const t = totals(p, state.donations); return <Link href={`/projects/${p.id}`} className="release-project" key={p.id} data-testid={`link-donor-project-${p.id}`}><div className="release-project-icon"><Building2 size={19} /></div><div className="release-project-body"><b>{p.title}</b><span>{p.ngoName} · {p.location}</span><div className="progress-track"><span style={{ width: `${t.progress}%` }} /></div><small>{p.milestones.filter(m => m.status === 'released').length} of {p.milestones.length} milestones released</small></div><div className="release-value"><b>{formatINR(t.released)}</b><small>released</small></div><ChevronRight size={17} /></Link>; })}</div></section>
    <div className="privacy-note"><CircleHelp size={17} /><span><b>What does “held” mean?</b> Contributions are shown in the project pool, but no funds move to an NGO until independent evidence is accepted by at least two verifiers.</span></div>
  </div>;
}
function NgoPage() {
  const { state, createProject, submitEvidence, updateMilestone } = useDemoState();
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? '');
  const project = state.projects.find(p => p.id === projectId) ?? state.projects[0];
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Kharola, Maharashtra');
  const [newTarget, setNewTarget] = useState('100000');
  const [newMilestones, setNewMilestones] = useState('4');
  const [milestoneId, setMilestoneId] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceLocation, setEvidenceLocation] = useState('');
  const [files, setFiles] = useState<{ name: string; type: string; size: number }[]>([]);
  const [submitted, setSubmitted] = useState('');
  const [editingMilestone, setEditingMilestone] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const p = project;
  const t = p ? totals(p, state.donations) : { donated: 0, released: 0, locked: 0, progress: 0 };
  const requestEvidence = (e: FormEvent) => {
    e.preventDefault(); if (!p || !milestoneId || !evidenceDescription.trim() || !evidenceLocation.trim()) return;
    const evidence: Evidence = { description: evidenceDescription.trim(), location: evidenceLocation.trim(), submittedAt: new Date().toISOString(), attachments: files };
    submitEvidence(p.id, milestoneId, evidence); setSubmitted('Evidence request recorded. Verifiers can now review the milestone.'); setEvidenceDescription(''); setEvidenceLocation(''); setFiles([]);
  };
  const createNew = (e: FormEvent) => {
    e.preventDefault(); const amount = Math.max(Number(newTarget), 1), count = Math.max(1, Math.min(Number(newMilestones), 12)), now = Date.now();
    const id = `project-${now}`, per = Math.floor(amount / count);
    const projectData: Project = { id, title: newTitle.trim(), description: newDescription.trim(), ngoName: 'Sakhi Education Trust', location: newLocation.trim(), targetAmount: amount, milestones: Array.from({ length: count }, (_, i) => ({ id: `${id}-m${i + 1}`, title: `Milestone ${i + 1}`, amount: i === count - 1 ? amount - per * (count - 1) : per, status: 'locked' as const, dueDate: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().slice(0, 10), votes: [] })) };
    createProject(projectData); setProjectId(id); setCreateOpen(false); setNewTitle(''); setNewDescription(''); setNewLocation('Kharola, Maharashtra');
  };
  const beginEdit = (m: Milestone) => { setEditingMilestone(m.id); setEditTitle(m.title); setEditAmount(String(m.amount)); setEditDueDate(m.dueDate); };
  const saveMilestone = (e: FormEvent) => { e.preventDefault(); if (!p || !editingMilestone || !editTitle.trim()) return; updateMilestone(p.id, editingMilestone, { title: editTitle.trim(), amount: Math.max(Number(editAmount), 1), dueDate: editDueDate }); setEditingMilestone(''); };
  return <div className="page-wrap"><PageHeading eyebrow="NGO WORKSPACE" title="Make the work easy to verify." description="Track what arrived, prepare the next milestone, and submit evidence for independent review." action={<button className="button button-primary" onClick={() => setCreateOpen(v => !v)} data-testid="button-create-project"><Plus size={16} /> New project</button>} />
    {createOpen && <form className="create-project-panel" onSubmit={createNew}><div className="create-panel-head"><div><div className="eyebrow">NEW PROJECT RECORD</div><h2>Set the work in motion</h2></div><button type="button" className="icon-button" onClick={() => setCreateOpen(false)} aria-label="Close project form" data-testid="button-close-project-form"><X size={18} /></button></div><div className="form-grid"><label className="field-label">Project title<input value={newTitle} onChange={e => setNewTitle(e.target.value)} required data-testid="input-new-project-title" placeholder="e.g. Community library renovation" /></label><label className="field-label">Funding target (₹)<input type="number" min="1" value={newTarget} onChange={e => setNewTarget(e.target.value)} required data-testid="input-new-project-target" /></label><label className="field-label span-2">Project location<input value={newLocation} onChange={e => setNewLocation(e.target.value)} required data-testid="input-new-project-location" placeholder="Village, district, state" /></label><label className="field-label span-2">What will this project do?<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} required data-testid="input-new-project-description" placeholder="Describe the community need and planned outcome." /></label><label className="field-label">Number of milestones<input type="number" min="1" max="12" value={newMilestones} onChange={e => setNewMilestones(e.target.value)} required data-testid="input-new-project-milestones" /></label><div className="form-field-tip"><LockKeyhole size={15} /> Milestone amounts split the target. Funds remain held until evidence is approved.</div></div><div className="form-actions"><button type="button" className="button button-quiet" onClick={() => setCreateOpen(false)} data-testid="button-cancel-project">Cancel</button><button className="button button-primary" type="submit" data-testid="button-save-project">Create project <ArrowRight size={15} /></button></div></form>}
    <div className="project-switcher"><div><span className="eyebrow">SELECT PROJECT RECORD</span><b>{p?.title ?? 'No project yet'}</b></div><select value={p?.id ?? ''} onChange={e => setProjectId(e.target.value)} data-testid="select-ngo-project">{state.projects.map(pr => <option key={pr.id} value={pr.id}>{pr.title}</option>)}</select></div>
    {p ? <><div className="metrics-row"><Metric label="Donations received" value={formatINR(t.donated)} detail={`${state.donations.filter(d => d.projectId === p.id).length} contributions`} icon={Banknote} /><Metric label="Released after review" value={formatINR(t.released)} detail="Approved milestone value" icon={CheckCircle2} tone="metric-green" /><Metric label="Currently locked" value={formatINR(t.locked)} detail="Protected project funds" icon={LockKeyhole} tone="metric-ochre" /></div>
    <div className="ngo-work-grid"><section className="content-card ngo-milestones"><div className="card-heading"><div><div className="eyebrow">DELIVERY PLAN</div><h2>Milestone status</h2></div><span className="milestone-progress-count">{p.milestones.filter(m => m.status === 'released').length} / {p.milestones.length} released</span></div><div className="ngo-milestone-list">{p.milestones.map((m, i) => <div className="ngo-milestone-wrap" key={m.id} data-testid={`ngo-milestone-${m.id}`}><div className="ngo-milestone"><div className={`mini-step ${m.status}`}>{m.status === 'released' ? <Check size={14} /> : String(i + 1).padStart(2, '0')}</div><div className="ngo-milestone-copy"><b>{m.title}</b><span>{formatINR(m.amount)} · Due {shortDate(m.dueDate)}</span></div><Pill tone={m.status === 'released' ? 'green' : m.status === 'review' ? 'gold' : m.status === 'rejected' ? 'red' : 'neutral'}>{m.status === 'review' ? 'Under review' : m.status === 'released' ? 'Released' : m.status === 'rejected' ? 'Revise' : 'Locked'}</Pill><button type="button" className="milestone-edit-button" onClick={() => beginEdit(m)} aria-label={`Edit ${m.title}`} data-testid={`button-edit-milestone-${m.id}`}><Pencil size={13} /></button></div>{editingMilestone === m.id && <form className="milestone-edit-form" onSubmit={saveMilestone}><label>Milestone title<input value={editTitle} onChange={e => setEditTitle(e.target.value)} required data-testid={`input-edit-milestone-title-${m.id}`} /></label><label>Amount (₹)<input type="number" min="1" value={editAmount} onChange={e => setEditAmount(e.target.value)} required data-testid={`input-edit-milestone-amount-${m.id}`} /></label><label>Due date<input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} required data-testid={`input-edit-milestone-date-${m.id}`} /></label><div className="milestone-edit-actions"><button type="button" className="button button-quiet" onClick={() => setEditingMilestone('')} data-testid={`button-cancel-milestone-edit-${m.id}`}>Cancel</button><button type="submit" className="button button-primary" data-testid={`button-save-milestone-${m.id}`}><Save size={13} /> Save</button></div></form>}</div>)}</div></section>
      <section className="content-card evidence-form-card"><div className="card-heading"><div><div className="eyebrow">REQUEST A RELEASE</div><h2>Submit milestone proof</h2></div><div className="evidence-head-icon"><Upload size={17} /></div></div><p className="card-intro">Describe what was completed and where. Attachments are stored as metadata only in this demo.</p><form onSubmit={requestEvidence}><label className="field-label">Milestone<select value={milestoneId} onChange={e => setMilestoneId(e.target.value)} data-testid="select-evidence-milestone" required><option value="">Choose a milestone</option>{p.milestones.filter(m => m.status === 'locked' || m.status === 'rejected').map(m => <option value={m.id} key={m.id}>{m.title} · {formatINR(m.amount)}{m.status === 'rejected' ? ' (revision requested)' : ''}</option>)}</select></label><label className="field-label">Completion description<textarea value={evidenceDescription} onChange={e => setEvidenceDescription(e.target.value)} rows={4} placeholder="What work is complete? What can a verifier confirm?" required data-testid="input-evidence-description" /></label><label className="field-label">Work location<input value={evidenceLocation} onChange={e => setEvidenceLocation(e.target.value)} placeholder="Village, district, state" required data-testid="input-evidence-location" /></label><label className="upload-zone"><input type="file" multiple onChange={e => setFiles(Array.from(e.target.files ?? []).map(f => ({ name: f.name, type: f.type || 'application/octet-stream', size: f.size })))} data-testid="input-evidence-files" /><span className="upload-icon"><FileImage size={17} /></span><span><b>Choose supporting files</b><small>Images, receipts, reports · names and sizes only</small></span><Upload size={15} /></label>{files.length > 0 && <div className="selected-files">{files.map(file => <span key={file.name}><FileText size={13} />{file.name}<small>{(file.size / 1024).toFixed(0)} KB</small></span>)}</div>}<button className="button button-primary full-button" type="submit" data-testid="button-submit-evidence">Submit for independent review <ArrowRight size={15} /></button></form>{submitted && <div className="success-message" data-testid="status-evidence-success"><CheckCircle2 size={16} />{submitted}</div>}</section></div>
      <section className="content-card received-card"><div className="card-heading"><div><div className="eyebrow">DONOR RECORD</div><h2>Received contributions</h2></div><Pill>{state.donations.filter(d => d.projectId === p.id).length} entries</Pill></div><LedgerRows entries={state.ledger.filter(e => e.projectId === p.id && e.type === 'donation').slice(0, 6)} /></section></> : <EmptyState icon={BriefcaseBusiness} title="Start with a project" text="Create a project record and divide the work into milestones." />}
  </div>;
}
function VerifyPage() {
  const { state, vote } = useDemoState();
  const pending = state.projects.flatMap(project => project.milestones.filter(m => m.evidence && m.status === 'review').map(m => ({ project, milestone: m })));
  const decisions = state.ledger.filter(e => e.type === 'vote' || e.type === 'release');
  const releasedTotal = state.projects.reduce((sum, project) => sum + project.milestones.filter(m => m.status === 'released').reduce((total, m) => total + m.amount, 0), 0);
  const donatedTotal = state.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const lockedTotal = Math.max(donatedTotal - releasedTotal, 0);
  const [selectedVerifier, setSelectedVerifier] = useState('v2');
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');
  const verifierMap: Record<string, string> = { v1: 'Ananya Rao', v2: 'Rohan Mehta', v3: 'Nisha Kulkarni' };
  const doVote = (projectId: string, m: Milestone, decision: 'approve' | 'reject') => {
    if (m.votes.some(v => v.verifierId === selectedVerifier)) { setToast('This verifier has already voted on this milestone.'); return; }
    if (decision === 'reject' && !rejectReason.trim()) { setToast('Add a clear reason so the NGO knows what to address.'); return; }
    const currentProject = state.projects.find(p => p.id === projectId);
    const poolBalance = state.donations.filter(d => d.projectId === projectId).reduce((sum, d) => sum + d.amount, 0) - (currentProject?.milestones.filter(item => item.status === 'released').reduce((sum, item) => sum + item.amount, 0) ?? 0);
    if (decision === 'approve' && poolBalance < m.amount) { setToast(`This milestone needs ${formatINR(m.amount - Math.max(poolBalance, 0))} more in the project pool before an approval can release it.`); return; }
    vote(projectId, m.id, selectedVerifier, verifierMap[selectedVerifier], decision, decision === 'reject' ? rejectReason : '');
    setToast(decision === 'approve' ? 'Approval recorded in the simulated ledger.' : 'Rejection recorded. Funds remain locked until revised evidence is approved.');
    setRejectReason('');
  };
  return <div className="page-wrap"><PageHeading eyebrow="INDEPENDENT REVIEW" title="Proof before payout." description="Review evidence against the milestone scope. Every decision is attributed, visible, and recorded." action={<label className="verifier-select"><span>Reviewer</span><select value={selectedVerifier} onChange={e => setSelectedVerifier(e.target.value)} data-testid="select-verifier-identity">{Object.entries(verifierMap).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><ChevronDown size={14} /></label>} />
    <div className="review-rule"><div className="rule-icon"><Users size={19} /></div><div><b>Two of three distinct verifiers release a milestone.</b><span>One approval is recorded. A second approval releases exactly that milestone amount; a rejection keeps the funds locked.</span></div><div className="rule-count"><strong>2 / 3</strong><small>REQUIRED</small></div></div>
    <div className="verify-summary"><div><span>Awaiting decision</span><b>{pending.length}</b></div><div><span>Decisions in record</span><b>{decisions.length}</b></div><div><span>Funds released</span><b>{formatINR(releasedTotal)}</b></div><div><span>Funds still locked</span><b>{formatINR(lockedTotal)}</b></div></div>
    <section className="review-section"><div className="section-title-line"><div><div className="eyebrow">EVIDENCE QUEUE</div><h2>Ready for your review</h2></div><span className="section-count">{pending.length} item{pending.length === 1 ? '' : 's'}</span></div>
      {pending.length === 0 ? <EmptyState icon={FileCheck2} title="Nothing waiting on review" text="When an NGO submits milestone evidence, it will be available here with its attachments and vote history." /> : <div className="review-list">{pending.map(({ project, milestone: m }) => { const approvals = m.votes.filter(v => v.decision === 'approve').length; const rejected = m.votes.filter(v => v.decision === 'reject').length; const voted = m.votes.some(v => v.verifierId === selectedVerifier); const projectPool = state.donations.filter(d => d.projectId === project.id).reduce((sum, d) => sum + d.amount, 0) - project.milestones.filter(item => item.status === 'released').reduce((sum, item) => sum + item.amount, 0); const fullyFunded = projectPool >= m.amount; return <article className="review-card" key={`${project.id}-${m.id}`} data-testid={`review-card-${m.id}`}><div className="review-card-header"><div><span className="review-project-name"><Building2 size={14} /> {project.title} <span>/</span> {project.ngoName}</span><h3>{m.title}</h3></div><Pill tone={m.status === 'rejected' ? 'red' : 'gold'}>{m.status === 'rejected' ? 'Revision requested' : 'Awaiting consensus'}</Pill></div><div className="review-value-row"><span>Milestone amount</span><b>{formatINR(m.amount)} <small>held in escrow</small></b></div>{!fullyFunded && <div className="funding-warning" data-testid={`status-milestone-funding-${m.id}`}><LockKeyhole size={14} /> Project pool has {formatINR(Math.max(projectPool, 0))}. This milestone needs {formatINR(m.amount)} before an approval can release funds.</div>}{m.evidence && <div className="evidence-review"><div className="evidence-review-header"><div className="evidence-icon"><FileCheck2 size={16} /></div><div><b>Submitted {shortDate(m.evidence.submittedAt)}</b><span><MapPin size={13} /> {m.evidence.location}</span></div><Pill tone="neutral">EVIDENCE</Pill></div><p>{m.evidence.description}</p>{m.evidence.attachments.length > 0 ? <div className="attachment-list">{m.evidence.attachments.map(a => <div className="attachment-item" key={a.name}><span className="attachment-type">{a.type.includes('image') ? <FileImage size={16} /> : <FileText size={16} />}</span><span><b>{a.name}</b><small>{a.type || 'Attachment'} · {(a.size / 1024).toFixed(0)} KB · metadata only</small></span><CheckCircle2 size={15} /></div>)}</div> : <div className="no-attachments">No files attached. Review the written evidence and location.</div>}</div>}
        <div className="vote-progress-line"><span className="vote-progress-label"><VoteIcon size={14} /> Consensus</span><div className="vote-slots">{[0, 1, 2].map(i => { const v = m.votes[i]; return <span key={i} className={`vote-slot ${v?.decision ?? ''}`} title={v ? `${v.verifierName}: ${v.decision}` : 'Awaiting vote'}>{v ? v.decision === 'approve' ? <Check size={13} /> : <X size={13} /> : i + 1}</span>; })}</div><b>{approvals}/2 approvals</b><span className="votes-total">{m.votes.length}/3 cast{rejected ? ` · ${rejected} against` : ''}</span></div>
        {m.votes.length > 0 && <div className="vote-history-mini">{m.votes.map(v => <span key={v.verifierId} className={v.decision}><i>{v.decision === 'approve' ? <Check size={11} /> : <X size={11} />}</i><b>{v.verifierName}</b> {v.decision === 'approve' ? 'approved' : 'requested revision'}{v.reason && <small>“{v.reason}”</small>}</span>)}</div>}
        {m.rejectionReason && <div className="rejection-callout"><XCircle size={15} /><span><b>Funds are still locked.</b> {m.rejectionReason}</span></div>}
        <div className="review-actions">{!voted ? <><button className="button button-approve" onClick={() => doVote(project.id, m, 'approve')} disabled={!fullyFunded} title={!fullyFunded ? 'This milestone is not fully funded yet' : ''} data-testid={`button-approve-${m.id}`}><CheckCircle2 size={16} /> Approve evidence</button><div className="reject-control"><input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason required for rejection" aria-label="Reason for rejection" data-testid={`input-rejection-reason-${m.id}`} /><button className="button button-reject" onClick={() => doVote(project.id, m, 'reject')} data-testid={`button-reject-${m.id}`}><XCircle size={15} /> Request revision</button></div></> : <div className="already-voted"><CheckCircle2 size={15} /> Your vote is recorded as {m.votes.find(v => v.verifierId === selectedVerifier)?.decision}. Select another verifier identity to demonstrate independent review.</div>}</div>
      </article>; })}</div>}
    </section>
    {toast && <div className="inline-toast" role="status" data-testid="status-vote-result"><CheckCircle2 size={15} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss message" data-testid="button-dismiss-vote-status"><X size={14} /></button></div>}
    <section className="decision-history"><div className="section-title-line"><div><div className="eyebrow">AUDIT TRAIL</div><h2>Previous decisions</h2></div><Link href="/ledger" className="inline-link" data-testid="link-verifier-ledger">Open full ledger <ArrowRight size={14} /></Link></div><LedgerRows entries={decisions.slice(0, 5)} /></section>
  </div>;
}
function LedgerPage() {
  const { state } = useDemoState();
  const [type, setType] = useState('All activity');
  const [projectId, setProjectId] = useState('all');
  const types = ['All activity', 'Donations', 'Evidence', 'Verifier decisions', 'Milestone releases'];
  const filtered = state.ledger.filter(e => (type === 'All activity' || (type === 'Donations' && e.type === 'donation') || (type === 'Evidence' && e.type === 'evidence') || (type === 'Verifier decisions' && e.type === 'vote') || (type === 'Milestone releases' && e.type === 'release')) && (projectId === 'all' || e.projectId === projectId));
  const donated = state.donations.reduce((sum, d) => sum + d.amount, 0);
  const released = state.projects.reduce((sum, p) => sum + p.milestones.filter(m => m.status === 'released').reduce((a, m) => a + m.amount, 0), 0);
  return <div className="page-wrap"><PageHeading eyebrow="PUBLIC RECORD" title="The ledger, without the jargon." description="A readable audit trail of contributions, evidence submissions, verifier decisions and milestone releases." action={<div className="ledger-status"><span className="live-dot" /> DEMO LEDGER · LOCAL</div>} />
    <div className="ledger-explainer"><div className="ledger-explainer-icon"><Fingerprint size={23} /></div><div><b>Inspectable by everyone. Owned by no single action.</b><p>Each activity has an actor, timestamp and simulated transaction reference. This browser demo stores records locally; chain references are illustrative only.</p></div><div className="explainer-stats"><span><small>CONTRIBUTED</small><b>{formatINR(donated)}</b></span><ArrowRight size={16} /><span><small>RELEASED</small><b>{formatINR(released)}</b></span></div></div>
    <div className="ledger-toolbar"><div className="filter-tabs">{types.map(t => <button key={t} onClick={() => setType(t)} className={type === t ? 'active' : ''} data-testid={`button-ledger-filter-${t.toLowerCase().replaceAll(' ', '-')}`}>{t}</button>)}</div><select value={projectId} onChange={e => setProjectId(e.target.value)} data-testid="select-ledger-project"><option value="all">All projects</option>{state.projects.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</select></div>
    <section className="ledger-table-card"><div className="ledger-table-head"><div><span className="eyebrow">CHRONOLOGICAL RECORD</span><h2>Transaction & decision history</h2></div><span className="record-count">{filtered.length} records</span></div>{filtered.length ? <LedgerRows entries={filtered} /> : <EmptyState icon={Fingerprint} title="No records in this view" text="Try another activity filter or project." />}</section>
    <div className="ledger-disclaimer"><LockKeyhole size={15} /><span><b>Simulation notice:</b> All transactions and chain references shown are generated by this demo. No real blockchain, funds, wallets, or private keys are used.</span></div>
  </div>;
}
function LedgerRows({ entries, compact = false }: { entries: ReturnType<typeof useDemoState>['state']['ledger']; compact?: boolean }) {
  const { state } = useDemoState();
  const iconByType = { donation: HandCoins, release: ArrowUpRight, evidence: FileCheck2, vote: VoteIcon, project: Building2 };
  const colorByType: Record<string, string> = { donation: 'gold', release: 'green', evidence: 'teal', vote: 'ink', project: 'teal' };
  const labelByType: Record<string, string> = { donation: 'Contribution', release: 'Funds released', evidence: 'Evidence submitted', vote: 'Verifier decision', project: 'Project created' };
  if (!entries.length) return <EmptyState icon={Clock3} title="No activity yet" text="New contributions and milestone activity will appear here." />;
  return <div className={`ledger-rows ${compact ? 'compact' : ''}`}>{entries.map((entry, index) => { const Icon = iconByType[entry.type]; const milestone = entry.milestoneId ? state.projects.flatMap(p => p.milestones).find(m => m.id === entry.milestoneId) : undefined; return <div className="ledger-row" key={entry.id} data-testid={`ledger-entry-${entry.id}`}><div className={`ledger-row-icon ${colorByType[entry.type]}`}><Icon size={16} /></div><div className="ledger-row-main"><div className="ledger-row-title"><b>{labelByType[entry.type]}</b><Pill tone={colorByType[entry.type]}>{entry.type === 'vote' ? entry.detail.toLowerCase().includes('approved') ? 'Approved' : 'Decision' : labelByType[entry.type]}</Pill></div><span>{entry.detail}{milestone && ` · ${milestone.title}`}</span><small><span>{entry.actor}</span><i>·</i>{shortDate(entry.createdAt)}<i>·</i><code>{entry.transactionHash}</code></small></div><div className="ledger-row-value">{entry.amount > 0 ? <><b className={entry.type === 'release' ? 'value-release' : ''}>{entry.type === 'release' ? '+' : ''}{formatINR(entry.amount)}</b><small>{entry.type === 'release' ? 'Released' : 'Contribution'}</small></> : <span className="no-amount">—</span>}</div>{!compact && <div className={`timeline-rail ${index === entries.length - 1 ? 'last' : ''}`} />}</div>; })}</div>;
}
function EmptyState({ icon: Icon, title, text, link, linkText }: { icon: typeof FolderOpen; title: string; text: string; link?: string; linkText?: string }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p>{link && linkText && <Link href={link} className="inline-link" data-testid="link-empty-state">{linkText} <ArrowRight size={14} /></Link>}</div>;
}
export default App;