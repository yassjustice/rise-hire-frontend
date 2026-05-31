'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PelicanAnimation } from './PelicanAnimation';

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPelican, setShowPelican] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const validate = () => {
    if (password.length < 8) { toast('Le mot de passe doit faire au moins 8 caractères', 'error'); return false; }
    if (password !== confirm) { toast('Les mots de passe ne correspondent pas', 'error'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, fullName);
      setShowPelican(true);
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 400
        ? 'Cet email est déjà utilisé'
        : err instanceof Error ? err.message : 'Erreur lors de la création du compte';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showPelican && (
        <PelicanAnimation variant="register" onComplete={() => router.push('/dashboard')} />
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Nom complet"
          placeholder="Ahmed Benali"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          hint="Minimum 8 caractères"
        />
        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Créer mon compte
        </Button>
      </form>
    </>
  );
}
