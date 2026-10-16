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
  style,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border${className ? ` ${className}` : ''}`}
      style={{
        '--star-border-radius': `${radius}px`,
        '--star-border-thickness': `${thickness}px`,
        '--star-border-surface': backgroundColor ?? '#1f1e1b',
        '--star-border-text': textColor ?? '#f1efea',
        '--star-border-track': borderColor ?? '#34322d',
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
