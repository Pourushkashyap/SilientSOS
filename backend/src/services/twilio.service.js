class TwilioService {
  async sendSMS(to, message) {
    if (!to) {
      console.log("❌ No number provided");
      return;
    }

    console.log("📩 Dummy SMS sent to:", to);
    console.log("📝 Message:", message);
  }
}