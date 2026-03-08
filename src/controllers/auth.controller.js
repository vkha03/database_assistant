import AuthService from "../services/auth.service.js";
import responseSuccess from "../utils/response.js";

const AuthController = {
  loginGoogle: async (req, res, next) => {
    const { idToken } = req.body;
    const result = await AuthService.loginGoogle(idToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const dataPayload = {
      accessToken: result.accessToken,
      user: result.user,
    };

    return responseSuccess(res, dataPayload, 200);
  },

  refreshToken: async (req, res, next) => {
    const currentToken = req.cookies?.refreshToken;
    if (!currentToken) {
      const error = new Error("Không tìm thấy Refresh Token trong Cookie!");
      error.statusCode = 401;
      throw error;
    }

    const result = await AuthService.refreshToken(currentToken);

    res.cookie("refreshToken", result.newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const dataPayload = {
      accessToken: result.newAccessToken,
      user: result.user,
    };

    return responseSuccess(res, dataPayload, 200);
  },

  logout: async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    return responseSuccess(res, { message: "Đăng xuất thành công" }, 200);
  },
};

export default AuthController;
