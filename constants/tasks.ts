
import { Task } from '@/types';

export const TASKS: Task[] = [
  {
    id: 'task_planting',
    title: 'Посадка дерева',
    description: 'Посадіть дерево або саджанець',
    xpReward: 30,
    detectionClass: 'planting_scene',
    icon: 'tree',
  },
  {
    id: 'task_watering',
    title: 'Полив рослини',
    description: 'Полийте рослину або дерево',
    xpReward: 25,
    detectionClass: 'watering_scene',
    icon: 'water',
  },
  {
    id: 'task_waste',
    title: 'Прибирання сміття',
    description: 'Зберіть та викиньте сміття',
    xpReward: 15,
    detectionClass: 'waste',
    icon: 'trash-can',
  },
  {
    id: 'task_recycling',
    title: 'Вторсировина',
    description: 'Здайте вторсировину на переробку',
    xpReward: 10,
    detectionClass: 'recyclable',
    icon: 'recycle',
  },
];
