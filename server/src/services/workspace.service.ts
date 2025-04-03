import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/appError";
import workspaceModel from "../models/workspace.model";

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

  const workspace = new workspaceModel({
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
