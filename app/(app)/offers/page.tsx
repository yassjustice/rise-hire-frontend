'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Offer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Link href={`/offers/${offer.id}`}>
      <Card className="h-full flex flex-col hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-text-900 line-clamp-2">{offer.job_title || offer.title}</h3>
          <Badge variant="green" className="shrink-0 text-xs">Active</Badge>
        </div>
        {(offer.company || offer.company_name) && (
          <p className="text-sm text-text-500 mb-3">🏢 {offer.company || offer.company_name}</p>
        )}
        {offer.experience_level && (
          <p className="text-sm text-text-500 mb-3">📈 {offer.experience_level}</p>
        )}
        {offer.required_skills && offer.required_skills.length > 0 && (
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
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api.getOffers()
      .then(setOffers)
      .catch(() => toast('Erreur lors du chargement des offres', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-900">Offres d&apos;emploi</h1>
          <p className="text-text-500 mt-1">Gérez vos offres et analysez les descriptions de poste</p>
        </div>
        <Link href="/offers/new">
          <Button>+ Nouvelle offre</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 text-text-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl font-semibold text-text-700 mb-2">Aucune offre active</p>
          <p className="text-text-500 mb-6">Créez votre première offre en collant une description de poste</p>
          <Link href="/offers/new">
            <Button>Créer une offre</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      )}
    </div>
  );
}
