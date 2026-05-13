"use client";

import { useState, useRef, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { PlayFillIcon, AddIcon, MicIcon, SendIcon, HeadphoneIcon } from "../components/icons";

interface Message {
  id: number;
  text: string;
  sender: "persona" | "user";
  time: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const now = new Date();
    const hours = now.getHours();
    const time = `${hours < 12 ? "AM" : "PM"} ${hours}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { id: Date.now(), text: input.trim(), sender: "user", time }]);
    setInput("");
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col pb-[120px] pt-8 relative">
        <div className="flex items-center px-6 shrink-0">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="relative h-[300px] overflow-hidden mt-2 shrink-0">
          <div className="w-full h-full bg-gradient-to-b from-disabled to-surface" />
          <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-transparent to-background" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-muted flex gap-2 items-center px-3 py-[6px] rounded-[4px]">
            <HeadphoneIcon />
            <span className="text-muted text-[15px] font-medium leading-6">듣고 있어요</span>
          </div>
        </div>

        <div className="flex flex-col px-6 py-2">
          {messages.map((msg) =>
            msg.sender === "persona" ? (
              <div key={msg.id} className="flex flex-col gap-2 items-start py-2">
                <div className="bg-surface-muted flex flex-col gap-1 items-start px-5 py-[14px] rounded-br-sheet rounded-tl-sheet rounded-tr-sheet max-w-[297px]">
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className="text-foreground text-[16px] font-medium leading-6">{line}</p>
                  ))}
                </div>
                <button className="bg-surface-muted flex gap-1 items-center px-3 py-[6px] rounded-[4px] cursor-pointer">
                  <PlayFillIcon />
                  <span className="text-muted text-[14px] font-medium leading-6">목소리 듣기</span>
                </button>
                <span className="text-foreground text-[14px] leading-6">{msg.time}</span>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col gap-1 items-end py-2">
                <div className="bg-accent flex flex-col gap-1 items-start px-5 py-[14px] rounded-bl-sheet rounded-tl-sheet rounded-tr-sheet max-w-[297px]">
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className="text-white text-[16px] font-medium leading-6">{line}</p>
                  ))}
                </div>
                <span className="text-foreground text-[14px] leading-6 text-right">{msg.time}</span>
              </div>
            )
          )}
          <div ref={bottomRef} />
        </div>

        <div className="fixed bottom-[96px] left-1/2 -translate-x-1/2 w-full max-w-app px-6 z-40">
          <div className="bg-white border border-disabled flex items-center justify-between px-4 py-3 rounded-card">
            <div className="flex gap-[10px] items-center flex-1">
              <button className="shrink-0 cursor-pointer">
                <AddIcon />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="대화를 이어나가세요"
                className="flex-1 text-[16px] text-foreground placeholder:text-placeholder outline-none font-medium leading-6 bg-transparent"
              />
            </div>
            <div className="flex gap-[10px] items-center shrink-0">
              <button className="cursor-pointer">
                <MicIcon size={20} />
              </button>
              <button onClick={handleSend} className="cursor-pointer">
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {showCrisis && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-50 flex items-center justify-center px-6">
            <div className="bg-white flex flex-col gap-[18px] items-center px-[26px] py-[44px] rounded-tile w-full max-w-[320px]">
              <div className="flex flex-col gap-3 items-center text-foreground">
                <p className="text-[20px] font-semibold leading-6 text-center">지금 마음이 많이 무거우신가요?</p>
                <div className="flex flex-col items-center text-[16px] font-medium">
                  <p className="leading-6">이런 마음이 들때는</p>
                  <p className="leading-6">곁에 있는 사람과 함께 해주세요</p>
                </div>
              </div>
              <div className="bg-surface flex items-center justify-center px-[18px] py-5 rounded-card w-full">
                <div className="flex flex-col gap-[14px] items-center text-foreground">
                  <p className="text-[18px] font-semibold leading-6">위기 상담 연락처</p>
                  <div className="flex flex-col gap-[17px] items-center text-[16px]">
                    <div className="flex flex-col gap-1 items-center">
                      <p className="font-semibold leading-6">자살예방 상담 전화</p>
                      <p className="font-medium leading-6"><span className="underline">1393</span> (24시간)</p>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <p className="font-semibold leading-6">정신건강 위기상담 전화</p>
                      <p className="font-medium leading-6"><span className="underline">2577-0199</span> (24시간)</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCrisis(false)}
                className="bg-disabled flex items-center justify-center px-5 py-3 rounded-card w-full cursor-pointer"
              >
                <span className="text-foreground text-[14px] font-medium tracking-brand">괜찮아요, 계속할게요</span>
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
