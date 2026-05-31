type BadgeVariant = 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'yellow';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
  yellow: 'bg-yellow-100 text-yellow-800',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function ThresholdBadge({ threshold }: { threshold: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    green: { label: '✅ Recommandé', variant: 'green' },
    orange: { label: '🟡 À considérer', variant: 'yellow' },
    red: { label: '🔴 Non recommandé', variant: 'red' },
  };
  const cfg = map[threshold] || { label: threshold, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'En attente', variant: 'gray' },
    processing: { label: '⚡ En cours', variant: 'blue' },
    completed: { label: '✅ Terminé', variant: 'green' },
    failed: { label: '❌ Échoué', variant: 'red' },
    active: { label: 'Active', variant: 'green' },
    closed: { label: 'Archivée', variant: 'gray' },
    done: { label: '✅ Extrait', variant: 'green' },
  };
  const cfg = map[status] || { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
