import svgPaths from "./svg-mzncxcvcq7"

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
        <p className="leading-[20px]">10:14</p>
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
          <p className="leading-[16px]">writing • QUESTION 6/20</p>
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
          className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] w-full"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <p className="leading-[28px]">Introduce yourself</p>
        </div>
      </div>
    </div>
  )
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal h-[99px] justify-center leading-[0] relative shrink-0 text-[#464556] text-[16px] w-[311px]">
          <p className="leading-[24px] mb-0">
            Write a short paragraph (3-5 sentences)
          </p>
          <p className="leading-[24px] mb-0">
            introducing yourself to a new friend.
          </p>
          <p className="leading-[24px] mb-0">
            Include your name, where you are from,
          </p>
          <p className="leading-[24px]">and one hobby.</p>
        </div>
      </div>
    </div>
  )
}

function QuestionCard() {
  return (
    <div
      className="absolute bg-[#f8fafc] content-stretch drop-shadow-[0px_4px_6px_rgba(79,70,229,0.08)] flex flex-col gap-[8px] h-[193px] items-center left-[24px] p-[17px] rounded-[12px] top-[116px] w-[345px]"
      data-name="Question Card"
    >
      <div
        aria-hidden
        className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <Container2 />
      <Container3 />
      <Frame1 />
    </div>
  )
}

function Label() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-[338px]"
      data-name="Label"
    >
      <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#464556] text-[14px] tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[20px]">Your Response</p>
      </div>
    </div>
  )
}

function Container4() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#767587] text-[16px] w-full">
          <p className="leading-[24px]">Type your response here...</p>
        </div>
      </div>
    </div>
  )
}

function Textarea() {
  return (
    <div
      className="bg-[#f1f5f9] min-h-[240px] relative rounded-[12px] shrink-0 w-full"
      data-name="Textarea"
    >
      <div className="flex flex-row justify-center min-h-[inherit] overflow-auto rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center min-h-[inherit] pb-[199px] pt-[17px] px-[17px] relative size-full">
          <Container4 />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
    </div>
  )
}

function Container5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#767587] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Target: 3-5 sentences</p>
      </div>
    </div>
  )
}

function Container6() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#767587] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">0 characters</p>
      </div>
    </div>
  )
}

function CharacterCounterStatus() {
  return (
    <div
      className="h-[23px] relative shrink-0 w-full"
      data-name="Character Counter / Status"
    >
      <div className="content-stretch flex items-start justify-between pt-[7px] px-[4px] relative size-full">
        <Container5 />
        <Container6 />
      </div>
    </div>
  )
}

function InputSection() {
  return (
    <div
      className="absolute content-stretch flex flex-col gap-[8px] items-end left-[24px] top-[321px] w-[345px]"
      data-name="Input Section"
    >
      <Label />
      <Textarea />
      <CharacterCounterStatus />
    </div>
  )
}

export default function Frame() {
  return (
    <div className="bg-[#f8fafc] relative size-full" data-name="Frame">
      <Background />
      <div className="absolute bg-[rgba(79,70,229,0.1)] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[345px]" />
      <div className="absolute bg-[#4f46e5] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[264px]" />
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
      <InputSection />
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
