import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 hero-gradient p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🐦</span>
          <span className="text-2xl font-bold">Rise Hire</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-4">Commencez dès aujourd&apos;hui</h2>
          <ul className="space-y-4 text-white/90">
            {[
              'Extraction automatique des CVs PDF',
              'Analyse NLP des offres d\'emploi',
              'Scoring IA avec pondérations personnalisées',
              'Export des résultats en CSV/PDF',
            ].map(item => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-success">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-light/60 text-sm">Projet académique · FQIA · Sujet 3 · 2026</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🐦</span>
            <span className="text-xl font-bold text-primary">Rise Hire</span>
          </div>
          <h1 className="text-3xl font-bold text-text-900 mb-2">Créer un compte</h1>
          <p className="text-text-500 mb-8">Rejoignez Rise Hire et recrutez intelligemment</p>
          <RegisterForm />
          <p className="text-center text-sm text-text-400 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
