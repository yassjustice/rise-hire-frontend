'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, Offer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

function OfferCard({ offer, onDelete }: { offer: Offer; onDelete: (id: string) => void }) {
  return (
    <div className="relative group">
      <Link href={`/offers/${offer.id}`} className="block h-full">
        <Card className="h-full flex flex-col hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-text-900 line-clamp-2">{offer.job_title || offer.title}</h3>
            <Badge variant="green" className="shrink-0 text-xs">Active</Badge>
          </div>
          {(offer.company_name || offer.company) && (
            <p className="text-sm text-text-500 mb-3">🏢 {offer.company_name || offer.company}</p>
          )}
          {offer.experience_level && (
            <p className="text-sm text-text-500 mb-3">📈 {offer.experience_level}</p>
          )}
          {Array.isArray(offer.required_skills) && offer.required_skills.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-auto pt-3 border-t border-border">
              {offer.required_skills.slice(0, 4).map(skill => (
                <span key={skill} className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full">{skill}</span>
              ))}
              {offer.required_skills.length > 4 && (
                <span className="text-xs text-text-400 px-1 py-0.5">+{offer.required_skills.length - 4}</span>
              )}
            </div>
          )}
        </Card>
      </Link>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(offer.id); }}
        className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-text-300 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
        title="Supprimer cette offre"
      >×</button>
    </div>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    api.getOffers()
      .then(setOffers)
      .catch(() => toast('Erreur lors du chargement des offres', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try {
      await api.deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      toast('Offre supprimée', 'success');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return offers;
    return offers.filter(o =>
      `${o.job_title ?? ''} ${o.title ?? ''} ${o.company_name ?? ''} ${o.company ?? ''}`.toLowerCase().includes(q)
    );
  }, [offers, search]);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-900">Offres d&apos;emploi</h1>
          <p className="text-text-500 mt-1">Gérez vos offres et analysez les descriptions de poste</p>
        </div>
        <Link href="/offers/new">
          <Button>+ Nouvelle offre</Button>
        </Link>
      </div>

      {!loading && offers.length > 0 && (
        <div className="mb-5">
          <Input
            placeholder="🔍 Rechercher par titre ou entreprise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-400">
          <p className="text-5xl mb-4">{offers.length === 0 ? '📋' : '🔍'}</p>
          <p className="text-xl font-semibold text-text-700 mb-2">
            {offers.length === 0 ? 'Aucune offre active' : 'Aucun résultat'}
          </p>
          <p className="text-text-500 mb-6">
            {offers.length === 0 ? 'Créez votre première offre en collant une description de poste' : 'Essayez une autre recherche'}
          </p>
          {offers.length === 0 && (
            <Link href="/offers/new"><Button>Créer une offre</Button></Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(offer => <OfferCard key={offer.id} offer={offer} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
