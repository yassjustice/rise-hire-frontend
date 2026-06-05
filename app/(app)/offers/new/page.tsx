'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

const SAMPLE_JD = `We are seeking a Full-Stack Developer proficient in React, Node.js, and PostgreSQL. 
The ideal candidate has 3+ years of experience building scalable web applications, 
strong knowledge of RESTful APIs, and excellent problem-solving skills. 
Bachelor's degree in Computer Science or equivalent required.`;

export default function NewOfferPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [jdText, setJdText] = useState('');
  const [lang, setLang] = useState('fr');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Record<string, unknown> | null>(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleExtract = async () => {
    if (!jdText.trim()) { toast('Veuillez coller une description de poste', 'error'); return; }
    setExtracting(true);
    try {
      const data = await api.extractOffer({ text: jdText, lang });
      const extracted = data as unknown as Record<string, unknown>;
      setExtracted(extracted);
      setTitle((extracted.job_title as string) || (extracted.title as string) || '');
      setCompany((extracted.company_name as string) || (extracted.company as string) || '');
      setStep(2);
    } catch {
      toast('Erreur lors de l\'extraction — vérifiez la longueur du texte (max ~4000 tokens)', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast('Le titre de l\'offre est requis', 'error'); return; }
    setSaving(true);
    try {
      // Spread extracted first, then override with user form values so nulls don't win
      await api.createOffer({
        ...extracted,
        job_title: title,
        title,
        company_name: company || '',
        company,
        job_description: jdText,
      });
      toast('Offre créée avec succès !', 'success');
      router.push('/offers');
    } catch {
      toast('Erreur lors de la création de l\'offre', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-success text-white'}`}>
            {step === 1 ? '1' : '✓'}
          </div>
          <div className="flex-1 h-1 bg-bg-50 rounded">
            <div className={`h-full bg-primary rounded transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-bg-50 text-text-400'}`}>
            2
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text-900">
          {step === 1 ? 'Analyser une description de poste' : 'Valider et enregistrer'}
        </h1>
      </div>

      {step === 1 && (
        <Card>
          <label className="block text-sm font-medium text-text-700 mb-2">
            Description du poste (JD)
          </label>
          <p className="text-xs text-text-400 mb-3">Collez la description complète du poste. Le NLP extraira automatiquement les compétences, l&apos;expérience requise et le domaine.</p>
          <textarea
            className="w-full h-56 border border-border rounded-lg px-4 py-3 text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder={SAMPLE_JD}
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-text-500">
              <label>Langue :</label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div className="ml-auto">
              <Button onClick={handleExtract} loading={extracting}>
                {extracting ? 'Analyse en cours...' : 'Analyser avec l\'IA ✨'}
              </Button>
            </div>
          </div>
          {extracting && (
            <div className="mt-4 p-4 bg-primary-light rounded-lg flex items-center gap-3 text-primary text-sm">
              <Spinner size="sm" />
              L&apos;IA analyse votre description de poste... (peut prendre 30–60s)
            </div>
          )}
        </Card>
      )}

      {step === 2 && extracted && (() => {
        const ext = extracted as Record<string, string | string[] | undefined>;
        const skills = (ext.required_skills as string[] | undefined) || [];
        const expLevel = ext.experience_level as string | undefined;
        const domain = ext.domain as string | undefined;
        const education = ext.education_required as string | undefined;
        return (
          <div className="flex flex-col gap-6">
            <Card>
              <h2 className="font-semibold text-text-900 mb-4">Informations de l&apos;offre</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Titre du poste *"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Développeur Full-Stack Senior"
                  required
                />
                <Input
                  label="Entreprise"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-text-900 mb-4">Extraction IA ✨</h2>
              <div className="space-y-4 text-sm">
                {skills.length > 0 && (
                  <div>
                    <p className="font-medium text-text-700 mb-2">Compétences requises</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="bg-primary-light text-primary px-2 py-1 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {expLevel && (
                  <div>
                    <p className="font-medium text-text-700">Niveau d&apos;expérience</p>
                    <p className="text-text-500">{expLevel}</p>
                  </div>
                )}
                {domain && (
                  <div>
                    <p className="font-medium text-text-700">Domaine</p>
                    <p className="text-text-500">{domain}</p>
                  </div>
                )}
                {education && (
                  <div>
                    <p className="font-medium text-text-700">Formation requise</p>
                    <p className="text-text-500">{education}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>← Modifier le texte</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">Enregistrer l&apos;offre</Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
