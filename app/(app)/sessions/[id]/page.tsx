'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Session, Offer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePoll } from '@/hooks/usePoll';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatDate, WEIGHT_LABELS } from '@/lib/utils';

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-primary-light' : done ? 'bg-success/10' : 'bg-bg-100'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${active ? 'bg-primary text-white' : done ? 'bg-success text-white' : 'bg-bg-50 text-text-400 border border-border'}`}>
        {active ? <Spinner size="sm" className="w-3 h-3" /> : done ? '✓' : ''}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-primary' : done ? 'text-success' : 'text-text-400'}`}>{label}</span>
    </div>
  );
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const { toast } = useToast();

  const fetchSession = useCallback(async () => {
    try { return await api.getSession(id); }
    catch { return null; }
  }, [id]);

  const { data: polled, stop } = usePoll<Session>(fetchSession);

  useEffect(() => {
    if (polled) {
      setSession(polled);
      if (polled.status === 'completed' || polled.status === 'failed') stop();
    }
  }, [polled, stop]);

  useEffect(() => {
    fetchSession().then(s => { if (s) setSession(s); }).catch(() => toast('Session introuvable', 'error'));
  }, [fetchSession, toast]);

  const offerId = session?.offer_id || session?.job_offer_id;
  useEffect(() => {
    if (!offerId) return;
    api.getOffer(offerId).then(setOffer).catch(() => setOffer(null));
  }, [offerId]);

  const isProcessing = session?.status === 'processing' || session?.status === 'pending';
  const isDone = session?.status === 'completed';
  const isFailed = session?.status === 'failed';
  const cvCount = session?.total_cvs ?? session?.cv_count ?? 0;
  const weights = (session?.weights || {}) as Record<string, number>;
  const critical = new Set((offer?.critical_skills || []).map(s => s.toLowerCase()));

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-5 text-sm">
        <Link href="/sessions" className="text-text-400 hover:text-primary">← Sessions</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 font-medium truncate">{session?.name || '...'}</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl hero-gradient text-white p-6 mb-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{session?.name || 'Session'}</h1>
            <p className="text-white/80 mt-1 text-sm">
              {session && `Créée le ${formatDate(session.created_at)}`}
              {session?.completed_at ? ` · Terminée le ${formatDate(session.completed_at)}` : ''}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{cvCount} candidat(s)</span>
              {offer && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full truncate max-w-[14rem]">{offer.job_title || offer.title}</span>}
            </div>
          </div>
          {session && <StatusBadge status={session.status} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Offer used in this session */}
          <Card>
            <h2 className="flex items-center gap-2 font-semibold text-text-900 mb-3"><span>📋</span> Offre analysée</h2>
            {offer ? (
              <div>
                <Link href={`/offers/${offer.id}`} className="text-lg font-bold text-text-900 hover:text-primary">{offer.job_title || offer.title}</Link>
                <p className="text-sm text-text-500 mt-0.5">
                  {(offer.company_name || offer.company) ? `🏢 ${offer.company_name || offer.company}` : ''}
                  {offer.location ? ` · 📍 ${offer.location}` : ''}
                </p>
                {Array.isArray(offer.required_skills) && offer.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {offer.required_skills.slice(0, 12).map(s => {
                      const crit = critical.has(s.toLowerCase());
                      return <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${crit ? 'bg-primary text-white font-medium' : 'bg-primary-light text-primary'}`}>{crit && '★ '}{s}</span>;
                    })}
                  </div>
                )}
                <Link href={`/offers/${offer.id}`} className="text-sm text-primary hover:underline mt-3 inline-block">Voir l&apos;offre complète →</Link>
              </div>
            ) : (
              <p className="text-sm text-text-400">Chargement de l&apos;offre…</p>
            )}
          </Card>

          {/* Progress */}
          <Card>
            <h2 className="font-semibold text-text-900 mb-4">Progression du scoring</h2>
            <div className="flex flex-col gap-2">
              <ProgressStep label="Session créée" done active={false} />
              <ProgressStep label="Extraction des données" done={isDone || isProcessing} active={isProcessing} />
              <ProgressStep label="Analyse IA et scoring" done={isDone} active={isProcessing} />
              <ProgressStep label="Résultats disponibles" done={isDone} active={false} />
            </div>
          </Card>

          {isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-primary-light rounded-xl text-primary">
              <Spinner size="sm" />
              <div>
                <p className="font-medium">Scoring en cours...</p>
                <p className="text-sm text-primary/70 mt-0.5">Cela peut prendre 30–120 secondes selon le nombre de CVs</p>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-danger">
              <p className="font-medium">Le scoring a échoué</p>
              <p className="text-sm text-danger/80 mt-1">{session?.error || 'Une erreur s\'est produite. Réessayez.'}</p>
            </div>
          )}

          {isDone && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success flex items-center justify-between">
              <div>
                <p className="font-semibold">Scoring terminé ✅</p>
                <p className="text-sm text-success/80 mt-0.5">{cvCount} candidat(s) analysé(s)</p>
              </div>
              <Link href={`/sessions/${id}/results`}>
                <Button>Voir les résultats →</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: weights used */}
        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Pondérations</h3>
            {Object.keys(weights).length === 0 ? (
              <p className="text-sm text-text-400">Non disponibles</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {Object.entries(weights).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-text-600">{WEIGHT_LABELS[k] || k}</span>
                      <span className="text-text-500 font-medium">{Math.round(v * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-bg-50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, v * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
