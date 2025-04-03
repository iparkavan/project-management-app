import passport from "passport";
import { ExpressHandler } from "../@types/constants";
import { config } from "../config/app-config";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { registerUserService } from "../services/auth.service";
import { registerSchema } from "../validations/auth.validation";
import { Express } from "express";
import { error } from "console";

export const googleLoginCallback = asyncHandler(async (req, res, next) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }

  return res.redirect(`${config.FRONTEND_ORGIN}/workspace/${currentWorkspace}`);
});

export const registerUserController = asyncHandler(async (req, res, next) => {
  const body = registerSchema.parse({ ...req.body });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});

export const loginController: ExpressHandler = asyncHandler(
  async (req, res, next) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user,
          });
        });
      }
    )(req, res, next);
  }
);

export const logoutController: ExpressHandler = asyncHandler(
  async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.log("Logout error", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "failed to log out" });
      }
    });

    req.session = null;
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Successfully logged out" });
  }
);
