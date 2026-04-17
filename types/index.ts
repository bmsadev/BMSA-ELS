export interface Member {
  id: string;
  name: string;
  email: string;
  committee: string;
  role: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  created_at?: string;
}

export interface HistoryEntry {
  id: string;
  subject: string;
  audience_groups: string[];
  recipient_count: number;
  status: 'queued' | 'sent' | 'error';
  brevo_message_id?: string;
  sent_at?: string;
}

export interface ScheduledEmail {
  id: string;
  subject: string;
  html_body: string;
  audience_groups: string[];
  scheduled_at: string;
  status: 'pending' | 'sent' | 'cancelled';
  created_at?: string;
}

export interface Settings {
  id?: number;
  sender_name: string;
  sender_email: string;
  updated_at?: string;
}

export type AudienceGroup =
  | 'SCOPH' | 'SCORA' | 'SCORP' | 'SCOME' | 'SCOPE' | 'SCORE'
  | 'RSD' | 'PSD' | 'PNSD' | 'CBSD' | 'FSD' | 'EB' | 'MEMBERS_ONLY' | 'ALL';

export const AUDIENCE_GROUPS: AudienceGroup[] = [
  'SCOPH', 'SCORA', 'SCORP', 'SCOME', 'SCOPE', 'SCORE',
  'RSD', 'PSD', 'PNSD', 'CBSD', 'FSD', 'EB', 'MEMBERS_ONLY', 'ALL',
];
