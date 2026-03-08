import AppError from "../utils/error.util.js";
import JwtUtils from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import AuthModel from "../models/auth.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const AuthService = {
  loginGoogle: async (idToken) => {
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      throw new AppError("Token Google không hợp lệ hoặc đã hết hạn!", 401);
    }

    const { sub: googleId, email } = ticket.getPayload();
    let user = await AuthModel.findUserByGoogleId(googleId);
    if (!user) {
      const insertId = await AuthModel.createUserGoogle(googleId, email);
      user = { id: insertId, google_id: googleId, email, role: "user" };
    }

    const accessToken = JwtUtils.generateAccessToken(user);
    const refreshToken = JwtUtils.generateRefreshToken(user);

    const expiresAt = new Date(
      Date.now() + process.env.EXPIRE_AT_REFRESH * 24 * 60 * 60 * 1000,
    );
    await AuthModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  refreshToken: async (currentToken) => {
    let decoded;
    try {
      decoded = JwtUtils.verifyRefreshToken(currentToken);
    } catch (error) {
      await AuthModel.deleteRefreshTokenByToken(currentToken);
      throw new AppError("Refresh Token không hợp lệ hoặc đã hết hạn!", 401);
    }

    const rtRecord = await AuthModel.findRefreshToken(currentToken);
    if (!rtRecord) {
      throw new AppError("Token bất hợp pháp hoặc đã bị thu hồi!", 401);
    }

    await AuthModel.deleteRefreshTokenById(rtRecord.id);

    const user = await AuthModel.findUserById(decoded.id);
    if (!user) {
      throw new AppError("Không tìm thấy thông tin tài khoản!", 404);
    }

    const newAccessToken = JwtUtils.generateAccessToken(user);
    const newRefreshToken = JwtUtils.generateRefreshToken(user);

    const expiresAt = new Date(
      Date.now() + process.env.EXPIRE_AT_REFRESH * 24 * 60 * 60 * 1000,
    );
    await AuthModel.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      newAccessToken,
      newRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  logout: async (refreshToken) => {
    await AuthModel.deleteRefreshTokenByToken(refreshToken);
  },
};

export default AuthService;
