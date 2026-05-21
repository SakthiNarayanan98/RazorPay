import { createOrder, verifyPayment, createPaymentLink } from "../controller/paymentController.js";

export default async function workflowRouter(app) {
  app.post("/payment",createOrder);
  app.post("/payment/verify", verifyPayment);
  app.post("/payment-sms", createPaymentLink);
}
