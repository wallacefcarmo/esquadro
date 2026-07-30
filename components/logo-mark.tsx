interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0F2C4C" />
      <path d="M8 22 L16 9 L24 22 Z" stroke="#F2A007" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
      <path d="M8 22 H24" stroke="#F2A007" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
