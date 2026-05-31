'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PelicanAnimation } from './PelicanAnimation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPelican, setShowPelican] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      setShowPelican(true);
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 401
        ? 'Email ou mot de passe incorrect'
        : err instanceof Error ? err.message : 'Erreur de connexion';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showPelican && (
        <PelicanAnimation variant="login" onComplete={() => router.push('/dashboard')} />
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        />
        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Se connecter
        </Button>
      </form>
    </>
  );
}
