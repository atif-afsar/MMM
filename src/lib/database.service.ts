import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { paiseToRupees, rupeesToPaise } from '@/lib/utils';
import type {
  Wedding,
  Expense,
  WeddingEvent,
  WeddingTask,
  DiscussionEntry,
  Guest,
} from '@/types';

export const DatabaseService = {
  /**
   * Fetch primary wedding for authenticated user
   */
  async getWeddingForUser(userId: string): Promise<Wedding | null> {
    if (!isSupabaseConfigured) return null;

    // Check if user is owner of a wedding
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('owner_user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wedding by owner:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        owner_user_id: data.owner_user_id,
        bride_name: data.bride_name,
        groom_name: data.groom_name,
        wedding_date: data.wedding_date || '',
        wedding_time: data.wedding_time || undefined,
        venue_name: data.venue_name || '',
        venue_address: data.venue_address || '',
        venue_map_url: data.venue_map_url || undefined,
        total_budget: paiseToRupees(data.total_budget_paise),
        cover_image_url: data.cover_image_path || undefined,
        invitation_slug: data.invitation_slug || '',
        invitation_published: data.invitation_published,
        rsvp_enabled: data.rsvp_enabled,
        welcome_message: data.invitation_message || undefined,
        theme_color: '#80182a',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }

    // Otherwise check if user is a member of any wedding
    const { data: memberRows, error: memberError } = await supabase
      .from('wedding_members')
      .select('wedding_id')
      .eq('user_id', userId)
      .limit(1);

    if (memberError || !memberRows || memberRows.length === 0) {
      return null;
    }

    const { data: memberWedding, error: memberWeddingError } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', memberRows[0].wedding_id)
      .single();

    if (memberWeddingError || !memberWedding) return null;

    return {
      id: memberWedding.id,
      owner_user_id: memberWedding.owner_user_id,
      bride_name: memberWedding.bride_name,
      groom_name: memberWedding.groom_name,
      wedding_date: memberWedding.wedding_date || '',
      wedding_time: memberWedding.wedding_time || undefined,
      venue_name: memberWedding.venue_name || '',
      venue_address: memberWedding.venue_address || '',
      venue_map_url: memberWedding.venue_map_url || undefined,
      total_budget: paiseToRupees(memberWedding.total_budget_paise),
      cover_image_url: memberWedding.cover_image_path || undefined,
      invitation_slug: memberWedding.invitation_slug || '',
      invitation_published: memberWedding.invitation_published,
      rsvp_enabled: memberWedding.rsvp_enabled,
      welcome_message: memberWedding.invitation_message || undefined,
      theme_color: '#80182a',
      created_at: memberWedding.created_at,
      updated_at: memberWedding.updated_at,
    };
  },

  /**
   * Update wedding configuration & details
   */
  async updateWedding(id: string, updates: Partial<Wedding>): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.bride_name !== undefined) payload.bride_name = updates.bride_name;
    if (updates.groom_name !== undefined) payload.groom_name = updates.groom_name;
    if (updates.wedding_date !== undefined) payload.wedding_date = updates.wedding_date || null;
    if (updates.wedding_time !== undefined) payload.wedding_time = updates.wedding_time || null;
    if (updates.venue_name !== undefined) payload.venue_name = updates.venue_name || null;
    if (updates.venue_address !== undefined) payload.venue_address = updates.venue_address || null;
    if (updates.venue_map_url !== undefined) payload.venue_map_url = updates.venue_map_url || null;
    if (updates.total_budget !== undefined) payload.total_budget_paise = rupeesToPaise(updates.total_budget);
    if (updates.cover_image_url !== undefined) payload.cover_image_path = updates.cover_image_url || null;
    if (updates.invitation_slug !== undefined) payload.invitation_slug = updates.invitation_slug || null;
    if (updates.invitation_published !== undefined) payload.invitation_published = updates.invitation_published;
    if (updates.rsvp_enabled !== undefined) payload.rsvp_enabled = updates.rsvp_enabled;
    if (updates.welcome_message !== undefined) payload.invitation_message = updates.welcome_message || null;

    const { error } = await supabase.from('weddings').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating wedding in Supabase:', error);
      return false;
    }
    return true;
  },

  /**
   * Fetch expenses for wedding
   */
  async getExpenses(weddingId: string): Promise<Expense[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('expense_date', { ascending: false });

    if (error || !data) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      wedding_id: row.wedding_id,
      title: row.title,
      description: row.description || undefined,
      category: row.category as Expense['category'],
      total_amount: paiseToRupees(row.total_amount_paise),
      amount_paid: paiseToRupees(row.amount_paid_paise),
      expense_date: row.expense_date,
      paying_side: (row.paying_side.charAt(0).toUpperCase() + row.paying_side.slice(1)) as Expense['paying_side'],
      payee_name: row.payee_name || undefined,
      due_date: row.due_date || undefined,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  /**
   * Add expense
   */
  async addExpense(
    expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Expense | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        wedding_id: expense.wedding_id,
        title: expense.title,
        description: expense.description || null,
        category: expense.category,
        total_amount_paise: rupeesToPaise(expense.total_amount),
        amount_paid_paise: rupeesToPaise(expense.amount_paid),
        expense_date: expense.expense_date,
        paying_side: expense.paying_side.toLowerCase() as 'groom' | 'bride' | 'shared',
        payee_name: expense.payee_name || null,
        due_date: expense.due_date || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding expense:', error);
      return null;
    }

    return {
      id: data.id,
      wedding_id: data.wedding_id,
      title: data.title,
      description: data.description || undefined,
      category: data.category as Expense['category'],
      total_amount: paiseToRupees(data.total_amount_paise),
      amount_paid: paiseToRupees(data.amount_paid_paise),
      expense_date: data.expense_date,
      paying_side: (data.paying_side.charAt(0).toUpperCase() + data.paying_side.slice(1)) as Expense['paying_side'],
      payee_name: data.payee_name || undefined,
      due_date: data.due_date || undefined,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Update expense
   */
  async updateExpense(id: string, updates: Partial<Expense>): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.total_amount !== undefined) payload.total_amount_paise = rupeesToPaise(updates.total_amount);
    if (updates.amount_paid !== undefined) payload.amount_paid_paise = rupeesToPaise(updates.amount_paid);
    if (updates.expense_date !== undefined) payload.expense_date = updates.expense_date;
    if (updates.paying_side !== undefined) payload.paying_side = updates.paying_side.toLowerCase();
    if (updates.payee_name !== undefined) payload.payee_name = updates.payee_name || null;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date || null;

    const { error } = await supabase.from('expenses').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating expense:', error);
      return false;
    }
    return true;
  },

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    return !error;
  },

  /**
   * Fetch events
   */
  async getEvents(weddingId: string): Promise<WeddingEvent[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('event_date', { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      wedding_id: row.wedding_id,
      name: row.name,
      event_date: row.event_date,
      start_time: row.start_time || undefined,
      venue: row.venue || undefined,
      notes: row.notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  /**
   * Add event
   */
  async addEvent(
    event: Omit<WeddingEvent, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<WeddingEvent | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('events')
      .insert({
        wedding_id: event.wedding_id,
        name: event.name,
        event_date: event.event_date,
        start_time: event.start_time || null,
        venue: event.venue || null,
        notes: event.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      wedding_id: data.wedding_id,
      name: data.name,
      event_date: data.event_date,
      start_time: data.start_time || undefined,
      venue: data.venue || undefined,
      notes: data.notes || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('events').delete().eq('id', id);
    return !error;
  },

  /**
   * Fetch tasks
   */
  async getTasks(weddingId: string): Promise<WeddingTask[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('due_date', { ascending: true });

    if (error || !data) return [];

    return data.map((row) => {
      let priority: WeddingTask['priority'] = 'Medium';
      if (row.priority.toLowerCase() === 'high') priority = 'High';
      if (row.priority.toLowerCase() === 'low') priority = 'Low';

      let status: WeddingTask['status'] = 'To Do';
      if (row.status.toLowerCase() === 'in_progress' || row.status.toLowerCase() === 'in progress') status = 'In Progress';
      if (row.status.toLowerCase() === 'completed') status = 'Completed';

      return {
        id: row.id,
        wedding_id: row.wedding_id,
        title: row.title,
        description: row.description || undefined,
        due_date: row.due_date || undefined,
        assigned_member_id: row.assigned_member_id,
        priority,
        status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
  },

  /**
   * Add task
   */
  async addTask(
    task: Omit<WeddingTask, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<WeddingTask | null> {
    if (!isSupabaseConfigured) return null;

    let dbStatus: 'todo' | 'in_progress' | 'completed' = 'todo';
    if (task.status === 'In Progress') dbStatus = 'in_progress';
    if (task.status === 'Completed') dbStatus = 'completed';

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        wedding_id: task.wedding_id,
        title: task.title,
        description: task.description || null,
        due_date: task.due_date || null,
        assigned_member_id: task.assigned_member_id || null,
        priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
        status: dbStatus,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      wedding_id: data.wedding_id,
      title: data.title,
      description: data.description || undefined,
      due_date: data.due_date || undefined,
      assigned_member_id: data.assigned_member_id,
      priority: task.priority,
      status: task.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Update task
   */
  async updateTask(id: string, updates: Partial<WeddingTask>): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date || null;
    if (updates.assigned_member_id !== undefined) payload.assigned_member_id = updates.assigned_member_id || null;
    if (updates.priority !== undefined) payload.priority = updates.priority.toLowerCase();
    if (updates.status !== undefined) {
      if (updates.status === 'In Progress') payload.status = 'in_progress';
      else if (updates.status === 'Completed') payload.status = 'completed';
      else payload.status = 'todo';
    }

    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    return !error;
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    return !error;
  },

  /**
   * Fetch discussions
   */
  async getDiscussions(weddingId: string): Promise<DiscussionEntry[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('discussions')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      wedding_id: row.wedding_id,
      author_user_id: row.author_user_id,
      author_name: 'Family Member',
      title: row.title || undefined,
      content: row.content,
      entry_type: (row.entry_type.charAt(0).toUpperCase() + row.entry_type.slice(1)) as DiscussionEntry['entry_type'],
      status: row.decision_status ? ((row.decision_status.charAt(0).toUpperCase() + row.decision_status.slice(1)) as DiscussionEntry['status']) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  /**
   * Add discussion
   */
  async addDiscussion(
    entry: Omit<DiscussionEntry, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<DiscussionEntry | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        wedding_id: entry.wedding_id,
        author_user_id: userId,
        title: entry.title || null,
        content: entry.content,
        entry_type: entry.entry_type.toLowerCase() as 'announcement' | 'discussion' | 'decision',
        decision_status: entry.status ? (entry.status.toLowerCase() as 'open' | 'decided') : null,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      wedding_id: data.wedding_id,
      author_user_id: data.author_user_id,
      author_name: entry.author_name,
      title: data.title || undefined,
      content: data.content,
      entry_type: entry.entry_type,
      status: entry.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Fetch guests
   */
  async getGuests(weddingId: string): Promise<Guest[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return (data as any[]).map((row) => {
      let side: Guest['family_side'] = 'Both';
      if (row.family_side === 'groom') side = 'Groom';
      if (row.family_side === 'bride') side = 'Bride';

      let invStatus: Guest['invitation_status'] = 'Not Sent';
      if (row.invitation_status === 'shared') invStatus = 'Shared';

      let rsvpStatus: Guest['rsvp_status'] = 'Pending';
      if (row.rsvp_status === 'attending') rsvpStatus = 'Attending';
      if (row.rsvp_status === 'not_attending') rsvpStatus = 'Not Attending';

      return {
        id: row.id,
        wedding_id: row.wedding_id,
        name: row.name,
        contact_info: row.phone || row.email || undefined,
        family_side: side,
        invitation_status: invStatus,
        rsvp_status: rsvpStatus,
        attendees_count: row.attendees_count,
        dietary_notes: row.dietary_notes || undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
  },

  /**
   * Add guest
   */
  async addGuest(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest | null> {
    if (!isSupabaseConfigured) return null;

    let dbSide: 'groom' | 'bride' | 'shared' = 'shared';
    if (guest.family_side === 'Groom') dbSide = 'groom';
    if (guest.family_side === 'Bride') dbSide = 'bride';

    const { data, error } = await supabase
      .from('guests')
      .insert({
        wedding_id: guest.wedding_id,
        name: guest.name,
        phone: guest.contact_info?.includes('@') ? null : guest.contact_info || null,
        email: guest.contact_info?.includes('@') ? guest.contact_info : null,
        family_side: dbSide,
        invitation_status: guest.invitation_status === 'Shared' ? 'shared' : 'not_sent',
        rsvp_status: guest.rsvp_status === 'Attending' ? 'attending' : guest.rsvp_status === 'Not Attending' ? 'not_attending' : 'pending',
        attendees_count: guest.attendees_count || 1,
        dietary_notes: guest.dietary_notes || null,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      ...guest,
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Delete guest
   */
  async deleteGuest(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('guests').delete().eq('id', id);
    return !error;
  },

  /**
   * Submit RSVP via isolated public RSVP submission
   */
  async submitPublicRsvp(
    weddingId: string,
    guestName: string,
    attendees: number,
    response: 'Attending' | 'Not Attending',
    notes?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase.from('rsvp_submissions').insert({
      wedding_id: weddingId,
      guest_name: guestName,
      attendees_count: attendees,
      response: response === 'Attending' ? 'attending' : 'not_attending',
      notes: notes || null,
    });

    if (error) {
      console.error('Error recording public RSVP:', error);
      return false;
    }
    return true;
  },
};
