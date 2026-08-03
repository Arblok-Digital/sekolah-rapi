import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0818] text-white overflow-x-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_60%_20%,_rgba(124,92,255,0.06)_0%,_transparent_60%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      <MarketingHeader />
      <main className="relative z-10">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export default MarketingLayout;
