import Joi from "joi";

const DbValidation = {
  idParam: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "ID kết nối phải là một số",
      "number.integer": "ID phải là số nguyên",
      "number.positive": "ID không hợp lệ",
      "any.required": "Thiếu tham số ID trên URL",
    }),
  }),

  create: Joi.object({
    db_host: Joi.string().hostname().max(255).required().messages({
      "string.hostname":
        "Host không đúng định dạng (VD: localhost hoặc 127.0.0.1)",
      "any.required": "Địa chỉ Host là bắt buộc",
    }),
    db_port: Joi.number()
      .integer()
      .min(1)
      .max(65535)
      .default(3306)
      .required()
      .messages({
        "number.min": "Cổng Port không hợp lệ",
        "number.max": "Cổng Port không được vượt quá 65535",
        "any.required": "Cổng Port là bắt buộc",
      }),
    db_name: Joi.string().trim().max(255).required().messages({
      "string.empty": "Tên Database không được để trống",
      "any.required": "Tên Database là bắt buộc",
    }),
    db_user: Joi.string().trim().max(255).required().messages({
      "any.required": "User Database là bắt buộc",
    }),
    db_password: Joi.string().allow("").max(255).required().messages({
      "any.required": "Trường mật khẩu là bắt buộc (có thể để trống)",
    }),
  }),

  update: Joi.object({
    db_host: Joi.string().hostname().max(255),
    db_port: Joi.number().integer().min(1).max(65535),
    db_name: Joi.string().trim().max(255),
    db_user: Joi.string().trim().max(255),
    db_password: Joi.string().allow("").max(255),
  })
    .min(1)
    .messages({
      "object.min": "Bạn phải cung cấp ít nhất một thông tin cần thay đổi",
    }),
};

export default DbValidation;
