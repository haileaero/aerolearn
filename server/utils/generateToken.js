import jwt from "jsonwebtoken";

/* ============================================================
   Generate JWT Token
============================================================ */

const generateToken = (
  userId,
  role
) => {

  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRE ||
        "30d",
    }
  );

};

export default generateToken;