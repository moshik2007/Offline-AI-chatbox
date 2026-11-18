import React, { useState } from 'react';
import { AssistantVisualState } from '../types';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg';
  state?: AssistantVisualState;
  interactive?: boolean;
}

export const Logo3D: React.FC<Logo3DProps> = ({
  size = 'md',
  state = 'idle',
  interactive = false,
}) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const dimensions =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : 'w-11 h-11';

  const coreSize =
    size === 'sm'
      ? 'w-5 h-5'
      : size === 'lg'
      ? 'w-14 h-14 sm:w-16 sm:h-16'
      : 'w-6 h-6';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 24, ry: x * 24 });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTilt({ rx: 0, ry: 0 });
  };

  const stateGradient =
    state === 'listening'
      ? 'from-rose-500 via-fuchsia-500 to-indigo-500 shadow-rose-500/40'
      : state === 'thinking'
      ? 'from-amber-400 via-orange-500 to-indigo-600 shadow-amber-500/35'
      : state === 'speaking'
      ? 'from-emerald-400 via-teal-500 to-cyan-500 shadow-emerald-500/40'
      : 'from-cyan-400 via-indigo-500 to-violet-600 shadow-indigo-500/40';

  const ringColor =
    state === 'listening'
      ? 'border-rose-400/60'
      : state === 'thinking'
      ? 'border-amber-400/60'
      : state === 'speaking'
      ? 'border-emerald-400/60'
      : 'border-cyan-400/50';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center perspective-900 select-none ${dimensions}`}
      aria-hidden="true"
    >
      <div
        className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        {/* Outer 3D Orbital Ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${ringColor} animate-orbit-slow`}
          style={{
            boxShadow: 'inset 0 0 12px rgba(56, 189, 248, 0.25)',
          }}
        />

        {/* Secondary Counter-Rotating 3D Ring */}
        <div
          className="absolute inset-1 rounded-full border border-indigo-400/40 animate-orbit-reverse"
          style={{
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.25)',
          }}
        />

        {/* 3D Floating Neural Core Sphere */}
        <div
          className={`relative ${coreSize} rounded-full bg-gradient-to-br ${stateGradient} shadow-lg flex items-center justify-center animate-float-3d`}
          style={{
            boxShadow:
              'inset -4px -4px 10px rgba(15, 23, 42, 0.45), inset 3px 3px 8px rgba(255, 255, 255, 0.45), 0 10px 25px rgba(79, 70, 229, 0.35)',
          }}
        >
          {/* Specular Glass Highlight */}
          <div className="absolute top-1.5 left-1.5 w-1/3 h-1/3 rounded-full bg-white/55 blur-[1px]" />

          {/* Inner Geometric Prism */}
          <svg
            viewBox="0 0 24 24"
            className={`${size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-white drop-shadow`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
            <path d="M12 22V12" />
            <path d="M21 7l-9 5-9-5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
