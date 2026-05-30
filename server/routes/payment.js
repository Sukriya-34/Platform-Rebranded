import express from "express";
import crypto from "crypto";
import prisma from "../db.js";

const router = express.Router();

// eSewa Sandbox credentials
const ESEWA_SECRET_KEY = "8g8M8PLHPNWqCWs";
const ESEWA_PRODUCT_CODE = "EPAYTEST";

// Generate eSewa Signature
function generateSignature(amount, transactionUuid) {
  const data = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

// 1. Initiate eSewa Payment Parameters
router.post("/initiate-esewa", async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ message: "userId and courseId are required" });
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const amount = course.price || 500; // fallback to 500
    const transactionUuid = `TXN-${userId}-${courseId}-${Date.now()}`;
    const signature = generateSignature(amount, transactionUuid);

    res.json({
      amount,
      tax_amount: 0,
      product_service_charge: 0,
      product_delivery_charge: 0,
      product_code: ESEWA_PRODUCT_CODE,
      signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      transaction_uuid: transactionUuid,
      success_url: `http://localhost:5000/api/payment/esewa-success`,
      failure_url: `http://localhost:5173/learner/courses/${courseId}?payment=failed`,
      esewa_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error initiating payment" });
  }
});

// 2. eSewa Success Callback
router.get("/esewa-success", async (req, res) => {
  const { data } = req.query;

  if (!data) {
    return res.redirect("http://localhost:5173/learner/dashboard?payment=invalid");
  }

  try {
    // Decode eSewa base64 encoded response data
    const decodedString = Buffer.from(data, "base64").toString("utf-8");
    const response = JSON.parse(decodedString);

    if (response.status === "COMPLETE") {
      const parts = response.transaction_uuid.split("-");
      const userId = parseInt(parts[1]);
      const courseId = parts[2];

      // Check if enrollment already exists
      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
            progress: 0,
          },
        });
      }

      // Create a notification
      await prisma.notification.create({
        data: {
          userId,
          message: `Payment successful! You have unlocked the course.`,
        },
      });

      // Redirect back to course page
      return res.redirect(`http://localhost:5173/learner/courses/${courseId}?payment=success`);
    } else {
      return res.redirect(`http://localhost:5173/learner/dashboard?payment=failed`);
    }
  } catch (error) {
    console.error("eSewa callback error:", error);
    return res.redirect(`http://localhost:5173/learner/dashboard?payment=error`);
  }
});

// Mock offline QR code verification
router.post("/qr-verify", async (req, res) => {
  const { userId, courseId, refId } = req.body;

  try {
    await prisma.enrollment.create({
      data: {
        userId: parseInt(userId),
        courseId,
        progress: 0,
      },
    });

    await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        message: `Offline QR code verification successful (Ref: ${refId}). Course unlocked!`,
      },
    });

    res.json({ success: true, message: "Course unlocked via offline QR verification!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;
