'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Offer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const data = await api.getOffer(id);
      setOffer(data);
    } catch {
      toast('Offre introuvable', 'error');
      router.push('/offers');
    } finally {
      setLoading(false);
    }
  }, [id, toast, router]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm('Supprimer cette offre ?')) return;
    setDeleting(true);
    try {
      await api.deleteOffer(id);
      toast('Offre supprimée', 'success');
      router.push('/offers');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = () => {
    if (!offer) return;
    setEditTitle(offer.job_title || offer.title || '');
    setEditCompany(offer.company_name || offer.company || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!offer) return;
    setSaving(true);
    try {
      const updated = await api.updateOffer(id, { ...offer, job_title: editTitle, company_name: editCompany });
      setOffer(updated);
      setEditing(false);
      toast('Offre mise à jour', 'success');
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!offer) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/offers" className="text-text-400 hover:text-text-700">← Offres</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 truncate">{offer.job_title || offer.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-3 max-w-md">
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre du poste" />
              <Input value={editCompany} onChange={e => setEditCompany(e.target.value)} placeholder="Nom de l'entreprise" />
              <div className="flex gap-2">
                <Button onClick={handleSave} loading={saving}>Enregistrer</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text-900">{offer.job_title || offer.title}</h1>
              {(offer.company_name || offer.company) && (
                <p className="text-text-500 mt-1">🏢 {offer.company_name || offer.company}</p>
              )}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={startEdit}>✏️ Modifier</Button>
            <Link href={`/sessions/new?offerId=${offer.id}`}>
              <Button>🚀 Lancer un scoring</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Supprimer</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {offer.job_description && (
            <Card>
              <h2 className="font-semibold text-text-900 mb-3">Description du poste</h2>
              <p className="text-sm text-text-500 whitespace-pre-wrap leading-relaxed">{offer.job_description}</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {offer.required_skills && offer.required_skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Compétences requises</h3>
              <div className="flex flex-wrap gap-1.5">
                {offer.required_skills.map(s => (
                  <span key={s} className="bg-primary-light text-primary text-xs px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </Card>
          )}
          <Card>
            <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Détails</h3>
            <div className="space-y-2 text-sm">
              {offer.experience_level && <p><span className="text-text-400">Niveau :</span> <span className="font-medium">{offer.experience_level}</span></p>}
              {offer.domain && <p><span className="text-text-400">Domaine :</span> <span className="font-medium">{offer.domain}</span></p>}
              {offer.education_required && <p><span className="text-text-400">Formation :</span> <span className="font-medium">{offer.education_required}</span></p>}
              {offer.location && <p><span className="text-text-400">Lieu :</span> <span className="font-medium">{offer.location}</span></p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
