import Joi from "joi";

const UserValidation = {
  idParam: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "ID người dùng phải là một số",
      "number.integer": "ID phải là số nguyên",
      "number.positive": "ID không hợp lệ",
      "any.required": "Thiếu ID người dùng trên URL",
    }),
  }),

  emailParam: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email không đúng định dạng",
      "any.required": "Email là bắt buộc để thực hiện thao tác này",
    }),
  }),
};

export default UserValidation;
