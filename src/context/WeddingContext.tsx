import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/lib/database.service';
import type {
  Wedding,
  Expense,
  WeddingEvent,
  WeddingTask,
  FamilyMember,
  DiscussionEntry,
  Guest,
  BudgetStats,
} from '@/types';

interface WeddingContextType {
  wedding: Wedding | null;
  expenses: Expense[];
  events: WeddingEvent[];
  tasks: WeddingTask[];
  familyMembers: FamilyMember[];
  discussions: DiscussionEntry[];
  guests: Guest[];
  budgetStats: BudgetStats;
  
  // Actions
  updateWedding: (updated: Partial<Wedding>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addEvent: (event: Omit<WeddingEvent, 'id' | 'created_at' | 'updated_at'>) => void;
  updateEvent: (id: string, event: Partial<WeddingEvent>) => void;
  deleteEvent: (id: string) => void;
  addTask: (task: Omit<WeddingTask, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: string, task: Partial<WeddingTask>) => void;
  deleteTask: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'created_at'>) => void;
  deleteFamilyMember: (id: string) => void;
  addDiscussion: (entry: Omit<DiscussionEntry, 'id' | 'created_at' | 'updated_at'>) => void;
  updateDiscussionStatus: (id: string, status: 'Open' | 'Decided') => void;
  addGuest: (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  submitPublicRsvp: (guestName: string, attendees: number, response: 'Attending' | 'Not Attending', notes?: string) => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

// Initial starter mock for immediate visual preview & validation
const INITIAL_WEDDING: Wedding = {
  id: 'wed-001',
  owner_user_id: '00000000-0000-0000-0000-000000000001',
  bride_name: 'Ananya Sharma',
  groom_name: 'Rohan Verma',
  wedding_date: '2026-12-18',
  wedding_time: '19:00',
  venue_name: 'The Leela Palace',
  venue_address: 'Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110023',
  venue_map_url: 'https://maps.google.com',
  total_budget: 3500000, // 35 Lakhs INR
  invitation_slug: 'ananya-and-rohan',
  invitation_published: true,
  rsvp_enabled: true,
  welcome_message: 'With joyous hearts, the Sharma and Verma families invite you to celebrate the union of Ananya & Rohan.',
  theme_color: '#80182a',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    wedding_id: 'wed-001',
    title: 'Grand Ballroom & Lawn Booking',
    description: 'Advance payment for main wedding day venue',
    category: 'Venue',
    total_amount: 1200000,
    amount_paid: 800000,
    expense_date: '2026-09-10',
    paying_side: 'Shared',
    payee_name: 'The Leela Palace Events',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    wedding_id: 'wed-001',
    title: 'Royal Mughal Feast Catering',
    description: 'Dinner for 450 guests including live counters',
    category: 'Catering',
    total_amount: 850000,
    amount_paid: 300000,
    expense_date: '2026-09-18',
    paying_side: 'Shared',
    payee_name: 'Saffron Caterers Delhi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    wedding_id: 'wed-001',
    title: 'Bridal Designer Lehenga',
    description: 'Sabyasachi bridal couture for reception & ceremony',
    category: 'Clothing',
    total_amount: 450000,
    amount_paid: 450000,
    expense_date: '2026-09-22',
    paying_side: 'Bride',
    payee_name: 'Heritage Bridal Studio',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    wedding_id: 'wed-001',
    title: 'Cinematic Photography & Drone Coverage',
    description: '3-day coverage (Mehendi, Sangeet, Wedding, Reception)',
    category: 'Photography',
    total_amount: 320000,
    amount_paid: 100000,
    expense_date: '2026-09-25',
    paying_side: 'Groom',
    payee_name: 'Stories by Joseph Studio',
    due_date: '2026-11-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-5',
    wedding_id: 'wed-001',
    title: 'Floral Marigold & Jasmine Decor',
    description: 'Stage, mandap, and entryway floral styling',
    category: 'Decoration',
    total_amount: 280000,
    amount_paid: 0,
    expense_date: '2026-10-01',
    paying_side: 'Shared',
    payee_name: 'Petals & Blooms Artistry',
    due_date: '2026-11-20',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_EVENTS: WeddingEvent[] = [
  {
    id: 'evt-1',
    wedding_id: 'wed-001',
    name: 'Mehendi & Haldi Fiesta',
    event_date: '2026-12-16',
    start_time: '11:00',
    venue: 'Terrace Garden, ITC Maurya',
    notes: 'Yellow and green traditional dress code. Folk singers arriving at 12:30 PM.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    wedding_id: 'wed-001',
    name: 'Sangeet & Cocktail Night',
    event_date: '2026-12-17',
    start_time: '19:30',
    venue: 'Crystal Ballroom, The Grand',
    notes: 'Choreographed family dance performances followed by DJ set.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    wedding_id: 'wed-001',
    name: 'Wedding Ceremony & Pheras',
    event_date: '2026-12-18',
    start_time: '18:30',
    venue: 'Royal Lawn, The Leela Palace',
    notes: 'Baraat procession begins at 6:30 PM sharp.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    wedding_id: 'wed-001',
    name: 'Grand Reception Dinner',
    event_date: '2026-12-19',
    start_time: '20:00',
    venue: 'Grand Pavilion, The Leela Palace',
    notes: 'Welcome toast and feast for all distinguished guests.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TASKS: WeddingTask[] = [
  {
    id: 'tsk-1',
    wedding_id: 'wed-001',
    title: 'Finalize dessert menu & live kulfi counter',
    description: 'Coordinate tasting session with head chef',
    due_date: '2026-11-05',
    priority: 'High',
    status: 'In Progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tsk-2',
    wedding_id: 'wed-001',
    title: 'Confirm hotel room blocks for out-of-town guests',
    description: '30 rooms reserved at special wedding tariff',
    due_date: '2026-10-25',
    priority: 'High',
    status: 'Completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tsk-3',
    wedding_id: 'wed-001',
    title: 'Send digital invitation link via WhatsApp',
    description: 'Broadcast link to family and close circles',
    due_date: '2026-11-10',
    priority: 'Medium',
    status: 'To Do',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tsk-4',
    wedding_id: 'wed-001',
    title: 'Collect vintage car for Groom Baraat entry',
    description: 'Confirm booking with Classic Wheels Delhi',
    due_date: '2026-12-01',
    priority: 'Low',
    status: 'To Do',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'fam-1',
    wedding_id: 'wed-001',
    name: 'Rajesh Sharma',
    family_side: 'Bride',
    role: "Father of Bride",
    contact_info: '+91 98110 12345',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fam-2',
    wedding_id: 'wed-001',
    name: 'Sunita Sharma',
    family_side: 'Bride',
    role: "Mother of Bride",
    contact_info: '+91 98110 54321',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fam-3',
    wedding_id: 'wed-001',
    name: 'Vikram Verma',
    family_side: 'Groom',
    role: "Father of Groom",
    contact_info: '+91 98220 98765',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fam-4',
    wedding_id: 'wed-001',
    name: 'Kavita Verma',
    family_side: 'Groom',
    role: "Mother of Groom",
    contact_info: '+91 98220 56789',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_DISCUSSIONS: DiscussionEntry[] = [
  {
    id: 'disc-1',
    wedding_id: 'wed-001',
    author_name: 'Rajesh Sharma',
    title: 'Room Allotment List Ready',
    content: 'The room keys list for relatives arriving from Mumbai and Bengaluru has been finalized with hotel concierge.',
    entry_type: 'Announcement',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'disc-2',
    wedding_id: 'wed-001',
    author_name: 'Rohan Verma',
    title: 'Sangeet Song Playlist Selection',
    content: 'Please upload your favourite retro Hindi tracks by this Sunday so the choreographers can mix the medley.',
    entry_type: 'Discussion',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'disc-3',
    wedding_id: 'wed-001',
    author_name: 'Ananya Sharma',
    title: 'Baraat Welcome Welcome Gift Bags',
    content: 'We agreed to proceed with Kashmiri silk shawls and artisanal dry fruit boxes for the baraat welcome.',
    entry_type: 'Decision',
    status: 'Decided',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_GUESTS: Guest[] = [
  {
    id: 'gst-1',
    wedding_id: 'wed-001',
    name: 'Amitabh & Jaya Bachchan',
    contact_info: 'amitabh@family.in',
    family_side: 'Both',
    invitation_status: 'Shared',
    rsvp_status: 'Attending',
    attendees_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gst-2',
    wedding_id: 'wed-001',
    name: 'Dr. Suresh & Meena Kapoor',
    contact_info: '+91 99990 11223',
    family_side: 'Bride',
    invitation_status: 'Shared',
    rsvp_status: 'Attending',
    attendees_count: 3,
    dietary_notes: 'Pure vegetarian / Jain food preferred',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gst-3',
    wedding_id: 'wed-001',
    name: 'Pooja Singhania',
    contact_info: '+91 98100 44556',
    family_side: 'Groom',
    invitation_status: 'Shared',
    rsvp_status: 'Pending',
    attendees_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gst-4',
    wedding_id: 'wed-001',
    name: 'Ramesh & Pratibha Joshi',
    contact_info: '+91 98450 77889',
    family_side: 'Groom',
    invitation_status: 'Not Sent',
    rsvp_status: 'Pending',
    attendees_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode, isConfigured } = useAuth();

  const [wedding, setWedding] = useState<Wedding | null>(INITIAL_WEDDING);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [events, setEvents] = useState<WeddingEvent[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<WeddingTask[]>(INITIAL_TASKS);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [discussions, setDiscussions] = useState<DiscussionEntry[]>(INITIAL_DISCUSSIONS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);

  // Sync with Supabase when authenticated and configured
  useEffect(() => {
    if (!isConfigured || isDemoMode || !user) {
      setWedding(INITIAL_WEDDING);
      setExpenses(INITIAL_EXPENSES);
      setEvents(INITIAL_EVENTS);
      setTasks(INITIAL_TASKS);
      setFamilyMembers(INITIAL_FAMILY);
      setDiscussions(INITIAL_DISCUSSIONS);
      setGuests(INITIAL_GUESTS);
      return;
    }

    let isMounted = true;
    async function loadSupabaseData() {
      try {
        if (!user) return;
        const liveWedding = await DatabaseService.getWeddingForUser(user.id);
        if (!isMounted) return;
        if (liveWedding) {
          setWedding(liveWedding);
          const [liveExpenses, liveEvents, liveTasks, liveDiscussions, liveGuests] = await Promise.all([
            DatabaseService.getExpenses(liveWedding.id),
            DatabaseService.getEvents(liveWedding.id),
            DatabaseService.getTasks(liveWedding.id),
            DatabaseService.getDiscussions(liveWedding.id),
            DatabaseService.getGuests(liveWedding.id),
          ]);
          if (!isMounted) return;
          setExpenses(liveExpenses);
          setEvents(liveEvents);
          setTasks(liveTasks);
          setDiscussions(liveDiscussions);
          setGuests(liveGuests);
        }
      } catch (err) {
        console.error('Failed to load wedding data from Supabase:', err);
      }
    }

    loadSupabaseData();
    return () => {
      isMounted = false;
    };
  }, [user, isDemoMode, isConfigured]);

  // Derive budget statistics strictly as defined in PRD Section 5.2
  // - Total spent: Sum of amounts actually paid
  // - Pending amount: Sum of unpaid balances on expenses
  // - Remaining budget: Total budget minus total paid/spent
  const budgetStats: BudgetStats = useMemo(() => {
    const totalBudget = wedding?.total_budget ?? 0;
    
    let totalSpent = 0;
    let totalPending = 0;

    expenses.forEach((exp) => {
      const paid = Math.min(exp.amount_paid, exp.total_amount);
      totalSpent += paid;
      totalPending += Math.max(0, exp.total_amount - paid);
    });

    const remainingBudget = totalBudget - totalSpent;
    const percentageSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    return {
      totalBudget,
      totalSpent,
      totalPending,
      remainingBudget,
      percentageSpent,
    };
  }, [wedding?.total_budget, expenses]);

  const updateWedding = (updated: Partial<Wedding>) => {
    setWedding((prev) => (prev ? { ...prev, ...updated, updated_at: new Date().toISOString() } : null));
    if (wedding && isConfigured && !isDemoMode) {
      DatabaseService.updateWedding(wedding.id, updated).catch((err) =>
        console.error('Failed to persist wedding update:', err)
      );
    }
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `exp-${Date.now()}`;
    const newExp: Expense = {
      ...expense,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (user && isConfigured && !isDemoMode) {
      DatabaseService.addExpense(expense, user.id)
        .then((saved) => {
          if (saved) {
            setExpenses((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
          }
        })
        .catch((err) => console.error('Failed to persist expense:', err));
    }
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updated, updated_at: new Date().toISOString() } : exp))
    );
    if (isConfigured && !isDemoMode) {
      DatabaseService.updateExpense(id, updated).catch((err) =>
        console.error('Failed to persist expense update:', err)
      );
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    if (isConfigured && !isDemoMode) {
      DatabaseService.deleteExpense(id).catch((err) =>
        console.error('Failed to persist expense deletion:', err)
      );
    }
  };

  const addEvent = (evt: Omit<WeddingEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `evt-${Date.now()}`;
    const newEvt: WeddingEvent = {
      ...evt,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvt].sort((a, b) => a.event_date.localeCompare(b.event_date)));

    if (user && isConfigured && !isDemoMode) {
      DatabaseService.addEvent(evt, user.id)
        .then((saved) => {
          if (saved) {
            setEvents((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
          }
        })
        .catch((err) => console.error('Failed to persist event:', err));
    }
  };

  const updateEvent = (id: string, updated: Partial<WeddingEvent>) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updated, updated_at: new Date().toISOString() } : evt))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    if (isConfigured && !isDemoMode) {
      DatabaseService.deleteEvent(id).catch((err) =>
        console.error('Failed to persist event deletion:', err)
      );
    }
  };

  const addTask = (tsk: Omit<WeddingTask, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `tsk-${Date.now()}`;
    const newTask: WeddingTask = {
      ...tsk,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    if (user && isConfigured && !isDemoMode) {
      DatabaseService.addTask(tsk, user.id)
        .then((saved) => {
          if (saved) {
            setTasks((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
          }
        })
        .catch((err) => console.error('Failed to persist task:', err));
    }
  };

  const updateTask = (id: string, updated: Partial<WeddingTask>) => {
    setTasks((prev) =>
      prev.map((tsk) => (tsk.id === id ? { ...tsk, ...updated, updated_at: new Date().toISOString() } : tsk))
    );
    if (isConfigured && !isDemoMode) {
      DatabaseService.updateTask(id, updated).catch((err) =>
        console.error('Failed to persist task update:', err)
      );
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((tsk) => tsk.id !== id));
    if (isConfigured && !isDemoMode) {
      DatabaseService.deleteTask(id).catch((err) =>
        console.error('Failed to persist task deletion:', err)
      );
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'created_at'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `fam-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addDiscussion = (entry: Omit<DiscussionEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `disc-${Date.now()}`;
    const newEntry: DiscussionEntry = {
      ...entry,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDiscussions((prev) => [newEntry, ...prev]);

    if (user && isConfigured && !isDemoMode) {
      DatabaseService.addDiscussion(entry, user.id)
        .then((saved) => {
          if (saved) {
            setDiscussions((prev) => prev.map((d) => (d.id === tempId ? saved : d)));
          }
        })
        .catch((err) => console.error('Failed to persist discussion:', err));
    }
  };

  const updateDiscussionStatus = (id: string, status: 'Open' | 'Decided') => {
    setDiscussions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status, updated_at: new Date().toISOString() } : d))
    );
  };

  const addGuest = (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `gst-${Date.now()}`;
    const newGuest: Guest = {
      ...guest,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGuests((prev) => [newGuest, ...prev]);

    if (isConfigured && !isDemoMode) {
      DatabaseService.addGuest(guest)
        .then((saved) => {
          if (saved) {
            setGuests((prev) => prev.map((g) => (g.id === tempId ? saved : g)));
          }
        })
        .catch((err) => console.error('Failed to persist guest:', err));
    }
  };

  const updateGuest = (id: string, updated: Partial<Guest>) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated, updated_at: new Date().toISOString() } : g))
    );
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    if (isConfigured && !isDemoMode) {
      DatabaseService.deleteGuest(id).catch((err) =>
        console.error('Failed to persist guest deletion:', err)
      );
    }
  };

  const submitPublicRsvp = (
    guestName: string,
    attendees: number,
    response: 'Attending' | 'Not Attending',
    notes?: string
  ) => {
    const newGuest: Guest = {
      id: `rsvp-${Date.now()}`,
      wedding_id: wedding?.id || 'wed-001',
      name: guestName,
      family_side: 'Both',
      invitation_status: 'Viewed',
      rsvp_status: response,
      attendees_count: attendees,
      dietary_notes: notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGuests((prev) => [newGuest, ...prev]);

    if (wedding && isConfigured) {
      DatabaseService.submitPublicRsvp(wedding.id, guestName, attendees, response, notes).catch((err) =>
        console.error('Failed to record public RSVP:', err)
      );
    }
  };

  return (
    <WeddingContext.Provider
      value={{
        wedding,
        expenses,
        events,
        tasks,
        familyMembers,
        discussions,
        guests,
        budgetStats,
        updateWedding,
        addExpense,
        updateExpense,
        deleteExpense,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        addFamilyMember,
        deleteFamilyMember,
        addDiscussion,
        updateDiscussionStatus,
        addGuest,
        updateGuest,
        deleteGuest,
        submitPublicRsvp,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
