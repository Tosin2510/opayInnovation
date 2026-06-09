import bycrypt from 'bcryptjs';
import User from '../../models/user.model';
const router=express.Router();

router.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message : 'Please enter all fields'})
    }
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message : 'Invalid credentials'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
    }catch(err){

    }
})

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