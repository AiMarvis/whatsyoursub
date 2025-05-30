'use client';

import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getMonthlyExpenseChartData, defaultChartOptions } from './chartUtils';
import ChartContainer from './ChartContainer';

const MonthlyExpenseChart = memo(({ subscriptions, loading, totalMonthlyAmount }) => {
  const chartData = useMemo(() => {
    if (loading || !subscriptions || subscriptions.length === 0 || totalMonthlyAmount === undefined) return null;
    return getMonthlyExpenseChartData(subscriptions, totalMonthlyAmount);
  }, [subscriptions, loading, totalMonthlyAmount]);

  const options = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins.legend,
        display: false, // 바 차트에서는 범례를 숨김 (단일 데이터셋)
      },
    },
    scales: {
      ...defaultChartOptions.scales,
      x: {
        ...defaultChartOptions.scales.x,
        grid: {
          display: false, // X축 그리드 라인 숨김
        },
      },
      y: {
        ...defaultChartOptions.scales.y,
        grid: {
          ...defaultChartOptions.scales.y.grid,
          color: defaultChartOptions.scales.y.grid.color, 
        },
      },
    },
  }), []);

  const isEmpty = !loading && (!chartData || chartData.labels.length === 0);

  return (
    <ChartContainer
      title="월별 예상 구독료"
      description="현재 및 향후 6개월간의 예상 월별 구독 지출액입니다."
      loading={loading}
      isEmpty={isEmpty}
    >
      {!isEmpty && chartData && (
         <div style={{ position: 'relative', height: '300px', width:'100%' }}> 
          <Bar data={chartData} options={options} />
        </div>
      )}
    </ChartContainer>
  );
});

MonthlyExpenseChart.displayName = 'MonthlyExpenseChart';

export default MonthlyExpenseChart; 