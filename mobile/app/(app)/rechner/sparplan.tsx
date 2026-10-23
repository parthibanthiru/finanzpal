import { SavingsCalculator } from '@/components/SavingsCalculator';
import { disclosure } from '@/lib/disclosures';
import { useT } from '@/lib/i18n';

// Defaults and ranges = the sliders on sparplanrechner.html.
export default function SparplanScreen() {
  const t = useT();
  return (
    <SavingsCalculator
      intro={t.calc.savings.introSparplan}
      initial={{ def: 1000, min: 0, max: 50000, step: 500 }}
      monthly={{ def: 100, min: 0, max: 2000, step: 25 }}
      years={{ def: 15, min: 1, max: 40, step: 1 }}
      rate={{ def: 7, min: 0, max: 12, step: 0.5 }}
      disclaimer={disclosure('rechner:sparplanrechner')}
    />
  );
}
