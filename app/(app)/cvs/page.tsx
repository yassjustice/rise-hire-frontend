'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { api, CV } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton, Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

function CVCard({ cv }: { cv: CV }) {
  const initials = cv.candidate_name
    ? cv.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Link href={`/cvs/${cv.id}`} className="block rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-900 truncate">{cv.candidate_name || 'Candidat inconnu'}</p>
            {cv.candidate_email && <p className="text-xs text-text-400 truncate">{cv.candidate_email}</p>}
          </div>
          {cv.extraction_status !== 'done' && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">⚠️</span>
          )}
        </div>
        {Array.isArray(cv.skills) && cv.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cv.skills.slice(0, 4).map(s => (
              <span key={s} className="bg-bg-50 text-text-500 text-xs px-2 py-0.5 rounded-full border border-border">{s}</span>
            ))}
            {cv.skills.length > 4 && <span className="text-xs text-text-400">+{cv.skills.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function CVsPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getCVs().then(setCvs).catch(() => toast('Erreur lors du chargement des CVs', 'error')).finally(() => setLoading(false));
  }, [toast]);

  const topSkills = useMemo(() => {
    const freq: Record<string, number> = {};
    cvs.forEach(cv => Array.isArray(cv.skills) && cv.skills.forEach(s => { freq[s] = (freq[s] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([s]) => s);
  }, [cvs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cvs.filter(cv => {
      if (q && !`${cv.candidate_name ?? ''} ${cv.candidate_email ?? ''}`.toLowerCase().includes(q)) return false;
      if (skillFilter.length > 0 && !skillFilter.some(sk => Array.isArray(cv.skills) && cv.skills.includes(sk))) return false;
      return true;
    });
  }, [cvs, search, skillFilter]);

  const toggleSkillFilter = (s: string) =>
    setSkillFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const uploadFiles = async (files: FileList) => {
    const pdfs = Array.from(files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (!pdfs.length) { toast('Seuls les fichiers PDF sont acceptés', 'error'); return; }
    setUploading(true);
    let uploaded = 0;
    for (const file of pdfs) {
      try {
        const cv = await api.uploadCV(file);
        setCvs(prev => [cv, ...prev]);
        uploaded++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        toast(`Erreur avec ${file.name}: ${msg}`, 'error');
      }
    }
    if (uploaded) toast(`${uploaded} CV(s) importé(s) avec succès`, 'success');
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-900">CVs</h1>
          <p className="text-text-500 mt-1">Importez et gérez les CVs de vos candidats</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} loading={uploading}>📤 Importer des CVs</Button>
        <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden"
          onChange={e => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/40'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Spinner size="lg" />
            <p className="font-medium">Extraction en cours... L&apos;IA analyse vos CVs</p>
          </div>
        ) : (
          <>
            <p className="text-3xl mb-1">📄</p>
            <p className="font-medium text-text-700">Glissez-déposez vos CVs PDF ici</p>
            <p className="text-xs text-text-400 mt-1">ou cliquez pour sélectionner des fichiers</p>
          </>
        )}
      </div>

      {/* Search + skill filters */}
      {!loading && cvs.length > 0 && (
        <div className="mb-4 flex flex-col gap-3">
          <Input
            placeholder="🔍 Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-text-400 shrink-0">Filtrer par compétence :</span>
              {topSkills.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkillFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${skillFilter.includes(s) ? 'bg-primary text-white border-primary' : 'bg-bg-50 text-text-500 border-border hover:border-primary/40'}`}
                >
                  {s}
                </button>
              ))}
              {skillFilter.length > 0 && (
                <button onClick={() => setSkillFilter([])} className="text-xs px-2 py-1 text-text-400 hover:text-danger">
                  ✕ Effacer
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* CV Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-400">
          <p className="text-5xl mb-4">{cvs.length === 0 ? '📄' : '🔍'}</p>
          <p className="text-xl font-semibold text-text-700 mb-2">
            {cvs.length === 0 ? 'Aucun CV importé' : 'Aucun résultat'}
          </p>
          <p className="text-text-500">
            {cvs.length === 0 ? 'Commencez par importer des CVs PDF de vos candidats' : 'Essayez une autre recherche ou effacez les filtres'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-400 mb-3">{filtered.length} CV{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cv => (
              <CVCard key={cv.id} cv={cv} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
