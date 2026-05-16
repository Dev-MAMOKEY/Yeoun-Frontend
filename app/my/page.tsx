"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { ArrowRightIcon } from "../components/icons";
import { useAuthStore } from "@/store/authStore";
import { usePersonaStore } from "@/store/personaStore";
import { useSessionStore } from "@/store/sessionStore";
import type { PersonaSummary, RsData, UserMeResponse } from "@/lib/types";

// KST(UTC+9) 기준 'YYYY.MM.DD' 포맷으로 변환
function formatKstDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function My() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setPersona = usePersonaStore((s) => s.setPersona);
  const clearPersona = usePersonaStore((s) => s.clearPersona);
  const clearSession = useSessionStore((s) => s.clearSession);

  // 페르소나 정보 카드용 — /users/me 응답에서 첫 페르소나 요약을 보관
  const [personaSummary, setPersonaSummary] = useState<PersonaSummary | null>(null);

  // 계정 삭제용 비밀번호 입력 시트 상태
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // 진입 시 내 정보 조회 → authStore / personaStore 갱신
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users/me");
        const json = (await res.json()) as RsData<UserMeResponse>;
        if (cancelled || !json.success || !json.data) return;

        const me = json.data;
        setUser({ userId: me.id, email: me.email });

        // 보유한 페르소나가 있으면 store에 반영
        const first = me.personas[0];
        if (first) {
          setPersona({
            personaId: first.id,
            name: first.name,
            nickname: first.nickname,
            status: first.status === "READY" ? "ready" : "draft",
          });
          setPersonaSummary(first);
        } else {
          setPersonaSummary(null);
        }
      } catch {
        // 조회 실패 시 화면은 그대로 두고 무시
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setPersona]);

  // 모든 store 초기화 (로그아웃 / 계정 삭제 공통)
  function resetStores() {
    clearAuth();
    clearPersona();
    clearSession();
  }

  // 로그아웃
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // 서버 실패와 무관하게 로컬 상태는 정리
    } finally {
      resetStores();
      router.push("/login");
    }
  }

  // 계정 삭제
  async function handleDeleteAccount() {
    if (deleting) return;
    if (!password) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as RsData<null>;

      if (!json.success) {
        // 비밀번호 불일치 추정 — code/메시지로 분기
        const code = json.error?.code ?? "";
        if (/PASSWORD|INVALID|MISMATCH|UNAUTHORIZED/i.test(code)) {
          setDeleteError("비밀번호가 일치하지 않습니다.");
        } else {
          setDeleteError("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        return;
      }

      // 삭제 성공 → store 초기화 후 로그인 페이지로
      resetStores();
      router.push("/login");
    } catch {
      setDeleteError("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-app flex flex-col gap-[26px] items-center pt-16 pb-[130px] px-6">
        <div className="flex items-center w-full px-6">
          <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">계정 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start justify-center px-5 py-[30px] rounded-sheet w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex items-center justify-center pl-3 w-full">
                <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">이메일</span>
              </div>
              <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">
                  {user?.email ?? "불러오는 중..."}
                </span>
              </div>
            </div>

            <button className="flex gap-2 items-center justify-center px-3 w-full cursor-pointer">
              <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand text-left">비밀번호 변경하기</span>
              <ArrowRightIcon color="var(--color-foreground)" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] items-start w-full">
          <div className="pl-3">
            <h2 className="text-foreground text-[18px] font-semibold leading-6">페르소나 정보</h2>
          </div>
          <div className="bg-white flex flex-col gap-[22px] items-start justify-center px-5 py-[30px] rounded-sheet w-full">
            {personaSummary ? (
              <>
                <div className="flex flex-col gap-[10px] w-full">
                  <div className="flex items-center justify-center pl-3 w-full">
                    <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">이름</span>
                  </div>
                  <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                    <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">
                      {personaSummary.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-[10px] w-full">
                  <div className="flex items-center justify-center pl-3 w-full">
                    <span className="flex-1 text-foreground text-[16px] font-semibold tracking-brand">생성일</span>
                  </div>
                  <div className="bg-surface flex items-center px-5 py-[10px] rounded-card w-full">
                    <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">
                      {formatKstDate(personaSummary.createdAt)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center pl-3 w-full">
                <span className="text-[#8a8a8a] text-[16px] font-medium tracking-brand">
                  등록된 페르소나가 없어요
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-surface-muted flex items-center justify-center px-5 py-[13px] rounded-card w-[346px] cursor-pointer"
        >
          <span className="text-muted text-[16px] font-medium tracking-brand">
            {loggingOut ? "로그아웃 중..." : "로그아웃"}
          </span>
        </button>

        <button
          onClick={() => {
            setShowDeleteSheet(true);
            setPassword("");
            setDeleteError(null);
          }}
          className="bg-surface-muted flex items-center justify-center px-5 py-[13px] rounded-card w-[346px] cursor-pointer"
        >
          <span className="text-muted text-[16px] font-medium tracking-brand">계정삭제</span>
        </button>

        <BottomNav />
      </div>

      {/* 계정 삭제 — 비밀번호 확인 시트 */}
      {showDeleteSheet && (
        <div
          className="fixed inset-0 bg-[rgba(19,19,19,0.3)] z-40 flex items-end justify-center"
          onClick={() => setShowDeleteSheet(false)}
        >
          <div
            className="w-full max-w-app bg-white flex flex-col gap-5 items-start pb-14 pt-[22px] px-[30px] rounded-tl-sheet rounded-tr-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-full">
              <div className="bg-border h-[4px] rounded-full w-8" />
            </div>

            <div className="pt-[9px] flex flex-col gap-1">
              <h2 className="text-foreground text-[18px] font-semibold tracking-brand">정말 계정을 삭제하시겠어요?</h2>
              <p className="text-subtle text-[14px] font-medium">삭제 후에는 되돌릴 수 없어요. 비밀번호를 입력해주세요.</p>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDeleteError(null);
              }}
              placeholder="비밀번호를 입력해주세요"
              className="bg-surface px-5 py-[10px] rounded-card w-full text-[16px] tracking-brand text-foreground placeholder:text-placeholder outline-none"
            />

            {deleteError && (
              <p className="text-[#c44] text-[13px] font-medium">{deleteError}</p>
            )}

            <button
              onClick={handleDeleteAccount}
              className="bg-[#c44] flex items-center justify-center px-[30px] py-[12px] rounded-card w-full cursor-pointer"
            >
              <span className="text-white text-[16px] font-medium tracking-brand">
                {deleting ? "삭제 중..." : "계정 삭제하기"}
              </span>
            </button>

            <div className="flex items-center justify-center w-full">
              <button
                onClick={() => setShowDeleteSheet(false)}
                className="text-foreground text-[14px] font-medium tracking-brand underline"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
