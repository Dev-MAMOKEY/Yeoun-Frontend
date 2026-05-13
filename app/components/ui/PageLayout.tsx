interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "flex flex-col pt-8 pb-8 px-6" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className={`w-full max-w-app ${className}`}>{children}</div>
    </div>
  );
}
