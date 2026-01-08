
import { TreeStage } from '@/types';

export const TREE_STAGES: TreeStage[] = [
  {
    level: 0,
    name: 'Насіння',
    minXP: 0,
    maxXP: 99,
    image: '🌱',
  },
  {
    level: 1,
    name: 'Саджанець',
    minXP: 100,
    maxXP: 299,
    image: '🌿',
  },
  {
    level: 2,
    name: 'Молоде дерево',
    minXP: 300,
    maxXP: 599,
    image: '🌳',
  },
  {
    level: 3,
    name: 'Дорослє дерево',
    minXP: 600,
    maxXP: 999,
    image: '🌲',
  },
  {
    level: 4,
    name: 'Могутнє дерево',
    minXP: 1000,
    maxXP: Infinity,
    image: '🎄',
  },
];

export function getTreeStageByXP(xp: number): TreeStage {
  for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
    if (xp >= TREE_STAGES[i].minXP) {
      return TREE_STAGES[i];
    }
  }
  return TREE_STAGES[0];
}

export function getProgressToNextLevel(xp: number): number {
  const currentStage = getTreeStageByXP(xp);
  if (currentStage.maxXP === Infinity) {
    return 100;
  }
  const progress = ((xp - currentStage.minXP) / (currentStage.maxXP - currentStage.minXP + 1)) * 100;
  return Math.min(100, Math.max(0, progress));
}
