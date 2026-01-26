import express from 'express';

const router = express.Router();

// POST /contact - Send contact form message via email
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GatsisHub Contact Form <noreply@gatsishub.com>',
        to: 'gatsishub@gmail.com',
        reply_to: email,
        subject: `New Contact Form Message from ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #e6af2e;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 30px;
                  border: 1px solid #e0e0e0;
                  border-radius: 0 0 8px 8px;
                }
                .info-row {
                  margin: 15px 0;
                  padding: 10px;
                  background-color: white;
                  border-left: 4px solid #e6af2e;
                }
                .label {
                  font-weight: bold;
                  color: #555;
                  display: inline-block;
                  width: 100px;
                }
                .message-box {
                  background-color: white;
                  padding: 20px;
                  margin-top: 20px;
                  border-radius: 4px;
                  border: 1px solid #e0e0e0;
                  white-space: pre-wrap;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>📩 New Contact Form Submission</h2>
              </div>
              <div class="content">
                <div class="info-row">
                  <span class="label">From:</span>
                  <span>${name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span><a href="mailto:${email}">${email}</a></span>
                </div>
                <div class="info-row">
                  <span class="label">Received:</span>
                  <span>${new Date().toLocaleString('en-US', { 
                    dateStyle: 'full', 
                    timeStyle: 'short',
                    timeZone: 'Asia/Manila'
                  })}</span>
                </div>
                
                <div class="message-box">
                  <strong>Message:</strong><br><br>
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div class="footer">
                <p>This message was sent from the GatsisHub contact form</p>
                <p>You can reply directly to this email to respond to ${name}</p>
              </div>
            </body>
          </html>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: errorData
      });
    }

    const emailData = await emailResponse.json();
    console.log('Contact form email sent successfully:', emailData.id);

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully!',
      emailId: emailData.id
    });

  } catch (error) {
    console.error('Error sending contact form message:', error);
    res.status(500).json({ 
      error: 'An error occurred while sending your message. Please try again later.',
      details: error.message 
    });
  }
});

export default router;
