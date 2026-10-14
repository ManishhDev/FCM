import React from 'react';
import { ProcessParameter, EvidenceSource } from '../types';
import { EVIDENCE_SOURCES } from '../lib/constants';
import { StatusBadge } from './StatusBadge';
import { X, ExternalLink, BookOpen, Layers, ShieldCheck } from 'lucide-react';

interface EvidenceModalProps {
  parameter: ProcessParameter | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ parameter, onClose }) => {
  if (!parameter) return null;

  const source = EVIDENCE_SOURCES.find(s => s.id === parameter.sourceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl border border-[#DCE5DF] max-w-2xl w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DCE5DF] bg-[#F7F9F6]">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#176B5B]" />
              <h3 id="modal-headline" className="text-base font-semibold text-[#182522]">
                Parameter Provenance & Evidence Record
              </h3>
            </div>
            <p className="text-xs text-[#64716C] mt-1 font-mono">
              Parameter ID: {parameter.id} · Model Version {parameter.version}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#64716C] hover:text-[#182522] hover:bg-[#DCE5DF]/40 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main parameter specs */}
          <div className="bg-[#EAF5EF]/50 p-4 rounded-xl border border-[#DCE5DF]">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="text-xs text-[#64716C]">Parameter Name & Symbol</span>
                <h4 className="text-lg font-bold text-[#123B32]">
                  {parameter.name} <span className="font-mono text-sm text-[#176B5B]">({parameter.symbol})</span>
                </h4>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-[#64716C]">Numerical Value & Unit</span>
                <div className="text-xl font-bold font-mono text-[#182522]">
                  {parameter.value !== null ? parameter.value : 'Unavailable'}{' '}
                  <span className="text-sm font-sans font-normal text-[#64716C]">{parameter.unit}</span>
                </div>
              </div>
            </div>

            {(parameter.originalReportedValue || parameter.conversionFormula) && (
              <div className="mt-3 pt-2.5 border-t border-[#DCE5DF]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {parameter.originalReportedValue && (
                  <div>
                    <span className="text-[#64716C] font-sans block">Original Reported Value:</span>
                    <span className="font-semibold text-[#182522]">{parameter.originalReportedValue}</span>
                  </div>
                )}
                {parameter.conversionFormula && (
                  <div>
                    <span className="text-[#64716C] font-sans block">Conversion Formula:</span>
                    <span className="text-[#245D8A]">{parameter.conversionFormula}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#DCE5DF]/60 flex items-center justify-between">
              <span className="text-xs text-[#64716C]">Data Classification:</span>
              <StatusBadge type="classification" value={parameter.classification} />
            </div>
          </div>

          {/* Source Citation */}
          {source ? (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#64716C] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#176B5B]" />
                Primary Literature Citation
              </h5>
              <div className="border border-[#DCE5DF] rounded-xl p-4 space-y-2 bg-white">
                <div className="font-semibold text-sm text-[#182522]">{source.title}</div>
                {source.authors && <div className="text-xs text-[#64716C]">{source.authors} ({source.publicationYear})</div>}
                <div className="text-xs text-[#64716C]">{source.publisher}</div>
                
                {source.notes && (
                  <p className="text-xs text-[#182522] bg-[#F7F9F6] p-2.5 rounded-lg border border-[#DCE5DF] mt-2">
                    {source.notes}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                  {source.doi && (
                    <span className="text-[#245D8A]">DOI: {source.doi}</span>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#176B5B] hover:underline font-sans font-medium ml-auto"
                    >
                      <span>View Publication</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#64716C] italic p-4 bg-[#F7F9F6] rounded-xl border border-[#DCE5DF]">
              This parameter is an uncalibrated user assumption or illustrative demo constant without an associated peer-reviewed source document.
            </div>
          )}

          {/* Study Conditions & System Boundary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-[#DCE5DF] p-3.5 rounded-xl space-y-1">
              <span className="font-semibold text-[#182522] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#176B5B]" />
                Study Conditions
              </span>
              <p className="text-[#64716C]">{parameter.studyConditions || 'Not specified'}</p>
            </div>
            <div className="border border-[#DCE5DF] p-3.5 rounded-xl space-y-1">
              <span className="font-semibold text-[#182522]">System Boundary</span>
              <p className="text-[#64716C]">{parameter.systemBoundary || 'Gate-to-gate facility boundary'}</p>
            </div>
          </div>

          {/* Uncertainty Notes */}
          {parameter.uncertaintyNotes && (
            <div className="text-xs bg-[#FFF4DE] p-3.5 rounded-xl border border-[#A96512]/20 space-y-1">
              <span className="font-semibold text-[#A96512]">Uncertainty & Sensitivity Caveat</span>
              <p className="text-[#182522]">{parameter.uncertaintyNotes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE5DF] bg-[#F7F9F6] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#182522] hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
