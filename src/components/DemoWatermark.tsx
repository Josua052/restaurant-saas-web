/**
 * DemoWatermark Component (Next.js)

 */

const IS_DEMO = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

export function DemoWatermark() {
  if (!IS_DEMO) return null;

  const svgPattern = `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='240' viewBox='0 0 340 240'>
    <text x='50%' y='50%' text-anchor='middle' transform='rotate(-40 170 120)' fill='%23334155' opacity='0.11' font-size='22' font-family='system-ui, -apple-system, sans-serif' font-weight='800' letter-spacing='3'>Property of Jo</text>
  </svg>`;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
