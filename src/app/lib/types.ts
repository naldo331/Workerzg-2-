
export type GuildRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Elite';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  category: string;
  experience: string;
  location: string;
  profileImage: string;
  rating: number;
  rank: GuildRank;
  completedJobs: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  joinedAt: string;
  availability: string;
}

export interface JobRequest {
  id: string;
  customerName: string;
  phone: string;
  location: string;
  category: string;
  description: string;
  budget: number;
  dateTime: string;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  assignedWorkerId?: string;
  createdAt: string;
}

export const CATEGORIES = [
  'Yard Work',
  'House Cleaning',
  'Construction',
  'Repairs',
  'Babysitting',
  'Moving Help',
  'Entertainment'
];

export const RANKS: GuildRank[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Elite'];
