const validate =
  (schema, proprety = "body") =>
  (req, res, next) => {
    const { error } = schema.validate(req[proprety], { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(
        Object.assign(new Error("Lỗi input: ", errorMessage), {
          statusCode: 400,
        }),
      );
    }

    next();
  };

export default validate;
