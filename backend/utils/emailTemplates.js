// Modern Email Templates - Spotify-inspired Design
// Reusable email template system for GatsisHub

const colors = {
  primary: '#E6AF2E',
  dark: '#191716',
  darkGray: '#2A2A2A',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
  success: '#1DB954',
  warning: '#FFA500',
  error: '#FF4444'
};

// Base template wrapper
const baseTemplate = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>GatsisHub</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.lightGray};">
  <span class="preheader" style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">${preheader}</span>
  
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${colors.lightGray};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${colors.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Header component
const header = () => `
<tr>
  <td style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkGray} 100%); padding: 48px 40px; text-align: center;">
    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: ${colors.white}; letter-spacing: -0.5px;">
      GatsisHub
    </h1>
    <p style="margin: 8px 0 0; font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.7); letter-spacing: 0.5px;">
      PREMIUM HANGER SOLUTIONS
    </p>
  </td>
</tr>
`;

// Content section
const contentSection = (title, message, accentColor = colors.primary) => `
<tr>
  <td style="padding: 48px 40px;">
    <div style="border-left: 4px solid ${accentColor}; padding-left: 20px; margin-bottom: 32px;">
      <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.dark}; line-height: 1.3;">
        ${title}
      </h2>
    </div>
    <div style="color: #555555; font-size: 16px; line-height: 1.6;">
      ${message}
    </div>
  </td>
</tr>
`;

// Code display component (for verification codes)
const codeDisplay = (code) => `
<tr>
  <td style="padding: 0 40px 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkGray} 100%); border-radius: 12px; padding: 32px; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">
            Your Verification Code
          </p>
          <div style="font-size: 48px; font-weight: 700; color: ${colors.primary}; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 0;">
            ${code}
          </div>
          <p style="margin: 16px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
            Code expires in 15 minutes
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

// Button component
const button = (text, url, backgroundColor = colors.primary) => `
<tr>
  <td style="padding: 0 40px 40px; text-align: center;">
    <a href="${url}" style="display: inline-block; background-color: ${backgroundColor}; color: ${colors.dark}; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 50px; letter-spacing: 0.5px; transition: all 0.3s;">
      ${text}
    </a>
  </td>
</tr>
`;

// Info box component
const infoBox = (content, type = 'info') => {
  const styles = {
    info: { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' },
    success: { bg: '#E8F5E9', border: colors.success, text: '#2E7D32' },
    warning: { bg: '#FFF3E0', border: colors.warning, text: '#E65100' },
    error: { bg: '#FFEBEE', border: colors.error, text: '#C62828' }
  };
  
  const style = styles[type];
  
  return `
<tr>
  <td style="padding: 0 40px 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="background-color: ${style.bg}; border-left: 4px solid ${style.border}; border-radius: 8px; padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${style.text};">
            ${content}
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;
};

// Details section (key-value pairs)
const detailsSection = (details) => {
  const rows = Object.entries(details)
    .map(([key, value]) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EEEEEE; font-size: 14px;">
          <span style="color: #999999; font-weight: 500;">${key}:</span>
          <span style="color: ${colors.dark}; font-weight: 600; float: right;">${value}</span>
        </td>
      </tr>
    `)
    .join('');
    
  return `
<tr>
  <td style="padding: 0 40px 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${colors.lightGray}; border-radius: 12px; padding: 24px;">
      ${rows}
    </table>
  </td>
</tr>
`;
};

// Footer component
const footer = () => `
<tr>
  <td style="background-color: ${colors.lightGray}; padding: 40px; text-align: center;">
    <p style="margin: 0 0 16px; font-size: 14px; color: #999999; line-height: 1.6;">
      If you didn't request this email, please ignore it or contact our support team.
    </p>
    <p style="margin: 0; font-size: 14px; color: #CCCCCC;">
      © ${new Date().getFullYear()} GatsisHub. All rights reserved.
    </p>
    <div style="margin-top: 24px;">
      <a href="https://gatsishub.com" style="color: #999999; text-decoration: none; font-size: 13px; margin: 0 12px;">Website</a>
      <span style="color: #DDDDDD;">•</span>
      <a href="https://gatsishub.com/support" style="color: #999999; text-decoration: none; font-size: 13px; margin: 0 12px;">Support</a>
      <span style="color: #DDDDDD;">•</span>
      <a href="https://gatsishub.com/privacy" style="color: #999999; text-decoration: none; font-size: 13px; margin: 0 12px;">Privacy</a>
    </div>
  </td>
</tr>
`;

// Pre-built templates
export const emailTemplates = {
  // Email verification template
  verification: (name, code) => {
    const content = header() +
      contentSection(
        'Verify Your Email',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>Welcome to GatsisHub! To complete your registration and start ordering premium custom hangers, please verify your email address using the code below:</p>`
      ) +
      codeDisplay(code) +
      infoBox('⏰ This verification code will expire in <strong>15 minutes</strong>. If you didn\'t sign up for GatsisHub, please ignore this email.', 'warning') +
      footer();
      
    return baseTemplate(content, 'Verify your email to get started with GatsisHub');
  },

  // Welcome email template
  welcome: (name, email, loginUrl) => {
    const content = header() +
      contentSection(
        'Welcome to GatsisHub! 🎉',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>Your email has been verified and your account is now active! We're excited to have you on board.</p>
         <p>You can now access all features and start ordering premium custom hangers for your business.</p>`
      ) +
      button('Access Your Account', loginUrl) +
      detailsSection({
        'Account Email': email,
        'Account Status': '✓ Active & Verified',
        'Member Since': new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }) +
      footer();
      
    return baseTemplate(content, 'Your GatsisHub account is ready to use');
  },

  // Login verification (2FA)
  loginVerification: (name, code, ipAddress, timestamp) => {
    const content = header() +
      contentSection(
        'Login Verification',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>Someone is attempting to log in to your GatsisHub account. If this is you, use the verification code below to complete your login:</p>`
      ) +
      codeDisplay(code) +
      detailsSection({
        'IP Address': ipAddress,
        'Time': timestamp,
        'Location': 'Detected automatically'
      }) +
      infoBox('🔒 If you didn\'t attempt to log in, please secure your account immediately by changing your password.', 'error') +
      footer();
      
    return baseTemplate(content, 'Verify your login attempt to GatsisHub');
  },

  // Password reset template
  passwordReset: (name, code) => {
    const content = header() +
      contentSection(
        'Reset Your Password',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>You requested to reset your password for your GatsisHub account. Use the verification code below to proceed:</p>`
      ) +
      codeDisplay(code) +
      infoBox('If you didn\'t request a password reset, please ignore this email. Your password will remain unchanged.', 'info') +
      footer();
      
    return baseTemplate(content, 'Reset your GatsisHub password');
  },

  // Google sign-in welcome
  googleWelcome: (name, email, loginUrl) => {
    const content = header() +
      contentSection(
        'Welcome to GatsisHub! 🎉',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>You've successfully signed up using your Google account. Your account is now active and ready to use!</p>
         <p>You can sign in anytime using your Google account - no password needed.</p>`
      ) +
      button('Access Your Account', loginUrl) +
      detailsSection({
        'Account Email': email,
        'Sign-In Method': '🔐 Google Account',
        'Account Status': '✓ Active'
      }) +
      infoBox('📍 <strong>Next Step:</strong> Complete your delivery address to start placing orders for custom hangers!', 'success') +
      footer();
      
    return baseTemplate(content, 'Your GatsisHub account is ready');
  },

  // Order confirmation template
  orderConfirmation: (companyName, orderNumber, orderDetails) => {
    const content = header() +
      contentSection(
        'Order Confirmed! ✓',
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>We've received your custom hanger order and our team is reviewing it now.</p>
         <p style="font-size: 18px; font-weight: 600; color: ${colors.primary}; margin-top: 24px;">Order #${orderNumber}</p>`
      ) +
      detailsSection(orderDetails) +
      infoBox(
        `<strong>📋 What Happens Next?</strong><br><br>
         <strong>1. Order Verification:</strong> Our team will review your specifications<br>
         <strong>2. Quote & Timeline:</strong> We'll contact you with pricing and production schedule<br>
         <strong>3. Production:</strong> Once confirmed, we'll begin manufacturing`,
        'info'
      ) +
      infoBox(
        `⏱️ <strong>Production Notes:</strong> Production time varies based on complexity and quantity. Custom designs may require additional review time. We'll keep you updated via email and our messaging system.`,
        'warning'
      ) +
      `<tr>
        <td style="padding: 0 40px 40px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders" style="display: inline-block; background-color: ${colors.primary}; color: ${colors.dark}; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 50px; letter-spacing: 0.5px; margin-right: 10px;">
            View Order Status
          </a>
          <a href="${process.env.FRONTEND_URL || 'https://gatsishub.com'}/messages" style="display: inline-block; background-color: ${colors.dark}; color: ${colors.white}; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 50px; letter-spacing: 0.5px;">
            Contact Support
          </a>
        </td>
      </tr>` +
      footer();
      
    return baseTemplate(content, `Order ${orderNumber} confirmed - we're on it!`);
  },

  // Order status update template
  orderStatusUpdate: (companyName, orderNumber, status, statusTitle, statusMessage) => {
    const content = header() +
      contentSection(
        statusTitle,
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>${statusMessage}</p>`
      ) +
      detailsSection({
        'Order Number': `ORD-${orderNumber}`,
        'Status': status
      }) +
      infoBox('You can view your order details and track its progress by logging into your account.', 'info') +
      button('View Order Details', 'https://gatsishub.com/orders') +
      footer();
      
    return baseTemplate(content, `Order #${orderNumber} status updated`);
  },

  // Payment approved template
  paymentApproved: (companyName, orderNumber, paymentMethod, amountPaid, dateVerified) => {
    const content = header() +
      contentSection(
        'Payment Approved! ✓',
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>Great news! Your payment has been verified and approved by our team.</p>
         <p style="color: ${colors.success}; font-weight: 600; font-size: 18px; margin-top: 20px;">✓ Payment Confirmed</p>`,
        colors.success
      ) +
      detailsSection({
        'Order Number': orderNumber,
        'Payment Method': paymentMethod,
        'Amount Paid': `PHP ${amountPaid}`,
        'Date Verified': dateVerified,
        'Status': '✓ Verified and Approved'
      }) +
      infoBox(
        `<strong>🎉 What's Next?</strong><br><br>
         Your order has been moved to production! Our manufacturing team will begin working on your custom hangers. 
         You'll receive updates as your order progresses through each stage.`,
        'success'
      ) +
      button('Track Order Progress', `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders`) +
      footer();
      
    return baseTemplate(content, `Payment approved for order ${orderNumber}`);
  },

  // Payment rejected template
  paymentRejected: (companyName, orderNumber, paymentMethod, reason, dateRejected) => {
    const content = header() +
      contentSection(
        'Payment Needs Resubmission',
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>We've reviewed your payment proof for order <strong>${orderNumber}</strong>, but unfortunately we need you to resubmit it.</p>`,
        colors.warning
      ) +
      detailsSection({
        'Order Number': orderNumber,
        'Payment Method': paymentMethod,
        'Date Reviewed': dateRejected,
        'Reason': reason || 'Unable to verify payment details'
      }) +
      infoBox(
        `<strong>⚠️ Action Required:</strong><br><br>
         Please submit a new proof of payment with clear, readable transaction details. Make sure all information is visible including:
         <ul style="margin: 10px 0; padding-left: 20px;">
           <li>Transaction reference number</li>
           <li>Amount paid</li>
           <li>Date and time of transaction</li>
           <li>Recipient details (GatsisHub)</li>
         </ul>`,
        'warning'
      ) +
      infoBox(
        `💡 <strong>Tip:</strong> Take a clear photo or screenshot of your payment receipt. Ensure there's no glare and all text is legible.`,
        'info'
      ) +
      button('Submit New Proof', `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/payment`) +
      footer();
      
    return baseTemplate(content, `Payment resubmission needed for order ${orderNumber}`);
  },

  // Contract amendment required template
  contractAmendmentRequired: (companyName, orderNumber, reason, changes) => {
    const content = header() +
      contentSection(
        'Order Update - Signature Required',
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>We've made updates to your order <strong>${orderNumber}</strong>. To proceed, we need your acknowledgment and signature on these changes.</p>
         <p style="font-weight: 600; color: ${colors.dark}; margin-top: 20px;">Reason: ${reason}</p>`,
        colors.warning
      ) +
      detailsSection(changes) +
      infoBox(
        `<strong>📋 Action Required:</strong><br><br>
         Please review the changes above and sign the contract amendment to continue with your order. 
         This ensures both parties are aligned on the updated specifications, pricing, or timeline.`,
        'warning'
      ) +
      infoBox(
        `⏱️ <strong>Important:</strong> Your order processing will be paused until you review and sign the amendment. 
         Please complete this at your earliest convenience to avoid delays.`,
        'info'
      ) +
      button('Review & Sign Amendment', `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders`) +
      footer();
      
    return baseTemplate(content, `Order ${orderNumber} - Signature Required for Updates`);
  },

  // Contract signed confirmation template
  contractSigned: (companyName, orderNumber, signedDate, isAmendment = false) => {
    const title = isAmendment ? 'Contract Amendment Signed! ✓' : 'Contract Signed Successfully! ✓';
    const message = isAmendment 
      ? 'Thank you for signing the contract amendment. Your order will now proceed with the updated details.'
      : 'Thank you for signing the sales agreement. You can now proceed with payment.';
    
    const content = header() +
      contentSection(
        title,
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>${message}</p>
         <p style="color: ${colors.success}; font-weight: 600; font-size: 18px; margin-top: 20px;">✓ Contract Signed</p>`,
        colors.success
      ) +
      detailsSection({
        'Order Number': orderNumber,
        'Document': isAmendment ? 'Contract Amendment' : 'Sales Agreement',
        'Signed On': signedDate,
        'Status': '✓ Legally Binding'
      }) +
      infoBox(
        isAmendment 
          ? `<strong>🎉 What's Next?</strong><br><br>
             Your order will continue processing with the updated specifications. Our team will keep you informed of progress at each stage.`
          : `<strong>💳 Next Step:</strong><br><br>
             Please submit your payment to begin production. You can upload your proof of payment from your order page.`,
        'success'
      ) +
      infoBox(
        `📄 <strong>Your Signed Contract:</strong> You can view and download your signed contract anytime from your order details page. 
         This serves as a legal agreement between you and GatsisHub.`,
        'info'
      ) +
      button('View Order Details', `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders`) +
      footer();
      
    return baseTemplate(content, `Contract signed for order ${orderNumber}`);
  },

  // Contract ready for customer signature (after sales admin signs)
  contractReadyForCustomer: (companyName, orderNumber, salesAdminName) => {
    const content = header() +
      contentSection(
        'Contract Ready for Your Signature 📝',
        `<p>Hi <strong>${companyName}</strong>,</p>
         <p>Your sales agreement has been reviewed and signed by <strong>${salesAdminName}</strong>.</p>
         <p style="color: ${colors.primary}; font-weight: 600; font-size: 18px; margin-top: 20px;">📝 Action Required: Please Sign the Contract</p>`,
        colors.primary
      ) +
      detailsSection({
        'Order Number': orderNumber,
        'Sales Representative': salesAdminName,
        'Status': '✓ Sales Admin Signed',
        'Next Step': 'Customer Signature Required'
      }) +
      infoBox(
        `<strong>📋 What's Included:</strong><br><br>
         Your contract includes all agreed-upon specifications, pricing, materials, and delivery timeline. 
         Please review carefully before signing.`,
        'info'
      ) +
      infoBox(
        `<strong>💳 Ready to Proceed?</strong><br><br>
         Once you sign the contract, you'll be able to submit payment and we'll begin production immediately. 
         This ensures both parties are protected throughout the order process.`,
        'success'
      ) +
      button('Review & Sign Contract', `${process.env.FRONTEND_URL || 'https://gatsishub.com'}/orders`) +
      footer();
      
    return baseTemplate(content, `Contract ready for signature - Order ${orderNumber}`);
  }
};

export default emailTemplates;
