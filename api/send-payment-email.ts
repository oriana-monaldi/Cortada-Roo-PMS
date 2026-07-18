import sendPaymentEmailHandler from "./send-payment-email/[reservationId]";

export const runtime = "nodejs";

export default {
  async fetch(request: Request) {
    return sendPaymentEmailHandler.fetch(request);
  },
};
