const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
    // Add detailed logging at the start
    console.log('=== FUNCTION CALLED ===');
    console.log('Method:', event.httpMethod);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Query params:', event.queryStringParameters);
    console.log('Body:', event.body);
    console.log('Body type:', typeof event.body);

    // Set CORS headers - moved to top for consistency
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json' // Ensure JSON response
    };

    // Add this temporary code in your function (before the main logic)
    if (event.httpMethod === 'GET' && event.queryStringParameters?.test === 'apikey') {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            
            // Simple test email
            const testMsg = {
                to: process.env.ADMIN_EMAIL,
                from: process.env.ADMIN_EMAIL,
                subject: 'SendGrid API Test',
                text: 'This is a test to verify API key permissions.'
            };
            
            await sgMail.send(testMsg);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'API key works!' })
            };
        } catch (error) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: error.message,
                    code: error.code 
                })
            };
        }
    }

    // Test POST handling
    if (event.httpMethod === 'GET' && event.queryStringParameters?.test === 'post') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Function is receiving requests correctly',
                method: event.httpMethod,
                hasBody: !!event.body,
                contentType: event.headers['content-type'] || 'not set'
            })
        };
    }

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Method not allowed' 
            })
        };
    }

    try {
        // Validate environment variables
        if (!process.env.SENDGRID_API_KEY) {
            console.error('SENDGRID_API_KEY is not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Server configuration error: SENDGRID_API_KEY missing'
                })
            };
        }

        if (!process.env.ADMIN_EMAIL) {
            console.error('ADMIN_EMAIL is not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Server configuration error: ADMIN_EMAIL missing'
                })
            };
        }

        // Set SendGrid API key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Parse the request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Invalid JSON in request body'
                })
            };
        }

        const { 
            name, 
            email, 
            phone, 
            date, 
            time, 
            bookingType,
            address,
            additionalInfo, 
        } = requestBody;

        // Validate required fields
        if (!name || !email || !date || !time) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Missing required fields: name, email, date, and time are required'
                })
            };
        }

        // Basic email validation
        if (!email.includes('@')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Invalid email address'
                })
            };
        }

        // Format the booking details for plain text
        const bookingDetails = `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Date: ${date}
      Time: ${time}
      Booking Type: ${bookingType}
      Address: ${address || 'Not specified'}
      Additional Information: ${additionalInfo || 'No additional information'}
    `;

        console.log('Processing booking for:', email);

        // Email to the user (booking confirmation)
        const userEmail = {
            to: email,
            from: {
                email: process.env.ADMIN_EMAIL,
                name: 'NiaImani Cleaning Services'
            },
            subject: 'Booking Confirmation - NiaImani Group',
            text: `Dear ${name},

Thank you for booking a consultation with NiaImani Cleaning Services!

Your booking details:
${bookingDetails}

We will contact you shortly to confirm your appointment and provide the meeting details.

If you have any questions before our meeting, please don't hesitate to reach out.

Best regards,
NiaImani Cleaning Services Team`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4285F4; margin-bottom: 10px;">NiaImani Cleaning Services</h1>
            <h2 style="color: #333; font-weight: normal;">Consultation Booking Confirmation</h2>
          </div>
          
          <p style="font-size: 16px; color: #333;">Dear ${name},</p>
          <p style="font-size: 16px; color: #333;">Thank you for booking a consultation with NiaImani Cleaning Services!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4285F4; margin-top: 0;">Your booking details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px 0; color: #333;">${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0; color: #333;">${email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td><td style="padding: 8px 0; color: #333;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td><td style="padding: 8px 0; color: #333;">${date}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Booking Type:</td><td style="padding: 8px 0; color: #333;">${bookingType}</td></tr>
               <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Time:</td><td style="padding: 8px 0; color: #333;">${time}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Address:</td><td style="padding: 8px 0; color: #333;">${address || 'Not specified'}</td></tr>
              ${additionalInfo ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Additional Information:</td><td style="padding: 8px 0; color: #333;">${additionalInfo}</td></tr>` : ''}
            </table>
          </div>
          
          <p style="font-size: 16px; color: #333;">We will contact you shortly to confirm your appointment and provide the meeting details.</p>
          <p style="font-size: 16px; color: #333;">If you have any questions before our meeting, please don't hesitate to reach out.</p>
          
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #666; font-size: 14px;">Best regards,<br><strong>NiaImani Cleaning Services</strong></p>
          </div>
        </div>
      `
        };

        // Email to the admin (new booking notification)
        const adminEmail = {
            to: process.env.ADMIN_EMAIL,
            from: {
                email: process.env.ADMIN_EMAIL,
                name: 'NiaImani Cleaning Services'
            },
            subject: `New Consultation Booking - ${name}`,
            text: `New consultation booking received!

Client details:
${bookingDetails}

Please follow up with the client to confirm the appointment and send meeting details.`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4285F4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">New Consultation Booking</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-top: 0;"><strong>A new consultation booking has been received!</strong></p>
            
            <h3 style="color: #4285F4;">Client Details:</h3>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 4px;">
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Name:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${name}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #4285F4;">${email}</a></td></tr>
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Phone:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Date:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${date}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Booking Type:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${bookingType}</td></tr>
             <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Time:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${time}</td></tr>
              <tr><td style="padding: 12px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Location:</td><td style="padding: 12px; color: #333; border-bottom: 1px solid #eee;">${address || 'Not specified'}</td></tr>
            </table>
            
            
            ${additionalInfo ? `
            <h3 style="color: #4285F4; margin-top: 25px;">Additional Information To Help Prepare for Service:</h3>
            <div style="background: white; padding: 15px; border-radius: 4px; color: #333;">
              ${additionalInfo.replace(/\n/g, '<br>')}
            </div>
            ` : ''}
            
            <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;"><strong>Action Required:</strong> Please follow up with the client to confirm the appointment and send service details.</p>
            </div>
          </div>
        </div>
      `
        };

        console.log('Attempting to send emails...');

        try {
            // Send emails individually with proper error handling
            await sgMail.send(userEmail);
            console.log('User email sent successfully');

            await sgMail.send(adminEmail);
            console.log('Admin email sent successfully');

            console.log('About to return success response');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Booking confirmation sent successfully!' 
                })
            };

        } catch (emailError) {
            console.error('SendGrid email error:', emailError);
            
            // Log more detailed error information
            if (emailError.response) {
                console.error('SendGrid response:', emailError.response.body);
            }

            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Failed to send booking confirmation',
                    details: emailError.message
                })
            };
        }

    } catch (error) {
        console.error('Function execution error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};