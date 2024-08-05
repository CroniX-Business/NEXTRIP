import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContactForm(
    @Body() body: { email: string; subject: string; message: string },
  ) {
    return this.contactService.sendContactForm(
      body.email,
      body.subject,
      body.message,
    );
  }
}
