import express from "express";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";

const messageRouter = express.Router();

messageRouter.post("/create", async (req, res) => {
  try {
    const { customerId, messageBody } = req.body;

    const user = await User.findOne({ customerId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const message = await Message.create({
      messageBody
    });


    //call the encryption here
    const tokenData = validator.generateToken({
        messageId: message._id,
        userId: user._id,
        bankKey: "044",
        ttl: 300000
    });

    message[0].token = tokenData.token;
    message[0].iv = tokenData.iv;
    message[0].authTag = tokenData.authTag;

    res.status(201).json({
      success: true,
      data: message,
    });



  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

messageRouter.post("/validate", async (req, res) => {
    try {
        const {token, iv, authTag} = req.body;

        const payload = validator.validateToken({
            token,
            iv,
            authTag
        });


        //check if the token is valid (verify ownership)
        if (payload.userId !== user._id.toString()) {
              return res.status(400).json({ message: "Invalid User" })
            }

        if (payload.messageId !== message._id.toString()) {
            return res.status(400).json({ message: "Invalid Message" })
        }

        res.status(201).json({ message: "Valid Token. Message Verified!"})
    } catch (error) {
       res.status(500).json({
      success: false,
      message: error.message,
    }); 
    }
})

export default messageRouter;