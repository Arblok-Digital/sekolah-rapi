const UNITS = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function belowThousand(n: number): string {
  if (n < 12) return UNITS[n];
  if (n < 20) return `${belowThousand(n - 10)} belas`;
  if (n < 100) {
    const rest = n % 10;
    return `${belowThousand(Math.floor(n / 10))} puluh${rest ? ` ${belowThousand(rest)}` : ''}`;
  }
  if (n < 200) return `seratus${n % 100 ? ` ${belowThousand(n % 100)}` : ''}`;
  const rest = n % 100;
  return `${belowThousand(Math.floor(n / 100))} ratus${rest ? ` ${belowThousand(rest)}` : ''}`;
}

function convert(n: number): string {
  if (n < 1000) return belowThousand(n);
  if (n < 2000) return `seribu${n % 1000 ? ` ${convert(n % 1000)}` : ''}`;
  if (n < 1_000_000) {
    const rest = n % 1000;
    return `${convert(Math.floor(n / 1000))} ribu${rest ? ` ${convert(rest)}` : ''}`;
  }
  if (n < 1_000_000_000) {
    const rest = n % 1_000_000;
    return `${convert(Math.floor(n / 1_000_000))} juta${rest ? ` ${convert(rest)}` : ''}`;
  }
  const rest = n % 1_000_000_000;
  return `${convert(Math.floor(n / 1_000_000_000))} miliar${rest ? ` ${convert(rest)}` : ''}`;
}

/** "350000" -> "tiga ratus lima puluh ribu rupiah" */
export function terbilang(n: number): string {
  const rounded = Math.round(Math.abs(n));
  if (rounded === 0) return 'nol rupiah';
  return `${convert(rounded)} rupiah`;
}
