import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { environment } from 'environments/environment';

@Injectable()
export class ContactService {
  async sendContactForm(email: string, subject: string, message: string): Promise<string> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: environment.MAILER_USER,
        pass: environment.MAILER_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: 'nextrip.company@gmail.com',
      subject: subject,
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      return 'Email sent successfully';
    } catch (error) {
      return `Failed to send email: ${error.message}`;
    }
  }
}
