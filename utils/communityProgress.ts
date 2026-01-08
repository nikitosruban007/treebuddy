import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_COMMUNITY_KEY = '@treebuddy_demo_community_v1';

export type CommunityProgress = {
  totalXP: number;
  totalActions: number;
};

export async function getDemoCommunityProgress(): Promise<CommunityProgress> {
  const raw = await AsyncStorage.getItem(DEMO_COMMUNITY_KEY);
  if (!raw) {
    const initial: CommunityProgress = { totalXP: 0, totalActions: 0 };
    await AsyncStorage.setItem(DEMO_COMMUNITY_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as CommunityProgress;
    return {
      totalXP: Number(parsed.totalXP || 0),
      totalActions: Number(parsed.totalActions || 0),
    };
  } catch {
    const initial: CommunityProgress = { totalXP: 0, totalActions: 0 };
    await AsyncStorage.setItem(DEMO_COMMUNITY_KEY, JSON.stringify(initial));
    return initial;
  }
}

export async function incrementDemoCommunityProgress(xpToAdd: number): Promise<CommunityProgress> {
  const current = await getDemoCommunityProgress();
  const next: CommunityProgress = {
    totalXP: current.totalXP + xpToAdd,
    totalActions: current.totalActions + 1,
  };
  await AsyncStorage.setItem(DEMO_COMMUNITY_KEY, JSON.stringify(next));
  return next;
}
