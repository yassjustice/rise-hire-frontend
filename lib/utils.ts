export function getThresholdColor(threshold: string): string {
  switch (threshold) {
    case 'green': return 'text-success';
    case 'orange': return 'text-warning';
    case 'red': return 'text-danger';
    default: return 'text-text-500';
  }
}

export function getThresholdBg(threshold: string): string {
  switch (threshold) {
    case 'green': return 'bg-green-50 border-green-200';
    case 'orange': return 'bg-yellow-50 border-yellow-200';
    case 'red': return 'bg-red-50 border-red-200';
    default: return 'bg-bg-50 border-border';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 0.80) return '#38A169';
  if (score >= 0.50) return '#D69E2E';
  return '#E53E3E';
}

export function getRecommendationLabel(rec: string): string {
  const map: Record<string, string> = {
    'Highly Recommended': 'Très recommandé',
    'Recommended': 'Recommandé',
    'Conditionally Recommended': 'Sous conditions',
    'Not Recommended': 'Non recommandé',
  };
  return map[rec] || rec;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export const DEFAULT_WEIGHTS = {
  skills_match: 0.30,
  experience_relevance: 0.22,
  achievements: 0.15,
  language_quality: 0.10,
  language_match: 0.10,
  education: 0.08,
  location: 0.05,
};

export const WEIGHT_LABELS: Record<string, string> = {
  skills_match: 'Compétences techniques',
  experience_relevance: 'Expérience professionnelle',
  achievements: 'Réalisations & impact',
  language_quality: 'Qualité rédactionnelle',
  language_match: 'Langues requises',
  education: 'Formation académique',
  location: 'Localisation',
};
