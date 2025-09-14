import { Award, Star, Zap, Shield } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  Icon: React.ElementType;
  condition: (stats: { points: number; totalScans: number }) => boolean;
}

export const achievementsList: Achievement[] = [
  {
    id: 'first_scan',
    name: 'Premier Pas',
    description: 'Vous avez scanné votre toute première bouteille !',
    Icon: Star,
    condition: ({ totalScans }) => totalScans >= 1,
  },
  {
    id: 'novice_recycler',
    name: 'Recycleur Novice',
    description: 'Vous avez recyclé 10 bouteilles.',
    Icon: Award,
    condition: ({ totalScans }) => totalScans >= 10,
  },
  {
    id: 'point_collector',
    name: 'Collectionneur de Points',
    description: 'Vous avez gagné plus de 100 points.',
    Icon: Zap,
    condition: ({ points }) => points >= 100,
  },
  {
    id: 'dedicated_recycler',
    name: 'Recycleur Dédié',
    description: 'Vous avez recyclé 50 bouteilles. Continuez comme ça !',
    Icon: Shield,
    condition: ({ totalScans }) => totalScans >= 50,
  },
  {
    id: 'points_hoarder',
    name: 'Thésauriseur de Points',
    description: 'Vous avez accumulé 500 points !',
    Icon: Zap,
    condition: ({ points }) => points >= 500,
  },
];