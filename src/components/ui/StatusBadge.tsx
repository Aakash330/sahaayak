import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export type BadgeStatus = 'success' | 'warning' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-900',
      border: 'border-blue-200',
      icon: Clock,
    },
    neutral: {
      bg: 'bg-stone-100',
      text: 'text-stone-800',
      border: 'border-stone-200',
      icon: Clock,
    },
  };

  const { bg, text, border, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${text} ${border} font-medium text-sm`}>
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </span>
  );
};
