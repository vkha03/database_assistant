import AppError from "../utils/error.util.js";

const validate =
  (schema, proprety = "body") =>
  (req, res, next) => {
    const { error } = schema.validate(req[proprety], { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new AppError(`Lỗi input:  ${errorMessage}`, 400));
    }

    next();
  };

export default validate;
