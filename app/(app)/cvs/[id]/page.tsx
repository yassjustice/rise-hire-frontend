'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, CV } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

type RichCV = CV & {
  profile?: string;
  projects?: unknown;
  raw_text?: string;
  industry?: string;
  certifications?: unknown;
  skills_in_experience?: string[];
};

/** Normalize a field that may be a string (newline-joined) or an array into clean lines. */
function toLines(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v))
    return v.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(/\n+/).map(s => s.trim()).filter(Boolean);
  return [];
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="flex items-center gap-2 font-semibold text-text-900 mb-4">
        <span className="text-lg">{icon}</span> {title}
      </h2>
      {children}
    </Card>
  );
}

function TimelineItem({ text, accent }: { text: string; accent: string }) {
  // Split "Title at Company (dates): description" heuristically
  const [head, ...rest] = text.split(/:\s/);
  return (
    <div className={`relative pl-5 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full ${accent}`}>
      <p className="font-medium text-text-900 text-sm leading-snug">{head}</p>
      {rest.length > 0 && <p className="text-sm text-text-500 mt-0.5">{rest.join(': ')}</p>}
    </div>
  );
}

function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'success' }) {
  const tones = {
    neutral: 'bg-bg-50 text-text-600 border-border',
    primary: 'bg-primary-light text-primary border-primary/20',
    success: 'bg-green-50 text-success border-green-200',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full border ${tones[tone]}`}>{label}</span>;
}

export default function CVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cv, setCv] = useState<RichCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    try { setCv((await api.getCV(id)) as RichCV); }
    catch { toast('CV introuvable', 'error'); router.push('/cvs'); }
    finally { setLoading(false); }
  }, [id, toast, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (!cv) return null;

  const name = cv.candidate_name || 'Candidat inconnu';
  const initials = cv.candidate_name
    ? cv.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const email = cv.candidate_email || cv.email || '';
  const phone = cv.candidate_phone || cv.phone || '';
  const location = cv.candidate_location || cv.location || '';
  const confidence = typeof cv.confidence_score === 'object' && cv.confidence_score
    ? Math.round(((cv.confidence_score as { confidence?: number }).confidence ?? 0))
    : 0;
  const backedSkills = new Set((cv.skills_in_experience || []).map(s => s.toLowerCase()));

  const experience = toLines(cv.experience);
  const education = toLines(cv.education);
  const projects = toLines(cv.projects);
  const failed = cv.extraction_status !== 'done';

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-5 text-sm">
        <Link href="/cvs" className="text-text-400 hover:text-primary">← CVs</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 font-medium">{name}</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-6 mb-6 shadow-card">
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl font-bold ring-2 ring-white/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            {cv.industry && <p className="text-white/80 mt-0.5">{cv.industry}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-white/90">
              {email && <span>✉️ {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {cv.candidate_linkedin && <a className="underline" href={cv.candidate_linkedin} target="_blank" rel="noreferrer">in/LinkedIn</a>}
              {cv.candidate_github && <a className="underline" href={cv.candidate_github} target="_blank" rel="noreferrer">GitHub</a>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-3xl font-bold leading-none">{confidence}%</p>
              <p className="text-xs text-white/70">confiance d&apos;extraction</p>
            </div>
            {failed && (
              <span className="text-xs bg-amber-400/90 text-amber-950 px-2 py-1 rounded-full font-medium">
                ⚠️ Extraction incomplète
              </span>
            )}
          </div>
        </div>
        {/* Quick facts strip */}
        <div className="flex flex-wrap gap-6 mt-5 pt-4 border-t border-white/15 text-sm">
          <div><span className="text-white/60">Expérience</span><br /><span className="font-semibold">{cv.experience_years ?? 0} an(s)</span></div>
          {cv.education_level && <div><span className="text-white/60">Formation</span><br /><span className="font-semibold">{cv.education_level}</span></div>}
          <div><span className="text-white/60">Compétences</span><br /><span className="font-semibold">{cv.skills?.length ?? 0}</span></div>
          {cv.language && <div><span className="text-white/60">Langue du CV</span><br /><span className="font-semibold uppercase">{cv.language}</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cv.profile && (
            <Section title="Profil" icon="🧭">
              <p className="text-sm text-text-600 leading-relaxed">{cv.profile}</p>
            </Section>
          )}

          {experience.length > 0 ? (
            <Section title="Expériences professionnelles" icon="💼">
              <div className="flex flex-col gap-4">
                {experience.map((e, i) => <TimelineItem key={i} text={e} accent="before:bg-primary" />)}
              </div>
            </Section>
          ) : (
            <Section title="Expériences professionnelles" icon="💼">
              <p className="text-sm text-text-400">Aucune expérience détectée dans ce document.</p>
            </Section>
          )}

          {education.length > 0 && (
            <Section title="Formation" icon="🎓">
              <div className="flex flex-col gap-4">
                {education.map((e, i) => <TimelineItem key={i} text={e} accent="before:bg-success" />)}
              </div>
            </Section>
          )}

          {projects.length > 0 && (
            <Section title="Projets" icon="🚀">
              <div className="flex flex-col gap-3">
                {projects.map((e, i) => <TimelineItem key={i} text={e} accent="before:bg-warning" />)}
              </div>
            </Section>
          )}

          {/* Document preview (extracted text) */}
          {cv.raw_text && cv.raw_text.trim().length > 0 && (
            <Card>
              <button onClick={() => setShowRaw(s => !s)} className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2 font-semibold text-text-900"><span className="text-lg">📄</span> Aperçu du document (texte extrait)</span>
                <span className="text-text-400 text-sm">{showRaw ? '▲ masquer' : '▼ afficher'}</span>
              </button>
              {showRaw && (
                <pre className="mt-4 text-xs text-text-500 whitespace-pre-wrap bg-bg-100 rounded-lg p-4 max-h-96 overflow-y-auto border border-border font-sans">
                  {cv.raw_text}
                </pre>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {Array.isArray(cv.skills) && cv.skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Compétences ({cv.skills.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map(s => (
                  <Chip key={s} label={s} tone={backedSkills.has(s.toLowerCase()) ? 'success' : 'neutral'} />
                ))}
              </div>
              {backedSkills.size > 0 && (
                <p className="text-[11px] text-text-400 mt-3">🟢 = compétence confirmée par l&apos;expérience</p>
              )}
            </Card>
          )}

          {Array.isArray(cv.soft_skills) && cv.soft_skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Soft skills</h3>
              <div className="flex flex-wrap gap-1.5">{cv.soft_skills.map(s => <Chip key={s} label={s} />)}</div>
            </Card>
          )}

          {Array.isArray(cv.languages_spoken) && cv.languages_spoken.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Langues</h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.languages_spoken.map(l => <Chip key={l.language} tone="primary" label={`${l.language}${l.level ? ` · ${l.level}` : ''}`} />)}
              </div>
            </Card>
          )}

          {Array.isArray(cv.flags) && cv.flags.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Signaux qualité</h3>
              <div className="flex flex-col gap-1.5">
                {cv.flags.map((f, i) => {
                  const label = typeof f === 'string' ? f : (f as { message?: string }).message || JSON.stringify(f);
                  return <span key={i} className="text-xs text-warning bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">⚠ {label}</span>;
                })}
              </div>
            </Card>
          )}

          <Link href="/sessions/new">
            <Card className="text-center cursor-pointer hover:border-primary/40 transition-colors">
              <p className="text-2xl mb-1">🚀</p>
              <p className="text-sm font-medium text-primary">Comparer à une offre</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
