import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { ExpensesPage } from '@/pages/expenses/ExpensesPage';
import { EventsTasksPage } from '@/pages/events/EventsTasksPage';
import { FamilyPage } from '@/pages/family/FamilyPage';
import { DiscussionsPage } from '@/pages/discussions/DiscussionsPage';
import { GuestsPage } from '@/pages/guests/GuestsPage';
import { InvitationEditorPage } from '@/pages/invitation/InvitationEditorPage';
import { PublicInvitationPage } from '@/pages/invitation/PublicInvitationPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:slug" element={<PublicInvitationPage />} />

      {/* Protected Private Wedding Suite */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="events-tasks" element={<EventsTasksPage />} />
        <Route path="family" element={<FamilyPage />} />
        <Route path="discussions" element={<DiscussionsPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="invitation-editor" element={<InvitationEditorPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
