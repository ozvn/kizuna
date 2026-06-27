import { FormEvent, useState } from 'react';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatSupabaseError } from '../lib/supabaseErrors';
import { validatePetName } from '../lib/petName';
import { usePetNameAvailability } from '../hooks/usePetNameAvailability';
import type { PendingPetRename } from '../types';

interface PetRenameControlProps {
  petId: string;
  petName: string;
  pendingRequest: PendingPetRename | null;
  onRenamed: (newName: string) => void;
  onStateChange: () => void;
}

function approvalLabel(approved: number, required: number): string {
  return `${approved}/${required} partners approved`;
}

export default function PetRenameControl({
  petId,
  petName,
  pendingRequest,
  onRenamed,
  onStateChange,
}: PetRenameControlProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(petName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validation = validatePetName(draft);
  const unchanged = validation.ok && validation.name.toLowerCase() === petName.trim().toLowerCase();
  const { available, checking } = usePetNameAvailability(draft, {
    excludePetId: petId,
    enabled: editing && validation.ok && !unchanged,
  });

  const canPropose =
    validation.ok &&
    !unchanged &&
    available === true &&
    !checking &&
    !busy &&
    !pendingRequest;

  const openEdit = () => {
    if (pendingRequest) return;
    setDraft(petName);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(petName);
    setError(null);
    setEditing(false);
  };

  const proposeRename = async (e: FormEvent) => {
    e.preventDefault();
    if (!canPropose) return;

    setBusy(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc('initiate_pet_rename', {
      p_new_name: validation.name,
    });

    if (rpcError) {
      setError(formatSupabaseError(rpcError));
    } else {
      setEditing(false);
      await onStateChange();
    }
    setBusy(false);
  };

  const approveRename = async () => {
    if (!pendingRequest) return;
    setBusy(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('confirm_pet_rename', {
      p_request_id: pendingRequest.id,
    });

    if (rpcError) {
      setError(formatSupabaseError(rpcError));
    } else {
      const payload = data as { name?: string; pending_request?: null };
      if (payload.name) onRenamed(payload.name);
      await onStateChange();
    }
    setBusy(false);
  };

  const declineRename = async () => {
    if (!pendingRequest) return;
    setBusy(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc('decline_pet_rename', {
      p_request_id: pendingRequest.id,
    });

    if (rpcError) setError(formatSupabaseError(rpcError));
    else await onStateChange();
    setBusy(false);
  };

  if (pendingRequest && !editing) {
    return (
      <div className="game-hud-rename-pending">
        <p className="game-caption text-ink font-bold truncate">
          → {pendingRequest.proposed_name}
        </p>
        <p className="game-hud-rename-hint game-caption text-ink-muted">
          {approvalLabel(pendingRequest.approval_count, pendingRequest.required_approvals)}
        </p>
        {pendingRequest.i_initiated && !pendingRequest.needs_my_approval && (
          <p className="game-hud-rename-hint game-caption text-ink-muted">Partner approval…</p>
        )}
        <div className="flex gap-1 mt-0.5">
          {pendingRequest.needs_my_approval && (
            <button
              type="button"
              disabled={busy}
              onClick={approveRename}
              className="pixel-btn px-1.5 py-0.5 bg-mint text-ink game-caption"
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={declineRename}
            className="pixel-btn px-1.5 py-0.5 bg-peach text-ink game-caption"
          >
            Decline
          </button>
        </div>
        {error && <p className="game-hud-rename-error game-caption text-coral-dark">{error}</p>}
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={openEdit}
        className="game-hud-name-btn group"
        title="Rename pet"
        aria-label={`Rename pet ${petName}`}
      >
        <span className="game-hud-name game-caption text-ink truncate">{petName}</span>
        <Pencil className="w-3 h-3 text-ink-muted group-hover:text-ink shrink-0" />
      </button>
    );
  }

  return (
    <form onSubmit={proposeRename} className="game-hud-rename-form">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="game-input game-hud-rename-input"
        maxLength={50}
        autoFocus
      />
      <button
        type="submit"
        disabled={!canPropose}
        className="pixel-btn p-1 bg-mint shrink-0"
        aria-label="Propose pet name"
        title="Both partners must approve"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={cancel}
        className="pixel-btn p-1 bg-peach shrink-0"
        aria-label="Cancel rename"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <p className="game-hud-rename-hint game-caption text-ink-muted w-full">
        Both partners must approve the new name.
      </p>
      {error && <p className="game-hud-rename-error game-caption text-coral-dark">{error}</p>}
      {!error && validation.ok && !unchanged && available === false && (
        <p className="game-hud-rename-error game-caption text-coral-dark">Name taken</p>
      )}
      {!error && checking && validation.ok && !unchanged && (
        <p className="game-hud-rename-hint game-caption text-ink-muted">Checking…</p>
      )}
    </form>
  );
}
