/**
 * Enquiry form and booking helpers.
 */

export function formatGoogleFormEmbedUrl(url) {
  if (!url || url.includes('dummyFormIdHere')) {
    return 'https://docs.google.com/forms/d/e/1FAIpQLSf6l5M_fN5wiZL2p7vWhLEZQUXpDIkhxdhl2C-GKPNp5aQK1g/viewform?embedded=true';
  }
  const trimmed = url.trim();
  if (trimmed.includes('embedded=true')) return trimmed;
  if (trimmed.includes('/viewform')) {
    return trimmed.replace(/\/viewform(\?.*)?$/, '/viewform?embedded=true');
  }
  return trimmed;
}

export function generateEnquiryMailto({ email, name, senderEmail, phone, eventDate, eventTime, message }) {
  const targetEmail = email || 'booking.muralidharshenoy@gmail.com';
  const cleanName = name || 'Anonymous';
  const subject = encodeURIComponent(`Concert Booking Enquiry from ${cleanName}`);
  const body = encodeURIComponent(
    `Hello Muralidhar Shenoy,\n\nI would like to enquire about booking a concert / performance.\n\nName: ${cleanName}\nEmail: ${senderEmail || 'Not specified'}\nPhone Number: ${phone || 'Not specified'}\nProposed Concert Date: ${eventDate || 'Not specified'}\nProposed Concert Time: ${eventTime || 'Not specified'}\n\nEnquiry Details:\n${message || ''}\n\nBest regards,\n${cleanName}`
  );
  return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
}
