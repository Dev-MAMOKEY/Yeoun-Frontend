# Yeoun Frontend

고인의 디지털 페르소나를 생성하고 대화할 수 있는 모바일 웹 추모 서비스 프론트엔드입니다.

페르소나 생성(사진·음성·인터뷰 업로드)부터 실시간 음성 대화까지 전체 사용자 플로우를 담당하며, BFF 패턴으로 Spring Boot 백엔드와 통신합니다. 클라이언트는 Next.js API Routes만 호출하고, API Routes가 Spring Boot로 요청을 프록시합니다.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand 5
- Web API — MediaRecorder, Web Audio API, SSE (text/event-stream)

## System Architecture

```text
Mobile Web / PWA
        |
        v
Next.js Frontend (App Router)
- 페이지 라우팅 및 UI 렌더링
- proxy.ts — 인증 상태 기반 경로 보호 / 리다이렉트
- app/api/** — Spring Boot 프록시 BFF Routes
- Zustand — authStore / personaStore / sessionStore
        |
        | HTTP (JSON / multipart / SSE)
        v
Spring Boot Backend
- JWT 인증/인가
- 사용자/페르소나 관리
- 대화 세션 관리
- Safety Guard
- FastAPI 작업 위임
- 미디어 스트리밍
        |
        | WireGuard VPN
        v
Local AI Server
- FastAPI
- Local LLM
- Voice Cloning TTS
- Talking Head Model
```
