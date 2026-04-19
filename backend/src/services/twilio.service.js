const twilio = require('twilio');

class TwilioService {
  constructor() {
    // Requires strict environment setup
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15550000000';
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendSMS(to, body) {
    if (!this.client) return console.log(`[Mock SMS] to ${to}: ${body}`);
    try {
      await this.client.messages.create({ body, from: this.fromNumber, to });
    } catch (e) {
      console.log('Twilio SMS error:', e);
    }
  }

  async sendWhatsApp(to, body) {
    if (!this.client) return console.log(`[Mock WhatsApp] to ${to}: ${body}`);
    try {
      await this.client.messages.create({ 
        body, 
        from: 'whatsapp:+14155238886', // Sandbox number
        to: `whatsapp:${to}` 
      });
    } catch (e) {
      console.log('Twilio WA error:', e);
    }
  }

  async dispatchAlertCommunications(contacts, ngo, locationUrl, audioUrl) {
    const message = `URGENT: Your contact may be in danger. Location: ${locationUrl}. Audio evidence: ${audioUrl}. DO NOT call her — go to her location immediately or contact local authorities.`;
    
    for (const contact of contacts) {
      if (!contact) continue;
      await this.sendSMS(contact, message);
      await this.sendWhatsApp(contact, message);
    }

    if (ngo && ngo.phone) {
      await this.sendSMS(ngo.phone, `EMERGENCY ALERT in your vicinity. User tracking link: ${locationUrl}`);
    }
  }
}

module.exports = new TwilioService();
