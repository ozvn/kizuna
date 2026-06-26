import { useEffect, useState, FormEvent, useCallback } from 'react';
import { Heart, Send, Check, X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatSupabaseError } from '../lib/supabaseErrors';
import { validatePetName } from '../lib/petName';
import type { MatchRequest } from '../types';

export default function Matchmaking() {
  const { profile, refreshProfile } = useAuth();
  const [petName, setPetName] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!profile) return;

    const { data: sent, error: sentError } = await supabase
      .from('match_requests')
      .select('*')
      .eq('sender_id', profile.id)
      .order('created_at', { ascending: false });

    if (sentError) {
      console.error('sent requests:', sentError);
      setError(formatSupabaseError(sentError));
      return;
    }

    const { data: incoming, error: incomingError } = await supabase
      .from('match_requests')
      .select('*')
      .eq('receiver_username', profile.username)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (incomingError) {
      console.error('incoming requests:', incomingError);
      setError(formatSupabaseError(incomingError));
      return;
    }

    setSentRequests((sent as MatchRequest[]) ?? []);

    if (!incoming?.length) {
      setIncomingRequests([]);
      return;
    }

    const senderIds = incoming.map((r) => r.sender_id);
    const { data: senders } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', senderIds);

    const nameById = new Map(senders?.map((s) => [s.id, s.username]) ?? []);

    setIncomingRequests(
      incoming.map((req) => ({
        ...(req as MatchRequest),
        proposed_pet_name: (req as MatchRequest).proposed_pet_name ?? 'Mochi',
        sender: { username: nameById.get(req.sender_id) ?? 'Unknown' },
      })),
    );
  }, [profile]);

  useEffect(() => {
    fetchRequests();

    if (!profile) return;

    const channel = supabase
      .channel(`match-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_requests' },
        () => fetchRequests(),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        () => refreshProfile(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.username, fetchRequests, refreshProfile]);

  const handleSendRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const nameCheck = validatePetName(petName);
    if (!nameCheck.ok) {
      setError(nameCheck.error);
      return;
    }

    const username = targetUsername.trim().toLowerCase();
    if (username === profile.username) {
      setError("You can't send a request to yourself");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc('send_match_request', {
      p_receiver_username: username,
      p_proposed_pet_name: nameCheck.name,
    });

    if (rpcError) {
      console.error('match send:', rpcError);
      setError(formatSupabaseError(rpcError));
    } else {
      setTargetUsername('');
      await fetchRequests();
    }

    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);

    const { error: rpcError } = await supabase.rpc('accept_match_request', {
      request_id: requestId,
    });

    if (rpcError) {
      setError(formatSupabaseError(rpcError));
    } else {
      await refreshProfile();
    }

    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    await supabase.from('match_requests').update({ status: 'rejected' }).eq('id', requestId);
    await fetchRequests();
    setProcessingId(null);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-gold' };
      case 'accepted':
        return { text: 'Accepted', color: 'text-sage-dark' };
      case 'rejected':
        return { text: 'Declined', color: 'text-coral-dark' };
      default:
        return { text: status, color: 'text-ink' };
    }
  };

  const petNameValid = validatePetName(petName).ok;
  const canSend = petNameValid && targetUsername.trim().length > 0 && !loading;

  return (
    <div className="game-device-canvas safe-area">
      <div className="game-console w-full max-w-md">
        <div className="pixel-card-inner p-4 space-y-3">
          <div className="text-center pb-1 border-b-2 border-frame-light border-dashed">
            <Heart className="w-6 h-6 mx-auto text-rose-dark mb-1.5" fill="#F0A8C0" />
            <h1 className="font-pixel text-[9px] text-ink text-stroke-title">Find Your Partner</h1>
            <p className="text-[10px] text-ink-muted mt-2 font-bold leading-relaxed text-stroke-soft">
              Name your shared pet, then send a request to the person you want to raise it with.
            </p>
          </div>

          <form onSubmit={handleSendRequest} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold block mb-1 text-ink flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                Pet Name
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                className="game-input"
                placeholder="Mochi, Poko, Kira…"
              />
              <p className="text-[9px] text-ink-muted mt-1 font-semibold">
                When accepted, your shared pet is born with this name.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold block mb-1 text-ink">Username</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  required
                  className="game-input flex-1"
                  placeholder="username"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="pixel-btn px-3 py-2 bg-lavender text-[10px] font-bold flex items-center gap-1 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </form>

          {error && <p className="game-alert game-alert-error">{error}</p>}

          {incomingRequests.length > 0 && (
            <div className="game-panel">
              <div className="game-panel-inner space-y-2">
                <h2 className="text-[10px] font-bold text-rose-dark text-stroke-soft">Incoming</h2>
                {incomingRequests.map((req) => (
                  <div key={req.id} className="game-list-row flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-ink truncate">
                        {req.sender?.username ?? 'Unknown'}
                      </p>
                      <p className="text-[9px] text-ink-muted truncate">
                        Pet:{' '}
                        <span className="font-bold text-rose-dark">{req.proposed_pet_name}</span>
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={processingId === req.id}
                        className="pixel-btn p-1.5 bg-mint"
                        aria-label="Accept"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                        className="pixel-btn p-1.5 bg-peach"
                        aria-label="Decline"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="game-panel">
            <div className="game-panel-inner space-y-2">
              <h2 className="text-[10px] font-bold text-ink text-stroke-soft">Sent</h2>
              {sentRequests.length === 0 ? (
                <p className="text-[10px] text-ink-muted font-semibold">No requests sent yet</p>
              ) : (
                sentRequests.map((req) => {
                  const st = statusLabel(req.status);
                  const displayPetName = req.proposed_pet_name ?? 'Mochi';
                  return (
                    <div
                      key={req.id}
                      className="game-list-row flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-ink truncate">
                          @{req.receiver_username}
                        </p>
                        <p className="text-[9px] text-ink-muted truncate">
                          Pet: <span className="font-bold">{displayPetName}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-bold flex items-center gap-0.5 shrink-0 ${st.color}`}
                      >
                        {req.status === 'pending' && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {st.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
