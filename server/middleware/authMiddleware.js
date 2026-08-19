import jwt from "jsonwebtoken";
import User from "../models/user.js";

/* ============================================================
   PROTECT ROUTES
============================================================ */

export const protect = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({

        message:
          "Access denied. No authentication token provided.",

      });

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {

      return res.status(401).json({

        message:
          "User no longer exists.",

      });

    }

    if (user.isActive === false) {

      return res.status(403).json({

        message:
          "Your account has been deactivated. Please contact the administrator.",

      });

    }

    req.user = user;

    return next();

  } catch (error) {

    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({

      message:
        "Invalid or expired authentication token.",

    });

  }

};

/* ============================================================
   ROLE AUTHORIZATION
============================================================ */

export const authorize =
  (...roles) =>
  (
    req,
    res,
    next
  ) => {

    if (!req.user) {

      return res.status(401).json({

        message:
          "Authentication required.",

      });

    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {

      return res.status(403).json({

        message:
          "You do not have permission to access this resource.",

      });

    }

    return next();

  };

/* ============================================================
   OPTIONAL AUTHENTICATION
   (Use when login is optional)
============================================================ */

export const optionalAuth =
  async (
    req,
    res,
    next
  ) => {

    try {

      const authHeader =
        req.headers.authorization;

      if (
        authHeader &&
        authHeader.startsWith(
          "Bearer "
        )
      ) {

        const token =
          authHeader.split(" ")[1];

        const decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET
          );

        const user =
          await User.findById(
            decoded.id
          ).select("-password");

        if (
          user &&
          user.isActive
        ) {

          req.user = user;

        }

      }

    } catch {

      // Ignore authentication errors
      // because authentication is optional.

    }

    next();

  };
  