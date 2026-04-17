
import { Worker, JobRequest } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'Alex Rivera',
    phone: '555-0101',
    skills: ['Plumbing', 'Electrician', 'HVAC'],
    category: 'Repairs',
    experience: '10 years of general repair work',
    location: 'Downtown Metro',
    profileImage: getImg('worker-1'),
    rating: 4.8,
    rank: 'Elite',
    completedJobs: 154,
    status: 'Approved',
    joinedAt: '2023-01-15',
    availability: 'Weekdays'
  },
  {
    id: 'w2',
    name: 'Sarah Chen',
    phone: '555-0102',
    skills: ['Landscaping', 'Tree Pruning', 'Garden Design'],
    category: 'Yard Work',
    experience: 'Certified horticulturalist',
    location: 'Westside Heights',
    profileImage: getImg('worker-2'),
    rating: 4.5,
    rank: 'Gold',
    completedJobs: 82,
    status: 'Approved',
    joinedAt: '2023-05-20',
    availability: 'Mondays and Tuesdays'
  },
  {
    id: 'w3',
    name: 'Marcus Johnson',
    phone: '555-0103',
    skills: ['Deep Cleaning', 'Organization', 'Post-Construction Cleaning'],
    category: 'House Cleaning',
    experience: 'Private estate cleaner',
    location: 'East Park',
    profileImage: getImg('worker-3'),
    rating: 4.9,
    rank: 'Platinum',
    completedJobs: 120,
    status: 'Approved',
    joinedAt: '2023-03-10',
    availability: 'Weekends'
  },
  {
    id: 'w4',
    name: 'Elena Rodriguez',
    phone: '555-0104',
    skills: ['Childcare', 'Early Education', 'CPR Certified'],
    category: 'Babysitting',
    experience: 'Former preschool teacher',
    location: 'North Hills',
    profileImage: getImg('worker-4'),
    rating: 4.7,
    rank: 'Silver',
    completedJobs: 45,
    status: 'Approved',
    joinedAt: '2024-02-01',
    availability: 'Evenings'
  }
];

export const MOCK_JOBS: JobRequest[] = [
  {
    id: 'j1',
    customerName: 'James Wilson',
    phone: '555-1001',
    location: '123 Maple St',
    category: 'Yard Work',
    description: 'Mowing the front and back lawn, trimming hedges.',
    budget: 80,
    dateTime: '2024-06-15T10:00',
    status: 'Pending',
    createdAt: '2024-06-10T09:00'
  },
  {
    id: 'j2',
    customerName: 'Linda Smith',
    phone: '555-1002',
    location: '456 Oak Ave',
    category: 'Repairs',
    description: 'Leaking kitchen faucet needs fixing.',
    budget: 120,
    dateTime: '2024-06-16T14:30',
    status: 'Assigned',
    assignedWorkerId: 'w1',
    createdAt: '2024-06-11T11:00'
  }
];
