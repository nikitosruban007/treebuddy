import AsyncStorage from '@react-native-async-storage/async-storage';
import { TASKS } from '@/constants/tasks';
import { CompletedTask, Task } from '@/types';
import { getTodayKey, toDate, isSameDateKey } from '@/utils/date';

export type DailyTaskInstance = {
  taskId: string;
  requiredCount: number;
  xpPerCompletion: number;
  labelKey: 'easy' | 'medium' | 'hard';
  conditionText: string;
};

const DAILY_PLAN_PREFIX = '@treebuddy_daily_plan_v1:';

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getTask(taskId: string): Task {
  for (const t of TASKS) {
    if (t.id === taskId) return t;
  }
  throw new Error(`Unknown taskId: ${taskId}`);
}

export async function getDailyPlan(params: {
  dateKey?: string;
  userSeed: string;
  language: 'ua' | 'en';
}): Promise<DailyTaskInstance[]> {
  const dateKey = params.dateKey ?? getTodayKey();
  const storageKey = `${DAILY_PLAN_PREFIX}${params.userSeed}:${dateKey}:${params.language}`;

  const cached = await AsyncStorage.getItem(storageKey);
  if (cached) {
    try {
      return JSON.parse(cached) as DailyTaskInstance[];
    } catch {
      // fall through
    }
  }

  // MVP plan: 3 tasks/day with clear conditions and varied difficulty.
  // We keep it deterministic per user+day.
  const h = hashString(`${params.userSeed}:${dateKey}`);
  const hardTaskId = h % 2 === 0 ? 'task_planting' : 'task_watering';

  const plan: DailyTaskInstance[] = [
    {
      taskId: 'task_recycling',
      requiredCount: 1,
      xpPerCompletion: getTask('task_recycling').xpReward,
      labelKey: 'easy',
      conditionText: params.language === 'ua'
        ? 'Знайди й відсортуй вторсировину (1 раз)'
        : 'Find and sort recyclables (1 time)',
    },
    {
      taskId: 'task_waste',
      requiredCount: 3,
      xpPerCompletion: 5,
      labelKey: 'medium',
      conditionText: params.language === 'ua'
        ? 'Прибери 3 об’єкти сміття (3 підтвердження)'
        : 'Pick up 3 pieces of litter (3 verifications)',
    },
    {
      taskId: hardTaskId,
      requiredCount: 1,
      xpPerCompletion: getTask(hardTaskId).xpReward,
      labelKey: 'hard',
      conditionText:
        params.language === 'ua'
          ? (hardTaskId === 'task_planting'
              ? 'Посади дерево або саджанець (1 раз)'
              : 'Полий будь-яку рослину (1 раз)')
          : (hardTaskId === 'task_planting'
              ? 'Plant a tree or a sapling (1 time)'
              : 'Water any plant (1 time)'),
    },
  ];

  await AsyncStorage.setItem(storageKey, JSON.stringify(plan));
  return plan;
}

export function getDailyProgress(params: {
  completedTasks: CompletedTask[];
  dateKey?: string;
  taskId: string;
}): number {
  const dateKey = params.dateKey ?? getTodayKey();

  return (params.completedTasks || []).filter((t) => {
    if (t.taskId !== params.taskId) return false;
    const d = toDate(t.completedAt);
    if (!d) return false;
    return isSameDateKey(d, dateKey);
  }).length;
}

export function getDailySummary(params: {
  plan: DailyTaskInstance[];
  completedTasks: CompletedTask[];
  dateKey?: string;
}): { doneTasks: number; totalTasks: number; totalCompletions: number } {
  const dateKey = params.dateKey ?? getTodayKey();

  let doneTasks = 0;
  let totalCompletions = 0;

  for (const item of params.plan) {
    const progress = getDailyProgress({
      completedTasks: params.completedTasks,
      dateKey,
      taskId: item.taskId,
    });
    totalCompletions += progress;
    if (progress >= item.requiredCount) doneTasks += 1;
  }

  return { doneTasks, totalTasks: params.plan.length, totalCompletions };
}
