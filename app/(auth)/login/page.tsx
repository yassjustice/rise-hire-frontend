import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 hero-gradient p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🐦</span>
          <span className="text-2xl font-bold">Rise Hire</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            &ldquo;L&apos;IA qui transforme votre processus de recrutement en un avantage concurrentiel.&rdquo;
          </blockquote>
          <p className="text-primary-light/80 text-sm">FQIA · PFF Sujet 3 · 2026</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[['📄', 'Extraction CVs', 'NLP avancé'], ['📋', 'Analyse offres', 'Extraction auto'], ['🏆', 'Scoring IA', 'Classement précis']].map(([icon, title, sub]) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-4 ring-1 ring-white/10">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-sm">{title}</div>
              <div className="text-xs text-white/60 mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🐦</span>
            <span className="text-xl font-bold text-primary">Rise Hire</span>
          </div>
          <h1 className="text-3xl font-bold text-text-900 mb-2">Bon retour 👋</h1>
          <p className="text-text-500 mb-8">Connectez-vous à votre espace Rise Hire</p>
          <LoginForm />
          <p className="text-center text-sm text-text-400 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
