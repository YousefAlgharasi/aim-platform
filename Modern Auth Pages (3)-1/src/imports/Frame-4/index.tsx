import svgPaths from "./svg-idxcdtyf8o"

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
        <p className="leading-[20px]">20:14</p>
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
          <p className="leading-[16px]">reading • QUESTION 5/20</p>
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
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[24px] mb-0">
            What is identified as the primary
          </p>
          <p className="leading-[24px]">
            catalyst for reducing student attritionrates?
          </p>
        </div>
      </div>
    </div>
  )
}

function Container4() {
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-[17px] right-0 top-[23px]"
      data-name="Container"
    >
      <div
        className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] w-[301px]"
        style={{ fontVariationSettings: '"wdth" 100' }}
      >
        <p className="leading-[24px] mb-0">
          Artificial intelligence is rapidly reshaping
        </p>
        <p className="leading-[24px] mb-0">personalized learning systems. By</p>
        <p className="leading-[24px] mb-0">
          analyzing micro-behaviors and mistake
        </p>
        <p className="leading-[24px] mb-0">
          patterns in real-time, modern algorithmic
        </p>
        <p className="leading-[24px] mb-0">
          tutors can alter course trajectories
        </p>
        <p className="leading-[24px] mb-0">
          dynamically. This reduces student attrition
        </p>
        <p className="leading-[24px] mb-0">
          rates by creating an optimized friction-free
        </p>
        <p className="leading-[24px]">educational environment.</p>
      </div>
    </div>
  )
}

function BackgroundBorder() {
  return (
    <div
      className="bg-[#e2e8f0] h-[106px] relative rounded-[12px] shrink-0 w-full"
      data-name="Background+Border"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-auto relative rounded-[inherit] size-full">
        <Container4 />
      </div>
      <div
        aria-hidden
        className="absolute border-[#4f46e5] border-l-4 border-solid inset-0 pointer-events-none rounded-[12px]"
      />
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
      <Container2 />
      <Container3 />
      <BackgroundBorder />
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
    <div className="absolute content-stretch cursor-pointer flex flex-col gap-[12px] items-start left-[25px] top-[360px] w-[345px]">
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
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-center whitespace-nowrap">
              <p className="leading-[24px]">Providing human tutor oversight</p>
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
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[16px] text-center whitespace-nowrap">
              <p className="leading-[24px]">Providing human tutor oversight</p>
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
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-left whitespace-nowrap">
              <p className="leading-[24px] mb-0">
                Altering course trajectories
              </p>
              <p className="leading-[24px]">dynamically based on user data</p>
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
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-left whitespace-nowrap">
              <p className="leading-[24px] mb-0">
                Lowering subscription costs for
              </p>
              <p className="leading-[24px]">premium learning paths</p>
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
      <Background />
      <div className="absolute bg-[rgba(79,70,229,0.1)] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[345px]" />
      <div className="absolute bg-[#4f46e5] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[48px]" />
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
      <QuestionCard />
      <Frame1 />
      <div
        className="absolute bg-[#e2e8f0] content-stretch flex h-[52px] items-center justify-center left-[25px] px-[24px] py-[14px] rounded-[12px] top-[736px] w-[165px]"
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
