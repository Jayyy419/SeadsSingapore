"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

// Singapore's PDPA expects people to be told why their data is collected at the point of
// collection, not only somewhere on a policy page — so every form that takes personal data
// says so beside its submit button, with the policy one click away.
export function FormPrivacyNotice({ className = "", publishesStory = false }: { className?: string; publishesStory?: boolean }) {
  const { t } = useLocale();
  return (
    <p className={`text-[11px] leading-snug ${className}`}>
      {publishesStory ? `${t.storyPublishNotice} ` : ""}
      {t.formPrivacyNotice}{" "}
      <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80">
        {t.privacyPolicyLink}
      </Link>
    </p>
  );
}
