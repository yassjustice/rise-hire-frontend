'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Stats, Session, Offer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: string; sub?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-2xl shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-text-900">{value}</p>
        <p className="text-sm text-text-500">{label}</p>
        {sub && <p className="text-xs text-text-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.getStats(), api.getSessions(), api.getOffers()])
      .then(([s, sess, off]) => {
        setStats(s);
        setSessions(sess.slice(0, 5));
        setOffers(off.slice(0, 3));
      })
      .catch(() => toast('Erreur lors du chargement du tableau de bord', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-900">
          Bonjour, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-500 mt-1">Voici un aperçu de votre activité de recrutement</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard icon="📋" label="Offres actives" value={stats?.total_offers ?? 0} />
            <StatCard icon="📄" label="CVs importés" value={stats?.total_cvs ?? 0} />
            <StatCard icon="🔄" label="Sessions totales" value={stats?.total_sessions ?? 0} />
            <StatCard icon="✅" label="Sessions complétées" value={stats?.completed_sessions ?? 0} sub={`${stats?.total_candidates_scored ?? 0} candidats scorés`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-900">Sessions récentes</h2>
            <Link href="/sessions" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-text-400">
                <p className="text-3xl mb-2">🔄</p>
                <p className="font-medium">Aucune session encore</p>
                <Link href="/sessions/new" className="text-primary text-sm hover:underline mt-1 block">
                  Lancer une session →
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-100">
                    <th className="text-left px-4 py-3 text-text-500 font-medium">Session</th>
                    <th className="text-left px-4 py-3 text-text-500 font-medium">CVs</th>
                    <th className="text-left px-4 py-3 text-text-500 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-bg-100 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/sessions/${s.id}`} className="font-medium text-text-900 hover:text-primary">
                          {s.name}
                        </Link>
                        <p className="text-xs text-text-400 mt-0.5">{formatDate(s.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 text-text-500">{s.cv_count ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Active offers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-900">Offres actives</h2>
            <Link href="/offers" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
            ) : offers.length === 0 ? (
              <Card className="text-center text-text-400 py-8">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-medium">Aucune offre active</p>
                <Link href="/offers/new" className="text-primary text-sm hover:underline mt-1 block">
                  Créer une offre →
                </Link>
              </Card>
            ) : (
              offers.map(offer => (
                <Link key={offer.id} href={`/offers/${offer.id}`}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                    <p className="font-semibold text-text-900 truncate">{offer.title}</p>
                    <p className="text-sm text-text-500 mt-1 truncate">{offer.company || 'Entreprise non spécifiée'}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {offer.required_skills?.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/cvs', icon: '📤', label: 'Importer des CVs', desc: 'Ajouter de nouveaux candidats' },
          { href: '/offers/new', icon: '📝', label: 'Créer une offre', desc: 'Analyser une description de poste' },
          { href: '/sessions/new', icon: '🚀', label: 'Lancer un scoring', desc: 'Comparer CVs et offres d\'emploi' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-card transition-all group">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{a.icon}</div>
            <p className="font-semibold text-text-900">{a.label}</p>
            <p className="text-sm text-text-500 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
