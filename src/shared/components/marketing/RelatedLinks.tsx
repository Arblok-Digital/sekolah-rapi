import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface RelatedLinkItem {
  href: string;
  label: string;
  description?: string;
}

interface RelatedLinksProps {
  title?: string;
  links: Array<RelatedLinkItem>;
}

export function RelatedLinks({ title = 'Baca juga / Lihat juga', links }: RelatedLinksProps) {
  if (links.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-[#12102b] rounded-2xl border border-white/5 p-5 hover:border-[#7c5cff]/40 hover:bg-white/5 transition-all duration-200"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm text-white group-hover:text-[#7c5cff] transition-colors">
                {link.label}
              </span>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#7c5cff] transition-colors shrink-0" />
            </span>
            {link.description && (
              <span className="mt-2 block text-sm text-white/70">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
