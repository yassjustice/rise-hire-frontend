'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Session } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api.getSessions().then(setSessions).catch(() => toast('Erreur lors du chargement', 'error')).finally(() => setLoading(false));
  }, [toast]);


  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-900">Sessions de scoring</h1>
          <p className="text-text-500 mt-1">Suivez vos sessions d&apos;analyse et de scoring IA</p>
        </div>
        <Link href="/sessions/new">
          <Button>+ Nouvelle session</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-text-400">
          <p className="text-5xl mb-4">🔄</p>
          <p className="text-xl font-semibold text-text-700 mb-2">Aucune session encore</p>
          <p className="text-text-500 mb-6">Créez une session pour scorer des CVs par rapport à une offre</p>
          <Link href="/sessions/new"><Button>Lancer une session</Button></Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-100">
                <th className="text-left px-4 py-3 font-medium text-text-500">Session</th>
                <th className="text-left px-4 py-3 font-medium text-text-500">CVs</th>
                <th className="text-left px-4 py-3 font-medium text-text-500">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-text-500">Créée le</th>
                <th className="text-right px-4 py-3 font-medium text-text-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-bg-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/sessions/${s.id}`} className="font-medium text-text-900 hover:text-primary">{s.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-text-500">{s.cv_count ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-text-400">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'completed' ? (
                      <Link href={`/sessions/${s.id}/results`} className="text-primary text-xs font-medium hover:underline">Voir résultats →</Link>
                    ) : (
                      <Link href={`/sessions/${s.id}`} className="text-text-400 text-xs hover:text-text-700">Détails</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
