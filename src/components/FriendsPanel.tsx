import { FormEvent, useState } from 'react';
import { Gamepad2, Heart, Loader2, Send, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import {
  FRIEND_PLAY_ENERGY_BOOST,
  FRIEND_PLAY_XP,
} from '../lib/ritualConfig';
import GamePanel from './GamePanel';
import type { FriendRequestInfo, PetSocialState } from '../types';

interface FriendsPanelProps {
  social: PetSocialState | null;
  loading: boolean;
  error: string | null;
  partnerUsername?: string | null;
  onRefresh: () => void;
  onPetUpdated?: () => void;
}

function approvalLabel(approved: number, required: number): string {
  return `${approved}/${required} owners approved`;
}

function RequestCard({
  title,
  request,
  mode,
  onConfirm,
  onDecline,
  busy,
}: {
  title: string;
  request: FriendRequestInfo;
  mode: 'outgoing' | 'incoming';
  onConfirm: () => void;
  onDecline: () => void;
  busy: boolean;
}) {
  const petName =
    mode === 'outgoing' ? request.target_pet_name : request.requester_pet_name;
  const senderCount = request.sender_approvals?.length ?? 0;
  const receiverCount = request.receiver_approvals?.length ?? 0;

  const needsAction =
    mode === 'outgoing'
      ? request.status === 'awaiting_sender' && request.needs_my_sender_approval
      : request.status === 'awaiting_receiver' && request.needs_my_receiver_approval;

  return (
    <div className="game-list-row space-y-1.5">
      <p className="game-heading text-ink text-stroke-soft">{title}</p>
      <p className="game-body text-rose-dark font-bold">{petName}</p>
      {request.status === 'awaiting_sender' && (
        <p className="game-caption text-ink-muted">
          Send approval: {approvalLabel(senderCount, 2)}
        </p>
      )}
      {request.status === 'awaiting_receiver' && (
        <p className="game-caption text-ink-muted">
          Accept approval: {approvalLabel(receiverCount, 2)}
        </p>
      )}
      <div className="flex gap-1.5 pt-1">
        {needsAction && (
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="pixel-btn flex-1 py-2 bg-mint text-ink"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          className="pixel-btn flex-1 py-2 bg-peach text-ink"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default function FriendsPanel({
  social,
  loading,
  error,
  partnerUsername,
  onRefresh,
  onPetUpdated,
}: FriendsPanelProps) {
  const [targetName, setTargetName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pendingPlay = social?.pending_friend_play;
  const hasFriends = (social?.friends?.length ?? 0) > 0;

  const afterSocialAction = async (completedPlay = false) => {
    await onRefresh();
    if (completedPlay) onPetUpdated?.();
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const name = targetName.trim();
    if (!name) return;

    setBusy(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc('initiate_pet_friend_request', {
      p_target_pet_name: name,
    });
    if (rpcError) {
      setActionError(formatSupabaseError(rpcError));
    } else {
      setTargetName('');
      await onRefresh();
    }
    setBusy(false);
  };

  const confirmSender = async (requestId: string) => {
    setBusy(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc('confirm_friend_request_sender', {
      p_request_id: requestId,
    });
    if (rpcError) setActionError(formatSupabaseError(rpcError));
    else await onRefresh();
    setBusy(false);
  };

  const confirmReceiver = async (requestId: string) => {
    setBusy(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc('confirm_friend_request_receiver', {
      p_request_id: requestId,
    });
    if (rpcError) setActionError(formatSupabaseError(rpcError));
    else await onRefresh();
    setBusy(false);
  };

  const decline = async (requestId: string) => {
    setBusy(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc('decline_pet_friend_request', {
      p_request_id: requestId,
    });
    if (rpcError) setActionError(formatSupabaseError(rpcError));
    else await onRefresh();
    setBusy(false);
  };

  const startFriendPlay = async (friendPetId: string) => {
    setBusy(true);
    setActionError(null);
    const { data, error: rpcError } = await supabase.rpc('initiate_friend_play', {
      p_friend_pet_id: friendPetId,
    });
    if (rpcError) {
      setActionError(formatSupabaseError(rpcError));
    } else {
      const state = data as PetSocialState | null;
      await onRefresh();
      if (!state?.pending_friend_play) onPetUpdated?.();
    }
    setBusy(false);
  };

  const approveFriendPlay = async (sessionId: string) => {
    setBusy(true);
    setActionError(null);
    const { data, error: rpcError } = await supabase.rpc('confirm_friend_play', {
      p_session_id: sessionId,
    });
    if (rpcError) {
      setActionError(formatSupabaseError(rpcError));
    } else {
      const state = data as PetSocialState | null;
      const wasPending = !!pendingPlay;
      await afterSocialAction(wasPending && !state?.pending_friend_play);
    }
    setBusy(false);
  };

  const declineFriendPlay = async (sessionId: string) => {
    setBusy(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc('decline_friend_play', {
      p_session_id: sessionId,
    });
    if (rpcError) setActionError(formatSupabaseError(rpcError));
    else await onRefresh();
    setBusy(false);
  };

  return (
    <div className="space-y-2 w-full">
      <GamePanel className="w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-1 pb-1 border-b-2 border-frame-light border-dashed">
            <Gamepad2 className="w-4 h-4 text-mint" />
            <h3 className="game-heading text-ink text-stroke-soft">Play with Friend</h3>
          </div>

          <p className="game-caption text-ink-muted leading-snug">
            All 4 owners must approve. When complete: +{FRIEND_PLAY_ENERGY_BOOST} energy and +
            {FRIEND_PLAY_XP} XP for both pets.
          </p>

          {loading && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
            </div>
          )}

          {!loading && pendingPlay && (
            <div className="game-list-row space-y-1.5">
              <p className="game-heading text-ink text-stroke-soft">Pending play session</p>
              <p className="game-body text-sky-dark font-bold">
                {pendingPlay.pet_a_name} &amp; {pendingPlay.pet_b_name}
              </p>
              <p className="game-caption text-ink-muted">
                {approvalLabel(
                  pendingPlay.approval_count,
                  pendingPlay.required_approvals,
                )}
              </p>
              {pendingPlay.i_initiated && !pendingPlay.needs_my_approval && (
                <p className="game-caption text-ink-muted">
                  Waiting for all owners to approve…
                </p>
              )}
              <div className="flex gap-1.5 pt-1">
                {pendingPlay.needs_my_approval && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => approveFriendPlay(pendingPlay.id)}
                    className="pixel-btn flex-1 py-2 bg-mint text-ink"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Approve Play'
                    )}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => declineFriendPlay(pendingPlay.id)}
                  className="pixel-btn flex-1 py-2 bg-peach text-ink"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {!loading && !pendingPlay && !hasFriends && (
            <p className="game-body text-ink-muted py-1">
              Add a friend first to play together.
            </p>
          )}

          {!loading && !pendingPlay && hasFriends && (
            <ul className="space-y-1">
              {social!.friends.map((f) => (
                <li
                  key={f.pet_id}
                  className="game-list-row flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="game-heading text-ink truncate">{f.pet_name}</p>
                    <p className="game-caption text-ink-muted">
                      Lv.{f.level} · 🔥{f.care_streak}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startFriendPlay(f.pet_id)}
                    className="pixel-btn px-3 py-1.5 bg-lavender shrink-0"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Play'
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </GamePanel>

      <GamePanel className="w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-1 pb-1 border-b-2 border-frame-light border-dashed">
            <UserPlus className="w-4 h-4 text-sky" />
            <h3 className="game-heading text-ink text-stroke-soft">Add Friend</h3>
          </div>

          <p className="game-caption text-ink-muted leading-snug">
            Both you and {partnerUsername ?? 'your partner'} must approve sending. Their couple
            must both approve accepting.
          </p>

          <form onSubmit={handleSend} className="flex gap-1.5">
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Pet name"
              className="game-input flex-1"
              minLength={2}
              maxLength={50}
            />
            <button
              type="submit"
              disabled={busy || targetName.trim().length < 2}
              className="pixel-btn px-3 py-2 bg-lavender shrink-0"
              aria-label="Send friend request"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </GamePanel>

      {(error || actionError) && (
        <p className="game-alert game-alert-error">{actionError ?? error}</p>
      )}

      {loading && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
        </div>
      )}

      {!loading && social?.outgoing_request && (
        <RequestCard
          title="Outgoing request"
          request={social.outgoing_request}
          mode="outgoing"
          busy={busy}
          onConfirm={() => confirmSender(social.outgoing_request!.id)}
          onDecline={() => decline(social.outgoing_request!.id)}
        />
      )}

      {!loading && social?.incoming_request && (
        <RequestCard
          title="Incoming request"
          request={social.incoming_request}
          mode="incoming"
          busy={busy}
          onConfirm={() => confirmReceiver(social.incoming_request!.id)}
          onDecline={() => decline(social.incoming_request!.id)}
        />
      )}

      <GamePanel className="w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-1 pb-1 border-b-2 border-frame-light border-dashed">
            <Heart className="w-4 h-4 text-rose-dark" fill="#F0A8C0" />
            <h3 className="game-heading text-ink text-stroke-soft">Pet Friends</h3>
          </div>

          {!loading && !hasFriends && (
            <p className="game-body text-ink-muted">No friends yet.</p>
          )}

          <ul className="space-y-1.5">
            {social?.friends.map((f) => (
              <li key={f.pet_id} className="game-list-row flex justify-between items-center gap-2">
                <div>
                  <p className="game-heading text-ink">{f.pet_name}</p>
                  <p className="game-caption text-ink-muted">
                    Lv.{f.level} · 🔥{f.care_streak}
                  </p>
                </div>
                <span className="game-body text-coral-dark">{f.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </GamePanel>
    </div>
  );
}
