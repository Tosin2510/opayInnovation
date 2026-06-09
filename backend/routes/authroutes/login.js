import bycrypt from 'bcryptjs';
import User from '../../models/user.model';
const router=express.Router();

router.post('./login',async(req,res)=>{
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
export default router