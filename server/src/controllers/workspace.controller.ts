import { ExpressHandler } from "../@types/constants";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createWorkspaceService,
  getAllWorkspacesUserIsMemberService,
} from "../services/workspace.service";
import { createWorkspaceSchema } from "../validations/workspace.validation";

export const createWorkspaceController: ExpressHandler = asyncHandler(
  async (req, res, next) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;

    const { workspace } = await createWorkspaceService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      workspace,
    });
  }
);

export const getAllWorkspacesUserIsMemberController: ExpressHandler =
  asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspace fetched successfully",
      workspaces,
    });
  });

export const getWorkspaceByIdController = asyncHandler(
  async (req, res, next) => {}
);
