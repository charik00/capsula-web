interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return (
    <img 
      src="/logo.svg"
      alt="CAPSULA"
      className={className}
    />
  );
}