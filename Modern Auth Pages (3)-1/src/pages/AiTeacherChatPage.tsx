import React, { useState } from 'react'
import { SparkleIcon } from '../components/Icons'

interface Message {
  id: number
  sender: 'ai' | 'user'
  text: string
  time: string
}

interface AiTeacherChatPageProps {
  lessonTitle?: string
  onBack: () => void
}

export function AiTeacherChatPage({
  lessonTitle = 'Ordering Food at a Cafe',
  onBack,
}: AiTeacherChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: `Hello Alex! I am your AIM English Tutor. Ask me anything about "${lessonTitle}" or let's practice dialogues together!`,
      time: '10:00 AM',
    },
    {
      id: 2,
      sender: 'user',
      text: 'What is the difference between "Can I get" and "Could I get" when ordering?',
      time: '10:01 AM',
    },
    {
      id: 3,
      sender: 'ai',
      text: '"Could I get" is slightly more polite and formal, making it ideal for cafes and restaurants. "Can I get" is very common and natural in casual situations!',
      time: '10:01 AM',
    },
  ])

  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      const aiReply: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Great question! You can also say "I\'d like to have a coffee, please," which sounds natural and polite.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiReply])
    }, 1200)
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors border-none cursor-pointer"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <SparkleIcon className="size-4 text-white" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-none block">AI Tutor</span>
            <span className="text-[10px] text-emerald-500 font-semibold">Online · Always Ready</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xs border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          A
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[82%] ${
              m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md shadow-indigo-500/15'
                  : 'bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {typing && (
          <div className="self-start bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1.5 shadow-xs">
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce" />
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce delay-150" />
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce delay-300" />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 pb-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 pl-4 border border-slate-200/60 dark:border-slate-700"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Teacher..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="size-10 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center border-none cursor-pointer transition-opacity disabled:opacity-40"
          >
            <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default AiTeacherChatPage
