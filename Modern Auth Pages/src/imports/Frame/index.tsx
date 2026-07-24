import svgPaths from "./svg-6aq77x7g91";

function RiBrainFill({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[calc(50%+32.5px)] size-[36px] top-[413px]"} data-name="ri:brain-fill">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30.0019">
          <path d={svgPaths.pfa40980} fill="var(--fill-0, #4F46E5)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function MdiSeedling({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[48px] size-[36px] top-[413px]"} data-name="mdi:seedling">
      <div className="absolute inset-[16.41%_8.33%_8.33%_8.33%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 27.0914">
          <path d={svgPaths.p3fa5cb70} fill="var(--fill-0, #0F172A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#f8fafc] relative size-full" data-name="Frame">
      <div className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Bold',sans-serif] font-bold leading-[0] left-[24px] text-[#0f172a] text-[30px] top-[245px] w-[345px] whitespace-pre-wrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[36px] mb-0">{`How would you `}</p>
        <p className="leading-[36px]">like to start?</p>
      </div>
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Regular',sans-serif] font-normal leading-[20px] left-[24px] text-[#94a3b8] text-[14px] top-[325px] w-[345px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.
      </p>
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Regular',sans-serif] font-normal leading-[20px] left-[24px] text-[#94a3b8] text-[14px] top-[325px] w-[345px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.
      </p>
      <div className="absolute bg-[rgba(79,70,229,0.25)] h-[12px] left-[calc(50%+9.5px)] rounded-[16px] top-[64px] w-[74px]" />
      <div className="absolute bg-[rgba(79,70,229,0.25)] h-[12px] left-[24px] rounded-[16px] top-[64px] w-[74px]" />
      <div className="absolute bg-[#4f46e5] h-[12px] left-[calc(75%+0.25px)] rounded-[16px] top-[64px] w-[74px]" />
      <div className="absolute bg-[rgba(79,70,229,0.25)] h-[12px] left-[calc(25%+15.75px)] rounded-[16px] top-[64px] w-[74px]" />
      <div className="absolute bg-[#e2e8f0] border border-[#cbd5e1] border-solid left-[24px] rounded-[12px] size-[164px] top-[389px]" />
      <div className="absolute bg-[rgba(79,70,229,0.1)] border border-[#4f46e5] border-solid left-[calc(50%+8.5px)] rounded-[12px] size-[164px] top-[389px]" />
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Bold',sans-serif] font-bold leading-[18px] left-[48px] text-[#0f172a] text-[16px] top-[464px] w-[102px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Start from Zero
      </p>
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Regular',sans-serif] font-normal leading-[12px] left-[48px] text-[#64748b] text-[10px] top-[511px] w-[126px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Skip the test and start from the absolute basics.
      </p>
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Regular',sans-serif] font-normal leading-[12px] left-[calc(50%+35.5px)] text-[#4f46e5] text-[10px] top-[511px] w-[99px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Test your skills to let the AI find your level.
      </p>
      <p className="[word-break:break-word] absolute font-['IBM_Plex_Sans:Bold',sans-serif] font-bold leading-[18px] left-[calc(50%+35.5px)] text-[#4f46e5] text-[16px] top-[464px] w-[137px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        Test My Knowledge
      </p>
      <div className="absolute bg-[#4f46e5] content-stretch cursor-pointer drop-shadow-[0px_4px_6px_rgba(79,70,229,0.2)] flex h-[52px] items-center justify-center left-[24px] px-[24px] py-[14px] rounded-[12px] top-[736px] w-[345px]" data-name="Button">
        <p className="[word-break:break-word] font-['IBM_Plex_Sans:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#f8fafc] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          Continue
        </p>
      </div>
      <RiBrainFill />
      <MdiSeedling />
    </div>
  );
}