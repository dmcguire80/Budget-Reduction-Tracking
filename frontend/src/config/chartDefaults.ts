/**
 * Chart.js Default Configuration
 *
 * Default settings for Chart.js components including colors, fonts,
 * responsive settings, animations, tooltips, and legends
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { ChartColorPalette, ChartTheme } from '../types/chart.types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Default color palette matching Tailwind CSS colors
 */
export const DEFAULT_CHART_COLORS: ChartColorPalette = {
  primary: '#3b82f6',   // blue-500
  success: '#10b981',   // green-500
  danger: '#ef4444',    // red-500
  warning: '#f59e0b',   // amber-500
  info: '#06b6d4',      // cyan-500
  secondary: '#6b7280', // gray-500
  light: '#f3f4f6',     // gray-100
  dark: '#1f2937',      // gray-800
};

/**
 * Chart color array for multiple datasets
 */
export const CHART_COLOR_ARRAY = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

/**
 * Account type specific colors
 */
export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: '#3b82f6',      // blue
  PERSONAL_LOAN: '#10b981',    // green
  AUTO_LOAN: '#f59e0b',        // amber
  MORTGAGE: '#8b5cf6',         // violet
  STUDENT_LOAN: '#06b6d4',     // cyan
  OTHER: '#6b7280',            // gray
};

/**
 * Utilization percentage color coding
 */
export const UTILIZATION_COLORS = {
  low: '#10b981',      // green (< 30%)
  medium: '#f59e0b',   // amber (30-70%)
  high: '#ef4444',     // red (> 70%)
};

/**
 * Default chart theme
 */
export const DEFAULT_CHART_THEME: ChartTheme = {
  colors: DEFAULT_CHART_COLORS,
  fonts: {
    family: "'Inter', 'system-ui', 'sans-serif'",
    size: {
      small: 11,
      medium: 13,
      large: 16,
    },
  },
  borderRadius: 4,
  gridColor: '#e5e7eb', // gray-200
  textColor: '#374151', // gray-700
};

/**
 * Default responsive settings
 */
export const DEFAULT_RESPONSIVE_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
};

/**
 * Default animation settings
 */
export const DEFAULT_ANIMATION_CONFIG = {
  duration: 750,
  easing: 'easeInOutQuart' as const,
};

/**
 * Default tooltip configuration
 */
export const DEFAULT_TOOLTIP_CONFIG = {
  enabled: true,
  mode: 'index' as const,
  intersect: false,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  titleColor: '#ffffff',
  bodyColor: '#ffffff',
  borderColor: '#374151',
  borderWidth: 1,
  padding: 12,
  displayColors: true,
  callbacks: {
    label: function (context: any) {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      if (context.parsed.y !== null) {
        label += new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(context.parsed.y);
      }
      return label;
    },
  },
};

/**
 * Default legend configuration
 */
export const DEFAULT_LEGEND_CONFIG = {
  display: true,
  position: 'top' as const,
  align: 'end' as const,
  labels: {
    color: DEFAULT_CHART_THEME.textColor,
    font: {
      size: DEFAULT_CHART_THEME.fonts.size.medium,
      family: DEFAULT_CHART_THEME.fonts.family,
    },
    padding: 16,
    usePointStyle: true,
  },
};

/**
 * Default title configuration
 */
export const DEFAULT_TITLE_CONFIG = {
  display: false,
  color: DEFAULT_CHART_THEME.textColor,
  font: {
    size: DEFAULT_CHART_THEME.fonts.size.large,
    family: DEFAULT_CHART_THEME.fonts.family,
    weight: '600' as const,
  },
  padding: {
    top: 10,
    bottom: 20,
  },
  align: 'start' as const,
};

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG = {
  display: true,
  color: DEFAULT_CHART_THEME.gridColor,
  lineWidth: 1,
};

/**
 * Default axis configuration
 */
export const DEFAULT_AXIS_CONFIG = {
  grid: DEFAULT_GRID_CONFIG,
  ticks: {
    color: DEFAULT_CHART_THEME.textColor,
    font: {
      size: DEFAULT_CHART_THEME.fonts.size.small,
      family: DEFAULT_CHART_THEME.fonts.family,
    },
  },
};

/**
 * Get default line chart options
 */
export function getLineChartOptions(config?: Partial<ChartOptions>): ChartOptions {
  return {
    ...DEFAULT_RESPONSIVE_CONFIG,
    plugins: {
      legend: DEFAULT_LEGEND_CONFIG,
      tooltip: DEFAULT_TOOLTIP_CONFIG,
      title: config?.plugins?.title || DEFAULT_TITLE_CONFIG,
    },
    scales: {
      x: {
        ...DEFAULT_AXIS_CONFIG,
        ...config?.scales?.x,
      },
      y: {
        ...DEFAULT_AXIS_CONFIG,
        beginAtZero: true,
        ticks: {
          ...DEFAULT_AXIS_CONFIG.ticks,
          callback: function (value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
        ...config?.scales?.y,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: DEFAULT_ANIMATION_CONFIG,
    ...config,
  } as ChartOptions;
}

/**
 * Get default bar chart options
 */
export function getBarChartOptions(config?: Partial<ChartOptions>): ChartOptions {
  return {
    ...DEFAULT_RESPONSIVE_CONFIG,
    plugins: {
      legend: DEFAULT_LEGEND_CONFIG,
      tooltip: DEFAULT_TOOLTIP_CONFIG,
      title: config?.plugins?.title || DEFAULT_TITLE_CONFIG,
    },
    scales: {
      x: {
        ...DEFAULT_AXIS_CONFIG,
        grid: {
          display: false,
        },
        ...config?.scales?.x,
      },
      y: {
        ...DEFAULT_AXIS_CONFIG,
        beginAtZero: true,
        ticks: {
          ...DEFAULT_AXIS_CONFIG.ticks,
          callback: function (value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
        ...config?.scales?.y,
      },
    },
    animation: DEFAULT_ANIMATION_CONFIG,
    ...config,
  } as ChartOptions;
}

/**
 * Get default pie/doughnut chart options
 */
export function getPieChartOptions(config?: Partial<ChartOptions>): ChartOptions {
  return {
    ...DEFAULT_RESPONSIVE_CONFIG,
    plugins: {
      legend: {
        ...DEFAULT_LEGEND_CONFIG,
        position: 'right' as const,
      },
      tooltip: {
        ...DEFAULT_TOOLTIP_CONFIG,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
            return `${label}: ${formattedValue} (${percentage}%)`;
          },
        },
      },
      title: config?.plugins?.title || DEFAULT_TITLE_CONFIG,
    },
    animation: DEFAULT_ANIMATION_CONFIG,
    ...config,
  } as ChartOptions;
}

/**
 * Get currency tooltip callback
 */
export function getCurrencyTooltipCallback() {
  return {
    label: function (context: any) {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      if (context.parsed.y !== null) {
        label += new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(context.parsed.y);
      }
      return label;
    },
  };
}

/**
 * Get percentage tooltip callback
 */
export function getPercentageTooltipCallback() {
  return {
    label: function (context: any) {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      if (context.parsed.y !== null) {
        label += context.parsed.y.toFixed(1) + '%';
      }
      return label;
    },
  };
}

/**
 * Set Chart.js global defaults
 */
export function setChartDefaults() {
  ChartJS.defaults.font.family = DEFAULT_CHART_THEME.fonts.family;
  ChartJS.defaults.font.size = DEFAULT_CHART_THEME.fonts.size.medium;
  ChartJS.defaults.color = DEFAULT_CHART_THEME.textColor;
  ChartJS.defaults.borderColor = DEFAULT_CHART_THEME.gridColor;
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
}
