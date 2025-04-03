import { ExpressHandler } from "../@types/constants";
import { UnauthorizedException } from "../utils/appError";

const isAuthenticated: ExpressHandler = async (req, res, next) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized. Please login");
  }
  next();
};

export default isAuthenticated;
