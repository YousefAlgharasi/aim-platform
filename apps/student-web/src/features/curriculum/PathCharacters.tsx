import type { ReactElement } from 'react';

/**
 * Small character illustrations that stand beside the lessons on the course path. They are purely decorative
 * (aria-hidden); locked lessons get the same drawing in grey. Ported from the learning-path reference.
 */
interface CharacterProps {
  grayscale?: boolean;
  className?: string;
}

const base = (grayscale?: boolean, className = '') =>
  `overflow-visible transition-[filter,opacity] duration-500 ${grayscale ? 'grayscale opacity-70' : ''} ${className}`;

function Zorro({ grayscale, className }: CharacterProps) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={base(grayscale, className)}>
      <circle cx="70" cy="78" r="46" fill={grayscale ? '#9ea4b0' : '#f39c38'} />
      <path d="M 24 115 C 26 86, 114 86, 116 115 Z" fill="#2c2d30" />
      <path d="M 38 115 L 54 90 L 86 90 L 102 115 Z" fill="#1f2022" />
      <rect x="61" y="70" width="18" height="22" fill="#f5CBA7" />
      <path d="M 52 46 C 52 34, 88 34, 88 46 L 86 68 C 86 80, 54 80, 54 68 Z" fill="#f5CBA7" />
      <path d="M 52 47 Q 70 44 88 47 L 87 60 Q 78 63 70 57 Q 62 63 53 60 Z" fill="#1e1f22" />
      <path d="M 51 51 L 41 47 M 89 51 L 99 47" stroke="#1e1f22" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="61" cy="53" rx="3.8" ry="2.3" fill="#ffffff" />
      <circle cx="61" cy="53" r="1.5" fill="#1e1f22" />
      <ellipse cx="79" cy="53" rx="3.8" ry="2.3" fill="#ffffff" />
      <circle cx="79" cy="53" r="1.5" fill="#1e1f22" />
      <path d="M 62 67 Q 70 65 78 67" stroke="#2c2d30" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 65 71 Q 70 73 75 71" stroke="#c07a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="70" cy="39" rx="39" ry="9" fill="#323337" />
      <ellipse cx="70" cy="38" rx="39" ry="7.5" fill="#43454a" />
      <path d="M 48 38 C 50 22, 90 22, 92 38 Z" fill="#2c2d30" />
      <path d="M 49 36 Q 70 39 91 36" stroke="#1a1b1e" strokeWidth="3" fill="none" />
      <circle cx="57" cy="91" r="3" fill="#b2b7c2" stroke="#1f2022" strokeWidth="1" />
      <circle cx="83" cy="91" r="3" fill="#b2b7c2" stroke="#1f2022" strokeWidth="1" />
      <path d="M 57 91 Q 70 98 83 91" stroke="#b2b7c2" strokeWidth="1.5" fill="none" />
      <circle cx="70" cy="100" r="8.5" fill={grayscale ? '#70757f' : '#d9384a'} />
      <path d="M 66 99 Q 70 95 74 99 Q 72 104 68 103 Z" fill={grayscale ? '#9ea4b0' : '#ff6b7b'} />
      <circle cx="70" cy="100" r="2.5" fill={grayscale ? '#52565e' : '#9e1f2e'} />
    </svg>
  );
}

function CoffeeReader({ grayscale, className }: CharacterProps) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={base(grayscale, className)}>
      <circle cx="70" cy="78" r="45" fill={grayscale ? '#e4e6eb' : '#fdebd0'} />
      <circle cx="52" cy="48" r="16" fill={grayscale ? '#7a7e85' : '#6e473b'} />
      <circle cx="88" cy="48" r="15" fill={grayscale ? '#7a7e85' : '#6e473b'} />
      <circle cx="70" cy="36" r="18" fill={grayscale ? '#898d94' : '#825446'} />
      <path d="M 40 116 C 42 88, 98 88, 100 116 Z" fill={grayscale ? '#8c9098' : '#5dade2'} />
      <path d="M 55 89 L 70 105 L 85 89" fill={grayscale ? '#d0d3d8' : '#fadbd8'} />
      <rect x="63" y="74" width="14" height="18" fill={grayscale ? '#d8dade' : '#f5cba7'} />
      <circle cx="70" cy="58" r="21" fill={grayscale ? '#eaecf0' : '#fad7a0'} />
      <path d="M 48 55 Q 52 35 72 38 Q 90 36 92 56 C 96 42 86 26 70 28 C 50 26 44 44 48 55 Z" fill={grayscale ? '#6c7077' : '#5c3c32'} />
      <circle cx="61" cy="56" r="7.5" fill="none" stroke="#3c4043" strokeWidth="2.8" />
      <circle cx="79" cy="56" r="7.5" fill="none" stroke="#3c4043" strokeWidth="2.8" />
      <line x1="68.5" y1="56" x2="71.5" y2="56" stroke="#3c4043" strokeWidth="2.8" />
      <circle cx="61" cy="56" r="2.3" fill="#2c2d30" />
      <circle cx="79" cy="56" r="2.3" fill="#2c2d30" />
      <path d="M 62 67 Q 70 75 78 67 Z" fill="#ffffff" stroke="#3c4043" strokeWidth="1.8" />
      <path d="M 18 76 L 44 64 L 54 96 L 28 106 Z" fill="#ffffff" stroke="#c4c7cc" strokeWidth="1.5" />
      <path d="M 24 92 C 20 88 26 82 32 86" fill={grayscale ? '#bfc2c7' : '#f5cba7'} />
      <path d="M 102 102 L 116 86 M 116 86 L 122 79 M 116 86 L 125 84 M 116 86 L 124 90" stroke={grayscale ? '#eaecf0' : '#fad7a0'} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function MimeChaplin({ grayscale, className }: CharacterProps) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={base(grayscale, className)}>
      <circle cx="74" cy="80" r="45" fill={grayscale ? '#d5d8dc' : '#aed6f1'} />
      <path d="M 42 118 C 46 86, 102 86, 106 118 Z" fill="#ffffff" />
      <path d="M 44 114 L 24 88 L 32 76" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="20" y1="38" x2="36" y2="128" stroke={grayscale ? '#787c82' : '#5d4037'} strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="36" r="5.5" fill="#ffffff" />
      <circle cx="26" cy="79" r="6.5" fill="#ffffff" stroke="#cfd2d6" strokeWidth="1" />
      <rect x="66" y="72" width="16" height="16" fill="#ffffff" />
      <circle cx="74" cy="56" r="20" fill="#ffffff" />
      <path d="M 54 48 C 52 58, 56 64, 58 54 M 94 48 C 96 58, 92 64, 90 54" stroke="#52565e" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="67" cy="55" r="2.3" fill="#2c2d30" />
      <circle cx="81" cy="55" r="2.3" fill="#2c2d30" />
      <path d="M 62 50 L 67 48 M 64 60 L 64 62 M 61 56 L 59 56" stroke="#52565e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 69 66 Q 74 70 80 65" stroke="#52565e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 46 42 Q 74 46 102 42" stroke="#32353b" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 53 41 C 53 19, 95 19, 95 41 Z" fill="#464952" />
      <path d="M 53 38 Q 74 41 95 38" stroke="#25272c" strokeWidth="3.5" fill="none" />
    </svg>
  );
}

function FormalCouple({ grayscale, className }: CharacterProps) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={base(grayscale, className)}>
      <circle cx="70" cy="82" r="44" fill={grayscale ? '#c4c7cc' : '#d7bde2'} />
      <path d="M 25 118 L 30 82 L 72 82 L 75 118 Z" fill="#ffffff" stroke="#b0b4ba" strokeWidth="1.5" />
      <polygon points="46,85 56,91 56,85 46,91" fill="#686c73" />
      <rect x="37" y="42" width="28" height="36" rx="11" fill="#ffffff" stroke="#8d9199" strokeWidth="1.5" />
      <path d="M 37 51 C 37 38, 65 38, 65 51 C 61 45, 41 45, 37 51 Z" fill="#4a4d54" />
      <circle cx="45" cy="57" r="2" fill="#3c4043" />
      <circle cx="57" cy="57" r="2" fill="#3c4043" />
      <path d="M 44 66 Q 51 64 58 66" stroke="#686c73" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 68 118 L 74 86 L 110 86 L 114 118 Z" fill="#686c73" />
      <path d="M 80 86 L 91 102 L 102 86 Z" fill="#dcdfe3" />
      <path d="M 70 48 C 68 36, 112 36, 110 48 L 112 92 L 68 92 Z" fill="#4a4d54" />
      <rect x="76" y="48" width="26" height="33" rx="12" fill="#ffffff" />
      <circle cx="83" cy="62" r="2" fill="#3c4043" />
      <circle cx="95" cy="62" r="2" fill="#3c4043" />
      <path d="M 81 57 L 86 58 M 97 57 L 92 58" stroke="#4a4d54" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 86 72 Q 89 70 92 72" stroke="#4a4d54" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ChecklistPaper({ grayscale, className }: CharacterProps) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={base(grayscale, className)}>
      <circle cx="70" cy="80" r="43" fill={grayscale ? '#8f939c' : '#f8c471'} />
      <path d="M 38 40 Q 70 36 96 42 L 106 106 Q 74 112 44 106 Z" fill="#ffffff" stroke="#d0d3d9" strokeWidth="2" />
      <path d="M 38 40 C 32 42, 32 52, 40 52" fill="#dcdfe6" />
      <polygon points="55,55 57,59 62,59 58,62 59,67 55,64 51,67 52,62 48,59 53,59" fill={grayscale ? '#a6aab2' : '#f39c12'} />
      <line x1="68" y1="58" x2="88" y2="57" stroke="#c5c8cf" strokeWidth="3" strokeLinecap="round" />
      <line x1="68" y1="64" x2="82" y2="63" stroke="#d8dbe0" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="58,76 60,80 65,80 61,83 62,88 58,85 54,88 55,83 51,80 56,80" fill={grayscale ? '#a6aab2' : '#f39c12'} />
      <line x1="71" y1="79" x2="91" y2="78" stroke="#c5c8cf" strokeWidth="3" strokeLinecap="round" />
      <line x1="71" y1="85" x2="85" y2="84" stroke="#d8dbe0" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(88, 72) rotate(-38)">
        <rect x="0" y="0" width="34" height="10" rx="2" fill={grayscale ? '#e0e2e6' : '#ffca28'} stroke="#9ea2ab" strokeWidth="1" />
        <polygon points="0,0 -10,5 0,10" fill="#d0d3d9" />
        <polygon points="-6,3 -10,5 -6,7" fill="#52565e" />
        <rect x="30" y="0" width="7" height="10" rx="2" fill={grayscale ? '#7c8087' : '#ec407a'} />
      </g>
    </svg>
  );
}

const CHARACTERS: Array<(p: CharacterProps) => ReactElement> = [Zorro, CoffeeReader, MimeChaplin, FormalCouple, ChecklistPaper];

/** The character for the nth lesson (0-based); they take turns so neighbouring lessons look different. */
export function PathCharacter({ index, grayscale, className }: CharacterProps & { index: number }) {
  const Character = CHARACTERS[((index % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length];
  return <Character grayscale={grayscale} className={className} />;
}
