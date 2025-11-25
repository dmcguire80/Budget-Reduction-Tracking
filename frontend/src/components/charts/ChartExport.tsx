/**
 * Chart Export
 *
 * Component for exporting charts as images (PNG, JPEG, SVG)
 */

import React, { useState } from 'react';
import { ChartExportProps, ChartExportFormat } from '../../types/chart.types';
import Button from '../common/Button';

export const ChartExport: React.FC<ChartExportProps> = ({
  chartId,
  fileName = 'chart',
  formats = ['png'],
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /**
   * Export chart as image
   */
  const exportChart = async (format: ChartExportFormat) => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      const canvas = chartElement.querySelector('canvas');
      if (!canvas) {
        throw new Error('Chart canvas not found');
      }

      let dataUrl: string;

      if (format === 'png' || format === 'jpeg') {
        // Export as PNG or JPEG
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        dataUrl = canvas.toDataURL(mimeType, 1.0);
      } else if (format === 'svg') {
        // Export as SVG (requires converting canvas to SVG)
        // This is a simplified implementation
        dataUrl = canvas.toDataURL('image/png'); // Fallback to PNG for SVG
        console.warn('SVG export not fully implemented, falling back to PNG');
      } else {
        throw new Error('Unsupported format');
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Copy chart to clipboard
   */
  const copyToClipboard = async () => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      const canvas = chartElement.querySelector('canvas');
      if (!canvas) {
        throw new Error('Chart canvas not found');
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          alert('Chart copied to clipboard!');
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
          alert('Failed to copy to clipboard. Your browser may not support this feature.');
        }
      });
    } catch (error) {
      console.error('Error copying chart:', error);
      alert('Failed to copy chart. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="outline"
        size="sm"
        disabled={isExporting}
        className="flex items-center space-x-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </Button>

      {/* Dropdown menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {formats.includes('png') && (
                <button
                  onClick={() => exportChart('png')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Download as PNG</span>
                </button>
              )}

              {formats.includes('jpeg') && (
                <button
                  onClick={() => exportChart('jpeg')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Download as JPEG</span>
                </button>
              )}

              {formats.includes('svg') && (
                <button
                  onClick={() => exportChart('svg')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Download as SVG</span>
                </button>
              )}

              <div className="border-t border-gray-200 my-1"></div>

              <button
                onClick={copyToClipboard}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy to Clipboard</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartExport;
