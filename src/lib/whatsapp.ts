// Single source of truth for the org's WhatsApp Business number — update here only.
// wa.me requires digits only, no "+" or spaces.
const WHATSAPP_NUMBER = "6588081760";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
