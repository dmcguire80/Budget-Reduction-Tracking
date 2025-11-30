/**
 * Chart Type Definitions
 *
 * TypeScript interfaces and types for chart components and data visualization
 */

// Chart.js types are available when needed
// import type { ChartOptions as ChartJsOptions } from 'chart.js';

/**
 * Date range for chart filtering
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Chart data structure compatible with Chart.js
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  borderDash?: number[];
  type?: 'line' | 'bar';
}

/**
 * Chart options (simplified, compatible with Chart.js)
 * For full Chart.js options, use ChartJsOptions directly
 */
export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: LegendOptions;
    tooltip?: TooltipOptions;
    title?: TitleOptions;
  };
  scales?: ScalesOptions;
}

/**
 * Legend configuration
 */
export interface LegendOptions {
  display?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  labels?: {
    color?: string;
    font?: {
      size?: number;
      family?: string;
      weight?: string | number;
    };
    padding?: number;
    usePointStyle?: boolean;
  };
}

/**
 * Tooltip configuration
 */
export interface TooltipOptions {
  enabled?: boolean;
  mode?: 'index' | 'nearest' | 'point';
  intersect?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  bodyColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  displayColors?: boolean;
  callbacks?: {
    label?: (context: any) => string | string[];
    title?: (context: any) => string | string[];
    footer?: (context: any) => string | string[];
  };
}

/**
 * Title configuration
 */
export interface TitleOptions {
  display?: boolean;
  text?: string | string[];
  color?: string;
  font?: {
    size?: number;
    family?: string;
    weight?: string | number;
  };
  padding?: {
    top?: number;
    bottom?: number;
  };
  align?: 'start' | 'center' | 'end';
}

/**
 * Scales configuration
 */
export interface ScalesOptions {
  x?: AxisOptions;
  y?: AxisOptions;
}

/**
 * Axis configuration
 */
export interface AxisOptions {
  type?: 'linear' | 'logarithmic' | 'category' | 'time';
  display?: boolean;
  reverse?: boolean;
  grid?: {
    display?: boolean;
    color?: string;
    lineWidth?: number;
  };
  ticks?: {
    display?: boolean;
    color?: string;
    font?: {
      size?: number;
      family?: string;
    };
    callback?: (value: any, index: number, values: any[]) => string | number;
    stepSize?: number;
  };
  title?: {
    display?: boolean;
    text?: string;
    color?: string;
    font?: {
      size?: number;
      weight?: string | number;
    };
  };
}

/**
 * Balance Reduction Chart Props
 */
export interface BalanceReductionChartProps {
  accountIds?: string[];
  dateRange?: DateRange;
  inversionStrategy?: 'reduction' | 'inverted-axis';
}

/**
 * Interest Forecast Chart Props
 */
export interface InterestForecastChartProps {
  accountId: string;
  months?: number;
}

/**
 * Payment Distribution Chart Props
 */
export interface PaymentDistributionChartProps {
  accountId?: string;
  dateRange?: DateRange;
}

/**
 * Progress Chart Props
 */
export interface ProgressChartProps {
  accountId?: string;
  months?: number;
  targetAmount?: number;
}

/**
 * Projection Chart Props
 */
export interface ProjectionChartProps {
  accountId: string;
  scenarios?: PaymentScenario[];
}

/**
 * Payment scenario for projections
 */
export interface PaymentScenario {
  label: string;
  monthlyPayment: number;
}

/**
 * Utilization Chart Props
 */
export interface UtilizationChartProps {
  accountId?: string;
  displayType?: 'gauge' | 'bar';
}

/**
 * Chart export format
 */
export type ChartExportFormat = 'png' | 'svg' | 'jpeg';

/**
 * Chart Export Props
 */
export interface ChartExportProps {
  chartId: string;
  fileName?: string;
  formats?: ChartExportFormat[];
}

/**
 * Date range preset
 */
export type DateRangePreset = '1M' | '3M' | '6M' | '1Y' | 'ALL' | 'CUSTOM';

/**
 * Date Range Selector Props
 */
export interface DateRangeSelectorProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  showCustom?: boolean;
}

/**
 * Chart data point for balance reduction
 */
export interface BalanceDataPoint {
  date: string;
  balance: number;
  reduction?: number;
  accountName?: string;
}

/**
 * Chart data point for interest forecast
 */
export interface InterestDataPoint {
  month: number;
  monthlyInterest: number;
  cumulativeInterest: number;
  scenario?: string;
}

/**
 * Payment distribution data
 */
export interface PaymentDistribution {
  principal: number;
  interest: number;
  fees?: number;
}

/**
 * Progress data point
 */
export interface ProgressDataPoint {
  month: string;
  actual: number;
  target?: number;
}

/**
 * Projection data point
 */
export interface ProjectionDataPoint {
  month: number;
  balance: number;
  scenario: string;
  isProjected: boolean;
}

/**
 * Utilization data
 */
export interface UtilizationData {
  accountName: string;
  currentBalance: number;
  creditLimit: number;
  utilizationPercentage: number;
}

/**
 * Chart color palette
 */
export interface ChartColorPalette {
  primary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  secondary: string;
  light: string;
  dark: string;
}

/**
 * Chart theme
 */
export interface ChartTheme {
  colors: ChartColorPalette;
  fonts: {
    family: string;
    size: {
      small: number;
      medium: number;
      large: number;
    };
  };
  borderRadius: number;
  gridColor: string;
  textColor: string;
}
