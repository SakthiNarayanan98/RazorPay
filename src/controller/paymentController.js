import razorpayInstance from "../middleware/razorpay.js";
import crypto from "crypto";

/**
 * Create Razorpay Order
 */

export const createPaymentLink = async (req, reply) => {

  try {

    const { amount, name, phone } = req.body;

    const paymentLink = await razorpayInstance.paymentLink.create({
      amount: amount * 100,
      currency: "INR",

      customer: {
        name,
        contact: phone,
      },
    });

    return reply.send({
      success: true,
      link: paymentLink.short_url,
    });

  } catch (err) {

    return reply.code(500).send({
      success: false,
      error: err.message,
    });
  }
};
export const createOrder = async (req, reply) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return reply.code(400).send({ message: "Amount is required" });
    }

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return reply.code(200).send({
      success: true,
      key: process.env.RAZORPAY_KEY_ID, // 👈 IMPORTANT for frontend
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    return reply.code(500).send({ error: err.message });
  }
};

/**
 * Verify Payment
 */
export const verifyPayment = async (req, reply) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("asdfghjkljhgfd",body);
    

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    console.log("isValid",isValid);
    

    if (!isValid) {
      return reply.code(400).send({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 👉 Save to DB here (VERY IMPORTANT)

    return reply.code(200).send({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error("Verify Error:", err);
    return reply.code(500).send({ error: err.message });
  }
};