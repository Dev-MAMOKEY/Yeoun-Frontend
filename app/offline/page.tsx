import { PageLayout } from "../components/ui/PageLayout";

// SW가 네트워크 실패를 감지했을 때 보여주는 오프라인 fallback 페이지
export default function Offline() {
  return (
    <PageLayout className="flex flex-col gap-2 items-start pt-8 pb-8 px-6">
      <div className="flex items-center w-full">
        <span className="text-[24px] font-bold text-black tracking-brand">Yeoun</span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full py-5">
        <div className="bg-white flex flex-col gap-3 items-center px-5 py-[40px] rounded-sheet w-full text-center">
          <h1 className="text-foreground text-[18px] font-semibold tracking-brand">
            오프라인 상태예요
          </h1>
          <p className="text-subtle text-[14px] font-medium leading-6">
            인터넷 연결을 확인한 뒤 다시 시도해주세요
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
