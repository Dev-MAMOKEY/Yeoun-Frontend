export function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon({ color = "white" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ size = 20, color = "#474741" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={size < 16 ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="#474741" strokeWidth="2" />
    </svg>
  );
}

export function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#474741" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="13" stroke="#474741" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="#474741" />
    </svg>
  );
}

export function MicIcon({ size = 24, color = "#474741" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="10" rx="3" stroke={color} strokeWidth="2" />
      <path d="M5 10a7 7 0 0014 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RecordIcon({ color = "#474741" }: { color?: string }) {
  return (
    <svg width="25" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke={color} strokeWidth="2" />
      <circle cx="8" cy="12" r="3" stroke={color} strokeWidth="2" />
      <circle cx="16" cy="12" r="3" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <polygon points="5,3 19,12 5,21" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayFillIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f5e5e">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="4" height="16" rx="1" fill="#474741" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="#474741" />
    </svg>
  );
}

export function RewindIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V1L7 6l5 5V7a6 6 0 110 12 6 6 0 01-6-6H4a8 8 0 108-8z" fill="#474741" />
    </svg>
  );
}

export function FastForwardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V1l5 5-5 5V7a6 6 0 100 12 6 6 0 006-6h2a8 8 0 11-8-8z" fill="#474741" />
    </svg>
  );
}

export function AddIcon({ size = 20, color = "#a3a3a3" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <line x1="22" y1="2" x2="11" y2="13" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="22,2 15,22 11,13 2,9" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HeadphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 18v-6a9 9 0 0118 0v6" stroke="#5f5e5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" stroke="#5f5e5e" strokeWidth="2" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" stroke="#5f5e5e" strokeWidth="2" />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg width="25" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="13" r="2" stroke="#474741" strokeWidth="1.5" />
      <path d="M16 17l-2-2-3 3" stroke="#474741" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MailOpenIcon() {
  return (
    <svg width="25" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 9l10-6 10 6" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="9" width="20" height="13" rx="2" stroke="#474741" strokeWidth="2" />
      <path d="M2 9l9 6 11-6" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#474741" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" stroke="#474741" strokeWidth="2" />
      <path d="M21 15l-5-5L5 21" stroke="#474741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="65" height="76" viewBox="0 0 65 76" fill="none">
      <circle cx="32.5" cy="24" r="20" fill="#a3a3a3" />
      <path d="M0 70c0-18 14.6-32.5 32.5-32.5S65 52 65 70" fill="#a3a3a3" />
    </svg>
  );
}

export function NavHomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={active ? "opacity-100" : "opacity-30"}>
      <path d="M3 12L12 3l9 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h5v-5h4v5h5V10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavMyIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={active ? "opacity-100" : "opacity-30"}>
      <circle cx="12" cy="8" r="4" stroke="black" strokeWidth="2" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
