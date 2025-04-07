import { Router } from "express";
import {
  createWorkspaceController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
} from "../controllers/workspace.controller";

const workspaceRoutes = Router();

workspaceRoutes.post(`/create/new`, createWorkspaceController);

workspaceRoutes.get(`/all`, getAllWorkspacesUserIsMemberController);

workspaceRoutes.get(`/members/:id`, getWorkspaceMembersController);

workspaceRoutes.get(`/analytics/:id`, getWorkspaceAnalyticsController);

workspaceRoutes.get(`/:id`, getWorkspaceByIdController);

export default workspaceRoutes;
