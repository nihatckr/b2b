import nodemailer from "nodemailer";

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Check if email is configured
const isEmailConfigured = EMAIL_USER && EMAIL_PASSWORD && EMAIL_USER !== "your-email@gmail.com";

// Create reusable transporter only if configured
const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
}) : null;

// Verify transporter configuration
export const verifyEmailConfig = async () => {
  if (!isEmailConfigured) {
    console.log("⚠️  Email not configured - using console output only");
    return false;
  }

  try {
    await transporter!.verify();
    console.log("✅ Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email server configuration error:", error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  // Skip email sending if not configured (dev mode)
  if (!isEmailConfigured) {
    console.log("⚠️  Email not configured - skipping email send");
    console.log(`📧 Would send password reset to: ${email}`);
    console.log(`🔗 Reset link: ${FRONTEND_URL}/auth/reset/${resetToken}`);
    return { success: true, messageId: "dev-mode-skip" };
  }

  const resetUrl = `${FRONTEND_URL}/auth/reset/${resetToken}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || "Textile System"}" <${EMAIL_FROM}>`,
    to: email,
    subject: "Şifre Sıfırlama Talebi",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Şifre Sıfırlama</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      Merhaba,
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      Hesabınız için bir şifre sıfırlama talebi aldık. Eğer bu talebi siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px;">
                      Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                    </p>

                    <!-- Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                        Şifremi Sıfırla
                      </a>
                    </div>

                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      Ya da aşağıdaki linki tarayıcınıza kopyalayabilirsiniz:
                    </p>
                    <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">
                      ${resetUrl}
                    </p>

                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0;">
                      ⏱️ Bu link <strong>1 saat</strong> boyunca geçerlidir.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 12px; color: #999999; margin: 0 0 10px;">
                      Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 0;">
                      © ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}. Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Şifre Sıfırlama Talebi

Hesabınız için bir şifre sıfırlama talebi aldık.

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
${resetUrl}

Bu link 1 saat boyunca geçerlidir.

Eğer bu talebi siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    throw new Error("Failed to send email");
  }
};

// Send email verification email
export const sendEmailVerification = async (
  email: string,
  verificationToken: string,
  name?: string
) => {
  // Skip email sending if not configured (dev mode)
  if (!isEmailConfigured) {
    console.log("⚠️  Email not configured - skipping email send");
    console.log(`📧 Would send verification to: ${email}`);
    console.log(`🔗 Verification link: ${FRONTEND_URL}/auth/verify-email/${verificationToken}`);
    return { success: true, messageId: "dev-mode-skip" };
  }

  const verifyUrl = `${FRONTEND_URL}/auth/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || "Textile System"}" <${EMAIL_FROM}>`,
    to: email,
    subject: "E-posta Adresinizi Doğrulayın ✅",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Doğrulama</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ E-posta Doğrulama</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      Merhaba${name ? ` ${name}` : ""},
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      <strong>${process.env.APP_NAME || "Textile System"}</strong> platformuna hoş geldiniz! 🎉
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px;">
                      Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir. Lütfen aşağıdaki butona tıklayın:
                    </p>

                    <!-- Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${verifyUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                        E-postamı Doğrula
                      </a>
                    </div>

                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      Ya da aşağıdaki linki tarayıcınıza kopyalayabilirsiniz:
                    </p>
                    <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">
                      ${verifyUrl}
                    </p>

                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0;">
                      ⏱️ Bu link <strong>24 saat</strong> boyunca geçerlidir.
                    </p>

                    <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 20px 0 0;">
                      Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 12px; color: #999999; margin: 0 0 10px;">
                      Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 0;">
                      © ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}. Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
E-posta Doğrulama

Merhaba${name ? ` ${name}` : ""},

${process.env.APP_NAME || "Textile System"} platformuna hoş geldiniz!

Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.

Doğrulama linki:
${verifyUrl}

Bu link 24 saat boyunca geçerlidir.

Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}
    `,
  };

  try {
    const info = await transporter!.sendMail(mailOptions);
    console.log("✅ Email verification sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Failed to send email");
  }
};

// Send welcome email (after email verification)
export const sendWelcomeEmail = async (email: string, name: string) => {
  // Skip email sending if not configured
  if (!isEmailConfigured) {
    console.log("⚠️  Email not configured - skipping welcome email");
    return;
  }

  const dashboardUrl = `${FRONTEND_URL}/dashboard`;
  const helpUrl = `${FRONTEND_URL}/help`;
  const profileUrl = `${FRONTEND_URL}/profile`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || "Textile System"}" <${EMAIL_FROM}>`,
    to: email,
    subject: "🎉 Hoş Geldiniz! Hesabınız Aktif",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Hoş Geldiniz!</h1>
                    <p style="color: #f0f0f0; margin: 10px 0 0; font-size: 16px;">
                      ${process.env.APP_NAME || "Textile System"} ailesine katıldınız
                    </p>
                  </td>
                </tr>

                <!-- Welcome Message -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 18px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      Merhaba <strong>${name}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      E-posta adresiniz başarıyla doğrulandı! 🎊 Artık platformumuzun tüm özelliklerinden yararlanabilirsiniz.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                        Dashboard'a Git →
                      </a>
                    </div>

                    <!-- Getting Started -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
                      <h2 style="font-size: 18px; color: #333333; margin: 0 0 15px;">
                        🚀 Başlarken İpuçları
                      </h2>
                      <ul style="font-size: 14px; color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li><strong>Profilinizi tamamlayın:</strong> Fotoğraf ekleyin, bilgilerinizi güncelleyin</li>
                        <li><strong>İlk projenizi oluşturun:</strong> Dashboard'dan hemen başlayın</li>
                        <li><strong>Ekibinizi davet edin:</strong> İşbirliğine başlayın</li>
                        <li><strong>Yardım merkezini keşfedin:</strong> Dokümantasyon ve rehberler</li>
                      </ul>
                    </div>

                    <!-- Quick Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td style="padding: 0 10px 0 0;" width="50%">
                          <div style="background-color: #f0f4ff; border-radius: 6px; padding: 20px; text-align: center;">
                            <h3 style="font-size: 16px; color: #667eea; margin: 0 0 10px;">📊 Dashboard</h3>
                            <p style="font-size: 13px; color: #666666; margin: 0 0 15px;">Genel bakış ve istatistikler</p>
                            <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: bold;">
                              Görüntüle →
                            </a>
                          </div>
                        </td>
                        <td style="padding: 0 0 0 10px;" width="50%">
                          <div style="background-color: #fff0f6; border-radius: 6px; padding: 20px; text-align: center;">
                            <h3 style="font-size: 16px; color: #764ba2; margin: 0 0 10px;">👤 Profil</h3>
                            <p style="font-size: 13px; color: #666666; margin: 0 0 15px;">Bilgilerinizi düzenleyin</p>
                            <a href="${profileUrl}" style="color: #764ba2; text-decoration: none; font-size: 14px; font-weight: bold;">
                              Düzenle →
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Help -->
                    <div style="background-color: #fffbea; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 30px 0 0;">
                      <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.6;">
                        <strong>💡 Yardıma mı ihtiyacınız var?</strong><br>
                        Herhangi bir sorunuz için <a href="${helpUrl}" style="color: #667eea; text-decoration: none;">Yardım Merkezi</a>'ni ziyaret edebilir
                        veya bize <a href="mailto:${EMAIL_FROM}" style="color: #667eea; text-decoration: none;">${EMAIL_FROM}</a> adresinden ulaşabilirsiniz.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 14px; color: #666666; margin: 0 0 10px;">
                      Keyifli kullanımlar dileriz! ❤️
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 0 0 10px;">
                      Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 0;">
                      © ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}. Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Hoş Geldiniz! 🎉

Merhaba ${name},

E-posta adresiniz başarıyla doğrulandı! Artık ${process.env.APP_NAME || "Textile System"} platformunun tüm özelliklerinden yararlanabilirsiniz.

Dashboard'a Git: ${dashboardUrl}

🚀 Başlarken İpuçları:
- Profilinizi tamamlayın: Fotoğraf ekleyin, bilgilerinizi güncelleyin
- İlk projenizi oluşturun: Dashboard'dan hemen başlayın
- Ekibinizi davet edin: İşbirliğine başlayın
- Yardım merkezini keşfedin: Dokümantasyon ve rehberler

📊 Hızlı Linkler:
- Dashboard: ${dashboardUrl}
- Profil: ${profileUrl}
- Yardım: ${helpUrl}

💡 Yardıma mı ihtiyacınız var?
Email: ${EMAIL_FROM}

Keyifli kullanımlar dileriz! ❤️

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || "Textile System"}
    `,
  };

  try {
    await transporter!.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
};
