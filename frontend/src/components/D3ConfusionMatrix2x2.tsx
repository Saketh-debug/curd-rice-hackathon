import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ConfusionMatrix } from '../types';
import { Eye, Info, Sparkles, BarChart2, Layers } from 'lucide-react';

export type DrilldownCellKey = 'TP' | 'FP' | 'TN' | 'FN';

interface D3ConfusionMatrix2x2Props {
    confusionMatrix: ConfusionMatrix;
    activeCell: DrilldownCellKey | null;
    onSelectCell: (cell: DrilldownCellKey) => void;
    totalTestSegments?: number;
    title?: string;
    subtitle?: string;
}

type DisplayMode = 'count' | 'row_percent' | 'total_percent';

interface CellData {
    key: DrilldownCellKey;
    name: string;
    description: string;
    row: number; // 0 = Actual Anomaly, 1 = Actual Nominal
    col: number; // 0 = Pred Anomaly, 1 = Pred Nominal
    actualLabel: string;
    predLabel: string;
    value: number;
    rowTotal: number;
    colTotal: number;
    total: number;
    color: string;
    accentColor: string;
    borderColor: string;
    glowId: string;
}

export const D3ConfusionMatrix2x2: React.FC<D3ConfusionMatrix2x2Props> = ({
    confusionMatrix,
    activeCell,
    onSelectCell,
    totalTestSegments,
    title = '2×2 Binary Telemetry Confusion Matrix',
    subtitle = 'Empirical Held-Out Validation (ESA OPS-SAT Spacecraft Telemetry)'
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('count');
    const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const { tp, fn, fp, tn } = confusionMatrix;
    const actualAnomalyTotal = tp + fn;
    const actualNominalTotal = fp + tn;
    const predAnomalyTotal = tp + fp;
    const predNominalTotal = fn + tn;
    const total = totalTestSegments || (actualAnomalyTotal + actualNominalTotal) || 1;

    // Derived standard metrics
    const recall = actualAnomalyTotal > 0 ? (tp / actualAnomalyTotal) * 100 : 0;
    const precision = predAnomalyTotal > 0 ? (tp / predAnomalyTotal) * 100 : 0;
    const specificity = actualNominalTotal > 0 ? (tn / actualNominalTotal) * 100 : 0;
    const fpr = actualNominalTotal > 0 ? (fp / actualNominalTotal) * 100 : 0;
    const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 0;

    const cells: CellData[] = [
        {
            key: 'TP',
            name: 'True Positive (TP)',
            description: 'Actual Anomaly correctly classified as Anomaly',
            row: 0,
            col: 0,
            actualLabel: 'Actual Anomaly',
            predLabel: 'Predicted Anomaly',
            value: tp,
            rowTotal: actualAnomalyTotal,
            colTotal: predAnomalyTotal,
            total,
            color: 'rgba(138, 191, 132, 0.22)',
            accentColor: '#8abf84',
            borderColor: 'rgba(138, 191, 132, 0.75)',
            glowId: 'glow-tp'
        },
        {
            key: 'FN',
            name: 'False Negative (FN)',
            description: 'Actual Anomaly misclassified as Nominal (Missed Threat)',
            row: 0,
            col: 1,
            actualLabel: 'Actual Anomaly',
            predLabel: 'Predicted Nominal',
            value: fn,
            rowTotal: actualAnomalyTotal,
            colTotal: predNominalTotal,
            total,
            color: 'rgba(255, 101, 104, 0.22)',
            accentColor: '#ff6568',
            borderColor: 'rgba(255, 101, 104, 0.75)',
            glowId: 'glow-fn'
        },
        {
            key: 'FP',
            name: 'False Positive (FP)',
            description: 'Actual Nominal flagged as Anomaly (False Alarm)',
            row: 1,
            col: 0,
            actualLabel: 'Actual Nominal',
            predLabel: 'Predicted Anomaly',
            value: fp,
            rowTotal: actualNominalTotal,
            colTotal: predAnomalyTotal,
            total,
            color: 'rgba(245, 179, 37, 0.22)',
            accentColor: '#f5b325',
            borderColor: 'rgba(245, 179, 37, 0.75)',
            glowId: 'glow-fp'
        },
        {
            key: 'TN',
            name: 'True Negative (TN)',
            description: 'Actual Nominal correctly cleared as Nominal',
            row: 1,
            col: 1,
            actualLabel: 'Actual Nominal',
            predLabel: 'Predicted Nominal',
            value: tn,
            rowTotal: actualNominalTotal,
            colTotal: predNominalTotal,
            total,
            color: 'rgba(124, 155, 218, 0.18)',
            accentColor: '#7c9bda',
            borderColor: 'rgba(124, 155, 218, 0.65)',
            glowId: 'glow-tn'
        }
    ];

    // Helper to format values according to displayMode
    const formatValue = (cell: CellData) => {
        if (displayMode === 'count') {
            return cell.value.toLocaleString();
        } else if (displayMode === 'row_percent') {
            const p = cell.rowTotal > 0 ? (cell.value / cell.rowTotal) * 100 : 0;
            return `${p.toFixed(1)}%`;
        } else {
            const p = cell.total > 0 ? (cell.value / cell.total) * 100 : 0;
            return `${p.toFixed(1)}%`;
        }
    };

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 560;
        const height = 400;
        const margin = { top: 75, right: 35, bottom: 45, left: 160 };
        const gridWidth = width - margin.left - margin.right;
        const gridHeight = height - margin.top - margin.bottom;

        const cellWidth = gridWidth / 2;
        const cellHeight = gridHeight / 2;
        const gap = 8;

        // Base container
        const g = svg
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Defs for filters and gradients
        const defs = svg.append('defs');

        // Glow filter
        const filter = defs.append('filter')
            .attr('id', 'd3-active-glow')
            .attr('x', '-30%')
            .attr('y', '-30%')
            .attr('width', '160%')
            .attr('height', '160%');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'blur');
        filter.append('feComposite')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blur')
            .attr('operator', 'over');

        // Column Labels (Predicted)
        const colLabels = [
            { text: 'PREDICTED ANOMALY', sub: `(Total: ${predAnomalyTotal})`, col: 0 },
            { text: 'PREDICTED NOMINAL', sub: `(Total: ${predNominalTotal})`, col: 1 }
        ];

        colLabels.forEach(col => {
            const colHeader = g.append('g')
                .attr('transform', `translate(${col.col * cellWidth + cellWidth / 2}, -38)`);

            colHeader.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', '#f1efea')
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('letter-spacing', '0.05em')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(col.text);

            colHeader.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 16)
                .attr('fill', '#a19c92')
                .attr('font-size', '10px')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(col.sub);
        });

        // Row Labels (Actual)
        const rowLabels = [
            { text: 'ACTUAL ANOMALY', sub: `${actualAnomalyTotal} cases`, row: 0, color: '#ff6568' },
            { text: 'ACTUAL NOMINAL', sub: `${actualNominalTotal} cases`, row: 1, color: '#7c9bda' }
        ];

        rowLabels.forEach(row => {
            const rowHeader = g.append('g')
                .attr('transform', `translate(-16, ${row.row * cellHeight + cellHeight / 2})`);

            rowHeader.append('text')
                .attr('text-anchor', 'end')
                .attr('y', -4)
                .attr('fill', row.color)
                .attr('font-size', '11px')
                .attr('font-weight', '700')
                .attr('letter-spacing', '0.04em')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(row.text);

            rowHeader.append('text')
                .attr('text-anchor', 'end')
                .attr('y', 14)
                .attr('fill', '#a19c92')
                .attr('font-size', '10px')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(row.sub);
        });

        // Corner Watermark / Dimension indicator
        svg.append('text')
            .attr('x', margin.left - 16)
            .attr('y', margin.top - 38)
            .attr('text-anchor', 'end')
            .attr('fill', '#66625a')
            .attr('font-size', '10px')
            .attr('font-family', 'var(--font-mono, monospace)')
            .attr('font-weight', '600')
            .text('ACTUAL \\ PRED');

        // Render each 2x2 Cell
        cells.forEach(cell => {
            const x = cell.col * cellWidth + gap / 2;
            const y = cell.row * cellHeight + gap / 2;
            const w = cellWidth - gap;
            const h = cellHeight - gap;
            const isSelected = activeCell === cell.key;

            const cellGroup = g.append('g')
                .attr('class', `cell-${cell.key}`)
                .attr('cursor', 'pointer')
                .on('mouseenter', (event: MouseEvent) => {
                    setHoveredCell(cell);
                    if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setTooltipPos({
                            x: event.clientX - rect.left,
                            y: event.clientY - rect.top
                        });
                    }
                    d3.select(`.rect-${cell.key}`)
                        .transition()
                        .duration(180)
                        .attr('transform', `translate(${x - 2}, ${y - 2})`)
                        .attr('width', w + 4)
                        .attr('height', h + 4)
                        .attr('stroke-width', 2.5)
                        .attr('stroke', cell.accentColor);
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
                    d3.select(`.rect-${cell.key}`)
                        .transition()
                        .duration(180)
                        .attr('transform', `translate(${x}, ${y})`)
                        .attr('width', w)
                        .attr('height', h)
                        .attr('stroke-width', isSelected ? 2.5 : 1)
                        .attr('stroke', isSelected ? cell.accentColor : cell.borderColor);
                })
                .on('click', () => {
                    onSelectCell(cell.key);
                });

            // Cell Background Card Rect
            const rect = cellGroup.append('rect')
                .attr('class', `rect-${cell.key}`)
                .attr('x', 0)
                .attr('y', 0)
                .attr('transform', `translate(${x}, ${y})`)
                .attr('width', w)
                .attr('height', h)
                .attr('rx', 12)
                .attr('ry', 12)
                .attr('fill', cell.color)
                .attr('stroke', isSelected ? cell.accentColor : cell.borderColor)
                .attr('stroke-width', isSelected ? 2.5 : 1)
                .attr('stroke-dasharray', isSelected ? 'none' : 'none')
                .style('transition', 'fill 0.25s ease');

            if (isSelected) {
                rect.attr('filter', 'url(#d3-active-glow)');
            }

            // Cell Title (Top)
            cellGroup.append('text')
                .attr('x', x + w / 2)
                .attr('y', y + 26)
                .attr('text-anchor', 'middle')
                .attr('fill', cell.accentColor)
                .attr('font-size', '11px')
                .attr('font-weight', '700')
                .attr('letter-spacing', '0.08em')
                .attr('font-family', 'var(--font-mono, monospace)')
                .text(cell.name);

            // Large Animated Metric Value (Center)
            const textValue = cellGroup.append('text')
                .attr('x', x + w / 2)
                .attr('y', y + h / 2 + 10)
                .attr('text-anchor', 'middle')
                .attr('fill', '#f1efea')
                .attr('font-size', '28px')
                .attr('font-weight', '700')
                .attr('font-family', 'var(--font-sans, system-ui)')
                .text(formatValue(cell));

            // Subtle value entry bounce
            textValue
                .attr('opacity', 0)
                .transition()
                .duration(400)
                .delay(cell.row * 100 + cell.col * 80)
                .attr('opacity', 1);

            // Sub-caption / Semantic Role (Bottom)
            let subText = '';
            if (cell.key === 'TP') subText = 'Correct Detections';
            else if (cell.key === 'FN') subText = 'Missed Anomalies';
            else if (cell.key === 'FP') subText = `False Alarms (${(cell.rowTotal > 0 ? (cell.value / cell.rowTotal) * 100 : 0).toFixed(1)}%)`;
            else if (cell.key === 'TN') subText = 'Pass Clearances';

            cellGroup.append('text')
                .attr('x', x + w / 2)
                .attr('y', y + h - 28)
                .attr('text-anchor', 'middle')
                .attr('fill', '#a19c92')
                .attr('font-size', '10px')
                .attr('font-family', 'var(--font-sans, system-ui)')
                .text(subText);

            // "Inspect Samples" Action pill in SVG
            const actionG = cellGroup.append('g')
                .attr('transform', `translate(${x + w / 2}, ${y + h - 12})`);

            actionG.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', isSelected ? cell.accentColor : '#8e8a80')
                .attr('font-size', '9.5px')
                .attr('font-family', 'var(--font-mono, monospace)')
                .attr('font-weight', isSelected ? '700' : '500')
                .text(isSelected ? '● ACTIVE DRILLDOWN' : '◉ Click to Inspect Samples');
        });

    }, [confusionMatrix, activeCell, displayMode]);

    return (
        <div ref={containerRef} className="relative bg-card border border-border rounded-xl p-5 shadow-xs">
            {/* Header with Title and Mode Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-signal/15 text-signal border border-signal/30">
                            <BarChart2 className="w-4 h-4" />
                        </span>
                        <h3 className="font-sans font-semibold text-base text-foreground tracking-tight">
                            {title}
                        </h3>
                        <span className="caps-label px-2 py-0.5 rounded-md bg-signal/15 text-signal border border-signal/30 font-medium text-[10px]">
                            D3.JS POWERED
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                        {subtitle}
                    </p>
                </div>

                {/* Display Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border self-start sm:self-auto">
                    <button
                        onClick={() => setDisplayMode('count')}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                            displayMode === 'count'
                                ? 'bg-background text-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Display raw segment counts"
                    >
                        Raw Counts
                    </button>
                    <button
                        onClick={() => setDisplayMode('row_percent')}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                            displayMode === 'row_percent'
                                ? 'bg-background text-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Normalized per actual class (Recall & Specificity)"
                    >
                        Recall %
                    </button>
                    <button
                        onClick={() => setDisplayMode('total_percent')}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                            displayMode === 'total_percent'
                                ? 'bg-background text-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Normalized over total test population"
                    >
                        Total %
                    </button>
                </div>
            </div>

            {/* D3 Render Container */}
            <div className="w-full flex justify-center items-center overflow-x-auto py-2">
                <svg
                    ref={svgRef}
                    className="w-full max-w-[620px] select-none"
                    style={{ minHeight: '340px' }}
                />
            </div>

            {/* Derived Empirical Rates Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-border font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-grove/10 border border-grove/20 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Sensitivity / Recall</span>
                    <span className="text-lg font-bold text-grove mt-0.5">{recall.toFixed(2)}%</span>
                    <span className="text-[10px] text-muted-foreground font-sans mt-0.5">TP / (TP + FN)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-signal/10 border border-signal/20 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Precision (PPV)</span>
                    <span className="text-lg font-bold text-signal mt-0.5">{precision.toFixed(2)}%</span>
                    <span className="text-[10px] text-muted-foreground font-sans mt-0.5">TP / (TP + FP)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-500/10 border border-slate-500/20 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Specificity (TNR)</span>
                    <span className="text-lg font-bold text-slate mt-0.5">{specificity.toFixed(2)}%</span>
                    <span className="text-[10px] text-muted-foreground font-sans mt-0.5">TN / (TN + FP)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">False Positive Rate</span>
                    <span className="text-lg font-bold text-destructive mt-0.5">{fpr.toFixed(2)}%</span>
                    <span className="text-[10px] text-muted-foreground font-sans mt-0.5">FP / (FP + TN)</span>
                </div>
            </div>

            {/* Interactive Tooltip Card */}
            {hoveredCell && tooltipPos && (
                <div
                    className="absolute pointer-events-none z-50 bg-[#1f1e1b]/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs max-w-xs transition-opacity duration-150"
                    style={{
                        left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth || 400) - 230)}px`,
                        top: `${Math.max(tooltipPos.y - 70, 10)}px`
                    }}
                >
                    <div className="flex items-center gap-1.5 font-bold font-mono" style={{ color: hoveredCell.accentColor }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        {hoveredCell.name}
                    </div>
                    <div className="text-[11px] text-foreground font-sans mt-1">
                        {hoveredCell.description}
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/60 space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Count:</span>
                            <span className="text-foreground font-semibold">{hoveredCell.value}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Class Rate:</span>
                            <span className="text-foreground font-semibold">
                                {hoveredCell.rowTotal > 0 ? ((hoveredCell.value / hoveredCell.rowTotal) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Share of Dataset:</span>
                            <span className="text-foreground font-semibold">
                                {hoveredCell.total > 0 ? ((hoveredCell.value / hoveredCell.total) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
