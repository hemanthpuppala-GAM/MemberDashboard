import { Phone, MessageCircle, Mail, MapPin, Globe, Share2 } from "lucide-react";

/** Icon per `ContactChannel.type` — shared between the public Contact page and the site footer. */
export const CHANNEL_ICONS = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  address: MapPin,
  website: Globe,
  social: Share2,
};

/** Clickable href for a channel, or null for types that are display-only (address). */
export function channelHref(channel) {
  switch (channel.type) {
    case "phone":
      return `tel:${channel.value.replace(/\s+/g, "")}`;
    case "whatsapp":
      return `https://wa.me/${channel.value.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${channel.value}`;
    case "website":
    case "social":
      return /^https?:\/\//i.test(channel.value) ? channel.value : `https://${channel.value}`;
    default:
      return null;
  }
}
