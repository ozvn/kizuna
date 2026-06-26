import { FormEvent, useState } from 'react';
import { Heart, Loader2, Send, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import GamePanel from './GamePanel';
import type { FriendRequestInfo, PetSocialState } from '../types';

interface FriendsPanelProps {
  social: PetSocialState | null;
  loading: boolean;
  error: string | null;
  partnerUsername?: string | null;
  onRefresh: () => void;
}

function approvalLabel(approved: number, required: number): string {
  return `${approved}/${required} partners approved`;
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
      <p className="text-[9px] font-bold text-ink text-stroke-soft">{title}</p>
      <p className="text-[10px] font-bold text-rose-dark">{petName}</p>
      {request.status === 'awaiting_sender' && (
        <p className="text-[8px] text-ink-muted font-semibold">
          Send approval: {approvalLabel(senderCount, 2)}
        </p>
      )}
      {request.status === 'awaiting_receiver' && (
        <p className="text-[8px] text-ink-muted font-semibold">
          Accept approval: {approvalLabel(receiverCount, 2)}
        </p>
      )}
      <div className="flex gap-1 pt-0.5">
        {needsAction && (
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="pixel-btn flex-1 py-1.5 text-[8px] font-bold bg-mint text-ink"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Approve'}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          className="pixel-btn flex-1 py-1.5 text-[8px] font-bold bg-peach text-ink"
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
}: FriendsPanelProps) {
  const [targetName, setTargetName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="space-y-2 w-full">
      <GamePanel className="w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-1 pb-1 border-b-2 border-frame-light border-dashed">
            <UserPlus className="w-3.5 h-3.5 text-sky" />
            <h3 className="text-[10px] font-bold text-ink text-stroke-soft">Add Friend</h3>
          </div>

          <p className="text-[8px] text-ink-muted font-semibold leading-snug">
            Both you and {partnerUsername ?? 'your partner'} must approve sending. Their couple
            must both approve accepting.
          </p>

          <form onSubmit={handleSend} className="flex gap-1.5">
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Pet name"
              className="game-input flex-1 text-[10px]"
              minLength={2}
              maxLength={50}
            />
            <button
              type="submit"
              disabled={busy || targetName.trim().length < 2}
              className="pixel-btn px-2.5 py-1.5 bg-lavender shrink-0"
              aria-label="Send friend request"
            >
              {busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      </GamePanel>

      {(error || actionError) && (
        <p className="game-alert game-alert-error text-[9px]">{actionError ?? error}</p>
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
            <Heart className="w-3.5 h-3.5 text-rose-dark" fill="#F0A8C0" />
            <h3 className="text-[10px] font-bold text-ink text-stroke-soft">Pet Friends</h3>
          </div>

          {!loading && (!social?.friends || social.friends.length === 0) && (
            <p className="text-[9px] text-ink-muted font-semibold">No friends yet.</p>
          )}

          <ul className="space-y-1">
            {social?.friends.map((f) => (
              <li key={f.pet_id} className="game-list-row flex justify-between items-center gap-2">
                <div>
                  <p className="text-[10px] font-bold text-ink">{f.pet_name}</p>
                  <p className="text-[8px] text-ink-muted font-semibold">
                    Lv.{f.level} · 🔥{f.care_streak}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-coral-dark">{f.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </GamePanel>
    </div>
  );
}
