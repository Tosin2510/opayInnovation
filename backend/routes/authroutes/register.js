import { Router } from "express";
import User from './user.model.js'
const router=express.Router()

router.post('/register',async(req,res)=>{
    const {username,email,password}=req.body;

    if( !username || !email || !password){
        return res.status(400).json({})
    }
})


