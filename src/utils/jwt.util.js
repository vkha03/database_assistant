import jwt from "jsonwebtoken";

const JwtUtils = {
  generateAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.EXPIRE_IN_ACCESS },
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.EXPIRE_IN_REFRESH,
    });
  },

  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return null;
    }
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  },
};

export default JwtUtils;
