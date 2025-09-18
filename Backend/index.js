const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://hrithikasridhar2_db_user:mypassword123@cluster0.svnubsa.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB", err));


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const Credential = mongoose.model(
  "credential",
  new mongoose.Schema({
    user: String,
    pass: String,
  }),
  "bulkmail"
);

app.post("/sendMail", async (req, res) => {
  const { msg, subject, emailList } = req.body;

  console.log("Incoming request:", req.body);

  if (!msg || !subject || !emailList || emailList.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Subject, message or email list missing" });
  }

  try {
    const data = await Credential.find();

    if (!data || data.length === 0) {
      console.error("No credentials found in DB");
      return res
        .status(500)
        .json({ status: "error", message: "No credentials found in database" });
    }

    const { user, pass } = data[0];

    if (!user || !pass) {
      console.error("Credentials are incomplete:", data[0]);
      return res
        .status(500)
        .json({ status: "error", message: "Invalid credentials in database" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: user.trim(), pass: pass.trim() },
    });

    await transporter.verify();
    console.log("Transporter verified successfully");

    let success = [];
    let failed = [];

    for (let recipient of emailList) {
      try {
        await transporter.sendMail({
          from: user,
          to: recipient,
          subject,
          text: msg,
        });
        success.push(recipient);
      } catch (e) {
        console.error("Failed to send to", recipient, e);
        failed.push(recipient);
      }
    }

    if (failed.length === 0) {
      return res.json({ status: "success", sent: success.length, failed: 0 });
    } else if (success.length > 0) {
      return res.json({
        status: "partial",
        sent: success.length,
        failed: failed.length,
      });
    } else {
      return res.json({ status: "error", sent: 0, failed: emailList.length });
    }
  } catch (err) {
    console.error("Send error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to send emails" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});
