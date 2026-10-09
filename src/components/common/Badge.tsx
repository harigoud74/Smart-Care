import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const norm = status?.toUpperCase() || '';

  let colors = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm === 'VERIFIED' || norm === 'CONFIRMED' || norm === 'COMPLETED' || norm === 'ACTIVE') {
    colors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm === 'PENDING') {
    colors = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm === 'CANCELLED' || norm === 'REJECTED' || norm === 'SUSPENDED' || norm === 'NO_SHOW' || norm === 'EMERGENCY') {
    colors = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm === 'URGENT') {
    colors = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (norm === 'ROUTINE' || norm === 'IN_PERSON') {
    colors = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (norm === 'TELECONSULTATION') {
    colors = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  const label = norm.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors} ${className}`}
    >
      {label}
    </span>
  );
};
