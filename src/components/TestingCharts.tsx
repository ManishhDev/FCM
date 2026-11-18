import React, { useState } from 'react';
import { TestSimulationResult } from '../types/composite';

interface TestingChartsProps {
  result: TestSimulationResult;
}

export const TestingCharts: React.FC<TestingChartsProps> = ({ result }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 620;
  const height = 280;
  const padLeft = 58;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 44;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allPoints = [
    ...result.modelCurve,
    ...(result.measuredOverlayCurve ?? []),
    ...(result.operatingPoint ? [result.operatingPoint] : []),
  ];

  const maxXRaw = Math.max(0.01, ...allPoints.map((p) => p.x));
  const minXRaw = Math.min(0, ...allPoints.map((p) => p.x));
  const maxYRaw = Math.max(
    0.01,
    result.limitLineY ?? 0,
    ...allPoints.map((p) => p.y)
  );
  const maxX = maxXRaw * 1.12;
  const maxY = maxYRaw * 1.15;

  const scaleX = (x: number) =>
    padLeft + ((x - minXRaw) / Math.max(0.0001, maxX - minXRaw)) * plotW;
  const scaleY = (y: number) =>
    padTop + plotH - (y / Math.max(0.0001, maxY)) * plotH;

  const modelPath = result.modelCurve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(2)} ${scaleY(p.y).toFixed(2)}`)
    .join(' ');

  const measuredPath =
    result.measuredOverlayCurve && result.measuredOverlayCurve.length >= 2
      ? result.measuredOverlayCurve
          .map(
            (p, idx) =>
              `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(2)} ${scaleY(p.y).toFixed(2)}`
          )
          .join(' ')
      : null;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxY * f);
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minXRaw + (maxX - minXRaw) * f);

  const hoverPoint =
    hoverIdx !== null && result.modelCurve[hoverIdx] ? result.modelCurve[hoverIdx] : null;

  return (
    <div className="bg-white rounded-xl border border-[#DCE5DF] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-[#123B32] uppercase tracking-wider">
            {result.yAxisLabel} vs. {result.xAxisLabel}
          </h4>
          <p className="text-[11px] text-[#64716C] mt-0.5">{result.modelDescription}</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-[#176B5B]" />
            <span className="text-[#182522] font-medium">Analytical Curve</span>
          </div>
          {measuredPath && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 bg-[#245D8A] border-b border-dashed" />
              <span className="text-[#245D8A] font-semibold">Measured CSV Data</span>
            </div>
          )}
          {result.limitLineY !== null && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-4 border-t-2 border-dashed border-[#DC2626]" />
              <span className="text-[#DC2626] font-medium">Limit</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] select-none"
          role="img"
          aria-label={`${result.testName} response chart`}
        >
          {/* Grid lines */}
          {yTicks.map((val, idx) => {
            const yPos = scaleY(val);
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={width - padRight}
                  y2={yPos}
                  stroke="#E6EDE9"
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="fill-[#64716C] text-[10px] font-mono tabular-nums"
                >
                  {val >= 100 ? Math.round(val) : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {xTicks.map((val, idx) => {
            const xPos = scaleX(val);
            return (
              <g key={`x-${idx}`}>
                <line
                  x1={xPos}
                  y1={padTop}
                  x2={xPos}
                  y2={height - padBottom}
                  stroke="#EFF4F1"
                  strokeWidth={1}
                />
                <text
                  x={xPos}
                  y={height - padBottom + 16}
                  textAnchor="middle"
                  className="fill-[#64716C] text-[10px] font-mono tabular-nums"
                >
                  {val >= 10 ? val.toFixed(1) : val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#94A39D"
            strokeWidth={1.2}
          />
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#94A39D"
            strokeWidth={1.2}
          />

          {/* Axis labels */}
          <text
            x={padLeft + plotW / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-[#182522] text-[11px] font-medium"
          >
            {result.xAxisLabel}
          </text>
          <text
            x={16}
            y={padTop + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${padTop + plotH / 2})`}
            className="fill-[#182522] text-[11px] font-medium"
          >
            {result.yAxisLabel}
          </text>

          {/* Limit Line */}
          {result.limitLineY !== null && (
            <g>
              <line
                x1={padLeft}
                y1={scaleY(result.limitLineY)}
                x2={width - padRight}
                y2={scaleY(result.limitLineY)}
                stroke="#DC2626"
                strokeWidth={1.4}
                strokeDasharray="5 4"
              />
              {result.limitLineLabel && (
                <text
                  x={width - padRight - 4}
                  y={scaleY(result.limitLineY) - 6}
                  textAnchor="end"
                  className="fill-[#DC2626] text-[10px] font-mono font-semibold"
                >
                  {result.limitLineLabel}
                </text>
              )}
            </g>
          )}

          {/* Analytical Model Curve */}
          <path
            d={modelPath}
            fill="none"
            stroke="#176B5B"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Measured CSV Overlay Curve */}
          {measuredPath && (
            <path
              d={measuredPath}
              fill="none"
              stroke="#245D8A"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive hover targets on model curve */}
          {result.modelCurve.map((p, idx) => (
            <circle
              key={idx}
              cx={scaleX(p.x)}
              cy={scaleY(p.y)}
              r={6}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}

          {/* Current Operating Point */}
          {result.operatingPoint && (
            <g>
              <line
                x1={scaleX(result.operatingPoint.x)}
                y1={scaleY(result.operatingPoint.y)}
                x2={scaleX(result.operatingPoint.x)}
                y2={height - padBottom}
                stroke={result.isFailure ? '#DC2626' : '#A96512'}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={scaleX(result.operatingPoint.x)}
                cy={scaleY(result.operatingPoint.y)}
                r={5.5}
                fill={result.isFailure ? '#DC2626' : '#A96512'}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Hover Crosshair & Tooltip */}
          {hoverPoint && (
            <g>
              <circle
                cx={scaleX(hoverPoint.x)}
                cy={scaleY(hoverPoint.y)}
                r={4}
                fill="#123B32"
              />
              <rect
                x={Math.min(width - 145, scaleX(hoverPoint.x) + 8)}
                y={Math.max(padTop, scaleY(hoverPoint.y) - 34)}
                width={132}
                height={26}
                rx={4}
                fill="#123B32"
              />
              <text
                x={Math.min(width - 145, scaleX(hoverPoint.x) + 14)}
                y={Math.max(padTop, scaleY(hoverPoint.y) - 17)}
                className="fill-white text-[10px] font-mono tabular-nums"
              >
                x={hoverPoint.x.toFixed(2)}, y={hoverPoint.y.toFixed(2)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <p className="text-[11px] text-[#64716C] border-t border-[#EFF4F1] pt-2">
        {result.validityNote}
      </p>
    </div>
  );
};
