const fs = require('fs/promises');
const path = require('path');

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'car-wash-bookings.json');

function getHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-email, x-admin-password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

async function readBookings() {
  try {
    const raw = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeBookings(bookings) {
  await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
}

async function sendTelegramNotification(booking) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  const text = [
    'New Car Wash Booking',
    `Ref: ${booking.ref}`,
    `Name: ${booking.fullName}`,
    `Phone: ${booking.phone}`,
    `Vehicle: ${booking.vehicleType} | ${booking.regNumber} | ${booking.vehicleColor}`,
    `Service: ${booking.service}`,
    `Date: ${booking.date}`,
    `Slot: ${booking.slot}`
  ].join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (error) {
    console.error('Telegram send failed:', error);
  }
}

exports.handler = async (event) => {
  const headers = getHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  try {
    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');

      if (!payload.fullName || !payload.phone || !payload.vehicleType || !payload.service || !payload.date || !payload.slot) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Missing required booking fields' })
        };
      }

      const bookings = await readBookings();
      bookings.push(payload);
      await writeBookings(bookings);
      await sendTelegramNotification(payload);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, booking: payload })
      };
    }

    if (event.httpMethod === 'GET') {
      const adminEmail = event.headers['x-admin-email'];
      const adminPassword = event.headers['x-admin-password'];

      if (adminEmail !== process.env.ADMIN_EMAIL || adminPassword !== process.env.ADMIN_PASSWORD) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Unauthorized' })
        };
      }

      const bookings = await readBookings();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, bookings })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Server error', details: error.message })
    };
  }
};
