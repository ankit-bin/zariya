import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try{
        //YAHA PR BHI CHANGE KIYA GAYA HAI .. 
        //const token = req.cookies.token;
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
        if (!token) {
            return res.status(401).json({ message: "Unauthorized",success:false });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized",success:false });
        }
        req.id = decoded.userId;


        
        next();

    }catch(error){
        return res.status(500).json({ message: "is authenication middleware fail Internal server error" });
    }
}
export default isAuthenticated;