import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Vote = { verifierId: string; verifierName: string; decision: 'approve' | 'reject'; reason?: string; createdAt: string };
export type Evidence = { description: string; location: string; submittedAt: string; attachments: { name: string; type: string; size: number }[] };
export type Milestone = { id: string; title: string; amount: number; status: 'released' | 'review' | 'locked' | 'rejected'; dueDate: string; evidence?: Evidence; votes: Vote[]; rejectionReason?: string };
export type Project = { id: string; title: string; description: string; ngoName: string; location: string; targetAmount: number; milestones: Milestone[] };
export type Donation = { id: string; projectId: string; donorName: string; amount: number; createdAt: string; transactionHash: string };
export type LedgerEntry = { id: string; type: 'donation' | 'release' | 'evidence' | 'vote' | 'project'; amount: number; actor: string; detail: string; createdAt: string; transactionHash: string; milestoneId?: string; projectId: string };
export type DemoState = { projects: Project[]; donations: Donation[]; ledger: LedgerEntry[] };

const stamp = (daysAgo = 0) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const milestoneDate = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);
const seedState = (): DemoState => {
  const projectId = 'school-construction';
  const milestones: Milestone[] = [
    { id: 'm1', title: 'Site preparation & foundation', amount: 25000, status: 'released', dueDate: milestoneDate(-30), votes: [{ verifierId: 'v1', verifierName: 'Ananya Rao', decision: 'approve', reason: 'Foundation work matches the submitted site record.', createdAt: stamp(12) }, { verifierId: 'v2', verifierName: 'Rohan Mehta', decision: 'approve', reason: 'Independent site check complete.', createdAt: stamp(11) }], evidence: { description: 'Foundation trenching and first concrete pour completed across the full site. Photos and contractor receipt attached.', location: 'Govt. Primary School, Kharola, Maharashtra', submittedAt: stamp(13), attachments: [{ name: 'foundation-progress.jpg', type: 'image/jpeg', size: 1482000 }, { name: 'contractor-receipt.pdf', type: 'application/pdf', size: 284000 }] } },
    { id: 'm2', title: 'Classroom walls & structure', amount: 25000, status: 'review', dueDate: milestoneDate(30), votes: [{ verifierId: 'v1', verifierName: 'Ananya Rao', decision: 'approve', reason: 'Materials and work align with the milestone scope.', createdAt: stamp(1) }], evidence: { description: 'Brickwork is complete up to lintel height in both classrooms. The attached photos show the north and east walls, with the local mason invoice for verification.', location: 'Govt. Primary School, Kharola, Maharashtra', submittedAt: stamp(2), attachments: [{ name: 'classroom-walls-north.jpg', type: 'image/jpeg', size: 2180000 }, { name: 'mason-invoice.pdf', type: 'application/pdf', size: 391000 }] } },
    { id: 'm3', title: 'Roofing, doors & windows', amount: 25000, status: 'locked', dueDate: milestoneDate(90), votes: [] },
    { id: 'm4', title: 'Finishing & classroom handover', amount: 25000, status: 'locked', dueDate: milestoneDate(150), votes: [] },
  ];
  const donations: Donation[] = [
    { id: 'd1', projectId, donorName: 'Mira Patel', amount: 25000, createdAt: stamp(18), transactionHash: '0x8a31…f90c' },
    { id: 'd2', projectId, donorName: 'Arjun Shah', amount: 30000, createdAt: stamp(9), transactionHash: '0x2cf7…1a42' },
    { id: 'd3', projectId, donorName: 'Kavya Nair', amount: 20000, createdAt: stamp(4), transactionHash: '0x6d20…b817' },
  ];
  const project: Project = { id: projectId, title: 'School Construction', description: 'A safer, brighter school for 120 children in Kharola. This fund is divided into four verifiable construction milestones; each release waits for independent approval of on-site evidence.', ngoName: 'Sakhi Education Trust', location: 'Kharola, Maharashtra', targetAmount: 100000, milestones };
  const ledger: LedgerEntry[] = [
    ...donations.map(d => ({ id: `l-${d.id}`, type: 'donation' as const, amount: d.amount, actor: d.donorName, detail: `Contribution to ${project.title}`, createdAt: d.createdAt, transactionHash: d.transactionHash, projectId })),
    { id: 'l-evidence-1', type: 'evidence' as const, amount: 0, actor: 'Sakhi Education Trust', detail: 'Evidence submitted for Classroom walls & structure', createdAt: stamp(2), transactionHash: '0x91bc…ee12', milestoneId: 'm2', projectId },
    { id: 'l-vote-1', type: 'vote' as const, amount: 0, actor: 'Ananya Rao', detail: 'Approved Classroom walls & structure · 1 of 3 votes', createdAt: stamp(1), transactionHash: '0x4b20…c319', milestoneId: 'm2', projectId },
    { id: 'l-vote-foundation-1', type: 'vote' as const, amount: 0, actor: 'Ananya Rao', detail: 'Approved Site preparation & foundation · first vote', createdAt: stamp(12), transactionHash: '0x27c1…a086', milestoneId: 'm1', projectId },
    { id: 'l-vote-foundation-2', type: 'vote' as const, amount: 0, actor: 'Rohan Mehta', detail: 'Approved Site preparation & foundation · 2 of 3 approvals', createdAt: stamp(11), transactionHash: '0x3e15…bd62', milestoneId: 'm1', projectId },
    { id: 'l-release-1', type: 'release' as const, amount: 25000, actor: 'Verifier consensus', detail: 'Released Site preparation & foundation after 2 of 3 approvals', createdAt: stamp(11), transactionHash: '0xb100…4f21', milestoneId: 'm1', projectId },
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { projects: [project], donations, ledger };
};

const STORAGE_KEY = 'clearpath-demo-v1';
type StateApi = { state: DemoState; reset: () => void; donate: (projectId: string, amount: number, donorName: string) => void; createProject: (project: Project) => void; updateMilestone: (projectId: string, milestoneId: string, changes: Pick<Milestone, 'title' | 'amount' | 'dueDate'>) => void; submitEvidence: (projectId: string, milestoneId: string, evidence: Evidence) => void; vote: (projectId: string, milestoneId: string, verifierId: string, verifierName: string, decision: 'approve' | 'reject', reason: string) => void };
const Context = createContext<StateApi | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as DemoState : seedState();
    } catch { return seedState(); }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  const api = useMemo<StateApi>(() => ({
    state,
    reset: () => { const fresh = seedState(); setState(fresh); },
    donate: (projectId, amount, donorName) => setState(prev => {
      const id = `d-${Date.now()}`, hash = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`, createdAt = new Date().toISOString();
      const donation: Donation = { id, projectId, donorName, amount, createdAt, transactionHash: hash };
      const entry: LedgerEntry = { id: `l-${id}`, type: 'donation', amount, actor: donorName, detail: `Contribution to ${prev.projects.find(p => p.id === projectId)?.title ?? 'project'}`, createdAt, transactionHash: hash, projectId };
      return { ...prev, donations: [donation, ...prev.donations], ledger: [entry, ...prev.ledger] };
    }),
    createProject: project => setState(prev => ({ ...prev, projects: [project, ...prev.projects], ledger: [{ id: `l-${project.id}`, type: 'project', amount: 0, actor: project.ngoName, detail: `Created project ${project.title}`, createdAt: new Date().toISOString(), transactionHash: `0x${Math.random().toString(16).slice(2, 10)}`, projectId: project.id }, ...prev.ledger] })),
    updateMilestone: (projectId, milestoneId, changes) => setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id !== projectId ? p : { ...p, milestones: p.milestones.map(m => m.id === milestoneId && m.status !== 'released' && m.status !== 'review' ? { ...m, ...changes } : m) }) })),
    submitEvidence: (projectId, milestoneId, evidence) => setState(prev => {
      const hash = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`, createdAt = new Date().toISOString();
      return { ...prev, projects: prev.projects.map(p => p.id !== projectId ? p : { ...p, milestones: p.milestones.map(m => m.id === milestoneId && (m.status === 'locked' || m.status === 'rejected') ? { ...m, evidence, status: 'review' as const, votes: [], rejectionReason: undefined } : m) }), ledger: [{ id: `l-e-${Date.now()}`, type: 'evidence', amount: 0, actor: 'Sakhi Education Trust', detail: `Evidence submitted for ${prev.projects.find(p => p.id === projectId)?.milestones.find(m => m.id === milestoneId)?.title ?? 'milestone'}`, createdAt, transactionHash: hash, milestoneId, projectId }, ...prev.ledger] };
    }),
    vote: (projectId, milestoneId, verifierId, verifierName, decision, reason) => setState(prev => {
      const createdAt = new Date().toISOString(), hash = `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`;
      const project = prev.projects.find(p => p.id === projectId);
      const milestone = project?.milestones.find(m => m.id === milestoneId);
      const received = prev.donations.filter(d => d.projectId === projectId).reduce((sum, d) => sum + d.amount, 0);
      const alreadyReleased = project?.milestones.filter(m => m.status === 'released').reduce((sum, m) => sum + m.amount, 0) ?? 0;
      if (decision === 'approve' && milestone && received - alreadyReleased < milestone.amount) return prev;
      let released = false;
      const projects = prev.projects.map(p => p.id !== projectId ? p : { ...p, milestones: p.milestones.map(m => {
        if (m.id !== milestoneId || m.status !== 'review' || m.votes.some(v => v.verifierId === verifierId)) return m;
        const vote: Vote = { verifierId, verifierName, decision, reason: reason.trim() || undefined, createdAt };
        const votes = [...m.votes, vote], approvals = votes.filter(v => v.decision === 'approve').length, rejections = votes.filter(v => v.decision === 'reject').length;
        if (approvals >= 2) { released = true; return { ...m, votes, status: 'released' as const, rejectionReason: undefined }; }
        if (rejections >= 2) return { ...m, votes, status: 'rejected' as const, rejectionReason: votes.filter(v => v.decision === 'reject').map(v => v.reason).filter(Boolean).join(' ') || 'Evidence did not meet the milestone requirements.' };
        return { ...m, votes, status: 'review' as const, rejectionReason: decision === 'reject' ? reason.trim() || 'Verifier requested additional evidence.' : undefined };
      }) });
      const voteEntry: LedgerEntry = { id: `l-v-${Date.now()}`, type: 'vote', amount: 0, actor: verifierName, detail: `${decision === 'approve' ? 'Approved' : 'Rejected'} ${prev.projects.find(p => p.id === projectId)?.milestones.find(m => m.id === milestoneId)?.title ?? 'milestone'}`, createdAt, transactionHash: hash, milestoneId, projectId };
      const releaseEntry: LedgerEntry | null = released ? { id: `l-r-${Date.now()}`, type: 'release', amount: prev.projects.find(p => p.id === projectId)?.milestones.find(m => m.id === milestoneId)?.amount ?? 0, actor: 'Verifier consensus', detail: `Released after 2 of 3 independent approvals`, createdAt, transactionHash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`, milestoneId, projectId } : null;
      return { ...prev, projects, ledger: releaseEntry ? [releaseEntry, voteEntry, ...prev.ledger] : [voteEntry, ...prev.ledger] };
    }),
  }), [state]);
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
export function useDemoState() { const value = useContext(Context); if (!value) throw new Error('DemoStateProvider is missing'); return value; }
export const formatINR = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;
export const shortDate = (date: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));