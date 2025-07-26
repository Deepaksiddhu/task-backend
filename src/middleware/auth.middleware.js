import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";
import e from "express";


export const authMiddleware = async (req,res,next) =>{
    try {
        console.log("=== AUTH MIDDLEWARE DEBUG ===");
        console.log("Request headers:", req.headers);
        console.log("All cookies:", req.cookies);
        console.log("JWT cookie:", req.cookies?.jwt);
        console.log("Cookie header:", req.headers.cookie);
        
        const token = req.cookies?.jwt;
        if(!token)
        {
            console.log("No token found in cookies");
            return res.status(401).json({
                message:"Unauthorized - No token provided"
            })
        }

        let decoded;

        try {
            console.log("Attempting to verify token:", token.substring(0, 20) + "...");
            console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
            decoded = jwt.verify(token,process.env.JWT_SECRET)
            console.log("Token verified successfully, decoded:", decoded);
        } catch (error) {
            console.log("JWT verification failed:", error.message);
            return res.status(401).json({
                message:"Unauthorized - Invalid token"
            })
        }
        

        const user = await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                id:true,
                name:true,
                email:true, 
                role:true
            }
        })


        if(!user)
        {
            return res.status(404).json({
                message:"User not found"
            })
        }

        req.user = user;

        next();
    


    } catch (error) {
        console.log("Error authenticating user:",error);
        return res.status(500).json({
            message:"Error authenticating user"
        })
        
    }
}



export const checkAdmin = async (req,res,next) =>{
    try {
        const userId = req.user.id;
    
        const user = await db.user.findUnique({
            where:{
                id:userId
            },
            select:{
                role:true
            }
        })

        if(!user || user.role !=="ADMIN")
        {
            return res.status(403).json({
                message:"Access denied - Admins only",
                success:false
            })
        }

        next()


    } catch (error) {
        console.log("Error :",error);
        return res.status(500).json({
            message:"Error checking admin role",
            success:false
        })
        
    }
}