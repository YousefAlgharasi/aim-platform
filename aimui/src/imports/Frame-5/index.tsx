import svgPaths from "./svg-08sza4ndr5"

function Container() {
  return (
    <div
      className="h-[15.75px] relative shrink-0 w-[13.5px]"
      data-name="Container"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="15.75"
        preserveAspectRatio="none"
        viewBox="0 0 13.5 15.75"
        width="13.5"
      >
        <g id="Container">
          <path
            d={svgPaths.p35fe5700}
            fill="var(--fill-0, #4F46E5)"
            id="Icon"
          />
        </g>
      </svg>
    </div>
  )
}

function Container1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div
        className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[14px] tracking-[0.28px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}
      >
        <p className="leading-[20px]">15:14</p>
      </div>
    </div>
  )
}

function Background() {
  return (
    <div
      className="absolute bg-[rgba(79,70,229,0.1)] content-stretch flex gap-[8px] items-center left-[calc(75%-11.75px)] px-[12px] py-[6px] rounded-[9999px] top-[24px]"
      data-name="Background"
    >
      <Container />
      <Container1 />
    </div>
  )
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[1.2px] uppercase w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[16px]">Speaking • QUESTION 6/20</p>
        </div>
      </div>
    </div>
  )
}

function Container3() {
  return (
    <div className="relative shrink-0 w-[313px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] tracking-[-0.24px] w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[24px]">
            Describe your typical morning routine in one minute ?
          </p>
        </div>
      </div>
    </div>
  )
}

function Container5() {
  return (
    <div
      className="content-stretch flex flex-col items-center relative shrink-0 w-full"
      data-name="Container"
    >
      <div
        className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#515f74] text-[16px] text-center whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}
      >
        <p className="leading-[24px]">Recording in progress...</p>
      </div>
    </div>
  )
}

function Container6() {
  return (
    <div
      className="content-stretch flex flex-col items-center relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[12px] text-center tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">00:12 / 01:00</p>
      </div>
    </div>
  )
}

function Container4() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[169px]"
      data-name="Container"
    >
      <Container5 />
      <Container6 />
    </div>
  )
}

function Margin() {
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-0 pt-[32px] top-[224px]"
      data-name="Margin"
    >
      <Container4 />
    </div>
  )
}

function Container7() {
  return (
    <div className="h-[38px] relative shrink-0 w-[28px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="38"
        preserveAspectRatio="none"
        viewBox="0 0 28 38"
        width="28"
      >
        <g id="Container">
          <path
            d={svgPaths.p12a01600}
            fill="var(--fill-0, #F8FAFC)"
            id="Icon"
          />
        </g>
      </svg>
    </div>
  )
}

function Button() {
  return (
    <div
      className="bg-[#4f46e5] content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[128px]"
      data-name="Button"
    >
      <div
        aria-hidden
        className="absolute border-8 border-[#faf8ff] border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
      <div
        className="absolute bg-[rgba(248,250,252,0)] left-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[128px] top-0"
        data-name="Button:shadow"
      />
      <Container7 />
    </div>
  )
}

function CentralMicrophoneButton() {
  return (
    <div
      className="-translate-x-1/2 absolute content-stretch flex flex-col items-start left-[calc(50%+0.01px)] top-[96px]"
      data-name="Central Microphone Button"
    >
      <div
        className="absolute flex inset-[-16px] items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div className="flex-none h-[100cqh] w-[100cqw]">
          <div
            className="bg-[rgba(79,70,229,0.2)] relative rounded-[9999px] size-full"
            data-name="Background Pulse Rings"
          />
        </div>
      </div>
      <div
        className="absolute flex inset-[-32px] items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div className="flex-none h-[100cqh] w-[100cqw]">
          <div
            className="bg-[rgba(79,70,229,0.1)] relative rounded-[9999px] size-full"
            data-name="Overlay"
          />
        </div>
      </div>
      <Button />
    </div>
  )
}

function RecordingInterface() {
  return (
    <div
      className="h-[304px] relative shrink-0 w-[166.31px]"
      data-name="Recording Interface"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Margin />
        <CentralMicrophoneButton />
      </div>
    </div>
  )
}

function QuestionCard() {
  return (
    <div
      className="absolute bg-[#f8fafc] content-stretch drop-shadow-[0px_4px_6px_rgba(79,70,229,0.08)] flex flex-col gap-[8px] h-[514px] items-center left-[24px] p-[17px] rounded-[12px] top-[116px] w-[345px]"
      data-name="Question Card"
    >
      <div
        aria-hidden
        className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <Container2 />
      <Container3 />
      <RecordingInterface />
    </div>
  )
}

export default function Frame() {
  return (
    <div className="bg-[#f8fafc] relative size-full" data-name="Frame">
      <Background />
      <div className="absolute bg-[rgba(79,70,229,0.1)] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[345px]" />
      <div className="absolute bg-[#4f46e5] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[147px]" />
      <div
        className="absolute bg-[#4f46e5] content-stretch cursor-pointer drop-shadow-[0px_4px_6px_rgba(79,70,229,0.2)] flex h-[52px] items-center justify-center left-[calc(50%+8.5px)] px-[24px] py-[14px] rounded-[12px] top-[736px] w-[164px]"
        data-name="Button"
      >
        <p
          className="[word-break:break-word] font-['IBM_Plex_Sans:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#f8fafc] text-[16px] whitespace-nowrap"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          Submit
        </p>
      </div>
      <div
        className="absolute bg-[#e2e8f0] content-stretch flex h-[52px] items-center justify-center left-[24px] px-[24px] py-[14px] rounded-[12px] top-[736px] w-[165px]"
        data-name="Button"
      >
        <p
          className="[word-break:break-word] font-['IBM_Plex_Sans:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#0f172a] text-[16px] whitespace-nowrap"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          Skip
        </p>
      </div>
      <QuestionCard />
    </div>
  )
}
