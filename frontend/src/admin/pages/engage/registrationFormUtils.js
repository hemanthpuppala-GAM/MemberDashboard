export function registrationFormPublicUrl(slug) {
  return `${window.location.origin}${import.meta.env.BASE_URL}register/${slug}`;
}
