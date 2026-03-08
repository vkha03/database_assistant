import Joi from "joi";

const AuthValidation = {
  loginGoogle: Joi.object({
    idToken: Joi.string().required().messages({
      "string.base": "Google ID Token phải là một chuỗi ký tự",
      "any.required": "Thiếu Google ID Token để xác thực",
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.base": "Refresh Token không hợp lệ",
      "any.required": "Không tìm thấy Refresh Token trong hệ thống",
    }),
  }),
};

export default AuthValidation;
