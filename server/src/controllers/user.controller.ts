import { ExpressHandler } from "../@types/constants";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { fetchCurrentUserService } from "../services/user.service";

export const getCurrentUserController: ExpressHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.user?._id;

    const { user } = await fetchCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched Successfully",
      user,
    });
  }
);
