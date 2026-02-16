import salonmindLogo from '../assets/salonmind-logo.png';

interface SalonMindLogoProps {
  className?: string;
  size?: number;
}

export default function SalonMindLogo({ className = '', size = 40 }: SalonMindLogoProps) {
  return (
    <img
      src={salonmindLogo}
      alt="SalonMind"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain'}}
    />
  );
}
