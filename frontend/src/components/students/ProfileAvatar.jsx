function hashName(value = "Student") {
  return [...value].reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

const palettes = [
  ["#0EA5E9", "#1D4ED8", "#FACC15"],
  ["#14B8A6", "#0F766E", "#F59E0B"],
  ["#8B5CF6", "#4F46E5", "#FBBF24"],
  ["#06B6D4", "#2563EB", "#F59E0B"],
  ["#10B981", "#047857", "#FDE047"],
];

export default function ProfileAvatar({ name = "Student", size = 52 }) {
  const cleanName = name?.trim() || "Student";
  const initials = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const hash = hashName(cleanName);
  const palette = palettes[hash % palettes.length];
  const angle = hash % 360;
  const dot = 10 + (hash % 18);

  const background = `
    radial-gradient(circle at ${dot}% 20%, ${palette[2]} 0 10%, transparent 11%),
    radial-gradient(circle at 78% ${dot}%, rgba(255,255,255,.28) 0 12%, transparent 13%),
    linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]})
  `;

  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl font-bold text-white shadow-sm ring-4 ring-white/70"
      style={{
        width: size,
        height: size,
        background,
      }}
      aria-label={`${cleanName} profile`}
      title={cleanName}
    >
      {initials || "S"}
    </div>
  );
}
