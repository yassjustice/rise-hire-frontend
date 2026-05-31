'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Offer, CV, Weights } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Spinner';
import { DEFAULT_WEIGHTS, WEIGHT_LABELS } from '@/lib/utils';

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillOfferId = searchParams.get('offerId');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [name, setName] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(prefillOfferId || '');
  const [selectedCvs, setSelectedCvs] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({ ...DEFAULT_WEIGHTS });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.getOffers(), api.getCVs()])
      .then(([o, c]) => { setOffers(o); setCvs(c); })
      .catch(() => toast('Erreur lors du chargement', 'error'))
      .finally(() => setLoadingData(false));
  }, [toast]);

  const toggleCV = (id: string) =>
    setSelectedCvs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!name.trim()) { toast('Nommez la session', 'error'); return; }
    if (!selectedOffer) { toast('Sélectionnez une offre', 'error'); return; }
    if (selectedCvs.length === 0) { toast('Sélectionnez au moins un CV', 'error'); return; }
    setCreating(true);
    try {
      const session = await api.createSession({ name, offer_id: selectedOffer, cv_ids: selectedCvs, weights: weights as unknown as Weights });
      await api.startScoring(session.id);
      toast('Session lancée ! Scoring en cours...', 'success');
      router.push(`/sessions/${session.id}`);
    } catch {
      toast('Erreur lors du lancement de la session', 'error');
    } finally {
      setCreating(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightsValid = Math.abs(totalWeight - 1) < 0.01;

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((n, i) => (
          <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step > n ? 'bg-success text-white' : step === n ? 'bg-primary text-white' : 'bg-bg-50 text-text-400'
            }`}>{step > n ? '✓' : n}</div>
            {i < 2 && <div className={`flex-1 h-1 rounded transition-colors ${step > n ? 'bg-success' : 'bg-bg-50'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <h2 className="text-xl font-bold text-text-900 mb-6">Configurer la session</h2>
          {loadingData ? <div className="flex flex-col gap-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-10" />)}</div> : (
            <div className="flex flex-col gap-5">
              <Input label="Nom de la session *" placeholder="Ex: Développeur Senior — Mai 2026" value={name} onChange={e => setName(e.target.value)} required />
              <div>
                <label className="block text-sm font-medium text-text-700 mb-2">Offre d&apos;emploi *</label>
                <select
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={selectedOffer}
                  onChange={e => setSelectedOffer(e.target.value)}
                >
                  <option value="">— Sélectionner une offre —</option>
                  {offers.map(o => <option key={o.id} value={o.id}>{o.job_title || o.title}</option>)}
                </select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { if (!name.trim() || !selectedOffer) { toast('Remplissez tous les champs requis', 'error'); return; } setStep(2); }}>
                  Suivant →
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-900">Sélectionner les CVs</h2>
            <span className="text-sm text-text-500">{selectedCvs.length} sélectionné(s)</span>
          </div>
          {loadingData ? (
            <div className="flex flex-col gap-3">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : cvs.length === 0 ? (
            <Card className="text-center text-text-400 py-8">
              <p className="text-3xl mb-2">📄</p>
              <p>Aucun CV disponible. <a href="/cvs" className="text-primary hover:underline">Importez des CVs</a> d&apos;abord.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {cvs.map(cv => (
                <label key={cv.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedCvs.includes(cv.id) ? 'border-primary bg-primary-light' : 'border-border hover:bg-bg-100'}`}>
                  <input type="checkbox" checked={selectedCvs.includes(cv.id)} onChange={() => toggleCV(cv.id)} className="accent-primary w-4 h-4" />
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {(cv.candidate_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-900 text-sm truncate">{cv.candidate_name || 'Candidat inconnu'}</p>
                    {cv.email && <p className="text-xs text-text-400 truncate">{cv.email}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>← Retour</Button>
            <Button onClick={() => { if (!selectedCvs.length) { toast('Sélectionnez au moins un CV', 'error'); return; } setStep(3); }} className="flex-1">
              Suivant →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <h2 className="text-xl font-bold text-text-900 mb-2">Pondérations du scoring</h2>
          <p className="text-sm text-text-400 mb-6">Ajustez l&apos;importance de chaque critère. La somme doit être égale à 1.00.</p>
          <div className="flex flex-col gap-4">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <label className="text-text-700 font-medium">{WEIGHT_LABELS[key] || key}</label>
                  <span className="text-text-500">{(value * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={value}
                  onChange={e => setWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
            <div className={`text-sm font-medium ${weightsValid ? 'text-success' : 'text-danger'}`}>
              Total : {totalWeight.toFixed(2)} {weightsValid ? '✓' : '⚠ Doit être égal à 1.00'}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => setStep(2)}>← Retour</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!weightsValid} className="flex-1">
              🚀 Lancer le scoring ({selectedCvs.length} CVs)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
