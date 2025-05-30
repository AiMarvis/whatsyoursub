'use client';

import React, { memo, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { getCategoryChartData, defaultChartOptions } from './chartUtils';
import ChartContainer from './ChartContainer';

const CategoryPieChart = memo(({ subscriptions, loading }) => {
  const chartData = useMemo(() => {
    if (loading || !subscriptions || subscriptions.length === 0) return null;
    return getCategoryChartData(subscriptions);
  }, [subscriptions, loading]);

  const options = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins.legend,
        position: 'right', 
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          ...defaultChartOptions.plugins.tooltip.callbacks,
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.raw;
            if (value !== null && value !== undefined) {
              // subscriptions에서 총합을 다시 계산하여 퍼센트 표시 (getCategoryChartData에서 금액만 반환하므로)
              const total = subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.price) || 0), 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              label += `${Number(value).toLocaleString()}원 (${percentage}%)`;
            }
            return label;
          }
        }
      }
    }
  }), [subscriptions]); // subscriptions가 바뀌면 tooltip 콜백도 다시 계산

  const isEmpty = !loading && (!chartData || chartData.labels.length === 0);

  return (
    <ChartContainer
      title="카테고리별 구독 현황"
      description="구독 중인 서비스의 카테고리별 지출 비율을 보여줍니다."
      loading={loading}
      isEmpty={isEmpty}
    >
      {!isEmpty && chartData && (
        <div style={{ position: 'relative', height: '300px', width:'100%' }}> 
          <Pie data={chartData} options={options} />
        </div>
      )}
    </ChartContainer>
  );
});

CategoryPieChart.displayName = 'CategoryPieChart';

export default CategoryPieChart; 