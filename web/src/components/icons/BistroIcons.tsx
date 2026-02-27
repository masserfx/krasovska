import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BurgerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Top bun */}
      <path
        d="M8 28C8 17.5 17.5 10 32 10s24 7.5 24 18H8z"
        fill="#E8A54B"
      />
      <path
        d="M8 28C8 17.5 17.5 10 32 10s24 7.5 24 18H8z"
        fill="url(#bun-shine)"
      />
      {/* Sesame seeds */}
      <ellipse cx="22" cy="18" rx="2" ry="1.5" fill="#F5D89A" transform="rotate(-15 22 18)" />
      <ellipse cx="32" cy="15" rx="2" ry="1.5" fill="#F5D89A" transform="rotate(10 32 15)" />
      <ellipse cx="42" cy="18" rx="2" ry="1.5" fill="#F5D89A" transform="rotate(-5 42 18)" />
      <ellipse cx="27" cy="22" rx="1.8" ry="1.3" fill="#F5D89A" transform="rotate(20 27 22)" />
      <ellipse cx="38" cy="21" rx="1.8" ry="1.3" fill="#F5D89A" transform="rotate(-10 38 21)" />
      {/* Lettuce */}
      <path
        d="M6 30c3-3 6-1 9-3s5 1 8-2 6 2 9-1 5 2 8-1 6 1 9-2 5 3 8 0l1 4H5l1-4z"
        fill="#6DBF4E"
      />
      {/* Tomato */}
      <rect x="7" y="33" width="50" height="5" rx="2.5" fill="#E74C3C" />
      {/* Cheese - melted edge */}
      <path
        d="M7 38h50v3c0 1-1 2-3 2l-2 3c-1 1-2-1-3 2s-3-1-4 2-2-1-4 1-2-2-3 1-3-2-4 1-2-1-4 2-3-2-4 1-2-1-3 2-2-2-3 0-3-1-4 1l-2-3c-2 0-3-1-3-2v-3z"
        fill="#F7C948"
      />
      {/* Patty */}
      <rect x="8" y="43" width="48" height="7" rx="3.5" fill="#6B3A2A" />
      <path d="M8 43h48c0 2-1 3-2 3H10c-1 0-2-1-2-3z" fill="#8B4D3A" />
      {/* Bottom bun */}
      <path
        d="M8 50h48v4c0 3-2 5-5 5H13c-3 0-5-2-5-5v-4z"
        fill="#E8A54B"
      />
      <path d="M8 50h48v2H8z" fill="#D4943F" />
      <defs>
        <linearGradient id="bun-shine" x1="32" y1="10" x2="32" y2="28">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Pizza slice shape */}
      <path
        d="M32 6L6 56h52L32 6z"
        fill="#F0C75E"
      />
      {/* Cheese layer */}
      <path
        d="M32 12L10 52h44L32 12z"
        fill="#F7DC6F"
      />
      {/* Sauce peek through */}
      <path
        d="M32 16L14 48h36L32 16z"
        fill="#E74C3C"
        opacity="0.3"
      />
      {/* Cheese stretchy texture */}
      <path
        d="M32 12L10 52h44L32 12z"
        fill="url(#cheese-grad)"
      />
      {/* Pepperoni */}
      <circle cx="28" cy="34" r="4" fill="#C0392B" />
      <circle cx="28" cy="34" r="3.2" fill="#E74C3C" />
      <circle cx="36" cy="28" r="3.5" fill="#C0392B" />
      <circle cx="36" cy="28" r="2.8" fill="#E74C3C" />
      <circle cx="32" cy="42" r="4" fill="#C0392B" />
      <circle cx="32" cy="42" r="3.2" fill="#E74C3C" />
      {/* Basil leaves */}
      <path d="M22 40c2-4 5-3 6-1s-2 5-4 4-3-1-2-3z" fill="#27AE60" />
      <path d="M40 36c-1-4 2-5 4-4s2 4 0 5-3 1-4-1z" fill="#2ECC71" />
      {/* Crust */}
      <path
        d="M6 56l2-4h48l2 4H6z"
        fill="#D4943F"
      />
      <path
        d="M6 56c0 2 2 4 4 4h44c2 0 4-2 4-4H6z"
        fill="#E8A54B"
      />
      <defs>
        <linearGradient id="cheese-grad" x1="32" y1="12" x2="32" y2="52">
          <stop offset="0%" stopColor="#F9E784" />
          <stop offset="100%" stopColor="#F0C75E" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DailyMenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Plate */}
      <ellipse cx="32" cy="40" rx="28" ry="14" fill="#E8EDF2" />
      <ellipse cx="32" cy="40" rx="28" ry="14" fill="url(#plate-grad)" />
      <ellipse cx="32" cy="39" rx="22" ry="10" fill="#F0F3F7" />
      <ellipse cx="32" cy="38" rx="18" ry="8" fill="#FAFBFC" />
      {/* Steam lines */}
      <path d="M24 18c0-4 3-4 3-8" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <animate attributeName="d" values="M24 18c0-4 3-4 3-8;M24 16c1-3 -1-5 2-9;M24 18c0-4 3-4 3-8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M32 16c0-4 3-4 3-8" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <animate attributeName="d" values="M32 16c0-4 3-4 3-8;M32 14c-1-3 2-5 1-9;M32 16c0-4 3-4 3-8" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M40 18c0-4 3-4 3-8" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <animate attributeName="d" values="M40 18c0-4 3-4 3-8;M40 16c1-3 -2-4 1-9;M40 18c0-4 3-4 3-8" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.2s" repeatCount="indefinite" />
      </path>
      {/* Food on plate - steak */}
      <ellipse cx="30" cy="36" rx="10" ry="5" fill="#8B5E3C" />
      <ellipse cx="30" cy="35" rx="9" ry="4" fill="#A0704B" />
      <path d="M22 35c2-1 5 0 7-1s4 1 6 0" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.5" />
      {/* Garnish */}
      <circle cx="40" cy="34" r="2" fill="#E74C3C" />
      <circle cx="42" cy="37" r="1.5" fill="#F39C12" />
      <path d="M38 38c1-2 3-1 3 0s-2 2-3 1z" fill="#27AE60" />
      {/* Cloche handle */}
      <defs>
        <linearGradient id="plate-grad" x1="32" y1="26" x2="32" y2="54">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ProteinBowlIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Bowl */}
      <path
        d="M6 28h52c0 16-10 28-26 28S6 44 6 28z"
        fill="#E8EDF2"
      />
      <path
        d="M6 28h52c0 16-10 28-26 28S6 44 6 28z"
        fill="url(#bowl-grad)"
      />
      {/* Bowl rim */}
      <ellipse cx="32" cy="28" rx="26" ry="6" fill="#D1D9E4" />
      <ellipse cx="32" cy="27" rx="26" ry="6" fill="#E8EDF2" />
      {/* Rice base */}
      <ellipse cx="32" cy="27" rx="22" ry="4.5" fill="#FFF8E7" />
      {/* Chicken/protein - left */}
      <path d="M14 24c2-3 8-3 10-1s0 5-4 5-7-1-6-4z" fill="#D4943F" />
      <path d="M15 23c1.5-2 6-2 7.5-0.5s0 3.5-3 3.5-5.5-1-4.5-3z" fill="#E8A54B" />
      {/* Avocado slices - top */}
      <path d="M28 20c0-2 3-3 5-2s2 3 0 4-5 0-5-2z" fill="#7CB342" />
      <path d="M30 20c0-1.2 1.8-2 3-1.3s1.2 2 0 2.6-3 0-3-1.3z" fill="#9CCC65" />
      <path d="M33 19c0-2 3-3 5-2s2 3 0 4-5 0-5-2z" fill="#7CB342" />
      <path d="M35 19c0-1.2 1.8-2 3-1.3s1.2 2 0 2.6-3 0-3-1.3z" fill="#9CCC65" />
      {/* Edamame */}
      <ellipse cx="42" cy="24" rx="2.5" ry="1.5" fill="#66BB6A" transform="rotate(-20 42 24)" />
      <ellipse cx="45" cy="23" rx="2.5" ry="1.5" fill="#66BB6A" transform="rotate(10 45 23)" />
      <ellipse cx="44" cy="26" rx="2" ry="1.2" fill="#81C784" transform="rotate(-5 44 26)" />
      {/* Carrots */}
      <rect x="18" y="19" width="8" height="2" rx="1" fill="#FF8A65" transform="rotate(-10 18 19)" />
      <rect x="19" y="22" width="7" height="2" rx="1" fill="#FF8A65" transform="rotate(5 19 22)" />
      <rect x="17" y="25" width="6" height="2" rx="1" fill="#FFAB91" transform="rotate(-3 17 25)" />
      {/* Seeds/sesame on top */}
      <ellipse cx="30" cy="25" rx="1" ry="0.6" fill="#FDD835" transform="rotate(30 30 25)" />
      <ellipse cx="35" cy="24" rx="1" ry="0.6" fill="#FDD835" transform="rotate(-20 35 24)" />
      <ellipse cx="28" cy="27" rx="0.8" ry="0.5" fill="#212121" transform="rotate(15 28 27)" />
      <ellipse cx="38" cy="26" rx="0.8" ry="0.5" fill="#212121" transform="rotate(-10 38 26)" />
      <defs>
        <linearGradient id="bowl-grad" x1="32" y1="28" x2="32" y2="56">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BeerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Glass body */}
      <path
        d="M14 14h32l-4 44H18L14 14z"
        fill="#F7DC6F"
        opacity="0.85"
      />
      {/* Beer liquid */}
      <path
        d="M15 18h28l-3.5 38H18.5L15 18z"
        fill="#F0B429"
      />
      <path
        d="M15 18h28l-3.5 38H18.5L15 18z"
        fill="url(#beer-grad)"
      />
      {/* Glass shine */}
      <path
        d="M17 18l-1.5 34 1.5-34z"
        fill="white"
        opacity="0.4"
      />
      <path
        d="M17 18h3l-3.3 36h-1L17 18z"
        fill="white"
        opacity="0.15"
      />
      {/* Bubbles */}
      <circle cx="24" cy="44" r="1.5" fill="white" opacity="0.4">
        <animate attributeName="cy" values="44;22;18" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.3;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="48" r="1" fill="white" opacity="0.35">
        <animate attributeName="cy" values="48;28;20" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.25;0" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="36" cy="42" r="1.2" fill="white" opacity="0.3">
        <animate attributeName="cy" values="42;24;16" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.2;0" dur="2.8s" repeatCount="indefinite" />
      </circle>
      {/* Foam */}
      <ellipse cx="22" cy="16" rx="6" ry="5" fill="#FFF8E1" />
      <ellipse cx="32" cy="15" rx="7" ry="6" fill="white" />
      <ellipse cx="40" cy="16" rx="6" ry="5" fill="#FFF8E1" />
      <ellipse cx="27" cy="13" rx="5" ry="4" fill="white" />
      <ellipse cx="36" cy="12" rx="5" ry="4" fill="white" />
      <ellipse cx="32" cy="10" rx="4" ry="3" fill="#FFF8E1" />
      {/* Glass rim */}
      <rect x="13" y="13" width="34" height="2" rx="1" fill="#D4E4F7" opacity="0.6" />
      {/* Handle */}
      <path
        d="M46 20h4c4 0 7 3 7 7v6c0 4-3 7-7 7h-3"
        stroke="#D4E4F7"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M46 20h4c4 0 7 3 7 7v6c0 4-3 7-7 7h-3"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="beer-grad" x1="29" y1="18" x2="29" y2="56">
          <stop offset="0%" stopColor="#F7DC6F" />
          <stop offset="100%" stopColor="#E8A54B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CoffeeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Saucer */}
      <ellipse cx="30" cy="54" rx="24" ry="6" fill="#E8EDF2" />
      <ellipse cx="30" cy="53" rx="20" ry="4.5" fill="#F0F3F7" />
      {/* Cup body */}
      <path
        d="M10 26h40v16c0 8-8 14-20 14S10 50 10 42V26z"
        fill="white"
      />
      <path
        d="M10 26h40v16c0 8-8 14-20 14S10 50 10 42V26z"
        fill="url(#cup-grad)"
      />
      {/* Coffee surface */}
      <ellipse cx="30" cy="28" rx="18" ry="4" fill="#5D4037" />
      <ellipse cx="30" cy="27" rx="16" ry="3" fill="#6D4C41" />
      {/* Latte art - leaf/rosetta */}
      <path
        d="M30 25c-3 0-6 1-8 2 2-1 5-0.5 8-0.5s6-0.5 8 0.5c-2-1-5-2-8-2z"
        fill="#D7CCC8"
        opacity="0.7"
      />
      <path d="M30 24v4" stroke="#D7CCC8" strokeWidth="0.8" opacity="0.5" />
      <path d="M27 25.5c1.5 0.5 2 1 3 1s1.5-0.5 3-1" stroke="#BCAAA4" strokeWidth="0.6" fill="none" opacity="0.6" />
      <path d="M28 26.5c1 0.4 1.3 0.8 2 0.8s1-0.4 2-0.8" stroke="#BCAAA4" strokeWidth="0.5" fill="none" opacity="0.5" />
      {/* Cup rim */}
      <ellipse cx="30" cy="26" rx="20" ry="4.5" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Handle */}
      <path
        d="M50 30h2c4 0 7 3 7 6v2c0 3-3 6-7 6h-2"
        stroke="#E2E8F0"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M50 30h2c4 0 7 3 7 6v2c0 3-3 6-7 6h-2"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      {/* Steam */}
      <path d="M22 16c0-4 3-5 3-9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M22 16c0-4 3-5 3-9;M22 14c1-3 -1-5 2-9;M22 16c0-4 3-5 3-9" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M30 14c0-4 3-5 3-9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M30 14c0-4 3-5 3-9;M30 12c-1-3 2-4 1-8;M30 14c0-4 3-5 3-9" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M38 16c0-4 3-5 3-9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M38 16c0-4 3-5 3-9;M38 14c1-3 -2-5 1-9;M38 16c0-4 3-5 3-9" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.2s" repeatCount="indefinite" />
      </path>
      <defs>
        <linearGradient id="cup-grad" x1="30" y1="26" x2="30" y2="56">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
