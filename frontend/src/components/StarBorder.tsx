'use client';

import React from 'react';
import './StarBorder.css';

export interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  color?: string;
  trailColor?: string;
  duration?: number;
  direction?: 'clockwise' | 'counter-clockwise';
  stars?: number;
  trailLength?: number;
  thickness?: number;
  radius?: number;
  glow?: number;
  hover?: 'lap' | 'brighten' | 'reveal' | 'none';
  sparkle?: boolean;
  clickPulse?: boolean;
  theme?: 'dark' | 'light';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  activeBackgroundColor?: string;
  activeTextColor?: string;
  to?: string;
  [key: string]: any;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'button',
  className = '',
  color,
  trailColor,
  duration,
  direction,
  stars,
  trailLength,
  thickness = 1,
  radius = 10,
  glow,
  hover,
  sparkle,
  clickPulse,
  theme = 'dark',
  backgroundColor,
  textColor,
  borderColor,
  hoverBackgroundColor,
  activeBackgroundColor,
  activeTextColor,
  style,
  children,
  ...rest
}) => {
  const isLight = backgroundColor === '#f1efea' || textColor === '#161513';
  const defaultHoverBg = isLight ? '#e4e1d8' : '#292825';
  const computedHoverBg = hoverBackgroundColor ?? defaultHoverBg;
  const resolvedTextColor = textColor ?? (isLight ? '#161513' : '#f1efea');
  const computedActiveBg = activeBackgroundColor ?? '#ff9933';
  const computedActiveText = activeTextColor ?? '#161513';

  return (
    <Component
      className={`star-border${className ? ` ${className}` : ''}`}
      style={{
        '--star-border-radius': `${radius}px`,
        '--star-border-thickness': `${thickness}px`,
        '--star-border-surface': backgroundColor ?? '#1f1e1b',
        '--star-border-hover': computedHoverBg,
        '--star-border-active': computedActiveBg,
        '--star-border-active-text': computedActiveText,
        '--star-border-active-track': computedActiveBg,
        '--star-border-text': resolvedTextColor,
        '--star-border-track': borderColor ?? '#34322d',
        color: resolvedTextColor,
        ...style
      }}
      {...(Component === 'button' && (rest as any).type === undefined ? { type: 'button' } : null)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default StarBorder;
