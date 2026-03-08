import Joi from "joi";

const QueryValidation = {
  ask: Joi.object({
    question: Joi.string().min(5).max(1000).required().messages({
      "string.min": "Câu hỏi quá ngắn",
      "string.max": "Câu hỏi tối đa 1000 ký tự (tránh spam AI)",
      "any.required": "Nội dung câu hỏi là bắt buộc",
    }),
  }),
};

export default QueryValidation;
