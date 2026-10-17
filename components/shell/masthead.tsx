import { DemoBadge } from "@/components/ui/demo-badge";

interface MastheadProps {
  editionDate: string;
  editionNumber: number;
  isDemo: boolean;
  totalReadingMinutes: number;
}

/**
 * Formats an ISO date string (or pre-formatted string) into the newspaper
 * convention: 'SATURDAY · 17 OCTOBER 2026'
 */
function formatEditionDate(raw: string): string {
  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    // Already formatted or unrecognised — return as-is.
    return raw.toUpperCase();
  }
  const day = date.toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
  const dayNum = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "long" }).toUpperCase();
  const year = date.getFullYear();
  return `${day} · ${dayNum} ${month} ${year}`;
}

export function Masthead({
  editionDate,
  editionNumber,
  isDemo,
  totalReadingMinutes,
}: MastheadProps) {
  const formattedDate = formatEditionDate(editionDate);

  return (
    <header className="w-full bg-paper border-b border-rule" role="banner">
      {/* Thick top rule */}
      <div className="w-full h-[3px] bg-ink" />

      {/* Metadata row */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-3 pb-1">
        {/* Left: edition date */}
        <span className="font-mono text-xs text-ink-soft tracking-wider leading-none">
          {formattedDate}
        </span>

        {/* Right: edition badge + reading time */}
        <div className="flex items-center gap-3">
          {isDemo && <DemoBadge />}
          <span className="font-mono text-xs text-ink-soft tracking-wider leading-none">
            EDITION No.&nbsp;{editionNumber}
          </span>
        </div>
      </div>

      {/* Wordmark + tagline */}
      <div className="flex flex-col items-center justify-center px-4 pt-3 pb-4 gap-1.5">
        <h1 className="font-serif text-ink text-3xl md:text-5xl tracking-tight leading-none select-none">
          DAYBREAK
        </h1>
        <p className="text-ink-faint text-sm italic leading-none">
          A world of news, shaped around you
        </p>
        {totalReadingMinutes > 0 && (
          <p className="font-mono text-[10px] text-ink-faint tracking-wider mt-0.5">
            {totalReadingMinutes} MIN READ TODAY
          </p>
        )}
      </div>

      {/* Bottom thin rule (border-b already on header, this adds a visual double-rule) */}
      <div className="w-full h-px bg-rule" />
    </header>
  );
}
