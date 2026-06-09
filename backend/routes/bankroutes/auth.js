import express from "express";
import Bank from "../models/bank.model";

const bankRouter = express.Router();

// Login Bank
bankRouter.post("/login", async (req, res) => {
  try {
    const { bankKey } = req.body;

    if (!bankKey) {
      return res.status(400).json({
        success: false,
        message: "Bank key is required",
      });
    }

    const bank = await Bank.findOne({ bankKey });

    if (!bank) {
      return res.status(404).json({
        success: false,
        message: "Invalid bank key",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      bank: {
        id: bank._id,
        bankName: bank.bankName,
        bankKey: bank.bankKey,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all banks
router.get("/get", async (req, res) => {
  try {
    const banks = await Bank.find();

    res.status(200).json({
      success: true,
      banks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default bankRouter;
