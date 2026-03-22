import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_REQUEST = import.meta.env.VITE_EMAILJS_TEMPLATE_REQUEST;
const TEMPLATE_CHURCH = import.meta.env.VITE_EMAILJS_TEMPLATE_CHURCH;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// ── Send request status notification (Approved / Declined) ───────────────────
export async function sendRequestNotification({
  requesterEmail,
  requesterName,
  requestType,
  referenceNumber,
  status,
  churchName,
  churchEmail,
}) {
  if (!requesterEmail) {
    console.log('No email provided — skipping notification');
    return;
  }

  const statusMessage = status === 'Approved'
    ? `Your request has been approved! Please visit the parish office or wait for further instructions from the church.`
    : `Unfortunately, your request has been declined. Please contact the parish directly for more information.`;

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_REQUEST,
      {
        requester_email: requesterEmail,
        requester_name: requesterName || 'Parishioner',
        request_type: requestType,
        reference_number: referenceNumber,
        status: status,
        status_message: statusMessage,
        church_name: churchName,
        church_email: churchEmail || 'N/A',
      },
      PUBLIC_KEY
    );
    console.log(`✅ Email sent to ${requesterEmail} — ${status}`);
  } catch (error) {
    console.error('EmailJS error:', error);
  }
}

// ── Send church approval notification ────────────────────────────────────────
export async function sendChurchApprovalEmail({
  registrantEmail,
  registrantName,
  churchName,
}) {
  if (!registrantEmail) {
    console.log('No registrant email — skipping notification');
    return;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_CHURCH,
      {
        registrant_email: registrantEmail,
        registrant_name: registrantName || 'Parish Representative',
        church_name: churchName,
      },
      PUBLIC_KEY
    );
    console.log(`✅ Church approval email sent to ${registrantEmail}`);
  } catch (error) {
    console.error('EmailJS church approval error:', error);
  }
}