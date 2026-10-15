import React, { useState, useRef, useEffect } from 'react';

const LOGO_STORAGE_KEY = 'fishwithnelson_custom_logo';

interface LogoProps {
  className?: string;
  showUploadOption?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-10 sm:h-12 w-auto',
  showUploadOption = false,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOGO_STORAGE_KEY);
      if (saved) setCustomLogoUrl(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomLogoUrl(reader.result);
        try {
          localStorage.setItem(LOGO_STORAGE_KEY, reader.result);
        } catch (err) {
          console.warn('Could not save logo to storage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // If user uploaded their logo file directly, display it with object-contain to ensure zero cropping
  if (customLogoUrl) {
    return (
      <div className="relative group inline-flex items-center">
        <img
          src={customLogoUrl}
          alt="FishingWithNelson"
          className={`object-contain max-w-full ${className}`}
        />
        {showUploadOption && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-xs"
              title="Upload new logo file"
            >
              Change
            </button>
          </>
        )}
      </div>
    );
  }

  // Fully balanced uncropped SVG replicating the uploaded FishingWithNelson banner logo
  // ViewBox (0 0 880 190) provides generous margins so hook, fish, text, and wave are completely visible
  return (
    <div className="relative group inline-flex items-center justify-center">
      <svg
        viewBox="0 0 880 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={`${className} overflow-visible block`}
        aria-label="FishingWithNelson logo"
      >
        <defs>
          {/* Orange gradient for the fish and lettering matching original photo */}
          <linearGradient id="nelsonOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d15" />
            <stop offset="100%" stopColor="#e63c00" />
          </linearGradient>

          {/* Marine blue wave water gradient */}
          <linearGradient id="nelsonBlueWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0077c2" />
            <stop offset="45%" stopColor="#0288d1" />
            <stop offset="100%" stopColor="#03a9f4" />
          </linearGradient>

          {/* Silver/carbon hook metallic gradient */}
          <linearGradient id="nelsonHookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="30%" stopColor="#757575" />
            <stop offset="70%" stopColor="#212121" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
        </defs>

        {/* 1. Large Fishing Hook on the Left (full curve from eyelet to bend) */}
        <g id="fishingHook">
          {/* Hook Eyelet */}
          <circle cx="95" cy="24" r="14" fill="#18181b" />
          <circle cx="95" cy="24" r="7" fill="#ffffff" />
          
          {/* Hook Shaft and Outer Curved Bend */}
          <path
            d="M 95 32 L 80 75 C 72 98, 48 122, 28 134 C 14 142, 6 135, 10 114 C 15 90, 42 74, 60 66 C 44 76, 28 92, 25 108 C 23 122, 34 126, 46 118 C 66 104, 88 78, 96 32 Z"
            fill="url(#nelsonHookGrad)"
          />
          {/* Hook Bottom Barb & Sharp Return Point */}
          <path
            d="M 28 132 C 45 146, 76 144, 92 118 L 97 125 C 76 156, 38 154, 20 136 Z"
            fill="#18181b"
          />
        </g>

        {/* 2. Water Splash Droplets & Spray Under Fish */}
        <g fill="url(#nelsonBlueWave)">
          <path d="M 16 150 C 35 144, 58 152, 85 138 C 66 146, 42 158, 16 150 Z" />
          <path d="M 32 158 C 55 152, 90 160, 120 146 C 96 158, 62 168, 32 158 Z" />
          <path d="M 50 165 C 80 162, 130 168, 160 152 C 125 168, 85 174, 50 165 Z" />
          
          {/* Water droplets */}
          <circle cx="125" cy="158" r="6" />
          <circle cx="142" cy="164" r="4.5" />
          <circle cx="155" cy="148" r="5" />
          <circle cx="170" cy="156" r="3.5" />
          <circle cx="110" cy="144" r="4" />
        </g>

        {/* 3. Leaping Orange Fish */}
        <g id="jumpingBass">
          {/* Fish Body & Head */}
          <path
            d="M 108 36 C 128 32, 160 52, 168 76 C 174 92, 164 110, 154 124 C 138 144, 110 138, 98 134 C 114 125, 130 106, 126 88 C 122 72, 98 58, 88 50 C 96 42, 104 38, 108 36 Z"
            fill="url(#nelsonOrangeGrad)"
            stroke="#18181b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Open Mouth */}
          <path
            d="M 88 50 C 80 44, 88 34, 102 34 L 96 46 C 92 50, 90 50, 88 50 Z"
            fill="#d84315"
            stroke="#18181b"
            strokeWidth="3"
          />
          <path
            d="M 90 48 C 98 52, 106 58, 110 68 C 100 64, 92 58, 90 48 Z"
            fill="#ffccbc"
            stroke="#18181b"
            strokeWidth="2"
          />

          {/* Fish Eye */}
          <circle cx="115" cy="45" r="6" fill="#ffffff" stroke="#18181b" strokeWidth="2.5" />
          <circle cx="116" cy="45" r="3" fill="#18181b" />

          {/* Dorsal Fin */}
          <path
            d="M 144 50 C 160 46, 180 58, 185 70 C 174 70, 164 65, 156 61 C 166 76, 158 80, 154 78 Z"
            fill="#e64a19"
            stroke="#18181b"
            strokeWidth="3"
          />

          {/* Gill Plates & Side Contours */}
          <path d="M 112 58 C 122 64, 128 76, 122 88" fill="none" stroke="#18181b" strokeWidth="3" />
          <path d="M 126 72 C 136 82, 138 96, 132 108" fill="none" stroke="#18181b" strokeWidth="3" />
          <path d="M 136 90 C 146 100, 146 112, 138 124" fill="none" stroke="#18181b" strokeWidth="2.5" />

          {/* Pectoral Fin */}
          <path
            d="M 108 94 C 118 102, 134 98, 130 110 C 118 112, 106 106, 104 98 Z"
            fill="#f4511e"
            stroke="#18181b"
            strokeWidth="2.5"
          />

          {/* Tail Fin */}
          <path
            d="M 102 130 C 90 142, 84 150, 96 154 C 104 154, 108 146, 110 138 Z"
            fill="#e64a19"
            stroke="#18181b"
            strokeWidth="2.5"
          />
        </g>

        {/* 4. Complete Brand Typography: "FishingWithNelson" */}
        {/* Full width allocated so "Nelson" is never cut off */}
        <text
          x="192"
          y="112"
          fontFamily="Outfit, Impact, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="68"
          letterSpacing="-1"
          fill="#f4511e"
        >
          FishingWithNelson
        </text>

        {/* 5. Complete Marine Blue Wave Swoop Underline */}
        {/* Extends smoothly from under the 'F' all the way past the trailing 'n' */}
        <path
          d="M 200 134 C 255 125, 305 116, 365 124 C 425 132, 520 126, 620 106 C 680 94, 760 84, 855 70 C 805 88, 715 110, 610 118 C 500 126, 420 114, 355 130 C 295 144, 235 142, 200 134 Z"
          fill="url(#nelsonBlueWave)"
        />
      </svg>

      {/* Hidden input to upload custom logo file */}
      {showUploadOption && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-slate-900/80 hover:bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-xs transition-opacity"
            title="Upload custom logo file"
          >
            Upload
          </button>
        </>
      )}
    </div>
  );
};
