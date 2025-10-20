// Email service configuration
// This is a placeholder implementation. In production, you should use a service like:
// - Resend (recommended): npm install resend
// - SendGrid: npm install @sendgrid/mail
// - AWS SES, Postmark, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // In development, log emails to console
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    if (text) console.log('Text:', text);
    if (html) console.log('HTML:', html);
    return { success: true };
  }

  // Production implementation with Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject,
        html: html || text || '',
        text: text || undefined,
      });

      if (error) {
        console.error('Email sending failed:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  // Fallback warning
  console.warn('⚠️ Email service not configured. Set RESEND_API_KEY in environment variables.');
  return { success: false, error: 'Email service not configured' };
}

// Email templates
export const emailTemplates = {
  verification: (name: string, url: string) => ({
    subject: 'Verify your email - URL Shortener',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>URL Shortener</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up. Please verify your email address to unlock all features.</p>
              <p>Click the button below to verify your email:</p>
              <div style="text-align: center;">
                <a href="${url}" class="button">Verify Email</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all;">${url}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hello ${name}!

      Thank you for signing up. Please verify your email address to unlock all features.

      Click this link to verify your email:
      ${url}

      This link will expire in 24 hours.

      If you didn't create an account, you can safely ignore this email.
    `
  }),

  passwordReset: (name: string, url: string) => ({
    subject: 'Reset your password - URL Shortener',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 10px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>URL Shortener</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
              <div style="text-align: center;">
                <a href="${url}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all;">${url}</p>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hello ${name}!

      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

      Click this link to reset your password:
      ${url}

      This link will expire in 1 hour for your security.

      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    `
  }),

  urlExpiring: (name: string, shortUrl: string, originalUrl: string, hoursLeft: number) => ({
    subject: `Your shortened URL expires in ${hoursLeft} hours - URL Shortener`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f4f4f4; }
            .url-box { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>URL Shortener</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your shortened URL will expire in ${hoursLeft} hours.</p>
              <div class="url-box">
                <p><strong>Short URL:</strong> ${shortUrl}</p>
                <p><strong>Original URL:</strong> ${originalUrl}</p>
              </div>
              <p>To extend the expiration date, visit your dashboard:</p>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>You received this email because you have expiration notifications enabled.</p>
              <p>To change your notification preferences, visit your account settings.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hello ${name}!

      Your shortened URL will expire in ${hoursLeft} hours.

      Short URL: ${shortUrl}
      Original URL: ${originalUrl}

      To extend the expiration date, visit your dashboard:
      ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

      You received this email because you have expiration notifications enabled.
      To change your notification preferences, visit your account settings.
    `
  })
};