import { db } from "../libs/db.js";

// GET /api/users - Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

// GET /api/users/:id - Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

// PUT /api/users/:id - Update user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email is already taken",
        });
      }
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role.toUpperCase();

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

// DELETE /api/users/:id - Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent admin from deleting themselves
    if (id === currentUserId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete the user (tasks will be set to null due to onDelete: SetNull)
    await db.user.delete({
      where: { id },
    });

    res.status(200).json({
      message: `User deleted successfully. ${existingUser._count.assignedTasks} tasks were unassigned.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};
