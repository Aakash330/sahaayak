/**
 * Typed Data Models
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface DailyBriefing {
  message: string;
  priorities: Task[];
}

export type Priority = 'high' | 'medium' | 'low';
export type Status = 'pending' | 'completed' | 'dismissed';

export interface DailyItem {
  id: string;
  title: string;
  category: string;
  reason: string;
  suggestedAction: string;
  priority: Priority;
  dueDate?: string;
  status: Status;
}
