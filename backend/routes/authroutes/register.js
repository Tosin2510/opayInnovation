import { Router } from "express";
import User from './user.model.js'
const router=express.Router()

router.post('/register',async(req,res)=>{
    const {username,email,password}=req.body;

    if( !username || !email || !password){
        return res.status(400).json({message: 'Enter all your field'})
    }
    try{
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message : 'User already exists'})
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            username,
            email,
            password:hashedPassword
        })
        const savedUser=await User.create(newUser)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: savedUser._index,
                username: savedUser.username,
                email: savedUser.email
            }
        });

    }catch(err){
        res.status(500).json({message: `Server error`, error:error.message})
    }
})
export default router

