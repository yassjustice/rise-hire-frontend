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

type RichOffer = Offer & {
  raw_text?: string;
  description?: string;
  description_summary?: string;
  seniority?: string;
};

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<RichOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    try { setOffer((await api.getOffer(id)) as RichOffer); }
    catch { toast('Offre introuvable', 'error'); router.push('/offers'); }
    finally { setLoading(false); }
  }, [id, toast, router]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm('Supprimer cette offre ?')) return;
    setDeleting(true);
    try { await api.deleteOffer(id); toast('Offre supprimée', 'success'); router.push('/offers'); }
    catch { toast('Erreur lors de la suppression', 'error'); }
    finally { setDeleting(false); }
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
      setOffer(updated as RichOffer); setEditing(false); toast('Offre mise à jour', 'success');
    } catch { toast('Erreur lors de la mise à jour', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;
  if (!offer) return null;

  const title = offer.job_title || offer.title || 'Offre';
  const company = offer.company_name || offer.company || '';
  const description = offer.raw_text || offer.description || offer.job_description || '';
  const summary = offer.description_summary || '';
  const critical = new Set((offer.critical_skills || []).map(s => s.toLowerCase()));
  const expYears = offer.experience_required_years ?? 0;

  const facts: [string, string][] = [];
  if (expYears) facts.push(['Expérience requise', `${expYears} an(s)`]);
  if (offer.seniority) facts.push(['Séniorité', offer.seniority]);
  if (offer.min_education || offer.education_required) facts.push(['Formation', (offer.min_education || offer.education_required) as string]);
  if (offer.industry || offer.domain) facts.push(['Domaine', (offer.industry || offer.domain) as string]);
  if (offer.location) facts.push(['Lieu', offer.location]);
  if (offer.job_type) facts.push(['Type', offer.job_type]);
  facts.push(['Télétravail', offer.remote_ok ? 'Oui' : 'Non / non précisé']);

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-5 text-sm">
        <Link href="/offers" className="text-text-400 hover:text-primary">← Offres</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700 font-medium truncate">{title}</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-6 mb-6 shadow-card">
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-white/85 mt-1">{company && `🏢 ${company}`}{company && offer.location ? '  ·  ' : ''}{offer.location && `📍 ${offer.location}`}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {offer.job_type && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{offer.job_type}</span>}
                {offer.seniority && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{offer.seniority}</span>}
                {offer.remote_ok && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">Télétravail</span>}
                {expYears > 0 && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{expYears}+ ans</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href={`/sessions/new?offerId=${offer.id}`}><Button>🚀 Lancer un scoring</Button></Link>
              <Button variant="secondary" onClick={startEdit}>✏️ Modifier</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Supprimer</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {summary && (
            <Card className="bg-primary-light/50 border-primary/20">
              <h2 className="flex items-center gap-2 font-semibold text-text-900 mb-2"><span>✨</span> Résumé IA</h2>
              <p className="text-sm text-text-600 leading-relaxed">{summary}</p>
            </Card>
          )}
          <Card>
            <h2 className="flex items-center gap-2 font-semibold text-text-900 mb-3"><span>📋</span> Description du poste</h2>
            {description
              ? <p className="text-sm text-text-600 whitespace-pre-wrap leading-relaxed">{description}</p>
              : <p className="text-sm text-text-400">Aucune description enregistrée pour cette offre.</p>}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {Array.isArray(offer.required_skills) && offer.required_skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Compétences requises</h3>
              <div className="flex flex-wrap gap-1.5">
                {offer.required_skills.map(s => {
                  const isCrit = critical.has(s.toLowerCase());
                  return (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full border ${isCrit ? 'bg-primary text-white border-primary font-medium' : 'bg-primary-light text-primary border-primary/20'}`}>
                      {isCrit && '★ '}{s}
                    </span>
                  );
                })}
              </div>
              {critical.size > 0 && <p className="text-[11px] text-text-400 mt-3">★ = compétence critique (poids double au scoring)</p>}
            </Card>
          )}

          {Array.isArray(offer.required_soft_skills) && offer.required_soft_skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Soft skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {offer.required_soft_skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full border bg-bg-50 text-text-600 border-border">{s}</span>)}
              </div>
            </Card>
          )}

          {Array.isArray(offer.required_languages) && offer.required_languages.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Langues</h3>
              <div className="flex flex-wrap gap-1.5">
                {offer.required_languages.map(l => <span key={l.language} className="text-xs px-2.5 py-1 rounded-full border bg-bg-50 text-text-600 border-border">{l.language}{l.min_level ? ` · ${l.min_level}` : ''}</span>)}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Détails</h3>
            <div className="flex flex-col gap-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-text-400">{k}</span>
                  <span className="font-medium text-text-700 text-right">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
