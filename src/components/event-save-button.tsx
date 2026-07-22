"use client";

// Save on the events form is one button for every field, but changing status to "cancelled"
// is far more consequential than any text edit — it puts a public banner on the event and
// closes RSVPs — so it gets its own confirm() gate, unlike ConfirmSubmitButton's always-confirm
// pattern used for delete. Only fires when the save would actually *change* status to
// cancelled, so re-saving an already-cancelled event's other fields doesn't nag every time.
export function EventSaveButton({ originalStatus, className }: { originalStatus: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        const form = e.currentTarget.closest("form");
        const status = form?.elements.namedItem("status");
        const newStatus = status instanceof HTMLSelectElement ? status.value : null;
        if (newStatus === "cancelled" && newStatus !== originalStatus) {
          const ok = window.confirm("Cancelling this event shows a public banner and closes RSVPs. Continue?");
          if (!ok) e.preventDefault();
        }
      }}
    >
      Save
    </button>
  );
}
