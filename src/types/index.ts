export interface Profile {
  id: string;
  username: string;
  partner_id: string | null;
  pet_id: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  name: string;
  level: number;
  xp: number;
  kinship: number;
  energy: number;
  aggressiveness: number;
  brain_size: number;
  spookiness: number;
  eye_shape: number;
  eye_color: number;
  hunger: number;
  cleanliness: number;
  evolution_stage: number;
  spirit_points: number;
  created_at: string;
  last_feed_at?: string | null;
  last_clean_at?: string | null;
  last_pet_at?: string | null;
  last_play_at?: string | null;
  last_care_at?: string | null;
  care_streak?: number;
}

export interface PendingJointPlay {
  id: string;
  initiator_id: string;
  initiator_username: string;
  created_at: string;
  expires_at: string;
  is_initiator: boolean;
  can_confirm: boolean;
}

export interface PetRitualState {
  last_feed_at: string | null;
  last_clean_at: string | null;
  last_pet_at: string | null;
  last_play_at: string | null;
  last_care_at: string | null;
  care_streak: number;
  daily_xp_earned: number;
  daily_xp_cap: number;
  energy?: number;
  energy_regen_per_hour?: number;
  pending_joint_play: PendingJointPlay | null;
}

export type PetMood = 'happy' | 'idle' | 'hungry' | 'sleepy' | 'lonely' | 'yawning';

export interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_username: string;
  proposed_pet_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: Pick<Profile, 'username'>;
}

export interface CareLog {
  id: string;
  pet_id: string;
  user_id: string;
  action_type: 'feed' | 'pet' | 'clean' | 'play';
  stat_gained: string;
  created_at: string;
  profile?: Profile;
}

export type CareAction = 'feed' | 'pet' | 'clean' | 'play';

export type PetScreenTab = 'home' | 'leaderboard' | 'friends';

export interface LeaderboardEntry {
  rank: number;
  pet_id: string;
  pet_name: string;
  level: number;
  xp: number;
  care_streak: number;
  spirit_points: number;
  score: number;
  is_mine: boolean;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  my_pet_id: string | null;
}

export interface PetFriendSummary {
  pet_id: string;
  pet_name: string;
  level: number;
  care_streak: number;
  score: number;
}

export interface FriendRequestInfo {
  id: string;
  target_pet_id?: string;
  target_pet_name?: string;
  requester_pet_id?: string;
  requester_pet_name?: string;
  status: 'awaiting_sender' | 'awaiting_receiver' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  sender_approvals: string[];
  receiver_approvals: string[];
  owners: string[];
  my_approved?: boolean;
  needs_my_sender_approval?: boolean;
  needs_my_receiver_approval?: boolean;
  expires_at: string;
}

export interface PetSocialState {
  friends: PetFriendSummary[];
  outgoing_request: FriendRequestInfo | null;
  incoming_request: FriendRequestInfo | null;
  pending_friend_play: PendingFriendPlay | null;
  owner_ids: string[];
}

export interface PendingFriendPlay {
  id: string;
  pet_a_id: string;
  pet_b_id: string;
  pet_a_name: string;
  pet_b_name: string;
  friend_pet_id: string;
  friend_pet_name: string;
  initiated_by: string;
  approvals: string[];
  approval_count: number;
  required_approvals: number;
  needs_my_approval: boolean;
  i_initiated: boolean;
  expires_at: string;
}

export const MOCHI_PHRASES = [
  'uww',
  'uffu puffu',
  'mimi~',
  'graff',
  'poko pipo',
] as const;

export const MOCHI_HUNGRY_PHRASES = [
  'grrr... mimi aç...',
  'onigiri...?',
  'tummy rumble~',
] as const;

export const MOCHI_SLEEPY_PHRASES = [
  'yawn~ zZz',
  'sleepy mimi...',
  'zzz... uffu',
] as const;

export const MOCHI_LONELY_PHRASES = [
  'where are you...?',
  'miss you~',
  'alone... mimi',
] as const;

export const MOCHI_HAPPY_PHRASES = [
  'poko pipo!!',
  'love you~',
  'best day ever!',
] as const;

export const COLORS = {
  ink: '#4A4560',
  cream: '#FFF8F0',
  rose: '#FFC8DD',
  peach: '#FFD4C4',
  sage: '#B8CDB8',
  lavender: '#D4C4E8',
  mint: '#B5E4C4',
  sky: '#A8D4F0',
  coral: '#FFB899',
  gold: '#F0D890',
} as const;
