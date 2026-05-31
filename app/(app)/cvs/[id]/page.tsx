'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, CV } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';

export default function CVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    try { setCv(await api.getCV(id)); }
    catch { toast('CV introuvable', 'error'); router.push('/cvs'); }
    finally { setLoading(false); }
  }, [id, toast, router]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm('Supprimer ce CV ?')) return;
    setDeleting(true);
    try { await api.deleteCV(id); toast('CV supprimé', 'success'); router.push('/cvs'); }
    catch { toast('Erreur lors de la suppression', 'error'); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;
  if (!cv) return null;

  const initials = cv.candidate_name
    ? cv.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cvs" className="text-text-400 hover:text-text-700">← CVs</Link>
        <span className="text-text-300">/</span>
        <span className="text-text-700">{cv.candidate_name || 'Candidat inconnu'}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-900">{cv.candidate_name || 'Candidat inconnu'}</h1>
            {cv.email && <p className="text-text-500">{cv.email}</p>}
            {cv.phone && <p className="text-text-500">{cv.phone}</p>}
          </div>
        </div>
        <Button variant="danger" onClick={handleDelete} loading={deleting}>Supprimer</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cv.experience && cv.experience.length > 0 && (
            <Card>
              <h2 className="font-semibold text-text-900 mb-4">Expériences professionnelles</h2>
              <div className="space-y-4">
                {cv.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-primary-light pl-4">
                    <p className="font-medium text-text-900">{typeof exp === 'string' ? exp : (exp as Record<string, string>).title}</p>
                    {typeof exp !== 'string' && (exp as Record<string, string>).company && (
                      <p className="text-sm text-text-500">{(exp as Record<string, string>).company}</p>
                    )}
                    {typeof exp !== 'string' && (exp as Record<string, string>).duration && (
                      <p className="text-xs text-text-400">{(exp as Record<string, string>).duration}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {cv.education && cv.education.length > 0 && (
            <Card>
              <h2 className="font-semibold text-text-900 mb-4">Formation</h2>
              <div className="space-y-3">
                {cv.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-success/40 pl-4">
                    <p className="font-medium text-text-900">{typeof edu === 'string' ? edu : (edu as Record<string, string>).degree}</p>
                    {typeof edu !== 'string' && (edu as Record<string, string>).institution && (
                      <p className="text-sm text-text-500">{(edu as Record<string, string>).institution}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {cv.skills && cv.skills.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Compétences</h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map(s => (
                  <span key={s} className="bg-bg-50 text-text-500 text-xs px-2 py-1 rounded-full border border-border">{s}</span>
                ))}
              </div>
            </Card>
          )}
          {cv.languages && cv.languages.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-3 text-sm uppercase tracking-wider">Langues</h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.languages.map(l => (
                  <span key={l} className="bg-bg-50 text-text-500 text-xs px-2 py-1 rounded-full border border-border">{l}</span>
                ))}
              </div>
            </Card>
          )}
          {cv.location && (
            <Card>
              <h3 className="font-semibold text-text-700 mb-1 text-sm uppercase tracking-wider">Localisation</h3>
              <p className="text-text-500 text-sm">{cv.location}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
