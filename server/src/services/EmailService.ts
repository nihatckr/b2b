import nodemailer from "nodemailer";
import type { PrismaClient } from "../data/generated/prisma";

// Use Prisma generated types with password optional for some operations
type User = Omit<
  NonNullable<Awaited<ReturnType<PrismaClient["user"]["findUnique"]>>>,
  "password"
> & {
  password?: string;
};
type Order = NonNullable<
  Awaited<ReturnType<PrismaClient["order"]["findUnique"]>>
>;
type Sample = NonNullable<
  Awaited<ReturnType<PrismaClient["sample"]["findUnique"]>>
>;

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
export class EmailService {
  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || "Textile Platform"}" <${
          process.env.SMTP_USER
        }>`,
        to,
        subject,
        html,
      });

      console.log("📧 Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  }

  // Welcome email for new users
  static async sendWelcomeEmail(user: User) {
    const subject = "Welcome to Textile Platform!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Textile Platform!</h2>
        <p>Dear ${user.name || "User"},</p>
        <p>Thank you for joining our textile manufacturing platform. Your account has been successfully created.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
            <li><strong>Registration Date:</strong> ${user.createdAt.toLocaleDateString()}</li>
          </ul>
        </div>

        ${
          user.role === "MANUFACTURE"
            ? `
          <p><strong>For Manufacturers:</strong></p>
          <ul>
            <li>Create and manage your collections</li>
            <li>Receive sample requests from customers</li>
            <li>Track production progress</li>
            <li>Communicate directly with customers</li>
          </ul>
        `
            : `
          <p><strong>For Customers:</strong></p>
          <ul>
            <li>Browse manufacturer collections</li>
            <li>Request samples and get quotes</li>
            <li>Place orders and track progress</li>
            <li>Communicate with manufacturers</li>
          </ul>
        `
        }

        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  // Order confirmation email
  static async sendOrderConfirmation(
    order: Order & { customer: User; manufacture: User }
  ) {
    const subject = `Order Confirmation #${order.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Order Confirmed!</h2>
        <p>Dear ${order.customer.name},</p>
        <p>Your order has been confirmed and is now being processed.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Quantity:</strong> ${order.quantity} pieces</li>
            <li><strong>Unit Price:</strong> $${order.unitPrice}</li>
            <li><strong>Total Price:</strong> $${order.totalPrice}</li>
            <li><strong>Status:</strong> ${order.status}</li>
            <li><strong>Manufacturer:</strong> ${order.manufacture.name}</li>
          </ul>
        </div>

        ${
          order.productionDays
            ? `
          <p><strong>Estimated Production Time:</strong> ${order.productionDays} days</p>
        `
            : ""
        }

        ${
          order.manufacturerNote
            ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Manufacturer Notes:</h4>
            <p>${order.manufacturerNote}</p>
          </div>
        `
            : ""
        }

        <p>You will receive updates as your order progresses through production.</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(order.customer.email, subject, html);
  }

  // Order status update email
  static async sendOrderStatusUpdate(
    order: Order & { customer: User; manufacture: User }
  ) {
    const subject = `Order Update #${order.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Order Status Updated</h2>
        <p>Dear ${order.customer.name},</p>
        <p>There's an update on your order:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>New Status:</strong> <span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">${
            order.status
          }</span></p>
        </div>

        ${
          order.manufacturerNote
            ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Latest Update:</h4>
            <p>${order.manufacturerNote}</p>
          </div>
        `
            : ""
        }

        <p>For more details, please log in to your account.</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(order.customer.email, subject, html);
  }

  // Sample request notification for manufacturers
  static async sendSampleRequestNotification(
    sample: Sample & { customer: User; manufacture: User }
  ) {
    const subject = "New Sample Request Received";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Sample Request</h2>
        <p>Dear ${sample.manufacture.name},</p>
        <p>You have received a new sample request:</p>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Sample Request Details:</h3>
          <ul>
            <li><strong>Customer:</strong> ${sample.customer.name}</li>
            <li><strong>Sample Type:</strong> ${
              sample.sampleType || "General"
            }</li>
            <li><strong>Minimum Quantity:</strong> ${
              sample.minimumQuantity || "Not specified"
            } pieces</li>
            <li><strong>Delivery Method:</strong> ${sample.deliveryMethod}</li>
          </ul>
        </div>

        ${
          sample.customerNote
            ? `
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Customer Notes:</h4>
            <p>${sample.customerNote}</p>
          </div>
        `
            : ""
        }

        <p>Please log in to your account to review and respond to this request.</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(sample.manufacture.email, subject, html);
  }

  // Production completion notification
  static async sendProductionCompleted(
    order: Order & { customer: User; manufacture: User }
  ) {
    const subject = `Production Completed - Order #${order.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎉 Production Completed!</h2>
        <p>Dear ${order.customer.name},</p>
        <p>Great news! Production for your order has been completed and is ready for shipping.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Status:</strong> <span style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 4px;">COMPLETED</span></p>
          ${
            order.shippingDate
              ? `<p><strong>Shipping Date:</strong> ${order.shippingDate}</p>`
              : ""
          }
          ${
            order.cargoTrackingNumber
              ? `<p><strong>Tracking Number:</strong> ${order.cargoTrackingNumber}</p>`
              : ""
          }
        </div>

        <p>You will receive shipping details shortly. Thank you for choosing our platform!</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(order.customer.email, subject, html);
  }

  // Quality control issue notification
  static async sendQualityIssueAlert(
    order: Order & { customer: User; manufacture: User },
    issueDetails: string
  ) {
    const subject = `Quality Alert - Order #${order.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Quality Alert</h2>
        <p>Dear ${order.customer.name},</p>
        <p>We've identified a quality concern with your order that requires attention:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <div style="background-color: #fee2e2; padding: 10px; border-radius: 4px;">
            <p><strong>Issue Details:</strong></p>
            <p>${issueDetails}</p>
          </div>
        </div>

        <p>Our team is working on resolving this issue. We'll contact you shortly with next steps.</p>
        <p>We apologize for any inconvenience.</p>
        <p>Best regards,<br>The Textile Platform Team</p>
      </div>
    `;

    await this.sendEmail(order.customer.email, subject, html);

    // Also notify manufacturer
    await this.sendEmail(
      order.manufacture.email,
      `Quality Issue Alert - Order #${order.orderNumber}`,
      html.replace(order.customer.name || "", order.manufacture.name || "")
    );
  }
}
