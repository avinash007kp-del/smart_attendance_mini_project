import React from 'react';

/**
 * AttentifyLogo — Modern minimalist geometric monogram logo.
 * 
 * Architectural letter 'A' integrated with an incomplete circular arc.
 * - Primary brand color: #142E43 (deep navy)
 * - ViewBox: 0 0 100 100
 * - Element 1: Open circular arc curving counterclockwise from top-center around left to lower-right
 * - Element 2: Geometric letter A with sharp miter apex, open triangular interior, crossbar at ~57% height,
 *   and right diagonal extending beyond circular arc into lower-right.
 *
 * @param {Object} props
 * @param {number|string} [props.size=32] - Width and height in px or CSS units
 * @param {string} [props.color='#142E43'] - Color for stroke (supports 'currentColor', '#ffffff', etc.)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.ariaLabel='Attentify Logo'] - Accessible label for screen readers
 * @param {React.CSSProperties} [props.style] - Optional inline style object
 */
export default function AttentifyLogo({
  size = 32,
  color = '#142E43',
  className = '',
  ariaLabel = 'Attentify Logo',
  style = {},
  ...rest
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={`attentify-logo ${className}`.trim()}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {/* Element 1: Open Circular Arc */}
      <path
        d="M 47.5 11.5 A 38.5 38.5 0 1 0 77 71.5"
        stroke={color}
        strokeWidth="8.5"
        strokeLinecap="butt"
      />

      {/* Element 2: Geometric Letter A (left & right diagonals with sharp miter apex) */}
      <path
        d="M 22 89 L 47.5 11.5 L 90 91"
        stroke={color}
        strokeWidth="8.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />

      {/* Element 2b: Horizontal Crossbar across the middle of A */}
      <line
        x1="33.8"
        y1="57"
        x2="72.2"
        y2="57"
        stroke={color}
        strokeWidth="8.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}
