'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, SessionResults } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThresholdBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { formatScore, getScoreColor } from '@/lib/utils';

function MissingSkill({ skill }: { skill: string }) {
  return <span className="bg-red-50 text-danger border border-red-200 text-xs px-2 py-0.5 rounded-full">{skill}</span>;
}

function StrengthSkill({ skill }: { skill: string }) {
  return <span className="bg-green-50 text-success border border-green-200 text-xs px-2 py-0.5 rounded-full">{skill}</span>;
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try { setResults(await api.getResults(id)); }
    catch { toast('Résultats indisponibles', 'error'); }
    finally { setLoading(false); }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (type: 'csv' | 'pdf') => {
    setExporting(type);
    try {
      const blob = type === 'csv' ? await api.exportCSV(id) : await api.exportPDF(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${id}.${type}`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Export ${type.toUpperCase()} téléchargé`, 'success');
    } catch {
      toast(`Erreur lors de l'export ${type.toUpperCase()}`, 'error');
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <PageLoader />;
  if (!results) return <div className="p-6 text-text-400 text-center">Résultats indisponibles</div>;

  const ranked = results.results?.sort((a, b) => (b.final_score_pct ?? 0) - (a.final_score_pct ?? 0)) ?? [];
  const summary = results.summary ?? (ranked.length > 0 ? {
    avg_score: ranked.reduce((s, r) => s + (r.final_score_pct ?? 0), 0) / ranked.length,
    above_threshold: ranked.filter(r => (r.final_score_pct ?? 0) >= 80).length,
    top_candidate: ranked[0]?.candidate_name || '—',
  } : undefined);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sessions" className="text-text-400 hover:text-text-700">← Sessions</Link>
        <span className="text-text-300">/</span>
        <Link href={`/sessions/${id}`} className="text-text-400 hover:text-text-700">Session</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700">Résultats</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-900">Résultats du scoring</h1>
          <p className="text-text-500 mt-1">{ranked.length} candidats classés par score</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')} loading={exporting === 'csv'}>
            📊 Export CSV
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {summary && (
        <Card className="mb-6 flex flex-wrap gap-6">
          {summary.avg_score !== undefined && (
            <div>
              <p className="text-xs text-text-400 uppercase tracking-wider">Score moyen</p>
              <p className="text-2xl font-bold" style={{ color: getScoreColor(summary.avg_score / 100) }}>
                {formatScore(summary.avg_score)}%
              </p>
            </div>
          )}
          {summary.above_threshold !== undefined && (
            <div>
              <p className="text-xs text-text-400 uppercase tracking-wider">Au-dessus du seuil (≥80%)</p>
              <p className="text-2xl font-bold text-success">{summary.above_threshold}</p>
            </div>
          )}
          {summary.top_candidate && (
            <div>
              <p className="text-xs text-text-400 uppercase tracking-wider">Meilleur candidat</p>
              <p className="text-xl font-bold text-text-900">{summary.top_candidate}</p>
            </div>
          )}
        </Card>
      )}

      {/* Results table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-100">
              <th className="text-left px-4 py-3 font-medium text-text-500 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-text-500">Candidat</th>
              <th className="text-left px-4 py-3 font-medium text-text-500">Score final</th>
              <th className="text-left px-4 py-3 font-medium text-text-500">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-text-500">Points forts</th>
              <th className="text-left px-4 py-3 font-medium text-text-500">Lacunes</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.cv_id || i} className="border-b border-border last:border-0 hover:bg-bg-100 transition-colors align-top">
                <td className="px-4 py-3 font-bold text-text-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-900">{r.candidate_name || 'Inconnu'}</p>
                  {r.email && <p className="text-xs text-text-400">{r.email}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-lg font-bold" style={{ color: getScoreColor((r.final_score_pct ?? 0) / 100) }}>
                    {r.final_score_pct !== undefined ? `${r.final_score_pct.toFixed(1)}%` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ThresholdBadge threshold={r.threshold || (r.final_score_pct >= 80 ? 'green' : r.final_score_pct >= 50 ? 'orange' : 'red')} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(r.strengths || []).slice(0, 3).map(s => <StrengthSkill key={s} skill={s} />)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(r.missing_skills || []).slice(0, 3).map(s => <MissingSkill key={s} skill={s} />)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
