'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    setSavingPwd(true);
    try {
      await api.me(); // verify token still valid
      // Password change endpoint: PUT /auth/password
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://yassirhakimi-recruiteia-api.hf.space/api'}/auth/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('recruteIA_token') : ''}`,
          },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as Record<string, Record<string, string>>)?.error?.message || 'Erreur');
      }
      toast('Mot de passe mis à jour avec succès', 'success');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-text-900 mb-8">Mon compte</h1>

      {/* Profile info */}
      <Card className="mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-900">{user?.full_name}</h2>
            <p className="text-text-500 text-sm">{user?.email}</p>
            {joinedDate && <p className="text-text-400 text-xs mt-1">Membre depuis {joinedDate}</p>}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-border pt-4">
          <dt className="text-text-500">Nom complet</dt>
          <dd className="text-text-900 font-medium">{user?.full_name}</dd>

          <dt className="text-text-500">Email</dt>
          <dd className="text-text-900 font-medium">{user?.email}</dd>

          <dt className="text-text-500">Rôle</dt>
          <dd className="text-text-900 font-medium capitalize">{user?.role || 'Recruteur'}</dd>

          <dt className="text-text-500">ID utilisateur</dt>
          <dd className="text-text-400 font-mono text-xs">{user?.id}</dd>
        </dl>
      </Card>

      {/* Change password */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-900">Sécurité</h2>
          {!changingPassword && (
            <Button variant="secondary" onClick={() => setChangingPassword(true)} className="text-sm">
              🔑 Changer le mot de passe
            </Button>
          )}
        </div>

        {changingPassword ? (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <Input
              label="Mot de passe actuel *"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Nouveau mot de passe *"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              required
            />
            <Input
              label="Confirmer le nouveau mot de passe *"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={savingPwd}>Enregistrer</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-text-500">Votre mot de passe est sécurisé. Changez-le régulièrement pour protéger votre compte.</p>
        )}
      </Card>

      {/* Session */}
      <Card className="border-danger/30 bg-danger/5">
        <h2 className="font-semibold text-danger mb-2">Session</h2>
        <p className="text-sm text-text-500 mb-4">Se déconnecter supprimera votre session locale. Vous devrez vous reconnecter.</p>
        <Button variant="danger" onClick={logout}>
          🚪 Se déconnecter
        </Button>
      </Card>
    </div>
  );
}
