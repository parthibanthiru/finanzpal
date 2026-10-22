import { SavingsCalculator } from '@/components/SavingsCalculator';
import { disclosure } from '@/lib/disclosures';

// Defaults and ranges = the sliders on zinseszinsrechner.html (same engine as the Sparplanrechner).
export default function ZinseszinsScreen() {
  return (
    <SavingsCalculator
      intro="Wie stark wächst dein Geld, wenn die Zinsen selbst wieder Zinsen bringen?"
      initial={{ def: 10000, min: 0, max: 100000, step: 500 }}
      monthly={{ def: 0, min: 0, max: 2000, step: 25 }}
      years={{ def: 10, min: 1, max: 40, step: 1 }}
      rate={{ def: 4, min: 0, max: 12, step: 0.5 }}
      disclaimer={disclosure('rechner:zinseszinsrechner')}
    />
  );
}
