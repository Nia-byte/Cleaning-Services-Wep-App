const { getStore } = require('@netlify/blobs');

function getHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-email, x-admin-password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

function getBlobStore() {
  try {
    // On Netlify, Blobs credentials are injected automatically — no token needed.
    return getStore('car-wash-bookings');
  } catch (error) {
    // Fallback for local dev without injected credentials.
    return getStore({
      name: 'car-wash-bookings',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_API_TOKEN
    });
  }
}

async function readBookings() {
  const store = getBlobStore();
  const data = await store.get('bookings', { type: 'json' }).catch(() => null);
  return Array.isArray(data) ? data : [];
}

async function writeBookings(bookings) {
  const store = getBlobStore();
  await store.setJSON('bookings', bookings);
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
