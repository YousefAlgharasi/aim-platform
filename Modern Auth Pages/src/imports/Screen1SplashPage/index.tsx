import svgPaths from "./svg-js598z4t4o";

function Group() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Group">
          <path clipRule="evenodd" d={svgPaths.p2fcbf000} fill="var(--fill-0, #F8FAFC)" fillRule="evenodd" id="Vector" opacity="0.2" />
          <path d={svgPaths.p3afda1c0} fill="var(--fill-0, #F8FAFC)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function GgSpinner({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[calc(25%+80.75px)] size-[36px] top-[752px]"} data-name="gg:spinner">
      <Group />
    </div>
  );
}

export default function Screen1SplashPage() {
  return (
    <div className="bg-[#4f46e5] relative size-full" data-name="Screen 1 — Splash Page">
      <p className="[word-break:break-word] absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[normal] left-[calc(50%-78.5px)] not-italic text-[64px] text-white top-[calc(50%-38px)] whitespace-nowrap">Logo</p>
      <GgSpinner />
    </div>
  );
}