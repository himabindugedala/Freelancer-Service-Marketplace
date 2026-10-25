import { findSmartMatchesForProject } from '../services/matchingService.js';
import { Project } from '../models/Project.js';

export const getMatchesForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const matches = await findSmartMatchesForProject(projectId, 8);

    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const previewMatchesForDraft = async (req, res, next) => {
  try {
    const { category, skills, budgetType, budgetMin, budgetMax } = req.body;
    const mockProject = {
      category,
      skills: Array.isArray(skills) ? skills : [skills],
      budgetType: budgetType || 'fixed',
      budgetMin: Number(budgetMin) || 10,
      budgetMax: Number(budgetMax) || 500,
    };

    const matches = await findSmartMatchesForProject(mockProject, 5);

    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};
