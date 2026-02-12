import { useState } from "react";

const THEMES = {
  dark: {
    bg: "#0A0A0A", bgSecondary: "#141414", bgCard: "#1A1212", bgCardHover: "#221818",
    bgElevated: "#1E1616", bgInput: "#1A1212", primary: "#DC2626",
    primaryGlow: "rgba(220, 38, 38, 0.3)", primaryMuted: "#991B1B",
    primarySoft: "rgba(220, 38, 38, 0.08)", accent: "#FF4444",
    text: "#F5F0F0", textSecondary: "#9A8A8A", textMuted: "#6B5858",
    border: "rgba(220, 38, 38, 0.12)", borderSubtle: "rgba(255, 255, 255, 0.06)",
    shadow: "0 8px 32px rgba(0,0,0,0.6)", shadowSm: "0 2px 8px rgba(0,0,0,0.4)",
    navBg: "rgba(10, 10, 10, 0.92)", pulse: "#DC2626",
    gradient: "linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)",
    gradientSubtle: "linear-gradient(180deg, rgba(220,38,38,0.06) 0%, transparent 100%)",
    tag18: "#DC2626", progressBg: "rgba(220, 38, 38, 0.15)",
    starActive: "#FF6B35", starInactive: "#3D2828",
    phoneFill1: "#FF4444", phoneFill2: "#C41919", screenBg1: "#1A0505", screenBg2: "#0D0000",
    headband: "#F5F0F0", earOuter: "#E8E0E0", earInner: "#D4CACA",
    phoneDetail: "#1A0505", pulseLineOpacity: 1,
  },
  light: {
    bg: "#FBF7F5", bgSecondary: "#F5EFEC", bgCard: "#FFFFFF", bgCardHover: "#FFF8F6",
    bgElevated: "#FFFFFF", bgInput: "#F5EFEC", primary: "#B91C1C",
    primaryGlow: "rgba(185, 28, 28, 0.15)", primaryMuted: "#7F1D1D",
    primarySoft: "rgba(185, 28, 28, 0.06)", accent: "#DC2626",
    text: "#1C1111", textSecondary: "#6B5252", textMuted: "#9A8585",
    border: "rgba(185, 28, 28, 0.12)", borderSubtle: "rgba(0, 0, 0, 0.06)",
    shadow: "0 8px 32px rgba(28, 17, 17, 0.08)", shadowSm: "0 2px 8px rgba(28, 17, 17, 0.06)",
    navBg: "rgba(251, 247, 245, 0.92)", pulse: "#B91C1C",
    gradient: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
    gradientSubtle: "linear-gradient(180deg, rgba(185,28,28,0.04) 0%, transparent 100%)",
    tag18: "#B91C1C", progressBg: "rgba(185, 28, 28, 0.1)",
    starActive: "#E85D4A", starInactive: "#E8DADA",
    phoneFill1: "#E03030", phoneFill2: "#A51515", screenBg1: "#FFF5F5", screenBg2: "#FFE8E8",
    headband: "#4A3535", earOuter: "#5C4848", earInner: "#3D2D2D",
    phoneDetail: "#D4B0B0", pulseLineOpacity: 0.9,
  },
};

const STORIES = [
  { id: 1, title: "Crimson Whispers", author: "Elena Voss", genre: "Dark Romance", rating: 4.8, duration: "3h 42m", progress: 0.65, cover: "🌹", listeners: "12.4K", mature: true, chapters: 24, currentChapter: 16 },
  { id: 2, title: "Midnight Confessions", author: "Marcus Black", genre: "Thriller", rating: 4.6, duration: "5h 18m", progress: 0.3, cover: "🌙", listeners: "8.7K", mature: true, chapters: 32, currentChapter: 10 },
  { id: 3, title: "Velvet Chains", author: "Sophia Laurent", genre: "Erotica", rating: 4.9, duration: "2h 55m", progress: 0, cover: "⛓️", listeners: "23.1K", mature: true, chapters: 18, currentChapter: 0 },
  { id: 4, title: "The Burning Edge", author: "James Noir", genre: "Suspense", rating: 4.5, duration: "6h 10m", progress: 0.85, cover: "🔥", listeners: "15.2K", mature: true, chapters: 40, currentChapter: 34 },
  { id: 5, title: "Forbidden Garden", author: "Aria Moon", genre: "Fantasy", rating: 4.7, duration: "4h 22m", progress: 0, cover: "🏵️", listeners: "19.8K", mature: true, chapters: 28, currentChapter: 0 },
  { id: 6, title: "Sins of Silk", author: "Dominic Grey", genre: "Dark Romance", rating: 4.4, duration: "3h 08m", progress: 0.12, cover: "🖤", listeners: "6.3K", mature: true, chapters: 20, currentChapter: 3 },
  { id: 7, title: "Red Obsession", author: "Natasha Blaze", genre: "Psychological", rating: 4.8, duration: "4h 55m", progress: 0, cover: "💋", listeners: "28.5K", mature: true, chapters: 30, currentChapter: 0 },
  { id: 8, title: "After Dark Tales", author: "Various", genre: "Anthology", rating: 4.3, duration: "7h 30m", progress: 0.45, cover: "🎭", listeners: "31.2K", mature: true, chapters: 15, currentChapter: 7 },
];

const CATEGORIES = ["All", "Dark Romance", "Thriller", "Erotica", "Fantasy", "Suspense", "Psychological", "Anthology"];

/* ═══════════════════════════════════════════
   CUSTOM SVG LOGO — matches original style:
   heartbeat pulse → "storyfone" text → phone w/ headphones
   ═══════════════════════════════════════════ */
const StoryfoneLogo = ({ width = 260, theme, animate = false }) => {
  const scale = width / 380;
  const t = theme;
  const uid = animate ? "a" : "s";
  return (
    <svg viewBox="0 0 380 140" width={width} height={140 * scale}
      style={animate ? { filter: "drop-shadow(0 0 12px rgba(220,38,38,0.5))" } : {}}>
      <defs>
        <linearGradient id={`pg${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={t.primary} stopOpacity="0.15" />
          <stop offset="25%" stopColor={t.primary} stopOpacity="1" />
          <stop offset="75%" stopColor={t.primary} stopOpacity="1" />
          <stop offset="100%" stopColor={t.primary} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`phg${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.phoneFill1} />
          <stop offset="100%" stopColor={t.phoneFill2} />
        </linearGradient>
        <linearGradient id={`scg${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.screenBg1} />
          <stop offset="100%" stopColor={t.screenBg2} />
        </linearGradient>
      </defs>
      {/* Heartbeat pulse */}
      <path d="M 0,70 L 28,70 L 38,70 L 48,28 L 58,105 L 68,42 L 76,85 L 84,70 L 98,70"
        stroke={`url(#pg${uid})`} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeLinejoin="round" opacity={t.pulseLineOpacity} />
      {animate && (
        <path d="M 0,70 L 28,70 L 38,70 L 48,28 L 58,105 L 68,42 L 76,85 L 84,70 L 98,70"
          stroke={t.primary} strokeWidth="3" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="300" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="300" to="-300" dur="2.5s" repeatCount="indefinite" />
        </path>
      )}
      {/* "story" text */}
      <text x="100" y="86" fontFamily="Georgia, 'Playfair Display', serif"
        fontSize="54" fontWeight="bold" fill={t.primary} letterSpacing="-1">
        story
      </text>
      {/* Connecting line */}
      <path d="M 242,70 L 272,70" stroke={t.primary} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Phone */}
      <g transform="translate(272, 12)">
        <rect x="0" y="0" width="60" height="116" rx="13" ry="13" fill={`url(#phg${uid})`} opacity="0.95" />
        <rect x="5" y="14" width="50" height="80" rx="5" ry="5" fill={`url(#scg${uid})`} />
        <path d="M 12,54 L 17,54 L 20,38 L 23,68 L 26,42 L 29,60 L 32,54 L 36,54 L 39,40 L 42,66 L 45,45 L 49,54"
          stroke={t.primary} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="18" y="102" width="24" height="3" rx="1.5" fill={t.phoneDetail} opacity="0.4" />
        <rect x="20" y="5" width="20" height="3" rx="1.5" fill={t.phoneDetail} opacity="0.35" />
      </g>
      {/* Headphones - sitting on top of phone like it's wearing them */}
      <g transform="translate(272, 12)">
        {/* Headband arcs over the top of the phone */}
        <path d="M -6,28 C -6,-12 66,-12 66,28" stroke={t.headband} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Left ear cup - mid-upper side of phone */}
        <ellipse cx="-6" cy="34" rx="9" ry="12" fill={t.earOuter} opacity="0.95" />
        <ellipse cx="-6" cy="34" rx="6" ry="9" fill={t.earInner} />
        {/* Right ear cup */}
        <ellipse cx="66" cy="34" rx="9" ry="12" fill={t.earOuter} opacity="0.95" />
        <ellipse cx="66" cy="34" rx="6" ry="9" fill={t.earInner} />
        {/* Mic arm from left cup */}
        <path d="M -3,43 C -3,60 14,66 19,66" stroke={t.earInner} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        {/* Mic capsule */}
        <ellipse cx="20" cy="66" rx="4.5" ry="5" fill={t.earInner} />
        <ellipse cx="20" cy="66" rx="2.5" ry="3" fill={t.earOuter} opacity="0.5" />
      </g>
    </svg>
  );
};

/* Small phone-only icon for compact spaces */
const StoryfoneIcon = ({ size = 32, theme }) => {
  const t = theme;
  return (
    <svg viewBox="0 0 80 116" width={size} height={size * 1.45}>
      <defs>
        <linearGradient id="pig" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.phoneFill1} />
          <stop offset="100%" stopColor={t.phoneFill2} />
        </linearGradient>
        <linearGradient id="sig" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.screenBg1} />
          <stop offset="100%" stopColor={t.screenBg2} />
        </linearGradient>
      </defs>
      <g transform="translate(10, 12)">
        <rect x="0" y="0" width="60" height="104" rx="13" fill="url(#pig)" opacity="0.95" />
        <rect x="5" y="14" width="50" height="70" rx="5" fill="url(#sig)" />
        <path d="M 12,49 L 17,49 L 20,35 L 23,62 L 26,38 L 29,55 L 32,49 L 36,49 L 39,37 L 42,60 L 45,41 L 49,49"
          stroke={t.primary} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="18" y="92" width="24" height="3" rx="1.5" fill={t.phoneDetail} opacity="0.4" />
      </g>
      <g transform="translate(10, 12)">
        <path d="M -4,22 C -4,-12 64,-12 64,22" stroke={t.headband} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <ellipse cx="-4" cy="28" rx="9" ry="11" fill={t.earOuter} opacity="0.95" />
        <ellipse cx="-4" cy="28" rx="6" ry="8" fill={t.earInner} />
        <ellipse cx="64" cy="28" rx="9" ry="11" fill={t.earOuter} opacity="0.95" />
        <ellipse cx="64" cy="28" rx="6" ry="8" fill={t.earInner} />
      </g>
    </svg>
  );
};

const AudioWave = ({ color, playing }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ width: 3, borderRadius: 2, background: color, height: playing ? undefined : 6,
        animation: playing ? `audioBar 0.8s ease-in-out ${i * 0.1}s infinite alternate` : "none", minHeight: 4, maxHeight: 20 }} />
    ))}
  </div>
);

const StarRating = ({ rating, theme }) => {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: "relative", width: 14, height: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={theme.starInactive}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {i < full && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill={theme.starActive} style={{ position: "absolute", top: 0, left: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {i === full && partial > 0 && (
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs><clipPath id={`c${rating}`}><rect x="0" y="0" width={partial * 24} height="24" /></clipPath></defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={theme.starActive} clipPath={`url(#c${rating})`} />
            </svg>
          )}
        </div>
      ))}
      <span style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 4, fontWeight: 600 }}>{rating}</span>
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function StoryfoneApp() {
  const [mode, setMode] = useState("dark");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentStory, setCurrentStory] = useState(STORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showStoryDetail, setShowStoryDetail] = useState(false);
  const [detailStory, setDetailStory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [registered, setRegistered] = useState(false);
  const [regStep, setRegStep] = useState(0); // 0=welcome, 1=phone, 2=birthdate, 3=pin
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [pinStep, setPinStep] = useState("set"); // "set" or "confirm"
  const [regError, setRegError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Profile / WhatsApp states
  const [userPhone, setUserPhone] = useState("");
  const [userCountryCode, setUserCountryCode] = useState("+91");
  const [userDOB, setUserDOB] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState("verified"); // "verified" | "verify" | "change"
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("+91");
  const [likedStories, setLikedStories] = useState([3, 5, 7]); // pre-liked some story IDs
  const [libraryTab, setLibraryTab] = useState("listening"); // "listening" | "liked"

  // Full Player states
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(null); // null | 15 | 30 | 45 | 60
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(184); // seconds into chapter
  const [chapterDuration] = useState(720); // 12 min chapter
  const [bookmarks, setBookmarks] = useState([42, 215, 480]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const seekBy = (sec) => setCurrentTime(t => Math.max(0, Math.min(chapterDuration, t + sec)));
  const storyIndex = STORIES.findIndex(s => s.id === currentStory.id);
  const prevStory = () => { const i = storyIndex > 0 ? storyIndex - 1 : STORIES.length - 1; setCurrentStory(STORIES[i]); setCurrentTime(0); };
  const nextStory = () => { const i = storyIndex < STORIES.length - 1 ? storyIndex + 1 : 0; setCurrentStory(STORIES[i]); setCurrentTime(0); };
  const toggleBookmark = () => {
    if (bookmarks.includes(currentTime)) setBookmarks(b => b.filter(x => x !== currentTime));
    else setBookmarks(b => [...b, currentTime].sort((a, b) => a - b));
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    setLikedStories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const t = THEMES[mode];
  const filtered = STORIES.filter(
    (s) => (selectedCategory === "All" || s.genre === selectedCategory) &&
      (!searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const continueListening = STORIES.filter((s) => s.progress > 0);
  const trending = [...STORIES].sort((a, b) => parseFloat(b.listeners) - parseFloat(a.listeners)).slice(0, 5);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes audioBar { from { height: 4px; } to { height: 20px; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
    @keyframes glowPulse { 0%,100% { filter: drop-shadow(0 0 10px rgba(220,38,38,0.3)); } 50% { filter: drop-shadow(0 0 25px rgba(220,38,38,0.7)); } }
    @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-6px); } 40%,80% { transform: translateX(6px); } }
    @keyframes pinPop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
    @keyframes breathe { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.95; } }
    * { scrollbar-width: none; } *::-webkit-scrollbar { display: none; }
  `;

  // PIN input handler
  const handlePinInput = (index, value, isConfirm = false) => {
    if (!/^\d?$/.test(value)) return;
    const arr = isConfirm ? [...confirmPin] : [...pin];
    arr[index] = value;
    isConfirm ? setConfirmPin(arr) : setPin(arr);
    setRegError("");
    if (value && index < 3) {
      const nextId = `${isConfirm ? "cpin" : "pin"}-${index + 1}`;
      document.getElementById(nextId)?.focus();
    }
  };

  const handlePinKeyDown = (index, e, isConfirm = false) => {
    if (e.key === "Backspace") {
      const arr = isConfirm ? [...confirmPin] : [...pin];
      if (!arr[index] && index > 0) {
        const prevId = `${isConfirm ? "cpin" : "pin"}-${index - 1}`;
        document.getElementById(prevId)?.focus();
      }
    }
  };

  // Validate birthdate is 18+
  const validateAge = () => {
    const d = parseInt(birthDay), m = parseInt(birthMonth), y = parseInt(birthYear);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2025) {
      setRegError("Please enter a valid date");
      return false;
    }
    const bd = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const monthDiff = today.getMonth() - bd.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) age--;
    if (age < 18) {
      setRegError("You must be 18 or older to register");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setRegError("");
    if (regStep === 1) {
      if (phone.length < 8) { setRegError("Enter a valid WhatsApp number"); return; }
      setRegStep(2);
    } else if (regStep === 2) {
      if (!validateAge()) return;
      setRegStep(3);
    } else if (regStep === 3) {
      if (pinStep === "set") {
        if (pin.some(d => d === "")) { setRegError("Enter all 4 digits"); return; }
        setPinStep("confirm");
      } else {
        if (confirmPin.some(d => d === "")) { setRegError("Confirm all 4 digits"); return; }
        if (pin.join("") !== confirmPin.join("")) {
          setRegError("PINs don't match. Try again.");
          setConfirmPin(["", "", "", ""]);
          document.getElementById("cpin-0")?.focus();
          return;
        }
        setUserPhone(phone);
        setUserCountryCode(countryCode);
        setUserDOB(`${birthDay.padStart(2,"0")}/${birthMonth.padStart(2,"0")}/${birthYear}`);
        setWhatsappStatus("verified");
        setRegistered(true);
      }
    }
  };

  // Shared styles for registration
  const regInputStyle = {
    background: "#1A1212", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 12,
    padding: "14px 16px", fontSize: 16, color: "#F5F0F0", outline: "none",
    fontFamily: "'DM Sans', sans-serif", width: "100%", boxSizing: "border-box",
  };
  const regBtnStyle = {
    background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "#fff",
    border: "none", padding: "15px", borderRadius: 14, fontSize: 16, fontWeight: 700,
    cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 20px rgba(220,38,38,0.3)", letterSpacing: 0.5,
  };
  const regBtnDisabled = { ...regBtnStyle, opacity: 0.4, cursor: "default", boxShadow: "none" };

  // Step indicators
  const StepDots = ({ current }) => (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: current === i ? 24 : 8, height: 8, borderRadius: 4,
          background: i <= current ? "#DC2626" : "rgba(220,38,38,0.15)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );

  // ── REGISTRATION FLOW ──
  if (!registered) {
    return (
      <div style={{ width: 390, height: 844, margin: "0 auto", background: "#0A0A0A", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", borderRadius: 40, border: "1px solid rgba(220,38,38,0.2)" }}>
        <style>{CSS}</style>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 20%, rgba(220,38,38,0.08) 0%, transparent 65%)" }} />

        {/* Back button (steps 1-3) */}
        {regStep > 0 && (
          <button onClick={() => {
            setRegError("");
            if (regStep === 3 && pinStep === "confirm") { setPinStep("set"); setConfirmPin(["","","",""]); }
            else setRegStep(regStep - 1);
          }} style={{ position: "absolute", top: 52, left: 24, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.12)", color: "#9A8A8A", width: 38, height: 38, borderRadius: 12, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            ←
          </button>
        )}

        {/* ── Step 0: Welcome ── */}
        {regStep === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", zIndex: 1 }}>
            <div style={{ animation: "fadeUp 0.8s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ animation: "glowPulse 2.5s ease-in-out infinite" }}>
                <StoryfoneLogo width={280} theme={THEMES.dark} animate />
              </div>
              <p style={{ color: "#6B5858", fontSize: 14, textAlign: "center", maxWidth: 260, lineHeight: 1.6, marginTop: 20 }}>
                Immersive audio stories crafted for mature audiences
              </p>
            </div>
            <div style={{ animation: "fadeUp 0.8s ease-out 0.3s both", marginTop: 48, width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <button onClick={() => setRegStep(1)} style={regBtnStyle}>
                Create Account
              </button>
              <button onClick={() => setRegStep(1)} style={{ ...regBtnStyle, background: "transparent", border: "1px solid rgba(220,38,38,0.3)", boxShadow: "none", color: "#DC2626" }}>
                Sign In
              </button>
              <p style={{ color: "#3D2828", fontSize: 11, textAlign: "center", lineHeight: 1.4, marginTop: 8 }}>
                By continuing, you agree to our Terms of Service and confirm you are 18 years or older.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 1: WhatsApp Number ── */}
        {regStep === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "100px 28px 40px", zIndex: 1 }}>
            <div style={{ animation: "fadeUp 0.4s ease-out" }}>
              <StepDots current={0} />
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>📱</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F5F0F0", fontFamily: "'Montserrat', sans-serif", margin: "0 0 8px" }}>WhatsApp Number</h2>
              <p style={{ fontSize: 14, color: "#6B5858", margin: "0 0 28px", lineHeight: 1.5 }}>We'll send you a verification code via WhatsApp</p>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  style={{ ...regInputStyle, width: 90, padding: "14px 8px", fontSize: 15, appearance: "none", textAlign: "center", cursor: "pointer", flexShrink: 0 }}>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+55">🇧🇷 +55</option>
                </select>
                <input placeholder="WhatsApp number" value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setRegError(""); }}
                  type="tel" inputMode="numeric" maxLength={12}
                  style={{ ...regInputStyle, flex: 1, fontSize: 18, letterSpacing: 1 }} />
              </div>

              {regError && <p style={{ color: "#FF4444", fontSize: 13, margin: "0 0 12px", animation: "shake 0.4s ease" }}>{regError}</p>}

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(220,38,38,0.04)", borderRadius: 10, marginBottom: 28 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: 12, color: "#6B5858", margin: 0, lineHeight: 1.4 }}>Your number is encrypted and never shared with third parties</p>
              </div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button onClick={handleNextStep} disabled={phone.length < 8}
                style={phone.length >= 8 ? regBtnStyle : regBtnDisabled}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Birthdate ── */}
        {regStep === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "100px 28px 40px", zIndex: 1 }}>
            <div style={{ animation: "fadeUp 0.4s ease-out" }}>
              <StepDots current={1} />
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>🎂</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F5F0F0", fontFamily: "'Montserrat', sans-serif", margin: "0 0 8px" }}>Date of Birth</h2>
              <p style={{ fontSize: 14, color: "#6B5858", margin: "0 0 28px", lineHeight: 1.5 }}>You must be 18 or older to use Story</p>

              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#6B5858", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Day</label>
                  <input placeholder="DD" value={birthDay} maxLength={2} inputMode="numeric"
                    onChange={e => { setBirthDay(e.target.value.replace(/\D/g, "")); setRegError(""); }}
                    style={{ ...regInputStyle, textAlign: "center", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#6B5858", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Month</label>
                  <input placeholder="MM" value={birthMonth} maxLength={2} inputMode="numeric"
                    onChange={e => { setBirthMonth(e.target.value.replace(/\D/g, "")); setRegError(""); }}
                    style={{ ...regInputStyle, textAlign: "center", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} />
                </div>
                <div style={{ flex: 1.4 }}>
                  <label style={{ fontSize: 11, color: "#6B5858", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Year</label>
                  <input placeholder="YYYY" value={birthYear} maxLength={4} inputMode="numeric"
                    onChange={e => { setBirthYear(e.target.value.replace(/\D/g, "")); setRegError(""); }}
                    style={{ ...regInputStyle, textAlign: "center", fontSize: 20, fontWeight: 700, letterSpacing: 2 }} />
                </div>
              </div>

              {regError && <p style={{ color: "#FF4444", fontSize: 13, margin: "0 0 12px", animation: "shake 0.4s ease" }}>{regError}</p>}

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(220,38,38,0.04)", borderRadius: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔞</span>
                <p style={{ fontSize: 12, color: "#6B5858", margin: 0, lineHeight: 1.4 }}>This app contains mature content. Age verification is required by law.</p>
              </div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button onClick={handleNextStep}
                disabled={!birthDay || !birthMonth || !birthYear}
                style={(birthDay && birthMonth && birthYear) ? regBtnStyle : regBtnDisabled}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: PIN ── */}
        {regStep === 3 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "100px 28px 40px", zIndex: 1 }}>
            <div style={{ animation: "fadeUp 0.4s ease-out" }} key={pinStep}>
              <StepDots current={2} />
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
                {pinStep === "set" ? "🔐" : "✅"}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F5F0F0", fontFamily: "'Montserrat', sans-serif", margin: "0 0 8px" }}>
                {pinStep === "set" ? "Create Your PIN" : "Confirm Your PIN"}
              </h2>
              <p style={{ fontSize: 14, color: "#6B5858", margin: "0 0 32px", lineHeight: 1.5 }}>
                {pinStep === "set" ? "Choose a 4-digit PIN to secure your account" : "Re-enter your PIN to confirm"}
              </p>

              {/* PIN boxes */}
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
                {(pinStep === "set" ? pin : confirmPin).map((digit, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <input
                      id={`${pinStep === "set" ? "pin" : "cpin"}-${i}`}
                      type={showPassword ? "tel" : "password"}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handlePinInput(i, e.target.value, pinStep === "confirm")}
                      onKeyDown={e => handlePinKeyDown(i, e, pinStep === "confirm")}
                      autoFocus={i === 0}
                      style={{
                        width: 58, height: 64, borderRadius: 14, border: `2px solid ${digit ? "#DC2626" : "rgba(220,38,38,0.15)"}`,
                        background: digit ? "rgba(220,38,38,0.06)" : "#1A1212",
                        color: "#F5F0F0", fontSize: 24, fontWeight: 800, textAlign: "center",
                        outline: "none", fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                        animation: digit ? "pinPop 0.2s ease" : "none",
                        caretColor: "#DC2626",
                      }}
                    />
                    {digit && !showPassword && (
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, borderRadius: "50%", background: "#DC2626", pointerEvents: "none" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Show/Hide toggle */}
              <button onClick={() => setShowPassword(!showPassword)} style={{
                background: "none", border: "none", color: "#6B5858", fontSize: 13,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex",
                alignItems: "center", gap: 6, margin: "0 auto 16px", padding: "8px 16px",
              }}>
                {showPassword ? "🙈" : "👁️"} {showPassword ? "Hide PIN" : "Show PIN"}
              </button>

              {regError && <p style={{ color: "#FF4444", fontSize: 13, margin: "0 0 12px", textAlign: "center", animation: "shake 0.4s ease" }}>{regError}</p>}
            </div>
            <div style={{ marginTop: "auto" }}>
              <button onClick={handleNextStep}
                disabled={(pinStep === "set" ? pin : confirmPin).some(d => d === "")}
                style={(pinStep === "set" ? pin : confirmPin).every(d => d !== "") ? regBtnStyle : regBtnDisabled}>
                {pinStep === "set" ? "Continue" : "Create Account"}
              </button>
              {pinStep === "confirm" && (
                <p style={{ fontSize: 12, color: "#3D2828", textAlign: "center", marginTop: 16, lineHeight: 1.4 }}>
                  By creating an account, you confirm you are 18+ and agree to our Terms & Privacy Policy.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const openDetail = (story) => { setDetailStory(story); setShowStoryDetail(true); };
  const playStory = (story) => { setCurrentStory(story); setIsPlaying(true); setShowPlayer(true); setShowStoryDetail(false); setCurrentTime(0); setShowFullPlayer(false); };

  // Helper for player control buttons
  const PlayerBtn = ({ children, onClick, size = 44, bg = "transparent", style: extra = {} }) => (
    <button onClick={onClick} style={{ width: size, height: size, borderRadius: size / 2, background: bg, border: "none", color: t.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, ...extra }}>
      {children}
    </button>
  );

  // ── FULL PLAYER SCREEN ──
  if (showFullPlayer) {
    const progress = currentTime / chapterDuration;
    return (
      <div style={{ width: 390, height: 844, margin: "0 auto", background: t.bg, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", borderRadius: 40, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
        <style>{CSS}</style>

        {/* Ambient background glow */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 20%, ${t.primaryGlow} 0%, transparent 60%)`, pointerEvents: "none" }} />

        {/* Top bar */}
        <div style={{ padding: "48px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <button onClick={() => { setShowFullPlayer(false); setShowSpeedMenu(false); setShowSleepMenu(false); }} style={{ background: "none", border: "none", color: t.text, fontSize: 24, cursor: "pointer", padding: 4 }}>↓</button>
          <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>Now Playing</p>
          <button onClick={() => {}} style={{ background: "none", border: "none", color: t.text, fontSize: 18, cursor: "pointer", padding: 4 }}>⋯</button>
        </div>

        {/* Cover Art */}
        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", alignItems: "center", padding: "32px 0 24px", zIndex: 1 }}>
          <div style={{
            width: 240, height: 240, borderRadius: 28, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100,
            boxShadow: `0 20px 60px ${t.primaryGlow}, 0 8px 24px rgba(0,0,0,0.4)`,
            animation: isPlaying ? "breathe 3s ease-in-out infinite" : "none",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
            {currentStory.cover}
          </div>
        </div>

        {/* Title, Author, Chapter */}
        <div style={{ padding: "0 32px", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>{currentStory.title}</h2>
              <p style={{ fontSize: 14, color: t.textSecondary, margin: "4px 0 0", fontStyle: "italic" }}>{currentStory.author}</p>
            </div>
            <button onClick={() => toggleLike(currentStory.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 4, flexShrink: 0, marginTop: 2 }}>
              {likedStories.includes(currentStory.id) ? "❤️" : "🤍"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: t.primary, margin: "6px 0 0", fontWeight: 600 }}>Chapter {currentStory.currentChapter || 1} of {currentStory.chapters}</p>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "20px 32px 0", zIndex: 1 }}>
          <div style={{ position: "relative", height: 6, background: t.progressBg, borderRadius: 3, cursor: "pointer" }}
            onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setCurrentTime(Math.round(((e.clientX - rect.left) / rect.width) * chapterDuration)); }}>
            {/* Bookmark markers */}
            {bookmarks.map(b => (
              <div key={b} style={{ position: "absolute", top: -3, left: `${(b / chapterDuration) * 100}%`, width: 4, height: 12, borderRadius: 2, background: t.starActive, transform: "translateX(-50%)", zIndex: 2 }} />
            ))}
            <div style={{ height: "100%", width: `${progress * 100}%`, background: t.gradient, borderRadius: 3, position: "relative" }}>
              {/* Scrubber handle */}
              <div style={{ position: "absolute", right: -7, top: -4, width: 14, height: 14, borderRadius: "50%", background: t.primary, boxShadow: `0 0 10px ${t.primaryGlow}`, border: `2px solid ${t.text}` }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>{formatTime(currentTime)}</span>
            <span style={{ fontSize: 11, color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>-{formatTime(chapterDuration - currentTime)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "16px 32px 0", zIndex: 1 }}>
          {/* Seek back 10s */}
          <PlayerBtn onClick={() => seekBy(-10)} size={44}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={t.textSecondary} strokeWidth="2" strokeLinecap="round">
                <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, color: t.textSecondary, top: 9 }}>10</span>
            </div>
          </PlayerBtn>

          {/* Prev */}
          <PlayerBtn onClick={prevStory} size={48}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={t.text}><path d="M19 20L9 12l10-8v16zM7 19V5h-2v14h2z"/></svg>
          </PlayerBtn>

          {/* Play/Pause */}
          <button onClick={() => setIsPlaying(!isPlaying)} style={{
            width: 68, height: 68, borderRadius: 34, background: t.gradient, border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            boxShadow: `0 4px 24px ${t.primaryGlow}`, fontSize: 26,
          }}>
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Next */}
          <PlayerBtn onClick={nextStory} size={48}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={t.text}><path d="M5 4l10 8-10 8V4zM17 5v14h2V5h-2z"/></svg>
          </PlayerBtn>

          {/* Seek forward 10s */}
          <PlayerBtn onClick={() => seekBy(10)} size={44}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={t.textSecondary} strokeWidth="2" strokeLinecap="round">
                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
              </svg>
              <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, color: t.textSecondary, top: 9 }}>10</span>
            </div>
          </PlayerBtn>
        </div>

        {/* Secondary Controls Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "20px 24px 0", zIndex: 1 }}>
          {/* Speed */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowSleepMenu(false); }} style={{ background: showSpeedMenu ? t.primarySoft : "none", border: showSpeedMenu ? `1px solid ${t.border}` : "1px solid transparent", borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: showSpeedMenu ? t.primary : t.textSecondary }}>{playbackSpeed}x</span>
              <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}>Speed</span>
            </button>
            {showSpeedMenu && (
              <div style={{ position: "absolute", bottom: 58, left: "50%", transform: "translateX(-50%)", background: t.bgElevated, borderRadius: 14, border: `1px solid ${t.border}`, padding: 6, boxShadow: t.shadow, zIndex: 20, animation: "fadeUp 0.2s ease-out", minWidth: 120 }}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                  <button key={s} onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }} style={{
                    display: "block", width: "100%", padding: "10px 16px", background: playbackSpeed === s ? t.primarySoft : "transparent",
                    border: "none", borderRadius: 8, color: playbackSpeed === s ? t.primary : t.text, fontSize: 14, fontWeight: playbackSpeed === s ? 700 : 500,
                    cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  }}>{s}x {s === 1 ? "(Normal)" : ""}</button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowSleepMenu(!showSleepMenu); setShowSpeedMenu(false); }} style={{ background: showSleepMenu || sleepTimer ? t.primarySoft : "none", border: (showSleepMenu || sleepTimer) ? `1px solid ${t.border}` : "1px solid transparent", borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>🌙</span>
              <span style={{ fontSize: 9, color: sleepTimer ? t.primary : t.textMuted, fontWeight: 600 }}>{sleepTimer ? `${sleepTimer}m` : "Sleep"}</span>
            </button>
            {showSleepMenu && (
              <div style={{ position: "absolute", bottom: 58, left: "50%", transform: "translateX(-50%)", background: t.bgElevated, borderRadius: 14, border: `1px solid ${t.border}`, padding: 6, boxShadow: t.shadow, zIndex: 20, animation: "fadeUp 0.2s ease-out", minWidth: 140 }}>
                {[{ v: null, l: "Off" }, { v: 15, l: "15 minutes" }, { v: 30, l: "30 minutes" }, { v: 45, l: "45 minutes" }, { v: 60, l: "60 minutes" }, { v: "chapter", l: "End of chapter" }].map(s => (
                  <button key={String(s.v)} onClick={() => { setSleepTimer(s.v); setShowSleepMenu(false); }} style={{
                    display: "block", width: "100%", padding: "10px 16px", background: sleepTimer === s.v ? t.primarySoft : "transparent",
                    border: "none", borderRadius: 8, color: sleepTimer === s.v ? t.primary : t.text, fontSize: 14, fontWeight: sleepTimer === s.v ? 700 : 500,
                    cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  }}>{s.l}</button>
                ))}
              </div>
            )}
          </div>

          {/* Bookmark */}
          <button onClick={toggleBookmark} style={{ background: "none", border: "1px solid transparent", borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>{bookmarks.includes(currentTime) ? "🔖" : "📑"}</span>
            <span style={{ fontSize: 9, color: bookmarks.includes(currentTime) ? t.primary : t.textMuted, fontWeight: 600 }}>Bookmark</span>
          </button>

          {/* Download */}
          <button onClick={() => {}} style={{ background: "none", border: "1px solid transparent", borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>⬇️</span>
            <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}>Download</span>
          </button>

          {/* Share */}
          <button onClick={() => {}} style={{ background: "none", border: "1px solid transparent", borderRadius: 10, padding: "6px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>↗️</span>
            <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}>Share</span>
          </button>
        </div>

        {/* Audio Visualizer */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 3, padding: "20px 60px 0", height: 40, zIndex: 1 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const h = isPlaying ? 6 + Math.random() * 28 : 4;
            return <div key={i} style={{
              width: 3, borderRadius: 2, background: t.primary, opacity: isPlaying ? 0.3 + Math.random() * 0.7 : 0.15,
              height: isPlaying ? undefined : 4, minHeight: 4,
              animation: isPlaying ? `audioBar 0.${4 + (i % 5)}s ease-in-out ${i * 0.03}s infinite alternate` : "none",
              maxHeight: 34,
            }} />;
          })}
        </div>

        {/* Chapter info strip */}
        <div style={{ padding: "16px 32px 32px", zIndex: 1, marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: t.bgCard, borderRadius: 14, border: `1px solid ${t.borderSubtle}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14 }}>📖</span>
              <div>
                <p style={{ fontSize: 12, color: t.text, margin: 0, fontWeight: 600 }}>Chapter {currentStory.currentChapter || 1}</p>
                <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>{currentStory.chapters} chapters total</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {bookmarks.length > 0 && <span style={{ fontSize: 10, color: t.starActive, fontWeight: 700, background: "rgba(255,107,53,0.1)", padding: "2px 8px", borderRadius: 8 }}>{bookmarks.length} 🔖</span>}
              <span style={{ fontSize: 11, color: t.textSecondary, fontWeight: 600 }}>{playbackSpeed}x</span>
              {sleepTimer && <span style={{ fontSize: 10, color: t.primary, fontWeight: 700, background: t.primarySoft, padding: "2px 8px", borderRadius: 8 }}>🌙 {sleepTimer === "chapter" ? "Ch." : `${sleepTimer}m`}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STORY DETAIL ──
  if (showStoryDetail && detailStory) {
    return (
      <div style={{ width: 390, height: 844, margin: "0 auto", background: t.bg, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", borderRadius: 40, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
        <style>{CSS}</style>
        <div style={{ height: 320, background: t.gradient, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)" }} />
          <div style={{ fontSize: 80, zIndex: 1, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}>{detailStory.cover}</div>
          <button onClick={() => setShowStoryDetail(false)} style={{ position: "absolute", top: 52, left: 20, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", border: "none", color: "#fff", width: 38, height: 38, borderRadius: 12, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          {detailStory.mature && <div style={{ position: "absolute", top: 52, right: 20, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>18+</div>}
          {/* Like button */}
          <button onClick={() => toggleLike(detailStory.id)} style={{ position: "absolute", top: 52, right: detailStory.mature ? 70 : 20, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", border: "none", width: 38, height: 38, borderRadius: 12, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {likedStories.includes(detailStory.id) ? "❤️" : "🤍"}
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 100px" }}>
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text, fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1.2 }}>{detailStory.title}</h1>
            <p style={{ fontSize: 14, color: t.textSecondary, margin: "8px 0 0", fontStyle: "italic" }}>by {detailStory.author}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              <StarRating rating={detailStory.rating} theme={t} />
              <span style={{ fontSize: 12, color: t.textMuted }}>•</span>
              <span style={{ fontSize: 12, color: t.textSecondary }}>{detailStory.listeners} listeners</span>
              <span style={{ fontSize: 12, color: t.textMuted }}>•</span>
              <span style={{ fontSize: 12, color: t.textSecondary }}>{detailStory.duration}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <span style={{ fontSize: 11, color: t.primary, background: t.primarySoft, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{detailStory.genre}</span>
              <span style={{ fontSize: 11, color: t.textMuted, background: t.borderSubtle, padding: "4px 12px", borderRadius: 20 }}>{detailStory.chapters} chapters</span>
            </div>
            {detailStory.progress > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>Chapter {detailStory.currentChapter} of {detailStory.chapters}</span>
                  <span style={{ fontSize: 12, color: t.primary, fontWeight: 600 }}>{Math.round(detailStory.progress * 100)}%</span>
                </div>
                <div style={{ height: 4, background: t.progressBg, borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${detailStory.progress * 100}%`, background: t.gradient, borderRadius: 2 }} />
                </div>
              </div>
            )}
            <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.7, marginTop: 20 }}>
              A captivating tale that explores the depths of human desire and the shadows that lurk beneath the surface. Each chapter unfolds with masterful narration, drawing you deeper into a world where nothing is as it seems.
            </p>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginTop: 28, marginBottom: 12, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: 1.5 }}>Chapters</h3>
            {[...Array(Math.min(5, detailStory.chapters))].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${t.borderSubtle}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: i < detailStory.currentChapter ? t.primarySoft : t.bgSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: i < detailStory.currentChapter ? t.primary : t.textMuted }}>
                  {i < detailStory.currentChapter ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: t.text, margin: 0, fontWeight: 500 }}>Chapter {i + 1}</p>
                  <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>~12 min</p>
                </div>
                {i < detailStory.currentChapter && <span style={{ fontSize: 11, color: t.primary, fontWeight: 600 }}>Played</span>}
              </div>
            ))}
            {detailStory.chapters > 5 && <p style={{ fontSize: 13, color: t.textMuted, textAlign: "center", marginTop: 12 }}>+ {detailStory.chapters - 5} more chapters</p>}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: `linear-gradient(transparent, ${t.bg} 30%)` }}>
          <button onClick={() => playStory(detailStory)} style={{ width: "100%", padding: 16, background: t.gradient, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 4px 20px ${t.primaryGlow}`, fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ fontSize: 20 }}>▶</span>
            {detailStory.progress > 0 ? "Continue Listening" : "Start Listening"}
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div style={{ width: 390, height: 844, margin: "0 auto", background: t.bg, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", borderRadius: 40, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      {/* Status Bar */}
      <div style={{ padding: "12px 28px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, zIndex: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={t.text}><rect x="0" y="5" width="3" height="7" rx="0.5"/><rect x="4.5" y="3" width="3" height="9" rx="0.5"/><rect x="9" y="1" width="3" height="11" rx="0.5"/><rect x="13" y="0" width="3" height="12" rx="0.5"/></svg>
          <svg width="16" height="12" viewBox="0 0 24 14" fill={t.text}><path d="M1 5a8 8 0 0116 0H15a6 6 0 00-12 0H1zM5 9a4 4 0 018 0h-2a2 2 0 00-4 0H5zM9 13a1 1 0 100-2 1 1 0 000 2z"/></svg>
          <svg width="26" height="12" viewBox="0 0 26 12" fill={t.text}><rect x="0" y="1" width="22" height="10" rx="2" stroke={t.text} strokeWidth="1" fill="none"/><rect x="23" y="3.5" width="2" height="5" rx="1"/><rect x="2" y="3" width="14" height="6" rx="1"/></svg>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: showPlayer ? 140 : 80 }}>

        {/* ═══ HOME ═══ */}
        {activeTab === "home" && (
          <div style={{ animation: "fadeUp 0.4s ease-out" }}>
            <div style={{ padding: "4px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <StoryfoneLogo width={180} theme={t} />
                <p style={{ fontSize: 13, color: t.textSecondary, margin: "6px 0 0" }}>Good evening, listener</p>
              </div>
              <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, color: t.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {mode === "dark" ? "☀️" : "🌙"}
              </button>
            </div>

            <div style={{ padding: "0 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", background: t.bgInput, borderRadius: 14, padding: "0 16px", border: `1px solid ${t.borderSubtle}` }}>
                <span style={{ color: t.textMuted, fontSize: 16 }}>🔍</span>
                <input placeholder="Search stories, authors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, border: "none", background: "transparent", padding: "14px 12px", fontSize: 14, color: t.text, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            </div>

            {continueListening.length > 0 && !searchQuery && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, padding: "0 20px", margin: "0 0 14px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: 1.5 }}>Continue Listening</h2>
                <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 20px" }}>
                  {continueListening.map((s) => (
                    <div key={s.id} onClick={() => openDetail(s)} style={{ minWidth: 160, background: t.bgCard, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${t.borderSubtle}`, boxShadow: t.shadowSm }}>
                      <div style={{ height: 100, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, position: "relative" }}>
                        {s.cover}
                        <div style={{ position: "absolute", bottom: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: 10, marginLeft: 2 }}>▶</span>
                        </div>
                      </div>
                      <div style={{ padding: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</p>
                        <p style={{ fontSize: 11, color: t.textMuted, margin: "4px 0 8px" }}>Ch. {s.currentChapter}/{s.chapters}</p>
                        <div style={{ height: 3, background: t.progressBg, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${s.progress * 100}%`, background: t.gradient, borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, padding: "0 20px", margin: "0 0 14px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: 1.5 }}>Trending Now 🔥</h2>
                <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 20px" }}>
                  {trending.map((s, i) => (
                    <div key={s.id} onClick={() => openDetail(s)} style={{ minWidth: 130, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ width: 130, height: 170, borderRadius: 16, background: `linear-gradient(135deg, ${t.bgCard} 0%, ${t.bgCardHover} 100%)`, border: `1px solid ${t.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, background: t.gradientSubtle }} />
                        {s.cover}
                        <div style={{ position: "absolute", top: 8, left: 8, background: t.primary, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6 }}>#{i + 1}</div>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: "8px 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{s.title}</p>
                      <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>{s.listeners}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: "0 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: "8px 18px", borderRadius: 20, border: selectedCategory === cat ? "none" : `1px solid ${t.borderSubtle}`, background: selectedCategory === cat ? t.gradient : t.bgCard, color: selectedCategory === cat ? "#fff" : t.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "0 20px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 14px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: 1.5 }}>
                {searchQuery ? "Search Results" : selectedCategory === "All" ? "All Stories" : selectedCategory}
              </h2>
              {filtered.map((s, i) => (
                <div key={s.id} onClick={() => openDetail(s)} style={{ display: "flex", gap: 14, padding: 14, background: t.bgCard, borderRadius: 16, marginBottom: 12, cursor: "pointer", border: `1px solid ${t.borderSubtle}`, animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                  <div style={{ width: 70, height: 90, borderRadius: 12, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{s.cover}</div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                      {s.mature && <span style={{ fontSize: 8, background: t.tag18, color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>18+</span>}
                    </div>
                    <p style={{ fontSize: 12, color: t.textSecondary, margin: "3px 0", fontStyle: "italic" }}>{s.author}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{s.genre}</span>
                      <span style={{ fontSize: 11, color: t.textMuted }}>•</span>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{s.duration}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                      <StarRating rating={s.rating} theme={t} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: t.textMuted }}>{s.listeners}</span>
                        <button onClick={(e) => toggleLike(s.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>
                          {likedStories.includes(s.id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                    </div>
                    {s.progress > 0 && (
                      <div style={{ height: 3, background: t.progressBg, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ height: "100%", width: `${s.progress * 100}%`, background: t.gradient, borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 40, margin: "0 0 12px" }}>🔍</p>
                  <p style={{ fontSize: 14, color: t.textMuted }}>No stories found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ EXPLORE ═══ */}
        {activeTab === "explore" && (
          <div style={{ padding: "8px 20px", animation: "fadeUp 0.4s ease-out" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: "0 0 4px" }}>Explore</h1>
            <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 20px" }}>Discover your next obsession</p>
            <div onClick={() => openDetail(STORIES[6])} style={{ background: t.gradient, borderRadius: 20, padding: 24, marginBottom: 24, position: "relative", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase" }}>Editor's Pick</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
                <span style={{ fontSize: 52 }}>{STORIES[6].cover}</span>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>{STORIES[6].title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontStyle: "italic" }}>by {STORIES[6].author}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>⭐ {STORIES[6].rating}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>•</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{STORIES[6].listeners} listeners</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>Browse by Genre</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["Dark Romance 🌹", "Thriller 🌙", "Erotica ⛓️", "Fantasy 🏵️", "Suspense 🔥", "Psychological 💋"].map((g, i) => (
                <div key={g} onClick={() => { setSelectedCategory(g.split(" ")[0]); setActiveTab("home"); }} style={{ padding: "20px 16px", background: t.bgCard, borderRadius: 16, border: `1px solid ${t.borderSubtle}`, cursor: "pointer", textAlign: "center", animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                  <span style={{ fontSize: 28 }}>{g.split(" ")[1]}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "8px 0 0" }}>{g.split(" ")[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ LIBRARY ═══ */}
        {activeTab === "library" && (
          <div style={{ padding: "8px 20px", animation: "fadeUp 0.4s ease-out" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: "0 0 16px" }}>My Library</h1>

            {/* Listening / Liked Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, background: t.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${t.borderSubtle}` }}>
              {[{ id: "listening", label: "Listening", count: continueListening.length }, { id: "liked", label: "Liked", count: likedStories.length }].map(tab => (
                <button key={tab.id} onClick={() => setLibraryTab(tab.id)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  background: libraryTab === tab.id ? t.gradient : "transparent",
                  color: libraryTab === tab.id ? "#fff" : t.textSecondary,
                  fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.2s",
                }}>
                  <span>{tab.id === "listening" ? "🎧" : "❤️"}</span>
                  {tab.label}
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: libraryTab === tab.id ? "rgba(255,255,255,0.25)" : t.primarySoft,
                    color: libraryTab === tab.id ? "#fff" : t.primary,
                    padding: "2px 7px", borderRadius: 10,
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── Listening List ── */}
            {libraryTab === "listening" && (
              <div>
                {continueListening.map((s, i) => (
                  <div key={s.id} onClick={() => openDetail(s)} style={{ display: "flex", gap: 14, padding: 16, background: t.bgCard, borderRadius: 16, marginBottom: 12, cursor: "pointer", border: `1px solid ${t.borderSubtle}`, animation: `fadeUp 0.3s ease-out ${i * 0.06}s both` }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{s.cover}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: t.text, margin: 0 }}>{s.title}</p>
                        <button onClick={(e) => toggleLike(s.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, lineHeight: 1 }}>
                          {likedStories.includes(s.id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0" }}>{s.author}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: t.primary, fontWeight: 600 }}>{Math.round(s.progress * 100)}% complete</span>
                        <span style={{ fontSize: 11, color: t.textMuted }}>Ch. {s.currentChapter}/{s.chapters}</span>
                      </div>
                      <div style={{ height: 3, background: t.progressBg, borderRadius: 2, marginTop: 6 }}>
                        <div style={{ height: "100%", width: `${s.progress * 100}%`, background: t.gradient, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
                {continueListening.length === 0 && (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <p style={{ fontSize: 44, margin: "0 0 12px" }}>🎧</p>
                    <p style={{ fontSize: 16, color: t.text, fontWeight: 600, margin: "0 0 4px" }}>Nothing playing</p>
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Start listening to add stories here</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Liked List ── */}
            {libraryTab === "liked" && (
              <div>
                {STORIES.filter(s => likedStories.includes(s.id)).map((s, i) => (
                  <div key={s.id} onClick={() => openDetail(s)} style={{ display: "flex", gap: 14, padding: 16, background: t.bgCard, borderRadius: 16, marginBottom: 12, cursor: "pointer", border: `1px solid ${t.borderSubtle}`, animation: `fadeUp 0.3s ease-out ${i * 0.06}s both` }}>
                    <div style={{ width: 56, height: 70, borderRadius: 12, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{s.cover}</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: t.text, margin: 0 }}>{s.title}</p>
                        <button onClick={(e) => toggleLike(s.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, lineHeight: 1 }}>❤️</button>
                      </div>
                      <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0", fontStyle: "italic" }}>{s.author}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: t.textMuted }}>{s.genre}</span>
                        <span style={{ fontSize: 11, color: t.textMuted }}>•</span>
                        <span style={{ fontSize: 11, color: t.textMuted }}>{s.duration}</span>
                        <span style={{ fontSize: 11, color: t.textMuted }}>•</span>
                        <StarRating rating={s.rating} theme={t} />
                      </div>
                    </div>
                  </div>
                ))}
                {likedStories.length === 0 && (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <p style={{ fontSize: 44, margin: "0 0 12px" }}>❤️</p>
                    <p style={{ fontSize: 16, color: t.text, fontWeight: 600, margin: "0 0 4px" }}>No liked stories yet</p>
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Tap the heart on any story to save it</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ PROFILE ═══ */}
        {activeTab === "profile" && (
          <div style={{ padding: "8px 20px", animation: "fadeUp 0.4s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>Profile</h1>
              <StoryfoneIcon size={28} theme={t} />
            </div>
            {/* User Avatar & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎧</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>Night Listener</h3>
                <p style={{ fontSize: 13, color: t.textSecondary, margin: "2px 0 0" }}>Premium Member</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[{ l: "Hours", v: "47.2", i: "⏱️" }, { l: "Stories", v: "12", i: "📖" }, { l: "Streak", v: "8d", i: "🔥" }].map((stat) => (
                <div key={stat.l} style={{ background: t.bgCard, borderRadius: 16, padding: 16, textAlign: "center", border: `1px solid ${t.borderSubtle}` }}>
                  <span style={{ fontSize: 20 }}>{stat.i}</span>
                  <p style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: "6px 0 2px", fontFamily: "'Playfair Display', serif" }}>{stat.v}</p>
                  <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>{stat.l}</p>
                </div>
              ))}
            </div>

            {/* ── Account Info ── */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>Account Info</h3>
            <div style={{ background: t.bgCard, borderRadius: 16, border: `1px solid ${t.borderSubtle}`, overflow: "hidden", marginBottom: 24 }}>

              {/* WhatsApp Number */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.borderSubtle}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: editingPhone ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>📱</span>
                    <div>
                      <p style={{ fontSize: 11, color: t.textMuted, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp</p>
                      <p style={{ fontSize: 15, color: t.text, margin: "2px 0 0", fontWeight: 500 }}>{userCountryCode} {userPhone}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Status Badge */}
                    {whatsappStatus === "verified" && !editingPhone && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.1)", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10 }}>✓</span> Verified
                      </span>
                    )}
                    {whatsappStatus === "verify" && !editingPhone && (
                      <button onClick={() => { setWhatsappStatus("verified"); }} style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10 }}>⚠</span> Verify
                      </button>
                    )}
                    {/* Change button */}
                    {!editingPhone && (
                      <button onClick={() => { setEditingPhone(true); setNewPhone(""); setNewCountryCode(userCountryCode); }} style={{ fontSize: 11, fontWeight: 600, color: t.primary, background: t.primarySoft, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer" }}>
                        Change
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit phone inline */}
                {editingPhone && (
                  <div style={{ animation: "fadeUp 0.3s ease-out" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <select value={newCountryCode} onChange={e => setNewCountryCode(e.target.value)}
                        style={{ background: t.bgInput, border: `1px solid ${t.borderSubtle}`, borderRadius: 10, padding: "10px 6px", fontSize: 13, color: t.text, outline: "none", width: 78, appearance: "none", textAlign: "center", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+55">🇧🇷 +55</option>
                      </select>
                      <input placeholder="New WhatsApp number" value={newPhone}
                        onChange={e => setNewPhone(e.target.value.replace(/\D/g, ""))}
                        type="tel" inputMode="numeric" maxLength={12}
                        style={{ flex: 1, background: t.bgInput, border: `1px solid ${t.borderSubtle}`, borderRadius: 10, padding: "10px 12px", fontSize: 15, color: t.text, outline: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditingPhone(false)}
                        style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.borderSubtle}`, background: "transparent", color: t.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        Cancel
                      </button>
                      <button onClick={() => {
                        if (newPhone.length >= 8) {
                          setUserPhone(newPhone);
                          setUserCountryCode(newCountryCode);
                          setWhatsappStatus("verify");
                          setEditingPhone(false);
                        }
                      }}
                        disabled={newPhone.length < 8}
                        style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: newPhone.length >= 8 ? t.gradient : t.bgInput, color: newPhone.length >= 8 ? "#fff" : t.textMuted, fontSize: 13, fontWeight: 700, cursor: newPhone.length >= 8 ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>
                        Save & Verify
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.borderSubtle}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🎂</span>
                  <div>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Date of Birth</p>
                    <p style={{ fontSize: 15, color: t.text, margin: "2px 0 0", fontWeight: 500 }}>{userDOB}</p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <div>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Member Since</p>
                    <p style={{ fontSize: 15, color: t.text, margin: "2px 0 0", fontWeight: 500 }}>February 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Settings ── */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Montserrat', sans-serif", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>Settings</h3>
            {[{ icon: mode === "dark" ? "☀️" : "🌙", label: `Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`, action: () => setMode(m => m === "dark" ? "light" : "dark") }, { icon: "🔔", label: "Notifications" }, { icon: "⬇️", label: "Downloads" }, { icon: "🔒", label: "Privacy" }, { icon: "❓", label: "Help & Support" }].map((item, i) => (
              <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${t.borderSubtle}`, cursor: item.action ? "pointer" : "default" }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{item.label}</span>
                <span style={{ marginLeft: "auto", color: t.textMuted, fontSize: 14 }}>›</span>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <StoryfoneLogo width={120} theme={t} />
              <p style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>v2.1.0 • Made with ❤️</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Mini Player ── */}
      {showPlayer && !showFullPlayer && (
        <div style={{ position: "absolute", bottom: 68, left: 0, right: 0, zIndex: 10, padding: "0 12px" }}>
          {/* Progress bar on top of mini player */}
          <div style={{ height: 3, background: t.progressBg, borderRadius: "3px 3px 0 0", marginBottom: -1, marginLeft: 4, marginRight: 4 }}>
            <div style={{ height: "100%", width: `${(currentTime / chapterDuration) * 100}%`, background: t.gradient, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          <div onClick={() => setShowFullPlayer(true)} style={{
            background: t.bgElevated, borderRadius: 14, padding: "10px 12px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: t.shadow, border: `1px solid ${t.border}`,
            backdropFilter: "blur(20px)", cursor: "pointer",
          }}>
            {/* Cover */}
            <div style={{ width: 42, height: 42, borderRadius: 10, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {currentStory.cover}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{currentStory.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <AudioWave color={t.primary} playing={isPlaying} />
                <span style={{ fontSize: 11, color: t.textMuted, lineHeight: 1 }}>Ch. {currentStory.currentChapter || 1}</span>
                <span style={{ fontSize: 10, color: t.textMuted }}>•</span>
                <span style={{ fontSize: 11, color: t.textMuted, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{formatTime(currentTime)}</span>
              </div>
            </div>
            {/* Play/Pause */}
            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} style={{
              width: 38, height: 38, borderRadius: 10, background: t.gradient, border: "none", color: "#fff",
              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: `0 2px 10px ${t.primaryGlow}`,
            }}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            {/* Next */}
            <button onClick={(e) => { e.stopPropagation(); nextStory(); }} style={{
              width: 32, height: 32, borderRadius: 8, background: "none", border: "none",
              color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={t.textSecondary}><path d="M5 4l10 8-10 8V4zM17 5v14h2V5h-2z"/></svg>
            </button>
            {/* Close */}
            <button onClick={(e) => { e.stopPropagation(); setShowPlayer(false); }} style={{
              background: "none", border: "none", color: t.textMuted, fontSize: 14, cursor: "pointer",
              padding: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: t.navBg, backdropFilter: "blur(20px)", display: "flex", justifyContent: "space-around", padding: "8px 0 24px", borderTop: `1px solid ${t.borderSubtle}`, zIndex: 10 }}>
        {[{ id: "home", icon: "🏠", label: "Home" }, { id: "explore", icon: "🧭", label: "Explore" }, { id: "library", icon: "📚", label: "Library" }, { id: "profile", icon: "👤", label: "Profile" }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 16px", position: "relative" }}>
            <span style={{ fontSize: 20, filter: activeTab === tab.id ? "none" : "grayscale(0.8)", opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? t.primary : t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{tab.label}</span>
            {activeTab === tab.id && <div style={{ position: "absolute", top: -8, width: 20, height: 3, borderRadius: 2, background: t.gradient }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
