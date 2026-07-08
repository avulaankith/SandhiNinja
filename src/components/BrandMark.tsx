const BrandMark = () => (
  <svg
    aria-hidden="true"
    className="brand-mark"
    viewBox="0 0 160 160"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="brandMarkShell" x1="20" x2="140" y1="20" y2="140">
        <stop offset="0%" stopColor="#f4b162" />
        <stop offset="100%" stopColor="#70e1dc" />
      </linearGradient>
      <linearGradient id="brandMarkCore" x1="32" x2="128" y1="28" y2="136">
        <stop offset="0%" stopColor="#132434" />
        <stop offset="100%" stopColor="#09131f" />
      </linearGradient>
      <filter id="brandMarkGlow" colorInterpolationFilters="sRGB">
        <feGaussianBlur result="blur" stdDeviation="8" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <circle
      cx="80"
      cy="80"
      fill="none"
      filter="url(#brandMarkGlow)"
      r="58"
      stroke="url(#brandMarkShell)"
      strokeOpacity="0.72"
      strokeWidth="10"
    />
    <circle cx="80" cy="80" fill="url(#brandMarkCore)" r="50" />
    <path
      d="M42 108L80 38L118 108"
      fill="none"
      stroke="#f7fbff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.92"
      strokeWidth="10"
    />
    <path
      d="M58 84H102"
      fill="none"
      stroke="#70e1dc"
      strokeLinecap="round"
      strokeOpacity="0.85"
      strokeWidth="7"
    />
    <circle cx="80" cy="80" fill="#f4b162" r="7" />
    <path
      d="M44 38L58 52M116 38L102 52M44 122L58 108M116 122L102 108"
      fill="none"
      stroke="#f4b162"
      strokeLinecap="round"
      strokeOpacity="0.78"
      strokeWidth="6"
    />
  </svg>
);

export default BrandMark;
