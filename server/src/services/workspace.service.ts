import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/appError";
import WorkspaceModel from "../models/workspace.model";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";

// ********************************
// CREATE NEW WORKSPACE
// *******************************/
export const createWorkspaceService = async (
  userId: string,
  body: { name: string; description?: string | undefined }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

  if (!ownerRole) throw new NotFoundException("Owner role not found");

  const workspace = new WorkspaceModel({
    name,
    description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return { workspace };
};

// ********************************
// GET WORKSPACE USER IS A MEMBER
// *******************************/
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberShips = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberShips.map((memberShip) => memberShip.workspaceId);

  return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({ workspaceId }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
};

// ********************************
// GET ALL MEMBER IN WORKSPACE
// *******************************/
export const getWorkspaceMembersService = async (workspaceId: string) => {
  // Fetch all member of the workspace

  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name, email profilePicture -password")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("_permission")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTask = await TaskModel.countDocuments({
    workspace: workspaceId,
  });

  const overDueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: TaskStatusEnum.DONE,
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTask,
    overDueTasks,
    completedTasks,
  };

  return { analytics };
};
