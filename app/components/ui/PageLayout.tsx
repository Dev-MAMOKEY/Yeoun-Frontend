interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "flex flex-col pt-8 pb-8 px-6" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex justify-center">
      <div className={`w-full max-w-[402px] ${className}`}>{children}</div>
    </div>
  );
}
