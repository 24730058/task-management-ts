import {Request, Response} from "express";
import md5 from "md5";
import * as generateHelper from "../../../helpers/generate.helper"
import {sendMail} from "../../../helpers/sendMail.helper";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model";
import {ForgotPassword} from "../models/forgot-password.model";

export const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const fullName: string = req.body.fullName;
        const email: string = req.body.email;
        const password: string = md5(req.body.password);
        const user = new User({
            fullName: fullName,
            email: email,
            password: password});
        await user.save();
        res.status(201).json({
            code: 201,
            message: "User registered successfully",
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error registering user",
            error: error.message
        });
    }

}

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const email: string = req.body.email;
        const password: string = md5(req.body.password);

        const user = await User.findOne({
            email: email,
            password: password,
            deleted: false
        });
        if (!user) {
            res.status(401).json({
                code: 401,
                message: "Invalid email or password"
            });
            return;
        }

        // Tạo token JWT
        const token = jwt.sign({ 
            userId: user.id,
            userEmail: user.email  // Thêm email
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

         // Gửi token về dưới dạng cookie (httpOnly)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // dùng true nếu là HTTPS
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 giờ
        });

        res.json({
            code: 200,
            message: "Login successful",
        });

    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error logging in",
            error: error.message
        });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Xoá cookie token
        res.clearCookie("token");

        res.json({
            code: 200,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error logging out",
            error: error.message
        });
    }
}

export const profile = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                code: 401,
                message: "Unauthorized"
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                code: 404,
                message: "User not found"
            });
            return;
        }

        res.json({
            code: 200,
            message: "Profile retrieved successfully",
            data: {
                fullName: user.fullName,
                email: user.email,
            }
        });

    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error retrieving profile",
            error: error.message
        });
    }
}

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const email: string = req.body.email;
        const user = await User.findOne({ email: email, deleted: false });
        if (!user) {
            res.status(404).json({
                code: 404,
                message: "User not found"
            });
            return;
        }
        // Tạo mã xác thực
        const otp = generateHelper.generateRandomNumber(6);
        // Lưu mã xác thực vào cơ sở dữ liệu (có thể là một trường mới trong User)
        const data = new ForgotPassword({
            email: email,
            otp: otp,
            expireAt: new Date(Date.now() + 5 * 60 * 1000) // Hết hạn sau 5 phút
        });
        await data.save();
        
        // Gửi mã xác thực qua email (giả sử bạn đã cấu hình gửi email)
        const subject = "Mã xác thực quên mật khẩu";
        const content = `Mã xác thực của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`;
        await sendMail(email, subject, content);

        res.status(200).json({
            code: 200,
            message: "OTP sent to your email",
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error sending OTP",
            error: error.message
        });
    }
}

export const otpPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const email: string = req.body.email;
        const otp: string = req.body.otp;

        // Kiểm tra mã OTP trong bảng ForgotPassword
        const forgotRecord = await ForgotPassword.findOne({
            email: email,
            otp: otp
        });

        if (!forgotRecord) {
            res.status(400).json({
                code: 400,
                message: "Invalid OTP"
            });
            return;
        }

        //Tìm User thật trong bảng User
        const realUser = await User.findOne({
            email: email,
            deleted: false
        });

        if (!realUser) {
            res.status(404).json({
                code: 404,
                message: "User not found"
            });
            return;
        }

         // Sử dụng ID của User thật
        const token = jwt.sign({ 
            userId: realUser.id,      //  ID của User thật
            userEmail: realUser.email // Thêm email để chắc chắn
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
        });
        
        res.json({
            code: 200,
            message: "OTP verified successfully",
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error verifying OTP",
            error: error.message
        });
    }
}

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId: string = req.user?.userId;
        const newPassword: string = req.body.password;
        
        if (!userId) {
            res.status(401).json({
                code: 401,
                message: "Unauthorized"
            });
            return;
        }

        const hashedPassword = md5(newPassword);

        await User.updateOne({
            _id: userId
        },{
            password: hashedPassword
        });

        res.json({
            code: 200,
            message: "Password reset successfully"
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error resetting password",
            error: error.message
        });
    }
}
