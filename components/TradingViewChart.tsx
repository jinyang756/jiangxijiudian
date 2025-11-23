import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { ChartPoint } from '../services/simulationService';

interface Props {
    navData: ChartPoint[];
    assetData?: ChartPoint[];
    costData?: ChartPoint[];
    mode: 'NAV' | 'STRATEGY';
}

const TradingViewChart: React.FC<Props> = ({ navData, assetData, costData, mode }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const assetSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const costSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: '#333',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
            },
        });

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update Data
    useEffect(() => {
        if (!chartRef.current) return;

        // Clear previous series logic (in a real app we might manage references better or keep one series)
        // For simplicity, we assume the chart instance is stable and we just update data if series exists,
        // or create them if they don't.
        
        // However, switching modes requires cleaning up.
        // Quick dirty cleanup: remove all series by re-creating chart or managing state.
        // Let's just manage series creation here.
        
        if (mode === 'NAV') {
            if (assetSeriesRef.current) {
                chartRef.current.removeSeries(assetSeriesRef.current);
                assetSeriesRef.current = null;
            }
            if (costSeriesRef.current) {
                chartRef.current.removeSeries(costSeriesRef.current);
                costSeriesRef.current = null;
            }

            if (!seriesRef.current) {
                seriesRef.current = chartRef.current.addAreaSeries({
                    lineColor: '#2563eb',
                    topColor: 'rgba(37, 99, 235, 0.4)',
                    bottomColor: 'rgba(37, 99, 235, 0.0)',
                });
            }
            seriesRef.current.setData(navData);
            chartRef.current.timeScale().fitContent();
        } else {
            // STRATEGY MODE
            if (seriesRef.current) {
                chartRef.current.removeSeries(seriesRef.current);
                seriesRef.current = null;
            }

            if (!assetSeriesRef.current) {
                assetSeriesRef.current = chartRef.current.addAreaSeries({
                    lineColor: '#10b981', // Green
                    topColor: 'rgba(16, 185, 129, 0.4)',
                    bottomColor: 'rgba(16, 185, 129, 0.0)',
                    priceScaleId: 'right',
                    title: '持仓市值'
                });
            }

            if (!costSeriesRef.current) {
                costSeriesRef.current = chartRef.current.addLineSeries({
                    color: '#ef4444', // Red
                    lineWidth: 2,
                    priceScaleId: 'right',
                    title: '投入成本'
                });
            }

            if (assetData) assetSeriesRef.current.setData(assetData);
            if (costData) costSeriesRef.current.setData(costData);
            
            chartRef.current.timeScale().fitContent();
        }

    }, [navData, assetData, costData, mode]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};

export default TradingViewChart;