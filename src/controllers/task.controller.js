import { db } from "../libs/db.js"; // assumes your Prisma client is here

// Create Task - Only Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedToId } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can create tasks" });
    }
    
    let assignedUser = null;
    if (assignedToId) {
      assignedUser = await db.user.findUnique({
        where: { id: assignedToId }
      });
      
       if (!assignedUser) {
        return res.status(400).json({ message: "Assigned user not found" });
      }
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: new Date(dueDate),
        assignedTo: assignedUser ? { connect: { id: assignedUser.id } } : undefined
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await db.task.findMany({
      where:
        req.user.role === "ADMIN"
          ? {}
          : { assignedToId: req.user.id },
      include: {
        assignedTo: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.task.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "ADMIN" && task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, assignedToId } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can update tasks" });
    }

    const task = await db.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo: assignedToId
          ? { connect: { id: assignedToId } }
          : { disconnect: true },
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can delete tasks" });
    }

    await db.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
