"use client";

import type { ComponentProps } from "react";

// Wraps a plain submit button with a native confirm() dialog before the (usually destructive)
// action actually fires. Works for both admin delete patterns in this codebase: a secondary
// `formAction` on a form whose primary submit is something else (Save), by passing
// `formAction`; or a button that's the sole submit inside its own `<form action={...}>`, by
// omitting it and letting the button just submit normally once confirmed.
export function ConfirmSubmitButton({
  formAction,
  confirmMessage,
  className,
  children,
}: {
  formAction?: ComponentProps<"button">["formAction"];
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
