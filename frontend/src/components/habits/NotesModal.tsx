"use client";

import { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useLogNotesMutation } from "@/lib/hooks/useLogMutation";
import type { DayEntry } from "@/types";

interface NotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: DayEntry | null;
  date: string;
}

export function NotesModal({
  open,
  onOpenChange,
  entry,
  date,
}: NotesModalProps) {
  const log = entry?.log ?? null;
  const habit = entry?.habit;

  const [notes, setNotes] = useState(log?.notes ?? "");
  const notesMutation = useLogNotesMutation(date);

  // Reset only when switching to a different log
  useEffect(() => {
    setNotes(log?.notes ?? "");
  }, [entry?.log?._id]);

  const hasChanged = notes.trim() !== (log?.notes ?? "").trim();
  const isReadOnly = !log; // notes only editable when log exists

  function handleSave() {
    if (!log?._id || !habit || !hasChanged) return;

    notesMutation.mutate(
      {
        habitId: habit._id,
        logId: log._id,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={habit?.title ?? "Notes"}
      description={isReadOnly ? "Read-only" : "Add a note for today"}
    >
      <div className="flex flex-col gap-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isReadOnly || notesMutation.isPending}
          placeholder="How did it go today?"
          rows={4}
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none transition-all
            bg-neutral-800 border border-neutral-700
            text-neutral-100 placeholder:text-neutral-500
            focus:border-violet-500 focus:ring-1 focus:ring-violet-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Character count */}
        <p className="text-xs text-neutral-600 text-right -mt-2">
          {notes.length} / 200
        </p>

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={notesMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              loading={notesMutation.isPending}
              disabled={!hasChanged}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
