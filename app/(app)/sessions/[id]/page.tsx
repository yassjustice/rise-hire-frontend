'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Session } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePoll } from '@/hooks/usePoll';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

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

  const isProcessing = session?.status === 'processing' || session?.status === 'pending';
  const isDone = session?.status === 'completed';
  const isFailed = session?.status === 'failed';

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sessions" className="text-text-400 hover:text-text-700">← Sessions</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 truncate">{session?.name || '...'}</span>
      </div>

      {session && (
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-900">{session.name}</h1>
            <p className="text-text-500 mt-1 text-sm">Créée le {formatDate(session.created_at)}</p>
          </div>
          <StatusBadge status={session.status} />
        </div>
      )}

      <div className="flex flex-col gap-4">
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
              <p className="text-sm text-success/80 mt-0.5">{session?.cv_count} candidats analysés</p>
            </div>
            <Link href={`/sessions/${id}/results`}>
              <Button>Voir les résultats →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
