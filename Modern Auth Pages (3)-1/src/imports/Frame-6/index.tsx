import svgPaths from "./svg-k7ih4j1rpe"

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
          <p className="leading-[16px]">listening • QUESTION 8/20</p>
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
          <p className="leading-[24px]">{`What is the speaker's main goal?`}</p>
        </div>
      </div>
    </div>
  )
}

function QuestionCard() {
  return (
    <div
      className="absolute bg-[#f8fafc] content-stretch drop-shadow-[0px_4px_6px_rgba(79,70,229,0.08)] flex flex-col gap-[8px] h-[313px] items-center left-[24px] p-[17px] rounded-[12px] top-[116px] w-[345px]"
      data-name="Question Card"
    >
      <div
        aria-hidden
        className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <Container2 />
      <Container3 />
    </div>
  )
}

function Container5() {
  return (
    <div
      className="h-[18.667px] relative shrink-0 w-[14.667px]"
      data-name="Container"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        height="18.6667"
        preserveAspectRatio="none"
        viewBox="0 0 14.6667 18.6667"
        width="14.6667"
      >
        <g id="Container">
          <path d={svgPaths.p37879e80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  )
}

function Button() {
  return (
    <div
      className="bg-[#4f46e5] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]"
      data-name="Button"
    >
      <div
        className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[64px] top-0"
        data-name="Button:shadow"
      />
      <Container5 />
    </div>
  )
}

function Container4() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Button />
      </div>
    </div>
  )
}

function Container7() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div
        className="[word-break:break-word] flex flex-col font-['IBM_Plex_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[14px] tracking-[1.4px] uppercase whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100' }}
      >
        <p className="leading-[20px]">TAP TO LISTEN</p>
      </div>
    </div>
  )
}

function WaveformVisualizer() {
  return (
    <div
      className="h-[48px] relative shrink-0 w-full"
      data-name="Waveform Visualizer"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[3px] items-center justify-center px-[16px] relative size-full">
          <div
            className="bg-[#4f46e5] h-[35.36px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Bars generated by JS"
          />
          <div
            className="bg-[#4f46e5] h-[17.84px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[34.7px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[32.64px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[13.14px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[17.77px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[30.52px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[28.81px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[16.41px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[24.7px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[10px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[13.16px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[37.19px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[30.86px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[27.48px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[20.95px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[11.94px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[25.31px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[16.61px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[17.77px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[17.06px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[19.64px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[27.14px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[22.17px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[36.75px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[12.2px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[28.44px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[23.98px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[26.2px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[20.59px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[23.38px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
          <div
            className="bg-[#4f46e5] h-[33.05px] relative rounded-[2px] shrink-0 w-[3px]"
            data-name="Background"
          />
        </div>
      </div>
    </div>
  )
}

function Container6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-center relative size-full">
        <Container7 />
        <WaveformVisualizer />
      </div>
    </div>
  )
}

function SectionAudioPlayerComponent() {
  return (
    <div
      className="absolute backdrop-blur-[4px] bg-[#e2e8f0] content-stretch flex flex-col gap-[16px] h-[202px] items-center left-[48px] pl-[28px] pr-[24px] py-[24px] rounded-[12px] top-[198px] w-[297px]"
      data-name="Section - Audio Player Component"
    >
      <div
        aria-hidden
        className="absolute border-[#4f46e5] border-l-4 border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <Container4 />
      <Container6 />
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

function AnswerSelection() {
  return (
    <div
      className="bg-[rgba(79,70,229,0.1)] relative rounded-[12px] shrink-0 w-full"
      data-name="answer selection"
    >
      <div
        aria-hidden
        className="absolute border-2 border-[#4f46e5] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#4f46e5] text-[16px] w-[293px]">
            <p className="leading-[24px]">
              To cancel a previous dinner reservation
            </p>
          </div>
          <Border />
        </div>
      </div>
    </div>
  )
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[23px] top-[453px] w-[345px]">
      <button
        className="bg-[#f8fafc] cursor-pointer relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-center whitespace-nowrap">
              <p className="leading-[24px]">
                To request a professional meeting
              </p>
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
      <AnswerSelection />
      <button
        className="bg-[#f8fafc] cursor-pointer relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-left whitespace-nowrap">
              <p className="leading-[24px]">
                To inquire about available travel options
              </p>
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
        className="bg-[#f8fafc] cursor-pointer relative rounded-[12px] shrink-0 w-full"
        data-name="answer selection"
      >
        <div
          aria-hidden
          className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
            <div className="[word-break:break-word] flex flex-col font-['Hanken_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#131b2e] text-[16px] text-left whitespace-nowrap">
              <p className="leading-[24px]">
                To provide feedback on a recent service
              </p>
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
      <div className="absolute bg-[#4f46e5] h-[8px] left-[24px] rounded-[16px] top-[72px] w-[264px]" />
      <QuestionCard />
      <SectionAudioPlayerComponent />
      <Frame1 />
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
        className="absolute bg-[#e2e8f0] content-stretch flex h-[52px] items-center justify-center left-[23px] px-[24px] py-[14px] rounded-[12px] top-[736px] w-[165px]"
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
