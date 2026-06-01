export default function Logo({ size = "md", dark = false }) {
  const sizes = { sm: "h-7", md: "h-9", lg: "h-12" };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  return (
    <div className="flex items-center gap-2.5">
      {/* Scales of Justice SVG — matches shoplovelaw.com */}
      <svg className={sizes[size]} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill={dark ? "#0a1628" : "#f5c842"} fillOpacity="0.12"/>
        {/* Beam */}
        <rect x="19" y="8" width="2" height="22" rx="1" fill={dark ? "#0a1628" : "#f5c842"}/>
        {/* Top crossbar */}
        <rect x="8" y="13" width="24" height="2" rx="1" fill={dark ? "#0a1628" : "#f5c842"}/>
        {/* Left pan chain */}
        <line x1="10" y1="15" x2="10" y2="22" stroke={dark ? "#0a1628" : "#f5c842"} strokeWidth="1.5"/>
        {/* Right pan chain */}
        <line x1="30" y1="15" x2="30" y2="22" stroke={dark ? "#0a1628" : "#f5c842"} strokeWidth="1.5"/>
        {/* Left pan */}
        <path d="M6 22 Q10 26 14 22" stroke={dark ? "#0a1628" : "#f5c842"} strokeWidth="1.5" fill="none"/>
        {/* Right pan */}
        <path d="M26 22 Q30 26 34 22" stroke={dark ? "#0a1628" : "#f5c842"} strokeWidth="1.5" fill="none"/>
        {/* Base */}
        <rect x="16" y="29" width="8" height="2" rx="1" fill={dark ? "#0a1628" : "#f5c842"}/>
      </svg>
      <span className={`font-serif font-bold tracking-tight ${textSizes[size]} ${dark ? "text-navy-900" : "text-white"}`}>
        Love Law<span className={dark ? "text-gold-500" : "text-gold-400"}>™</span>
      </span>
    </div>
  );
}
