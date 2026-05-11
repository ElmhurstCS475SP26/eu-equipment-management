import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReservationContract } from '../components/pdf/ReservationContract';
import { APP_CONFIG } from './constants';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateContractBuffer(reservation, items, user) {
  return await renderToBuffer(
    <ReservationContract reservation={reservation} items={items} user={user} />
  );
}

// Sends a reservation email via Resend
export async function sendReservationEmail({ to, subject, type, reservation, items, user, includeContract = false }) {
  try {
    let attachments = [];
    if (includeContract) {
      const buffer = await generateContractBuffer(reservation, items, user);
      attachments.push({
        filename: `Contract-${reservation.bookingId || reservation.id}.pdf`,
        content: buffer,
      });
    }

    const html = getEmailHtml({ type, reservation, items, user });

    const { data, error } = await resend.emails.send({
      from: `${APP_CONFIG.name} <onboarding@resend.dev>`, //Currently using resend's default domain
      to: [to],
      subject: subject,
      html: html,
      attachments: attachments,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

// HTML Template Generator (Matches Screenshot Style)
export function getEmailHtml({ type, reservation, items, user }) {
  const isConfirmation = type === 'confirmation';
  const isReminder = type === 'reminder';
  const isReturn = type === 'return_reminder';
  const isOverdue = type === 'overdue';

  const title = isConfirmation
    ? `Equipment reserved for ${user.name}`
    : isReminder
      ? `Reminder: Pickup in 1 hour`
      : isReturn
        ? `Reminder: Return in 1 hour`
        : `URGENT: Equipment Overdue`;

  const subTitle = `RESERVATION-${reservation.bookingId || reservation.id} - ${items.length} items`;

  const itemRows = items.map(item => `
    <tr style="border-bottom: 1px solid #333;">
      <td style="padding: 15px 0;">
        <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080'}" alt="${item.name}" style="width: 60px; height: 60px; object-cover; border-radius: 4px;" />
      </td>
      <td style="padding: 15px 10px; color: #fff;">${item.name}</td>
      <td style="padding: 15px 10px; color: #888;">${item.brand || 'None'}</td>
      <td style="padding: 15px 10px; color: #888;">${item.externalId || item.barcode || 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000; margin: 0; padding: 0; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; }
        .header { margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
        .subtitle { color: #888; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .info-card { background-color: #111; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: left; border: 1px solid #222; }
        .info-row { margin-bottom: 10px; color: #ccc; }
        .info-label { font-weight: 600; color: #fff; display: inline-block; width: 80px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
        th { color: #888; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 1px solid #222; }
        .btn { background-color: #2563eb; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; margin-top: 30px; }
        .footer { color: #555; font-size: 12px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${subTitle}</div>
        </div>

        <div class="info-card">
          <div class="info-row"><span class="info-label">Location:</span> ${APP_CONFIG.location}</div>
          <div class="info-row"><span class="info-label">From:</span> ${new Date(reservation.startDate).toLocaleString()}</div>
          <div class="info-row"><span class="info-label">To:</span> ${new Date(reservation.endDate).toLocaleString()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <a href="${APP_CONFIG.baseUrl}/dashboard" class="btn">Go to reservation</a>

        <div class="footer">
          ${isOverdue ? '<p style="color: #ef4444; font-weight: bold;">WARNING: This equipment is currently overdue. Please return it immediately to avoid penalties.</p>' : ''}
          <p>&copy; ${new Date().getFullYear()} ${APP_CONFIG.name}. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
