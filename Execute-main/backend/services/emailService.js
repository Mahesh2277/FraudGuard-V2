const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send fraud alert email
const sendFraudAlert = async (transactionDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'FraudGuard <noreply@fraudguard.com>',
      to: process.env.ADMIN_EMAIL || 'admin@fraudguard.com',
      subject: `🚨 FRAUD ALERT - Transaction ${transactionDetails.transaction_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">⚠️ FRAUD DETECTED</h1>
          </div>
          <div style="padding: 20px; background: #fef2f2; border: 1px solid #fecaca;">
            <h2 style="color: #dc2626; margin-top: 0;">Transaction Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Transaction ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.transaction_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">$${transactionDetails.amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Payer ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.payer_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Payee ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.payee_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>IP Address:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.ip}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>State:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.state}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Fraud Score:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${(transactionDetails.fraud_score * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Fraud Reason:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${transactionDetails.fraud_reason || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;"><strong>Date & Time:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #991b1b;">
                <strong>⚠️ Action Required:</strong> This transaction has been flagged as fraudulent and reported to SEBI. 
                Please review the transaction details and take appropriate action.
              </p>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This is an automated alert from FraudGuard Fraud Detection System.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Fraud alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending fraud alert email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendFraudAlert
};
