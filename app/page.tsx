import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐦</span>
          <span className="text-xl font-bold text-primary">Rise Hire</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-colors">
            Se connecter
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Commencer
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          🎓 Projet PFF · FQIA Sujet 3 · 2026
        </div>
        <h1 className="text-5xl font-bold text-text-900 max-w-2xl leading-tight mb-6">
          Recrutez plus vite avec l&apos;<span className="text-primary">intelligence artificielle</span>
        </h1>
        <p className="text-lg text-text-500 max-w-xl mb-10">
          Uploadez vos CVs, analysez vos offres d&apos;emploi et obtenez un classement intelligent des candidats en quelques secondes.
        </p>
        <div className="flex gap-4">
          <Link href="/register" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md">
            Créer un compte gratuit
          </Link>
          <Link href="/login" className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary-light transition-colors">
            Voir une démo
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bg-100 px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-text-900 mb-12">Comment ça marche ?</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📄', step: '1', title: 'Importez les CVs', desc: "Téléchargez les CVs PDF de vos candidats. Notre IA extrait automatiquement les informations clés." },
            { icon: '📋', step: '2', title: 'Créez une offre', desc: 'Collez la description de poste. Le NLP identifie les compétences, le niveau et le domaine requis.' },
            { icon: '🏆', step: '3', title: 'Scorez et classez', desc: 'Lancez une session de scoring. Obtenez un classement instantané avec scores et lacunes détectées.' },
          ].map(item => (
            <div key={item.step} className="bg-white rounded-2xl p-6 shadow-card text-center">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Étape {item.step}</div>
              <h3 className="text-lg font-semibold text-text-900 mb-2">{item.title}</h3>
              <p className="text-sm text-text-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-text-400">
        © 2026 Rise Hire · FQIA PFF Sujet 3 · Powered by RecruteIA API
      </footer>
    </div>
  );
}
