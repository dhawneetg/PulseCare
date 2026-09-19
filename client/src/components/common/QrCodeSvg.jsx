import React from 'react';

/**
 * PulseCare Lightweight Zero-Dependency SVG QR Code Matrix
 * Renders an authentic QR-style digital health verification matrix
 * with standard 3 finder patterns, timing tracks, and deterministic module data.
 */
export default function QrCodeSvg({ 
  value = 'https://pulsecare.gov.in/rx/verify', 
  size = 110,
  className = ''
}) {
  // Deterministic 21x21 QR Version 1 layout
  const N = 21;
  const grid = Array.from({ length: N }, () => Array(N).fill(false));

  // 1. Draw 7x7 Finder Pattern at (row, col)
  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);       // Top-left
  drawFinder(0, N - 7);   // Top-right
  drawFinder(N - 7, 0);   // Bottom-left

  // 2. Timing patterns
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Dark module
  grid[N - 8][8] = true;

  // 4. Fill data areas using simple deterministic hash from value string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Skip finder zones and separators
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= N - 8;
      const inBL = r >= N - 8 && c < 8;
      const onTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !onTiming) {
        // pseudo-random but deterministic based on hash and coordinates
        const cellVal = ((hash ^ (r * 37 + c * 59)) % 100);
        grid[r][c] = cellVal > 48;
      }
    }
  }

  const cellSize = 100 / N;

  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`bg-white p-1.5 rounded-lg shadow-sm ${className}`}
      aria-label={`QR Code for ${value}`}
    >
      <rect width="100" height="100" fill="#FFFFFF" />
      {grid.map((row, r) =>
        row.map((isDark, c) =>
          isDark ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#0F2D27"
            />
          ) : null
        )
      )}
    </svg>
  );
}
