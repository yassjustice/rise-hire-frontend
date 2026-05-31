'use client';

import { useEffect, useState, useRef } from 'react';
import { api, CV } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

function CVCard({ cv }: { cv: CV }) {
  const initials = cv.candidate_name
    ? cv.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Link href={`/cvs/${cv.id}`}>
      <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-900 truncate">{cv.candidate_name || 'Candidat inconnu'}</p>
            {cv.email && <p className="text-xs text-text-400 truncate">{cv.email}</p>}
          </div>
        </div>
        {cv.skills && cv.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cv.skills.slice(0, 4).map(s => (
              <span key={s} className="bg-bg-50 text-text-500 text-xs px-2 py-0.5 rounded-full border border-border">{s}</span>
            ))}
            {cv.skills.length > 4 && <span className="text-xs text-text-400">+{cv.skills.length - 4}</span>}
          </div>
        )}
      </Card>
    </Link>
  );
}

export default function CVsPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getCVs().then(setCvs).catch(() => toast('Erreur lors du chargement des CVs', 'error')).finally(() => setLoading(false));
  }, [toast]);

  const uploadFiles = async (files: FileList) => {
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf');
    if (!pdfs.length) { toast('Seuls les fichiers PDF sont acceptés', 'error'); return; }
    setUploading(true);
    let uploaded = 0;
    for (const file of pdfs) {
      try {
        const cv = await api.uploadCV(file);
        setCvs(prev => [cv, ...prev]);
        uploaded++;
      } catch {
        toast(`Erreur avec ${file.name}`, 'error');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-900">CVs</h1>
          <p className="text-text-500 mt-1">Importez et gérez les CVs de vos candidats</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} loading={uploading}>
          📤 Importer des CVs
        </Button>
        <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden"
          onChange={e => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/40'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Spinner size="lg" />
            <p className="font-medium">Extraction en cours...</p>
            <p className="text-sm text-text-400">L&apos;IA analyse les CVs</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-2">📄</p>
            <p className="font-semibold text-text-700">Glissez-déposez vos CVs PDF ici</p>
            <p className="text-sm text-text-400 mt-1">ou cliquez pour sélectionner des fichiers</p>
          </>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : cvs.length === 0 ? (
        <div className="text-center py-16 text-text-400">
          <p className="text-5xl mb-4">📄</p>
          <p className="text-xl font-semibold text-text-700 mb-2">Aucun CV importé</p>
          <p className="text-text-500">Commencez par importer des CVs PDF de vos candidats</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvs.map(cv => <CVCard key={cv.id} cv={cv} />)}
        </div>
      )}
    </div>
  );
}
