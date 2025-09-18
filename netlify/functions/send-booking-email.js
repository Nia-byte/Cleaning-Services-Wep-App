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
            // Service details
            serviceType,
            cleaningType,
            beds,
            baths,
            frequency,
            recurringFrequency,
            officeSize,
            constructionType,
            squareMeters,
            totalPrice
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
          Service Type: ${serviceType || 'Not specified'}
          ${cleaningType ? `Cleaning Type: ${cleaningType}` : ''}
          ${beds ? `Bedrooms: ${beds}` : ''}
          ${baths ? `Bathrooms: ${baths}` : ''}
          ${frequency ? `Frequency: ${frequency}` : ''}
          ${totalPrice ? `Estimated Price: R${totalPrice} ZAR` : ''}
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

Thank you for booking a service with NiaImani Cleaning Services!

Your booking details:
${bookingDetails}We will contact you shortly to confirm your appointment and provide the meeting details.

If you have any questions before our meeting, please don't hesitate to reach out.

Best regards,
NiaImani Cleaning Services Team`,
    html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4285F4 0%, #4285F4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
                    <img src="https://i.imgur.com/qB05y7p.png" alt="NiaImani Logo" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px;">
                </div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Booking Confirmation</h1>
                <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Thank you for choosing NiaImani Cleaning Services</p>
            </div>
            
            <!-- Content Container -->
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Welcome Message -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">Hello ${name}!</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">Your cleaning service booking has been confirmed. We'll be in touch shortly to finalize the details.</p>
                </div>

                ${serviceType ? `
                <!-- Service Details Card -->
                <div style="background: #f1f3f4; padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #e8eaed;">
                    <h2 style="margin: 0 0 20px; color: #1a73e8; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">🏠</span>
                        Service Details
                    </h2>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Service Type:</span>
                            <span style="color: #1a73e8; font-weight: 500; text-transform: capitalize;">${serviceType}</span>
                        </div>
                        
                        ${cleaningType ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Cleaning Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${cleaningType}</span>
                        </div>
                        ` : ''}
                        
                        ${beds ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Bedrooms:</span>
                            <span style="color: #202124;">${beds}</span>
                        </div>
                        ` : ''}
                        
                        ${baths ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Bathrooms:</span>
                            <span style="color: #202124;">${baths}</span>
                        </div>
                        ` : ''}
                        
                        ${frequency ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Plan Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${frequency}${recurringFrequency ? ` (${recurringFrequency})` : ''}</span>
                        </div>
                        ` : ''}
                        
                        ${officeSize ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Office Size:</span>
                            <span style="color: #202124; text-transform: capitalize;">${officeSize}</span>
                        </div>
                        ` : ''}
                        
                        ${constructionType ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Construction Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${constructionType}${squareMeters ? ` (${squareMeters} sq m)` : ''}</span>
                        </div>
                        ` : ''}
                        
                        ${totalPrice ? `
                        <div style="display: flex; padding: 15px 0; background: #e8f0fe; margin-top: 10px; border-radius: 8px; padding-left: 15px; padding-right: 15px;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 140px;">Estimated Price:</span>
                            <span style="color: #1565c0; font-weight: 700; font-size: 18px;">R${totalPrice} ZAR</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Appointment Details Card -->
                <div style="background: #e3f2fd; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
                    <h2 style="margin: 0 0 20px; color: #1565c0; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📅</span>
                        Service Slot
                    </h2>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #bbdefb;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 120px;">Date:</span>
                            <span style="color: #0d47a1; font-weight: 500;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #bbdefb;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 120px;">Time:</span>
                            <span style="color: #0d47a1; font-weight: 500;">${time}</span>
                        </div>
                        
                        <div style="padding: 12px 0;">
                            <span style="font-weight: 600; color: #1565c0; display: block; margin-bottom: 8px;">Address:</span>
                            <span style="color: #0d47a1; line-height: 1.5;">${address || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                ${additionalInfo ? `
                <!-- Additional Information Card -->
                <div style="background: #fff3e0; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #ff9800;">
                    <h2 style="margin: 0 0 15px; color: #ef6c00; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📝</span>
                        Additional Information
                    </h2>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ffcc80;">
                        <p style="margin: 0; color: #bf360c; line-height: 1.6; font-style: italic;">"${additionalInfo}"</p>
                    </div>
                </div>
                ` : ''}

                <!-- What's Next Section -->
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                    <h2 style="margin: 0 0 15px; color: #2e7d32; font-size: 20px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">✨</span>
                        What Happens Next?
                    </h2>
                    <div style="color: #1b5e20;">
                        <p style="margin: 0 0 10px; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">1</span>
                            We'll call you within 24 hours to confirm details
                        </p>
                        <p style="margin: 0 0 10px; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">2</span>
                            Final quotation will be provided
                        </p>
                        <p style="margin: 0; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">3</span>
                            Our professional team will arrive as scheduled
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                <p style="margin: 0;">NiaImani Group Cleaning Services</p>
                <p style="margin: 5px 0 0;">Professional cleaning you can trust</p>
            </div>
        </div>
    `
};

       
// Enhanced admin email with complete service details
        const adminEmail = {
            to: process.env.ADMIN_EMAIL,
            from: {
                email: process.env.ADMIN_EMAIL,
                name: 'NiaImani Cleaning Services'
            },
            subject: `New ${serviceType || 'Cleaning'} cleaning Booking - ${name}`,
            text: `New cleaning booking received!

Service Details:
${serviceType ? `Service Type: ${serviceType}` : ''}
${cleaningType ? `Cleaning Type: ${cleaningType}` : ''}
${beds ? `Bedrooms: ${beds}` : ''}
${baths ? `Bathrooms: ${baths}` : ''}
${frequency ? `Frequency: ${frequency}` : ''}
${recurringFrequency ? `Recurring Schedule: ${recurringFrequency}` : ''}
${officeSize ? `Office Size: ${officeSize}` : ''}
${constructionType ? `Construction Type: ${constructionType}` : ''}
${squareMeters ? `Square Meters: ${squareMeters}` : ''}
Estimated Price: R${totalPrice || 'TBD'}

Client Information:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Date: ${date}
Time: ${time}
Booking Type: ${bookingType}
Address: ${address || 'Not specified'}
Additional Information: ${additionalInfo || 'No additional information'}

Please follow up with the client to confirm the service and provide quotation.`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4285F4 0%, #4285F4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
               <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
                 <img src="https://i.imgur.com/qB05y7p.png" alt="NiaImani Logo" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px;">
              </div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 300;">New Cleaning Service Booking</h1>
                <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Booking received from ${name}</p>
            </div>
            
            <!-- Content Container -->
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Priority Alert -->
                <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #ff6b6b;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 20px; margin-right: 10px;"></span>
                        <h3 style="margin: 0; color: #d63031; font-size: 18px;">Action Required</h3>
                    </div>
                    <p style="margin: 0; color: #2d3436; font-weight: 500;">New booking requires immediate follow-up and quotation</p>
                </div>

                ${serviceType ? `
                <!-- Service Details Card -->
                <div style="background: #f1f3f4; padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #e8eaed;">
                    <h2 style="margin: 0 0 20px; color: #1a73e8; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;"></span>
                        Service Details
                    </h2>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Service Type:</span>
                            <span style="color: #1a73e8; font-weight: 500; text-transform: capitalize;">${serviceType}</span>
                        </div>
                        
                        ${cleaningType ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Cleaning Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${cleaningType}</span>
                        </div>
                        ` : ''}
                        
                        ${beds ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Bedrooms:</span>
                            <span style="color: #202124;">${beds}</span>
                        </div>
                        ` : ''}
                        
                        ${baths ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Bathrooms:</span>
                            <span style="color: #202124;">${baths}</span>
                        </div>
                        ` : ''}
                        
                        ${frequency ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Plan Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${frequency}${recurringFrequency ? ` (${recurringFrequency})` : ''}</span>
                        </div>
                        ` : ''}
                        
                        ${officeSize ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Office Size:</span>
                            <span style="color: #202124; text-transform: capitalize;">${officeSize}</span>
                        </div>
                        ` : ''}
                        
                        ${constructionType ? `
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 140px;">Construction Type:</span>
                            <span style="color: #202124; text-transform: capitalize;">${constructionType}${squareMeters ? ` (${squareMeters} sq m)` : ''}</span>
                        </div>
                        ` : ''}
                        
                        ${totalPrice ? `
                        <div style="display: flex; padding: 15px 0; background: #e8f0fe; margin-top: 10px; border-radius: 8px; padding-left: 15px; padding-right: 15px;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 140px;">Estimated Price:</span>
                            <span style="color: #1565c0; font-weight: 700; font-size: 18px;"> R${totalPrice} ZAR</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Client Information Card -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                    <h2 style="margin: 0 0 20px; color: #1a73e8; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;"></span>
                        Client Information
                    </h2>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 120px;">Name:</span>
                            <span style="color: #202124; font-weight: 500;">${name}</span>
                        </div>
                        
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 120px;">Email:</span>
                            <a href="mailto:${email}" style="color: #1a73e8; text-decoration: none;">${email}</a>
                        </div>
                        
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 120px;">Phone:</span>
                            <a href="tel:${phone}" style="color: #1a73e8; text-decoration: none;">${phone || 'Not provided'}</a>
                        </div>
                        
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #dadce0;">
                            <span style="font-weight: 600; color: #5f6368; min-width: 120px;">Booking Type:</span>
                            <span style="color: #202124; text-transform: capitalize;"> ${bookingType}</span>
                        </div>
                    </div>
                </div>

                <!-- Appointment Details Card -->
                <div style="background: #e3f2fd; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
                    <h2 style="margin: 0 0 20px; color: #1565c0; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;"></span>
                        Service Slot
                    </h2>
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #bbdefb;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 120px;">Date:</span>
                            <span style="color: #0d47a1; font-weight: 500;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        
                        <div style="display: flex; padding: 12px 0; border-bottom: 1px solid #bbdefb;">
                            <span style="font-weight: 600; color: #1565c0; min-width: 120px;">Time:</span>
                            <span style="color: #0d47a1; font-weight: 500;">${time}</span>
                        </div>
                        
                        <div style="padding: 12px 0;">
                            <span style="font-weight: 600; color: #1565c0; display: block; margin-bottom: 8px;">Address:</span>
                            <span style="color: #0d47a1; line-height: 1.5;">${address || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                ${additionalInfo ? `
                <!-- Additional Information Card -->
                <div style="background: #fff3e0; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #ff9800;">
                    <h2 style="margin: 0 0 15px; color: #ef6c00; font-size: 22px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📝</span>
                        Additional Information
                    </h2>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ffcc80;">
                        <p style="margin: 0; color: #bf360c; line-height: 1.6; font-style: italic;">"${additionalInfo}"</p>
                    </div>
                </div>
                ` : ''}

                <!-- Action Items -->
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); padding: 25px; border-radius: 12px; border: 2px solid #4caf50;">
                    <h2 style="margin: 0 0 15px; color: #2e7d32; font-size: 20px; display: flex; align-items: center;">
                        <span style="margin-right: 10px;"></span>
                        Next Steps
                    </h2>
                    <div style="color: #1b5e20;">
                        <p style="margin: 0 0 10px; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">1</span>
                            Contact client within 24 hours to confirm details
                        </p>
                        <p style="margin: 0 0 10px; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">2</span>
                            Prepare and send detailed quotation
                        </p>
                        <p style="margin: 0; display: flex; align-items: center;">
                            <span style="background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: bold;">3</span>
                            Schedule service and assign team
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                <p style="margin: 0;">NiaImani Group Cleaning Services</p>
                <p style="margin: 5px 0 0;"></p>
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