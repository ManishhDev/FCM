import React from 'react';
import { DataClassification, ValidationStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileText, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  type: 'classification' | 'validation' | 'cost_status' | 'emissions_status';
  value: DataClassification | ValidationStatus | 'complete' | 'partial' | 'unavailable';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, showIcon = true }) => {
  // Respecting anti-slop zero-pill discipline: Clean typography with subtle indicator, not garish candy pills
  if (type === 'classification') {
    switch (value) {
      case 'verified_against_source':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B5B]">
            {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-[#53A878]" />}
            <span>Verified Against Source</span>
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#176B5B]">
            {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-[#176B5B]" />}
            <span>Peer-Reviewed Source</span>
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />}
            <span>Unverified / Preliminary</span>
          </span>
        );
      case 'derived':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#245D8A]">
            {showIcon && <FileText className="w-3.5 h-3.5 text-[#245D8A]" />}
            <span>Derived Equation</span>
          </span>
        );
      case 'user_assumption':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
            {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
            <span>User Assumption</span>
          </span>
        );
      case 'illustrative':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A96512]">
            {showIcon && <Sparkles className="w-3.5 h-3.5 text-[#A96512]" />}
            <span>Illustrative Demo Data</span>
          </span>
        );
      case 'unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 italic">
            {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
            <span>Data Unavailable</span>
          </span>
        );
    }
  }

  // Validation status
  switch (value) {
    case 'pass':
    case 'complete':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B5B]">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-[#53A878]" />}
          <span>Verified Balanced</span>
        </span>
      );
    case 'warning':
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A96512]">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-[#A96512]" />}
          <span>Partial / Warning</span>
        </span>
      );
    case 'fail':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
          {showIcon && <XCircle className="w-3.5 h-3.5 text-[#B42318]" />}
          <span>Failed Check</span>
        </span>
      );
    case 'incomplete':
    case 'unavailable':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 italic">
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
          <span>Incomplete Data</span>
        </span>
      );
  }
};
