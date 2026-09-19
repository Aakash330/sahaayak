import { DailyItem } from '../../models';

export const mockDailyItems: DailyItem[] = [
  {
    id: 'item-1',
    title: 'Electricity bill',
    category: 'Bills',
    reason: 'Due tomorrow. Amount ₹1,240.',
    suggestedAction: 'Review and pay',
    priority: 'high',
    dueDate: 'Tomorrow',
    status: 'pending'
  },
  {
    id: 'item-2',
    title: 'Doctor appointment',
    category: 'Health',
    reason: 'Today at 4:00 PM with Dr. Sharma.',
    suggestedAction: 'Leave by 3:15 PM',
    priority: 'high',
    dueDate: 'Today, 4:00 PM',
    status: 'pending'
  },
  {
    id: 'item-3',
    title: 'Bank message',
    category: 'Security',
    reason: 'Needs attention regarding suspicious activity.',
    suggestedAction: 'Understand this message',
    priority: 'medium',
    status: 'pending'
  }
];
