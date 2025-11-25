/**
 * Date Range Selector
 *
 * Component for selecting date ranges with quick presets and custom dates
 */

import React, { useState } from 'react';
import { DateRangeSelectorProps, DateRangePreset } from '../../types/chart.types';
import { getDateRangeFromPreset } from '../../utils/chart.utils';
import { format } from 'date-fns';
import Input from '../common/Input';
import Button from '../common/Button';

const DEFAULT_PRESETS: DateRangePreset[] = ['1M', '3M', '6M', '1Y', 'ALL'];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showCustom = true,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    value?.startDate ? format(value.startDate, 'yyyy-MM-dd') : ''
  );
  const [customEndDate, setCustomEndDate] = useState(
    value?.endDate ? format(value.endDate, 'yyyy-MM-dd') : ''
  );

  /**
   * Handle preset selection
   */
  const handlePresetClick = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    setShowCustomPicker(false);
    const range = getDateRangeFromPreset(preset);
    onChange(range);
  };

  /**
   * Handle custom date range
   */
  const handleCustomClick = () => {
    setSelectedPreset('CUSTOM');
    setShowCustomPicker(true);
  };

  /**
   * Apply custom date range
   */
  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);

    if (startDate > endDate) {
      alert('Start date must be before end date');
      return;
    }

    onChange({ startDate, endDate });
    setShowCustomPicker(false);
  };

  /**
   * Get label for preset
   */
  const getPresetLabel = (preset: DateRangePreset): string => {
    switch (preset) {
      case '1M':
        return '1 Month';
      case '3M':
        return '3 Months';
      case '6M':
        return '6 Months';
      case '1Y':
        return '1 Year';
      case 'ALL':
        return 'All Time';
      case 'CUSTOM':
        return 'Custom';
      default:
        return preset;
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPreset === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getPresetLabel(preset)}
          </button>
        ))}

        {showCustom && (
          <button
            onClick={handleCustomClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPreset === 'CUSTOM'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        )}
      </div>

      {/* Custom date picker */}
      {showCustomPicker && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomPicker(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCustomRange}
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Current selection display */}
      {value && (
        <div className="text-sm text-gray-600">
          Showing data from{' '}
          <span className="font-medium">{format(value.startDate, 'MMM dd, yyyy')}</span>{' '}
          to{' '}
          <span className="font-medium">{format(value.endDate, 'MMM dd, yyyy')}</span>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
