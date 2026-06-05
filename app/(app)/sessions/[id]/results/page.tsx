'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, SessionResults, ResultRow } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThresholdBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatScore, getScoreColor } from '@/lib/utils';

function Tag({ skill, kind }: { skill: string; kind: 'good' | 'bad' }) {
  const cls = kind === 'good'
    ? 'bg-green-50 text-success border-green-200'
    : 'bg-red-50 text-danger border-red-200';
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{skill}</span>;
}

function rankBadge(i: number) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return null;
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try { setResults(await api.getResults(id)); }
    catch { toast('Résultats indisponibles', 'error'); }
    finally { setLoading(false); }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await api.exportCSV(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `resultats-${id}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast('Export CSV téléchargé', 'success');
    } catch { toast("Erreur lors de l'export CSV", 'error'); }
    finally { setExporting(false); }
  };

  if (loading) return <PageLoader />;
  if (!results) return <div className="p-6 text-text-400 text-center">Résultats indisponibles</div>;

  // Sort by score, then de-duplicate identical candidates (same name + email)
  const sorted = (results.results ?? []).slice().sort((a, b) => (b.final_score_pct ?? 0) - (a.final_score_pct ?? 0));
  const seen = new Set<string>();
  const ranked: ResultRow[] = [];
  for (const r of sorted) {
    const key = `${(r.candidate_name || '').toLowerCase().trim()}|${(r.candidate_email || r.email || '').toLowerCase().trim()}`;
    const dedupeKey = r.candidate_name ? key : `id:${r.cv_id}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    ranked.push(r);
  }

  const avg = ranked.length ? ranked.reduce((s, r) => s + (r.final_score_pct ?? 0), 0) / ranked.length : 0;
  const above = ranked.filter(r => (r.final_score_pct ?? 0) >= 80).length;
  const top = ranked[0]?.candidate_name || '—';

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-5 text-sm">
        <Link href="/sessions" className="text-text-400 hover:text-primary">← Sessions</Link>
        <span className="text-text-300">/</span>
        <Link href={`/sessions/${id}`} className="text-text-400 hover:text-primary">Session</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 font-medium">Résultats</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-900">Résultats du scoring</h1>
          <p className="text-text-500 mt-1">{ranked.length} candidat{ranked.length > 1 ? 's' : ''} classé{ranked.length > 1 ? 's' : ''} par pertinence</p>
        </div>
        <Button variant="secondary" onClick={handleExport} loading={exporting}>📊 Export CSV</Button>
      </div>

      {/* Summary */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><p className="text-xs text-text-400 uppercase tracking-wider">Score moyen</p>
            <p className="text-2xl font-bold mt-1" style={{ color: getScoreColor(avg / 100) }}>{formatScore(avg)}%</p></Card>
          <Card><p className="text-xs text-text-400 uppercase tracking-wider">Recommandés (≥80%)</p>
            <p className="text-2xl font-bold text-success mt-1">{above}</p></Card>
          <Card><p className="text-xs text-text-400 uppercase tracking-wider">Meilleur candidat</p>
            <p className="text-lg font-bold text-text-900 mt-1 truncate">{top}</p></Card>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-100 text-text-500">
              <th className="text-left px-4 py-3 font-medium w-12">#</th>
              <th className="text-left px-4 py-3 font-medium">Candidat</th>
              <th className="text-left px-4 py-3 font-medium w-48">Score</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-left px-4 py-3 font-medium">Points forts</th>
              <th className="text-left px-4 py-3 font-medium">Lacunes</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => {
              const pct = r.final_score_pct ?? 0;
              const color = getScoreColor(pct / 100);
              return (
                <tr key={r.cv_id || i} className="border-b border-border last:border-0 hover:bg-bg-100 transition-colors align-top">
                  <td className="px-4 py-3 font-bold text-text-400">{rankBadge(i) || i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-900">{r.candidate_name || 'Candidat inconnu'}</p>
                    {(r.candidate_email || r.email) && <p className="text-xs text-text-400">{r.candidate_email || r.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold tabular-nums" style={{ color }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-bg-50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ThresholdBadge threshold={r.threshold || (pct >= 80 ? 'green' : pct >= 50 ? 'orange' : 'red')} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.strengths && r.strengths.length > 0)
                        ? r.strengths.slice(0, 3).map(s => <Tag key={s} skill={s} kind="good" />)
                        : (r.matched_skills || []).slice(0, 3).map(s => <Tag key={s} skill={s} kind="good" />)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.missing_skills || []).slice(0, 3).map(s => <Tag key={s} skill={s} kind="bad" />)}
                      {(!r.missing_skills || r.missing_skills.length === 0) && <span className="text-xs text-text-300">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
