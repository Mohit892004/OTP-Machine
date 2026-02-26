require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// Store OTP per phone number
const otpStore = {};

app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.json({ success: false, message: "Phone number required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    try {
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE,
            to: phone
        });

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.post("/verify-otp", (req, res) => {
    const { phone, otp } = req.body;

    if (otpStore[phone] === otp) {
        delete otpStore[phone];
        res.json({ success: true, message: "Welcome! OTP Verified Successfully 🎉" });
    } else {
        res.json({ success: false, message: "Invalid OTP ❌" });
    }
});

app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
);