export function getReferralCode(): string | null {
  // Check session storage first
  const stored = sessionStorage.getItem('referral_code');
  if (stored) return stored;

  // Try to parse from URL
  let ref: string | null = null;
  const urlParams = new URLSearchParams(window.location.search);
  ref = urlParams.get('ref');

  if (!ref) {
    const hash = window.location.hash;
    const hashQueryIndex = hash.indexOf('?');
    if (hashQueryIndex !== -1) {
      const hashParams = new URLSearchParams(hash.slice(hashQueryIndex));
      ref = hashParams.get('ref');
    }
  }

  if (ref) {
    const cleanRef = ref.trim().toLowerCase();
    sessionStorage.setItem('referral_code', cleanRef);
    return cleanRef;
  }

  return null;
}
