"use client";

export function DemoBanner() {
  const isMock =
    process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
    !process.env.NEXT_PUBLIC_API_URL;

  if (!isMock) return null;

  return (
    <div className="w-full bg-[#1e1b4b] text-indigo-100 text-center py-1.5 px-4 text-xs font-medium tracking-wide z-50 print:hidden shrink-0 border-b border-indigo-900/50 shadow-xs flex items-center justify-center gap-1.5 select-none">
      <span>🔬</span>
      <span>
        <strong className="text-white font-semibold">Mode Demo</strong> — Data bersifat simulasi. Semua fitur dapat dicoba secara penuh.
      </span>
    </div>
  );
}
