export type FamilySide = 'Groom' | 'Bride' | 'Shared';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type DiscussionType = 'Announcement' | 'Discussion' | 'Decision';
export type DecisionStatus = 'Open' | 'Decided';
export type RsvpStatus = 'Pending' | 'Attending' | 'Not Attending';
export type InvitationStatus = 'Not Sent' | 'Shared' | 'Viewed';

export type ExpenseCategory =
  | 'Venue'
  | 'Catering'
  | 'Clothing'
  | 'Jewellery'
  | 'Photography'
  | 'Decoration'
  | 'Invitations'
  | 'Travel & Stay'
  | 'Gifts'
  | 'Makeup & Grooming'
  | 'Ceremony & Rituals'
  | 'Miscellaneous';

export interface Wedding {
  id: string;
  owner_user_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  wedding_time?: string;
  venue_name: string;
  venue_address: string;
  venue_map_url?: string;
  total_budget: number;
  cover_image_url?: string;
  invitation_slug: string;
  invitation_published: boolean;
  rsvp_enabled: boolean;
  welcome_message?: string;
  theme_color?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  wedding_id: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  total_amount: number;
  amount_paid: number;
  expense_date: string;
  paying_side: FamilySide;
  payee_name?: string;
  due_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  wedding_id: string;
  user_id?: string | null;
  name: string;
  family_side: 'Groom' | 'Bride';
  role: string;
  contact_info?: string;
  created_at: string;
}

export interface WeddingEvent {
  id: string;
  wedding_id: string;
  name: string;
  event_date: string;
  start_time?: string;
  venue?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingTask {
  id: string;
  wedding_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_member_id?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface DiscussionEntry {
  id: string;
  wedding_id: string;
  author_user_id?: string;
  author_name: string;
  title?: string;
  content: string;
  entry_type: DiscussionType;
  status?: DecisionStatus;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  contact_info?: string;
  family_side: 'Groom' | 'Bride' | 'Both';
  invitation_status: InvitationStatus;
  rsvp_status: RsvpStatus;
  attendees_count?: number;
  dietary_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
  remainingBudget: number;
  percentageSpent: number;
}
