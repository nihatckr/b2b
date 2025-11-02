import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";
import validator from "validator";

/**
 * Email Service Configuration
 *
 * Environment variables:
 * - EMAIL_HOST: SMTP sunucu adresi (varsayılan: smtp.gmail.com)
 * - EMAIL_PORT: SMTP port (varsayılan: 587)
 * - EMAIL_USER: SMTP kullanıcı adı (gerekli)
 * - EMAIL_PASSWORD: SMTP şifresi (gerekli)
 * - EMAIL_FROM: Gönderen e-posta adresi (varsayılan: EMAIL_USER)
 * - FRONTEND_URL: Frontend URL (varsayılan: http://localhost:3000)
 * - APP_NAME: Uygulama adı (varsayılan: Textile System)
 */

// DOMPurify için JSDOM penceresi oluştur (server-side)
const window = new JSDOM("").window;
const purify = DOMPurify(window);

// Rate limiter yapılandırması: 5 email / 15 dakika per email adresi
const emailRateLimiter = new RateLimiterMemory({
  points: 5, // 5 email
  duration: 15 * 60, // 15 dakika
});

// Email yapılandırma sabitleri
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  secure: false, // true for 465, false for other ports
} as const;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const APP_NAME = process.env.APP_NAME || "Textile System";

// Email yapılandırmasının geçerliliğini kontrol et
const isEmailConfigured = Boolean(
  EMAIL_CONFIG.user &&
    EMAIL_CONFIG.password &&
    EMAIL_CONFIG.user !== "your-email@gmail.com"
);

// Transporter'ı yalnızca yapılandırıldıysa oluştur
const transporter: Transporter | null = isEmailConfigured
  ? nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.password,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    })
  : null;

/**
 * Email yapılandırmasını doğrula
 *
 * @returns {Promise<boolean>} Yapılandırma geçerli mi?
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  if (!isEmailConfigured) {
    console.log(
      "⚠️  E-posta yapılandırılmamış - sadece konsol çıktısı kullanılıyor"
    );
    return false;
  }

  try {
    await transporter!.verify();
    console.log("✅ E-posta sunucusu mesaj göndermeye hazır");
    return true;
  } catch (error) {
    console.error("❌ E-posta sunucusu yapılandırma hatası:", error);
    return false;
  }
};

/**
 * Email gönderme sonucu interface'i
 */
interface EmailResult {
  success: boolean;
  messageId: string;
}

/**
 * Validation hatası interface'i
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Email adresini doğrula
 *
 * @param email - Doğrulanacak email adresi
 * @returns Email geçerli mi?
 */
const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }

  // validator.js ile RFC 5322 uyumlu kontrol
  if (!validator.isEmail(email)) {
    return false;
  }

  // Uzunluk kontrolü (RFC 5321: max 254 karakter)
  if (email.length > 254) {
    return false;
  }

  // Tehlikeli karakterler kontrolü
  const dangerousChars = /[<>()[\]\\,;:\s@"]/g;
  const [localPart] = email.split("@");
  if (localPart && dangerousChars.test(localPart)) {
    return false;
  }

  return true;
};

/**
 * String input'u sanitize et (XSS koruması)
 *
 * @param input - Temizlenecek string
 * @param maxLength - Maksimum uzunluk (varsayılan: 500)
 * @returns Temizlenmiş string
 */
const sanitizeString = (
  input: string | undefined,
  maxLength: number = 500
): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Whitespace temizle
  let sanitized = input.trim();

  // Uzunluk limiti
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // HTML entities encode et
  sanitized = purify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // Hiçbir HTML tag'ine izin verme
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // İçeriği koru, sadece tag'leri kaldır
  });

  // Null bytes temizle
  sanitized = sanitized.replace(/\0/g, "");

  return sanitized;
};

/**
 * Token'ı doğrula (UUID, alphanumeric)
 *
 * @param token - Doğrulanacak token
 * @returns Token geçerli mi?
 */
const validateToken = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    return false;
  }

  // UUID formatı kontrolü veya alphanumeric
  const isUUID = validator.isUUID(token);
  const isAlphanumeric = validator.isAlphanumeric(token, "en-US", {
    ignore: "-_",
  });

  return isUUID || isAlphanumeric;
};

/**
 * URL'i doğrula
 *
 * @param url - Doğrulanacak URL
 * @returns URL geçerli mi?
 */
const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  return validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
    require_valid_protocol: true,
  });
};

/**
 * Rate limiting kontrolü yap
 *
 * @param email - Kontrol edilecek email adresi
 * @throws Rate limit aşıldıysa hata fırlatır
 */
const checkRateLimit = async (email: string): Promise<void> => {
  try {
    await emailRateLimiter.consume(email);
  } catch (error) {
    throw new Error(
      "Çok fazla email gönderme denemesi. Lütfen 15 dakika sonra tekrar deneyin."
    );
  }
};

/**
 * Email parametrelerini doğrula ve sanitize et
 *
 * @param params - Doğrulanacak parametreler
 * @returns Doğrulama sonucu
 */
const validateEmailParams = (params: {
  email: string;
  token?: string;
  name?: string;
  url?: string;
}): { valid: boolean; errors: ValidationError[]; sanitized: any } => {
  const errors: ValidationError[] = [];
  const sanitized: any = {};

  // Email doğrulama (zorunlu)
  if (!validateEmail(params.email)) {
    errors.push({
      field: "email",
      message: "Geçersiz email adresi",
    });
  } else {
    sanitized.email = params.email.toLowerCase().trim();
  }

  // Token doğrulama (opsiyonel)
  if (params.token !== undefined) {
    if (!validateToken(params.token)) {
      errors.push({
        field: "token",
        message: "Geçersiz token formatı",
      });
    } else {
      sanitized.token = params.token;
    }
  }

  // Name sanitize (opsiyonel)
  if (params.name !== undefined) {
    const sanitizedName = sanitizeString(params.name, 100);
    if (sanitizedName.length === 0 && params.name.length > 0) {
      errors.push({
        field: "name",
        message: "Geçersiz karakter içeren isim",
      });
    } else {
      sanitized.name = sanitizedName;
    }
  }

  // URL doğrulama (opsiyonel)
  if (params.url !== undefined) {
    if (!validateUrl(params.url)) {
      errors.push({
        field: "url",
        message: "Geçersiz URL formatı",
      });
    } else {
      sanitized.url = params.url;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * HTML email şablonu oluştur
 *
 * @param content - Email içeriği HTML
 * @returns Tam HTML email şablonu
 */
const createEmailTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Email footer HTML
 */
const getEmailFooter = (): string => `
<tr>
  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
    <p style="font-size: 12px; color: #999999; margin: 0 0 10px;">
      Bu otomatik bir e-postadır, lütfen yanıtlamayın.
    </p>
    <p style="font-size: 12px; color: #999999; margin: 0;">
      © ${new Date().getFullYear()} ${APP_NAME}. Tüm hakları saklıdır.
    </p>
  </td>
</tr>
`;

/**
 * Şifre sıfırlama emaili gönder
 *
 * @param email - Alıcı email adresi
 * @param resetToken - Şifre sıfırlama token'ı
 * @returns Email gönderim sonucu
 * @throws Validation hatası veya rate limit aşımı durumunda hata fırlatır
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<EmailResult> => {
  // 1. Parametreleri doğrula ve sanitize et
  const validation = validateEmailParams({
    email,
    token: resetToken,
  });

  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => e.message).join(", ");
    console.error("❌ Şifre sıfırlama emaili doğrulama hatası:", errorMessages);
    throw new Error(`Doğrulama hatası: ${errorMessages}`);
  }

  const { email: sanitizedEmail, token: sanitizedToken } = validation.sanitized;

  // 2. Rate limiting kontrolü
  try {
    await checkRateLimit(sanitizedEmail);
  } catch (error) {
    console.error("❌ Rate limit aşıldı:", sanitizedEmail);
    throw error;
  }

  // 3. Email yapılandırılmamışsa atla (geliştirme modu)
  if (!isEmailConfigured) {
    console.log("⚠️  E-posta yapılandırılmamış - email gönderimi atlandı");
    console.log(`📧 Şifre sıfırlama emaili gönderilecekti: ${sanitizedEmail}`);
    console.log(
      `🔗 Sıfırlama linki: ${FRONTEND_URL}/auth/reset/${sanitizedToken}`
    );
    return { success: true, messageId: "dev-mode-skip" };
  }

  const resetUrl = `${FRONTEND_URL}/auth/reset/${sanitizedToken}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${EMAIL_CONFIG.from}>`,
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
                      © ${new Date().getFullYear()} ${APP_NAME}. Tüm hakları saklıdır.
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
© ${new Date().getFullYear()} ${APP_NAME}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Şifre sıfırlama emaili gönderildi:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Şifre sıfırlama emaili gönderilemedi:", error);
    throw new Error("E-posta gönderilemedi");
  }
};

/**
 * Email doğrulama emaili gönder
 *
 * @param email - Alıcı email adresi
 * @param verificationToken - Email doğrulama token'ı
 * @param name - Kullanıcı adı (opsiyonel)
 * @returns Email gönderim sonucu
 * @throws Validation hatası veya rate limit aşımı durumunda hata fırlatır
 */
export const sendEmailVerification = async (
  email: string,
  verificationToken: string,
  name?: string
): Promise<EmailResult> => {
  // 1. Parametreleri doğrula ve sanitize et
  const validationParams: any = {
    email,
    token: verificationToken,
  };
  if (name !== undefined) {
    validationParams.name = name;
  }
  const validation = validateEmailParams(validationParams);

  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => e.message).join(", ");
    console.error("❌ Email doğrulama doğrulama hatası:", errorMessages);
    throw new Error(`Doğrulama hatası: ${errorMessages}`);
  }

  const {
    email: sanitizedEmail,
    token: sanitizedToken,
    name: sanitizedName,
  } = validation.sanitized;

  // 2. Rate limiting kontrolü
  try {
    await checkRateLimit(sanitizedEmail);
  } catch (error) {
    console.error("❌ Rate limit aşıldı:", sanitizedEmail);
    throw error;
  }

  // 3. Email yapılandırılmamışsa atla (geliştirme modu)
  if (!isEmailConfigured) {
    console.log("⚠️  E-posta yapılandırılmamış - email gönderimi atlandı");
    console.log(`📧 Doğrulama emaili gönderilecekti: ${sanitizedEmail}`);
    console.log(
      `🔗 Doğrulama linki: ${FRONTEND_URL}/auth/verify-email/${sanitizedToken}`
    );
    return { success: true, messageId: "dev-mode-skip" };
  }

  const verifyUrl = `${FRONTEND_URL}/auth/verify-email/${sanitizedToken}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${EMAIL_CONFIG.from}>`,
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
                      Merhaba${sanitizedName ? ` ${sanitizedName}` : ""},
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      <strong>${APP_NAME}</strong> platformuna hoş geldiniz! 🎉
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
                      © ${new Date().getFullYear()} ${APP_NAME}. Tüm hakları saklıdır.
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

Merhaba${sanitizedName ? ` ${sanitizedName}` : ""},

${APP_NAME} platformuna hoş geldiniz!

Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.

Doğrulama linki:
${verifyUrl}

Bu link 24 saat boyunca geçerlidir.

Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

---
© ${new Date().getFullYear()} ${APP_NAME}
    `,
  };

  try {
    const info = await transporter!.sendMail(mailOptions);
    console.log("✅ Email doğrulama emaili gönderildi:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Doğrulama emaili gönderilemedi:", error);
    throw new Error("E-posta gönderilemedi");
  }
};

/**
 * Hoş geldin emaili gönder (email doğrulama sonrası)
 *
 * @param email - Alıcı email adresi
 * @param name - Kullanıcı adı
 * @returns Email gönderim sonucu
 * @throws Validation hatası veya rate limit aşımı durumunda hata fırlatır
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<EmailResult> => {
  // 1. Parametreleri doğrula ve sanitize et
  const validation = validateEmailParams({
    email,
    name,
  });

  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => e.message).join(", ");
    console.error("❌ Hoş geldin emaili doğrulama hatası:", errorMessages);
    throw new Error(`Doğrulama hatası: ${errorMessages}`);
  }

  const { email: sanitizedEmail, name: sanitizedName } = validation.sanitized;

  // 2. Rate limiting kontrolü
  try {
    await checkRateLimit(sanitizedEmail);
  } catch (error) {
    console.error("❌ Rate limit aşıldı:", sanitizedEmail);
    throw error;
  }

  // 3. Email yapılandırılmamışsa atla
  if (!isEmailConfigured) {
    console.log("⚠️  E-posta yapılandırılmamış - hoş geldin emaili atlandı");
    return { success: true, messageId: "dev-mode-skip" };
  }

  const dashboardUrl = `${FRONTEND_URL}/dashboard`;
  const helpUrl = `${FRONTEND_URL}/help`;
  const profileUrl = `${FRONTEND_URL}/profile`;

  const mailOptions = {
    from: `"${APP_NAME}" <${EMAIL_CONFIG.from}>`,
    to: sanitizedEmail,
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
                      ${APP_NAME} ailesine katıldınız
                    </p>
                  </td>
                </tr>

                <!-- Welcome Message -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 18px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                      Merhaba <strong>${sanitizedName}</strong>,
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
                        veya bize <a href="mailto:${
                          EMAIL_CONFIG.from
                        }" style="color: #667eea; text-decoration: none;">${
      EMAIL_CONFIG.from
    }</a> adresinden ulaşabilirsiniz.
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
                      © ${new Date().getFullYear()} ${APP_NAME}. Tüm hakları saklıdır.
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

Merhaba ${sanitizedName},

E-posta adresiniz başarıyla doğrulandı! Artık ${APP_NAME} platformunun tüm özelliklerinden yararlanabilirsiniz.

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
Email: ${EMAIL_CONFIG.from}

Keyifli kullanımlar dileriz! ❤️

---
© ${new Date().getFullYear()} ${APP_NAME}
    `,
  };

  try {
    const info = await transporter!.sendMail(mailOptions);
    console.log("✅ Hoş geldin emaili gönderildi:", sanitizedEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Hoş geldin emaili gönderilemedi:", error);
    throw new Error("E-posta gönderilemedi");
  }
};
