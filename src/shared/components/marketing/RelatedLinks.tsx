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
            className="group bg-white/70 rounded-2xl border border-[#17211b]/10 p-5 hover:border-[#26735d]/40 hover:bg-white transition-all duration-200"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm text-[#17211b] group-hover:text-[#26735d] transition-colors">
                {link.label}
              </span>
              <ArrowRight className="w-4 h-4 text-[#6f7972] group-hover:text-[#26735d] transition-colors shrink-0" />
            </span>
            {link.description && (
              <span className="mt-2 block text-sm text-[#59645d]">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
