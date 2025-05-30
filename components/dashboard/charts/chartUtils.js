import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { format, addMonths, getMonth, getYear } from 'date-fns';

// Chart.js 컴포넌트 등록
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// DaisyUI 테마 색상 (tailwind.config.mjs 또는 글로벌 CSS에 정의된 색상과 일치시켜야 함)
// 실제 프로젝트에서는 CSS 변수를 직접 참조하거나, 테마 설정에 따라 동적으로 가져오는 것이 좋음
const daisyUIColors = {
  primary: '#570DF8', // 예시 색상
  secondary: '#F000B8',
  accent: '#37CDBE',
  neutral: '#3D4451',
  info: '#3ABFF8',
  success: '#36D399',
  warning: '#FBBD23',
  error: '#F87272',
  base100: '#FFFFFF', // 밝은 테마 기준
};

// 차트 색상 정의 (투명도 적용)
export const chartColors = {
  primary: (alpha = 0.8) => `rgba(87, 13, 248, ${alpha})`, // primary
  secondary: (alpha = 0.8) => `rgba(240, 0, 184, ${alpha})`, // secondary
  accent: (alpha = 0.8) => `rgba(55, 205, 190, ${alpha})`, // accent
  neutral: (alpha = 0.8) => `rgba(61, 68, 81, ${alpha})`, // neutral
  info: (alpha = 0.8) => `rgba(58, 191, 248, ${alpha})`, // info
  success: (alpha = 0.8) => `rgba(54, 211, 153, ${alpha})`, // success
  warning: (alpha = 0.8) => `rgba(251, 189, 35, ${alpha})`, // warning
  error: (alpha = 0.8) => `rgba(248, 114, 114, ${alpha})`, // error
  baseContent: (alpha = 0.6) => `rgba(55, 65, 81, ${alpha})`, // text-base-content/60 와 유사하게
};

// 카테고리별 색상 매핑
export const categoryColors = {
  default: chartColors.neutral(0.7),
  // 카테고리명은 실제 데이터와 일치해야 함
  '엔터테인먼트': chartColors.primary(0.7),
  '업무/생산성': chartColors.secondary(0.7),
  '유틸리티': chartColors.accent(0.7),
  '교육': chartColors.info(0.7),
  '자기계발': chartColors.success(0.7),
  '기타': chartColors.neutral(0.5),
};

export function getCategoryColor(category) {
  return categoryColors[category] || categoryColors.default;
}

// 카테고리별 구독 데이터 집계 함수 (파이 차트용)
export function getCategoryChartData(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    return { labels: [], datasets: [] };
  }

  const categoryMap = subscriptions.reduce((acc, sub) => {
    const category = sub.category || '기타';
    const price = parseFloat(sub.price) || 0;
    acc[category] = (acc[category] || 0) + price;
    return acc;
  }, {});

  const labels = Object.keys(categoryMap);
  const data = Object.values(categoryMap);
  const backgroundColor = labels.map(label => getCategoryColor(label));

  return {
    labels,
    datasets: [
      {
        label: '카테고리별 지출',
        data,
        backgroundColor,
        borderColor: daisyUIColors.base100, // 차트 조각 경계선 색상
        borderWidth: 2,
      },
    ],
  };
}

// 월별 지출 차트 데이터 생성 함수 (바 차트용)
// 향후 6개월 (현재 월 포함) 예상 지출
export function getMonthlyExpenseChartData(subscriptions, currentMonthTotal) {
  if (!subscriptions || subscriptions.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = [];
  const data = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const targetDate = addMonths(now, i);
    const monthLabel = format(targetDate, 'yyyy년 M월');
    labels.push(monthLabel);

    if (i === 0) {
      data.push(currentMonthTotal || 0);
      continue;
    }
    
    // 다음 달부터는 예상치를 계산 (단순 합계로, 실제 결제일 고려 필요시 로직 복잡해짐)
    // 현재 구현은 모든 구독이 매월 결제된다고 가정하고, 현재 월 총액을 그대로 사용.
    // 보다 정확한 계산을 위해서는 각 구독의 결제 주기(billing_cycle)와 다음 결제일(next_payment_date)을 고려해야 함.
    // 이번 구현에서는 단순화를 위해 totalMonthlyAmount를 반복 사용.
    data.push(currentMonthTotal || 0); 
  }

  return {
    labels,
    datasets: [
      {
        label: '월별 예상 지출',
        data,
        backgroundColor: chartColors.primary(0.6),
        borderColor: chartColors.primary(1),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 50,
      },
    ],
  };
}

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: chartColors.baseContent(1), // 범례 텍스트 색상
        padding: 20,
        font: {
          size: 12,
        }
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      padding: 10,
      cornerRadius: 4,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null && context.dataset.data[context.dataIndex] !== undefined) {
            label += `${Number(context.dataset.data[context.dataIndex]).toLocaleString()}원`;
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false, // x축 배경선 숨기기
      },
      ticks: {
        color: chartColors.baseContent(0.8), // x축 눈금 색상
        font: {
          size: 11,
        }
      },
    },
    y: {
      grid: {
        color: chartColors.baseContent(0.1), // y축 배경선 색상 및 투명도
        drawBorder: false,
      },
      ticks: {
        color: chartColors.baseContent(0.8), // y축 눈금 색상
        font: {
          size: 11,
        },
        callback: function(value) {
          return `${Number(value).toLocaleString()}원`;
        }
      },
      beginAtZero: true,
    },
  },
  animation: {
    duration: 800,
    easing: 'easeInOutQuart',
  },
  layout: {
    padding: {
      top: 10,
      bottom:10
    }
  }
}; 