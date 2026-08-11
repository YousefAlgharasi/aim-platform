import svgPaths from "./svg-zjide3xqyd"

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[1.2px] uppercase w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[16px]">CONDITIONALS • QUESTION 4/20</p>
        </div>
      </div>
    </div>
  )
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[18px] w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[24px] mb-0">Choose the correct option to</p>
          <p className="leading-[24px]">complete the sentence:</p>
        </div>
      </div>
    </div>
  )
}

function BackgroundVerticalBorder() {
  return (
    <div
      className="bg-[#e2e8f0] relative rounded-[8px] shrink-0 w-full"
      data-name="Background+VerticalBorder"
    >
      <div
        aria-hidden
        className="absolute border-[#4f46e5] border-l-4 border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[16px] pl-[20px] pr-[16px] pt-[24px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] whitespace-nowrap">
          <p className="mb-0 whitespace-pre">
            <span
              className="font-['IBM_Plex_Sans:Italic',sans-serif] font-normal leading-[24px]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >{`"If I `}</span>
            <span
              className="font-['IBM_Plex_Sans:Bold_Italic',sans-serif] font-bold leading-[24px] text-[#413fe6]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              ___
            </span>
            <span
              className="font-['IBM_Plex_Sans:Italic',sans-serif] font-normal leading-[24px]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >{`   time, I would have`}</span>
          </p>
          <p
            className="font-['IBM_Plex_Sans:Italic',sans-serif] leading-[24px] whitespace-pre"
            style={{ fontVariationSettings: '"wdth" 100' }}
          >{`finished the project on schedule."`}</p>
        </div>
      </div>
    </div>
  )
}

function QuestionCard() {
  return (
    <div
      className="absolute bg-[#f8fafc] content-stretch drop-shadow-[0px_4px_6px_rgba(79,70,229,0.08)] flex flex-col gap-[8px] items-start left-[24px] p-[17px] rounded-[12px] top-[116px] w-[345px]"
      data-name="Question Card"
    >
      <div
        aria-hidden
        className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <Container />
      <Container1 />
      <BackgroundVerticalBorder />
    </div>
  )
}

function Container2() {
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

function Container3() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div
        className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[14px] tracking-[0.28px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}
      >
        <p className="leading-[20px]">24:14</p>
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
      <Container2 />
      <Container3 />
    </div>
  )
}

function Border() {
  return (
    <div
      className="content-stretch flex items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 size-[20px]"
      data-name="Border"
    >
      <div
        aria-hidden
        className="absolute border-2 border-[#4f46e5] border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
      <div
        className="bg-[#4f46e5] relative rounded-[9999px] shrink-0 size-[10px]"
        data-name="Background"
      />
    </div>
  )
}

function Frame1() {
  return (
    <div className="absolute content-stretch cursor-pointer flex flex-col gap-[12px] items-start left-[24px] top-[342px] w-[345px]">
      <button
        className="bg-[#f8fafc] relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div
              className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] text-center whitespace-nowrap"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              <p className="leading-[24px]">have</p>
            </div>
            <div
              className="relative rounded-[9999px] shrink-0 size-[20px]"
              data-name="Border"
            >
              <div
                aria-hidden
                className="absolute border-2 border-[#c6c4d8] border-solid inset-0 pointer-events-none rounded-[9999px]"
              />
            </div>
          </div>
        </div>
      </button>
      <button
        className="bg-[rgba(79,70,229,0.1)] relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#4f46e5] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div
              className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[16px] text-center whitespace-nowrap"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              <p className="leading-[24px]">had had</p>
            </div>
            <Border />
          </div>
        </div>
      </button>
      <button
        className="bg-[#f8fafc] relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div
              className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] text-center whitespace-nowrap"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              <p className="leading-[24px]">had</p>
            </div>
            <div
              className="relative rounded-[9999px] shrink-0 size-[20px]"
              data-name="Border"
            >
              <div
                aria-hidden
                className="absolute border-2 border-[#c6c4d8] border-solid inset-0 pointer-events-none rounded-[9999px]"
              />
            </div>
          </div>
        </div>
      </button>
      <button
        className="bg-[#f8fafc] relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div
              className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] text-center whitespace-nowrap"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              <p className="leading-[24px]">has</p>
            </div>
            <div
              className="relative rounded-[9999px] shrink-0 size-[20px]"
              data-name="Border"
            >
              <div
                aria-hidden
                className="absolute border-2 border-[#c6c4d8] border-solid inset-0 pointer-events-none rounded-[9999px]"
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

export default function Frame() {
  return (
    <div className="bg-[#f8fafc] relative size-full" data-name="Frame">
      <QuestionCard />
      <Background />
      <div className="absolute bg-[rgba(79,70,229,0.1)] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[345px]" />
      <div className="absolute bg-[#4f46e5] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[17px]" />
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
      <Frame1 />
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
    </div>
  )
}
