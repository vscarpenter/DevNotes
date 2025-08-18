import React from 'react';
import { UserGuideTooltip, TooltipWrapper, withTooltip } from './index';
import { createTooltipConfig } from '@/lib/userGuide';

// Example 1: Using UserGuideTooltip directly
export const DirectTooltipExample: React.FC = () => {
  const tooltipConfig = createTooltipConfig(
    'example-tooltip',
    'This is an example tooltip that appears on hover',
    { position: 'bottom', trigger: 'hover', delay: 300 }
  );

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Direct Tooltip Usage</h3>
      <UserGuideTooltip config={tooltipConfig}>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me for tooltip
        </button>
      </UserGuideTooltip>
    </div>
  );
};

// Example 2: Using TooltipWrapper
export const WrapperTooltipExample: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Wrapper Tooltip Usage</h3>
      <TooltipWrapper
        tooltipContent="This tooltip uses the wrapper component"
        tooltipPosition="top"
        tooltipTrigger="focus"
      >
        <input
          type="text"
          placeholder="Focus me for tooltip"
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </TooltipWrapper>
    </div>
  );
};

// Example 3: Using withTooltip HOC
const SimpleButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ 
  children, 
  onClick 
}) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
  >
    {children}
  </button>
);

const TooltipButton = withTooltip(SimpleButton);

export const HOCTooltipExample: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">HOC Tooltip Usage</h3>
      <TooltipButton
        tooltipContent="This button uses the withTooltip HOC"
        tooltipPosition="right"
        tooltipTrigger="click"
        onClick={() => alert('Button clicked!')}
      >
        Click me for tooltip
      </TooltipButton>
    </div>
  );
};

// Example 4: Using predefined tooltip content
export const PredefinedTooltipExample: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Predefined Tooltip Content</h3>
      <TooltipWrapper tooltipId="editor-markdown-help">
        <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Markdown Help
        </button>
      </TooltipWrapper>
    </div>
  );
};

// Combined example component
export const TooltipExamples: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tooltip System Examples</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DirectTooltipExample />
        <WrapperTooltipExample />
        <HOCTooltipExample />
        <PredefinedTooltipExample />
      </div>
    </div>
  );
};