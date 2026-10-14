import React, { useState } from 'react';
import { REFERENCE_PARAMETERS, EVIDENCE_SOURCES } from '../lib/constants';
import { ProcessParameter } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceModal } from '../components/EvidenceModal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  FileText,
  SlidersHorizontal
} from 'lucide-react';

export const EvidenceLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [selectedParam, setSelectedParam] = useState<ProcessParameter | null>(null);

  const filteredParams = REFERENCE_PARAMETERS.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studyConditions && p.studyConditions.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPathway = pathwayFilter === 'all' || p.pathwayId === pathwayFilter;
    const matchesClassification = classificationFilter === 'all' || p.classification === classificationFilter;

    return matchesSearch && matchesPathway && matchesClassification;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Parameter Detail Modal */}
      <EvidenceModal
        parameter={selectedParam}
        onClose={() => setSelectedParam(null)}
      />

      {/* Header */}
      <div className="pb-6 border-b border-[#DCE5DF]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#176B5B]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
            Evidence Library & Parameter Provenance
          </h1>
        </div>
        <p className="text-xs text-[#64716C] mt-1">
          Traceable catalogue of peer-reviewed engineering parameters, recovery yields, specific energy metrics, and experimental study conditions.
        </p>
      </div>

      {/* Peer-Reviewed Literature Sources Grid */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-[#182522] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#176B5B]" />
          <span>Curated Primary Scientific Literature Sources</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVIDENCE_SOURCES.slice(0, 4).map((source) => (
            <div key={source.id} className="bg-white rounded-xl border border-[#DCE5DF] p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#176B5B] uppercase block">
                  {source.publisher} · {source.publicationYear}
                </span>
                <h4 className="font-semibold text-xs text-[#182522] mt-1 leading-snug">
                  {source.title}
                </h4>
                {source.authors && (
                  <p className="text-[11px] text-[#64716C] mt-1 italic">{source.authors}</p>
                )}
                {source.notes && (
                  <p className="text-[11px] text-[#182522] mt-2 line-clamp-3 bg-[#F7F9F6] p-2 rounded border border-[#DCE5DF]/60">
                    {source.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-[#DCE5DF] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#245D8A] truncate max-w-[120px]">
                  {source.doi || 'Indexed'}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#176B5B] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Read Paper</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search parameters by name, symbol, or study condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg pl-9 pr-3 py-2 text-xs text-[#182522]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64716C]">Pathway:</span>
            <select
              value={pathwayFilter}
              onChange={(e) => setPathwayFilter(e.target.value)}
              className="bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#182522]"
            >
              <option value="all">All Pathways</option>
              <option value="mechanical">Mechanical</option>
              <option value="thermal">Thermal Pyrolysis</option>
              <option value="cement_kiln">Cement Kiln</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#64716C]">Classification:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#182522]"
            >
              <option value="all">All Types</option>
              <option value="published">Peer-Reviewed Published</option>
              <option value="derived">Derived Equation</option>
              <option value="user_assumption">User Assumption</option>
              <option value="illustrative">Illustrative Demo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#182522]">
            Parameters Catalogue ({filteredParams.length} of {REFERENCE_PARAMETERS.length} active)
          </h3>
          <span className="text-xs text-[#64716C]">Click any parameter row for full citation & uncertainty notes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                <th className="py-3 px-4 font-semibold">Parameter Name & Symbol</th>
                <th className="py-3 px-4 font-semibold">Pathway Applicability</th>
                <th className="py-3 px-4 font-semibold text-right">Reference Value</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Experimental Conditions</th>
                <th className="py-3 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF]">
              {filteredParams.map((param) => (
                <tr
                  key={param.id}
                  onClick={() => setSelectedParam(param)}
                  className="hover:bg-[#F7F9F6]/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#182522] block">{param.name}</span>
                    <span className="font-mono text-[11px] text-[#176B5B]">{param.symbol}</span>
                  </td>
                  <td className="py-3 px-4 capitalize text-[#64716C]">
                    {param.pathwayId.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#182522]">
                    {param.value !== null ? param.value : 'Unavailable'}{' '}
                    <span className="font-sans font-normal text-[#64716C] text-[11px]">{param.unit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge type="classification" value={param.classification} />
                  </td>
                  <td className="py-3 px-4 text-[#64716C] max-w-xs truncate">
                    {param.studyConditions || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-[#176B5B] font-semibold hover:underline">
                      Provenance →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
