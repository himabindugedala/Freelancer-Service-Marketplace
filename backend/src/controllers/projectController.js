import { Project } from '../models/Project.js';
import { Proposal } from '../models/Proposal.js';
import { Category } from '../models/Category.js';

export const getOpenProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      skill,
      minBudget,
      maxBudget,
      budgetType,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'open' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (budgetType && budgetType !== 'all') {
      query.budgetType = budgetType;
    }

    if (minBudget || maxBudget) {
      if (minBudget) query.budgetMax = { ...query.budgetMax, $gte: Number(minBudget) };
      if (maxBudget) query.budgetMin = { ...query.budgetMin, $lte: Number(maxBudget) };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'budget_desc') sortOptions = { budgetMax: -1 };
    else if (sort === 'budget_asc') sortOptions = { budgetMin: 1 };
    else if (sort === 'proposals_desc') sortOptions = { proposalsCount: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('client', 'name avatar')
        .populate('category', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('client', 'name avatar createdAt')
      .populate('category', 'name slug icon')
      .populate('hiredFreelancer', 'name avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if the current requesting user has already submitted a proposal
    let myProposal = null;
    if (req.user && req.user.role === 'freelancer') {
      myProposal = await Proposal.findOne({ project: project._id, freelancer: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        myProposal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budgetType,
      budgetMin,
      budgetMax,
      deadline,
      attachments,
    } = req.body;

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      category,
      skills: Array.isArray(skills) ? skills : [skills],
      budgetType: budgetType || 'fixed',
      budgetMin,
      budgetMax,
      deadline: new Date(deadline),
      attachments: attachments || [],
      status: 'open',
    });

    const populated = await Project.findById(project._id)
      .populate('category', 'name slug icon')
      .populate('client', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Project posted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getClientProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate('category', 'name slug icon')
      .populate('hiredFreelancer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this project.' });
    }

    if (project.status !== 'open' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Project cannot be edited because it is currently '${project.status}'.`,
      });
    }

    const updated = await Project.findByIdAndUpdate(id, { $set: req.body }, { new: true })
      .populate('category', 'name slug icon')
      .populate('client', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const closeProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this project.' });
    }

    if (project.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a project that has an active hire in progress. Please manage the order directly.',
      });
    }

    project.status = 'cancelled';
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project closed successfully',
    });
  } catch (error) {
    next(error);
  }
};
