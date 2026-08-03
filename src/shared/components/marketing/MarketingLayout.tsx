import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f4ed] text-[#17211b]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_60%_20%,_rgba(184,212,75,0.12)_0%,_transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,_rgba(23,63,53,0.035)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(23,63,53,0.035)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      <MarketingHeader />
      <main className="relative z-10">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export default MarketingLayout;
