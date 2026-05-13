"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavHomeIcon, NavMyIcon } from "./icons";

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/chat";
  const isMy = pathname === "/my";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] bg-[#faf9f6] [filter:drop-shadow(4px_0px_8px_rgba(163,163,163,0.3))] flex items-center justify-between pb-7 pt-4 px-[90px] rounded-tl-[10px] rounded-tr-[10px] z-50">
      <Link href="/chat" className="flex flex-col gap-[2px] items-center justify-center">
        <NavHomeIcon active={isHome} />
        <span className={`text-[14px] font-medium text-black ${isHome ? "" : "opacity-30"}`}>홈</span>
      </Link>
      <Link href="/my" className="flex flex-col gap-[2px] items-center justify-center">
        <NavMyIcon active={isMy} />
        <span className={`text-[14px] font-medium text-black ${isMy ? "" : "opacity-30"}`}>마이</span>
      </Link>
    </div>
  );
}
