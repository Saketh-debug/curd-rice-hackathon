import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Layers, Sparkles, Filter, Percent, Binary, ZoomIn } from 'lucide-react';

interface D3ConfusionMatrix7x7Props {
    matrix: number[][];
    labels: string[];
    selectedCell: { r: number; c: number; val: number } | null;
    onSelectCell: (r: number, c: number, val: number) => void;
    title?: string;
    subtitle?: string;
}

type DisplayFormat = 'percent' | 'decimal';

export const D3ConfusionMatrix7x7: React.FC<D3ConfusionMatrix7x7Props> = ({
    matrix,
    labels,
    selectedCell,
    onSelectCell,
    title = '7×7 Multiclass Ground Flow Confusion Matrix',
    subtitle = 'XGBoost Multiclass IDS Classifier • 52 Flow Features • Held-Out Validation'
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [format, setFormat] = useState<DisplayFormat>('percent');
    const [filterErrorsOnly, setFilterErrorsOnly] = useState<boolean>(false);
    const [hoveredCell, setHoveredCell] = useState<{
        r: number;
        c: number;
        val: number;
        actual: string;
        predicted: string;
        isDiagonal: boolean;
    } | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const numRows = matrix.length || 7;
    const numCols = (matrix[0] && matrix[0].length) || 7;

    const formatValue = (val: number) => {
        if (format === 'percent') {
            if (val === 0) return '0.0%';
            if (val < 0.001) return '<0.1%';
            return `${(val * 100).toFixed(1)}%`;
        }
        return val.toFixed(3);
    };

    // Color interpolation functions
    const getDiagonalColor = (val: number) => {
        // Correct predictions: deep dark -> emerald
        if (val > 0.98) return '#10b981'; // vibrant emerald
        if (val > 0.95) return '#059669'; // medium emerald
        if (val > 0.85) return '#047857'; // dark emerald
        return '#065f46';
    };

    const getOffDiagonalColor = (val: number) => {
        // Misclassifications: black -> crimson
        if (val === 0) return '#181715';
        if (val < 0.005) return '#241a1a';
        if (val < 0.015) return '#451a1a';
        if (val < 0.05) return '#7f1d1d';
        return '#dc2626'; // bright red for high error
    };

    const getCellFill = (r: number, c: number, val: number) => {
        if (filterErrorsOnly && r === c) {
            return '#181715'; // muted when filtering errors
        }
        return r === c ? getDiagonalColor(val) : getOffDiagonalColor(val);
    };

    const getTextColor = (r: number, c: number, val: number) => {
        if (filterErrorsOnly && r === c) {
            return '#52504b';
        }
        if (r === c) {
            return val > 0.95 ? '#ffffff' : '#e2e8f0';
        }
        if (val === 0) return '#47453f';
        if (val < 0.005) return '#94a3b8';
        return '#fca5a5';
    };

    useEffect(() => {
        if (!svgRef.current || !matrix || matrix.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Dimensions
        const width = 760;
        const height = 580;
        const margin = { top: 110, right: 30, bottom: 40, left: 155 };
        const gridWidth = width - margin.left - margin.right;
        const gridHeight = height - margin.top - margin.bottom;

        const cellWidth = gridWidth / numCols;
        const cellHeight = gridHeight / numRows;
        const cellGap = 3.5;

        // Container SVG
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Defs for Glow Filter
        const defs = svg.append('defs');
        const glow = defs.append('filter')
            .attr('id', 'd3-matrix-glow')
            .attr('x', '-30%')
            .attr('y', '-30%')
            .attr('width', '160%')
            .attr('height', '160%');
        glow.append('feGaussianBlur')
            .attr('stdDeviation', '3.5')
            .attr('result', 'blur');
        glow.append('feComposite')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blur')
            .attr('operator', 'over');

        // Top Axis Title: PREDICTED CLASS
        svg.append('text')
            .attr('x', margin.left + gridWidth / 2)
            .attr('y', 28)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f5b325')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '0.1em')
            .attr('font-family', 'var(--font-mono, monospace)')
            .text('▼ PREDICTED CLASSIFICATION (COLUMNS)');

        // Left Axis Title: ACTUAL CLASS
        svg.append('text')
            .attr('transform', `translate(22, ${margin.top + gridHeight / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ff6568')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '0.1em')
            .attr('font-family', 'var(--font-mono, monospace)')
            .text('▲ ACTUAL GROUND TRUTH (ROWS)');

        // Render Column Headers (Rotated for legibility)
        labels.forEach((label, cIdx) => {
            const colX = cIdx * cellWidth + cellWidth / 2;
            const headerGroup = g.append('g')
                .attr('transform', `translate(${colX}, -12)`);

            headerGroup.append('text')
                .attr('text-anchor', 'start')
                .attr('transform', 'rotate(-38)')
                .attr('fill', '#f1efea')
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(label.length > 14 ? label.slice(0, 13) + '…' : label);
        });

        // Render Row Headers
        labels.forEach((label, rIdx) => {
            const rowY = rIdx * cellHeight + cellHeight / 2;
            const headerGroup = g.append('g')
                .attr('transform', `translate(-12, ${rowY})`);

            headerGroup.append('text')
                .attr('text-anchor', 'end')
                .attr('y', 4)
                .attr('fill', '#f1efea')
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(label);
        });

        // Crosshair highlight guides (initially invisible)
        const rowHighlight = g.append('rect')
            .attr('class', 'row-guide')
            .attr('x', 0)
            .attr('width', gridWidth)
            .attr('height', cellHeight)
            .attr('fill', 'rgba(255, 255, 255, 0.04)')
            .attr('stroke', 'rgba(245, 179, 37, 0.35)')
            .attr('stroke-width', 1)
            .attr('rx', 6)
            .attr('display', 'none')
            .attr('pointer-events', 'none');

        const colHighlight = g.append('rect')
            .attr('class', 'col-guide')
            .attr('y', 0)
            .attr('height', gridHeight)
            .attr('width', cellWidth)
            .attr('fill', 'rgba(255, 255, 255, 0.04)')
            .attr('stroke', 'rgba(245, 179, 37, 0.35)')
            .attr('stroke-width', 1)
            .attr('rx', 6)
            .attr('display', 'none')
            .attr('pointer-events', 'none');

        // Render Heatmap Matrix Cells
        matrix.forEach((row, rIdx) => {
            row.forEach((val, cIdx) => {
                const x = cIdx * cellWidth + cellGap / 2;
                const y = rIdx * cellHeight + cellGap / 2;
                const w = cellWidth - cellGap;
                const h = cellHeight - cellGap;
                const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                const isDiag = rIdx === cIdx;

                const cellGroup = g.append('g')
                    .attr('class', `cell-group-${rIdx}-${cIdx}`)
                    .attr('cursor', 'pointer')
                    .on('mouseenter', (event: MouseEvent) => {
                        setHoveredCell({
                            r: rIdx,
                            c: cIdx,
                            val,
                            actual: labels[rIdx] || `Class ${rIdx}`,
                            predicted: labels[cIdx] || `Class ${cIdx}`,
                            isDiagonal: isDiag
                        });

                        if (containerRef.current) {
                            const rect = containerRef.current.getBoundingClientRect();
                            setTooltipPos({
                                x: event.clientX - rect.left,
                                y: event.clientY - rect.top
                            });
                        }

                        // Show Crosshairs
                        rowHighlight
                            .attr('y', rIdx * cellHeight)
                            .attr('display', 'block');
                        colHighlight
                            .attr('x', cIdx * cellWidth)
                            .attr('display', 'block');

                        // Hover cell animation
                        d3.select(`.cell-rect-${rIdx}-${cIdx}`)
                            .transition()
                            .duration(150)
                            .attr('stroke', '#ffffff')
                            .attr('stroke-width', 2);
                    })
                    .on('mousemove', (event: MouseEvent) => {
                        if (containerRef.current) {
                            const rect = containerRef.current.getBoundingClientRect();
                            setTooltipPos({
                                x: event.clientX - rect.left,
                                y: event.clientY - rect.top
                            });
                        }
                    })
                    .on('mouseleave', () => {
                        setHoveredCell(null);
                        setTooltipPos(null);
                        rowHighlight.attr('display', 'none');
                        colHighlight.attr('display', 'none');

                        d3.select(`.cell-rect-${rIdx}-${cIdx}`)
                            .transition()
                            .duration(150)
                            .attr('stroke', isSelected ? '#ffffff' : (isDiag ? 'rgba(138, 191, 132, 0.4)' : 'rgba(52, 50, 45, 0.6)'))
                            .attr('stroke-width', isSelected ? 2.5 : 1);
                    })
                    .on('click', () => {
                        onSelectCell(rIdx, cIdx, val);
                    });

                // Background Cell Rectangle
                const cellRect = cellGroup.append('rect')
                    .attr('class', `cell-rect-${rIdx}-${cIdx}`)
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', w)
                    .attr('height', h)
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .attr('fill', getCellFill(rIdx, cIdx, val))
                    .attr('stroke', isSelected ? '#ffffff' : (isDiag ? 'rgba(138, 191, 132, 0.4)' : 'rgba(52, 50, 45, 0.6)'))
                    .attr('stroke-width', isSelected ? 2.5 : 1)
                    .style('transition', 'fill 0.2s ease');

                if (isSelected) {
                    cellRect.attr('filter', 'url(#d3-matrix-glow)');
                }

                // Cell Text Value
                cellGroup.append('text')
                    .attr('x', x + w / 2)
                    .attr('y', y + h / 2 + 4)
                    .attr('text-anchor', 'middle')
                    .attr('fill', getTextColor(rIdx, cIdx, val))
                    .attr('font-size', '11px')
                    .attr('font-weight', isDiag || val > 0.01 ? '700' : '400')
                    .attr('font-family', 'var(--font-mono, monospace)')
                    .text(formatValue(val));
            });
        });

    }, [matrix, labels, selectedCell, format, filterErrorsOnly]);

    return (
        <div ref={containerRef} className="relative bg-card border border-border rounded-xl p-5 shadow-xs">
            {/* Header with Title and Mode Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-signal/15 text-signal border border-signal/30">
                            <Layers className="w-4 h-4" />
                        </span>
                        <h2 className="text-lg font-semibold tracking-tight text-foreground font-sans">
                            {title}
                        </h2>
                        <span className="caps-label px-2 py-0.5 rounded-md bg-signal/15 text-signal border border-signal/30 font-medium text-[10px]">
                            D3.JS HEATMAP
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                        {subtitle}
                    </p>
                </div>

                {/* Interactive Controls & Heatmap Legend */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                        <span className="flex items-center gap-1.5 text-grove">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> True Match (Diagonal)
                        </span>
                        <span className="flex items-center gap-1.5 text-destructive">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Error (Off-Diagonal)
                        </span>
                    </div>

                    {/* Format Toggle */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setFormat('percent')}
                            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                format === 'percent'
                                    ? 'bg-background text-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Show percentages (%)"
                        >
                            <Percent className="w-3 h-3" /> %
                        </button>
                        <button
                            onClick={() => setFormat('decimal')}
                            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                format === 'decimal'
                                    ? 'bg-background text-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Show decimal probabilities (0.000)"
                        >
                            <Binary className="w-3 h-3" /> 0.00
                        </button>
                    </div>

                    {/* Errors Filter Toggle */}
                    <button
                        onClick={() => setFilterErrorsOnly(!filterErrorsOnly)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            filterErrorsOnly
                                ? 'bg-destructive/20 border-destructive text-destructive font-bold'
                                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                        }`}
                        title="Highlight misclassification errors"
                    >
                        <Filter className="w-3 h-3" />
                        {filterErrorsOnly ? 'Errors Highlighted' : 'All Transitions'}
                    </button>
                </div>
            </div>

            {/* D3 Render Container */}
            <div className="w-full flex justify-center items-center overflow-x-auto py-2">
                <svg
                    ref={svgRef}
                    className="w-full max-w-[780px] select-none"
                    style={{ minHeight: '460px' }}
                />
            </div>

            {/* Matrix Helper Tip */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal animate-pulse"></span>
                    <span>Click any cell to inspect behavioral heuristics and Laya mitigation policy below.</span>
                </div>
                {selectedCell && (
                    <div className="text-foreground">
                        Selected: <span className="text-signal font-semibold">{labels[selectedCell.r]}</span> → <span className="text-grove font-semibold">{labels[selectedCell.c]}</span>
                    </div>
                )}
            </div>

            {/* Interactive Tooltip Card */}
            {hoveredCell && tooltipPos && (
                <div
                    className="absolute pointer-events-none z-50 bg-[#1f1e1b]/95 backdrop-blur-md border border-border p-3.5 rounded-lg shadow-2xl text-xs max-w-xs transition-opacity duration-150"
                    style={{
                        left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth || 500) - 240)}px`,
                        top: `${Math.max(tooltipPos.y - 85, 10)}px`
                    }}
                >
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                        <div className="font-bold font-mono flex items-center gap-1.5" style={{ color: hoveredCell.isDiagonal ? '#8abf84' : '#ff6568' }}>
                            <Sparkles className="w-3.5 h-3.5" />
                            {hoveredCell.isDiagonal ? 'True Match' : 'Misclassification'}
                        </div>
                        <span className="font-mono text-sm font-bold text-foreground">
                            {(hoveredCell.val * 100).toFixed(2)}%
                        </span>
                    </div>

                    <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Ground Truth:</span>
                            <span className="text-foreground font-medium">{hoveredCell.actual}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Predicted:</span>
                            <span className="text-foreground font-medium">{hoveredCell.predicted}</span>
                        </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-signal font-sans">
                        ◉ Click to inspect packet heuristics & SOAR mitigation
                    </div>
                </div>
            )}
        </div>
    );
};
