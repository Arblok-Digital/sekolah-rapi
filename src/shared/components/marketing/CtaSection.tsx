import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaSectionProps {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaSection({
  title,
  description,
  primaryLabel = 'Coba Gratis',
  primaryHref = '/register',
  secondaryLabel = 'Lihat Harga',
  secondaryHref = '/pricing',
}: CtaSectionProps) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="rounded-3xl bg-[#b8d44b] pb-2">
        <div className="rounded-3xl bg-[#173f35] p-8 sm:p-12 text-center text-white border border-[#17211b]/10">
          <h2 className="text-2xl sm:text-3xl font-black">{title}</h2>
          {description && <p className="mt-3 text-sm text-white/75 max-w-2xl mx-auto">{description}</p>}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-black bg-[#b8d44b] hover:bg-[#dfe99a] text-[#17211b] transition-all duration-200"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-bold bg-white/10 text-white hover:bg-white/20 border border-white/25 transition-all duration-200"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
