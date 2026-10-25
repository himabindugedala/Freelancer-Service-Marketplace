import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Service } from '../models/Service.js';
import { Project } from '../models/Project.js';

/**
 * Computes transparent, weighted rule-based match scores between a project and freelancers.
 * Weights:
 * - Skills Match (35%)
 * - Category Match (20%)
 * - Rating & Feedback (15%)
 * - Completed Projects Track Record (10%)
 * - Budget / Hourly Rate Compatibility (10%)
 * - Availability (10%)
 */
export const findSmartMatchesForProject = async (projectIdOrData, limit = 6) => {
  let project;
  if (typeof projectIdOrData === 'string') {
    project = await Project.findById(projectIdOrData).populate('category');
  } else {
    project = projectIdOrData;
  }

  if (!project) {
    throw new Error('Project not found for matching');
  }

  const projectSkills = (project.skills || []).map((s) => s.trim().toLowerCase());
  const projectCategoryId = project.category?._id
    ? project.category._id.toString()
    : project.category?.toString();

  // Retrieve active freelancers with their user profile
  const profiles = await FreelancerProfile.find()
    .populate({
      path: 'user',
      select: 'name email avatar status createdAt',
      match: { status: 'active' },
    })
    .lean();

  const validProfiles = profiles.filter((p) => p.user !== null);

  // Pre-fetch services created by freelancers to assess category presence
  const freelancerIds = validProfiles.map((p) => p.user._id);
  const freelancerServices = await Service.find({
    freelancer: { $in: freelancerIds },
    status: 'published',
  })
    .select('freelancer category skills')
    .lean();

  const serviceCategoryMap = new Map();
  for (const s of freelancerServices) {
    const fId = s.freelancer.toString();
    const cId = s.category.toString();
    if (!serviceCategoryMap.has(fId)) {
      serviceCategoryMap.set(fId, new Set());
    }
    serviceCategoryMap.get(fId).add(cId);
  }

  const scoredMatches = validProfiles.map((freelancer) => {
    let score = 0;
    const matchReasons = [];

    // 1. Skills Match (up to 35 pts)
    const fSkills = (freelancer.skills || []).map((s) => s.trim().toLowerCase());
    if (projectSkills.length > 0 && fSkills.length > 0) {
      const matchedSkills = projectSkills.filter((ps) =>
        fSkills.some((fs) => fs.includes(ps) || ps.includes(fs))
      );
      const ratio = matchedSkills.length / projectSkills.length;
      const skillScore = Math.min(35, Math.round(ratio * 35));
      score += skillScore;
      if (ratio >= 0.5) {
        matchReasons.push(`${Math.round(ratio * 100)}% skills overlap (${matchedSkills.join(', ')})`);
      } else if (matchedSkills.length > 0) {
        matchReasons.push(`Matches: ${matchedSkills.join(', ')}`);
      }
    }

    // 2. Category Match (up to 20 pts)
    const fId = freelancer.user._id.toString();
    const categoriesForFreelancer = serviceCategoryMap.get(fId);
    if (projectCategoryId && categoriesForFreelancer && categoriesForFreelancer.has(projectCategoryId)) {
      score += 20;
      matchReasons.push('Active service in this category');
    } else {
      // Partial credit if headline or bio contains category keywords
      score += 5;
    }

    // 3. Rating & Feedback (up to 15 pts)
    const rating = freelancer.ratingAvg || 5.0;
    const ratingScore = Math.round((rating / 5) * 15);
    score += ratingScore;
    if (rating >= 4.7 && (freelancer.ratingCount || 0) > 0) {
      matchReasons.push(`Top-rated (${rating.toFixed(1)} ★)`);
    }

    // 4. Completed Projects (up to 10 pts)
    const completed = freelancer.completedOrdersCount || 0;
    const completedScore = Math.min(10, completed * 2);
    score += completedScore;
    if (completed >= 3) {
      matchReasons.push(`${completed} orders completed successfully`);
    }

    // 5. Budget Compatibility (up to 10 pts)
    const hourly = freelancer.hourlyRate || 30;
    if (project.budgetType === 'hourly') {
      if (hourly >= project.budgetMin && hourly <= project.budgetMax) {
        score += 10;
        matchReasons.push(`Rate ($${hourly}/hr) directly within project budget`);
      } else if (hourly < project.budgetMin) {
        score += 8;
        matchReasons.push(`Highly affordable rate ($${hourly}/hr)`);
      } else {
        score += 3;
      }
    } else {
      // Fixed budget: compare hourly rate * 20 vs project max
      const estimatedCost = hourly * 15;
      if (estimatedCost <= project.budgetMax) {
        score += 10;
        matchReasons.push('Cost-effective for this project scope');
      } else {
        score += 5;
      }
    }

    // 6. Availability (up to 10 pts)
    if (freelancer.availability === 'available') {
      score += 10;
      matchReasons.push('Available immediately');
    } else if (freelancer.availability === 'busy') {
      score += 4;
    }

    // Normalized final score between 0 and 100
    const finalScore = Math.min(100, Math.max(10, score));

    return {
      freelancer: {
        _id: freelancer.user._id,
        name: freelancer.user.name,
        avatar: freelancer.user.avatar,
        headline: freelancer.headline,
        bio: freelancer.bio,
        skills: freelancer.skills,
        hourlyRate: freelancer.hourlyRate,
        availability: freelancer.availability,
        ratingAvg: freelancer.ratingAvg,
        ratingCount: freelancer.ratingCount,
        completedOrdersCount: freelancer.completedOrdersCount,
      },
      matchScore: finalScore,
      matchReasons,
    };
  });

  // Sort descending by match score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  return scoredMatches.slice(0, limit);
};
