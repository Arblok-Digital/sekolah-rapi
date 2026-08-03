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
      <div className="rounded-3xl bg-gradient-to-b from-white/5 to-transparent p-px">
        <div className="rounded-[calc(1.5rem-1px)] bg-[#12102b] p-8 sm:p-12 text-center border border-white/5">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {description && <p className="mt-3 text-sm text-white/70 max-w-2xl mx-auto">{description}</p>}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white shadow-xl shadow-[#7c5cff]/25 transition-all duration-200"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
