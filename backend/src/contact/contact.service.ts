// contact.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { environment } from 'environments/environment';

@Injectable()
export class ContactService {
  async sendContactForm(email: string, subject: string, message: string) {
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
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
