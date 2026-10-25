import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'freelancer'], {
    errorMap: () => ({ message: "Role must be 'client' or 'freelancer'" }),
  }),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
  headline: z.string().max(120).optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().min(5).optional(),
  availability: z.enum(['available', 'busy', 'not_available']).optional(),
  languages: z.array(z.string()).optional(),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
  socialLinks: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

export const createServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).min(1, 'Specify at least one skill or tag'),
  pricingType: z.enum(['fixed', 'starting_at']).default('fixed'),
  price: z.number().min(5, 'Price must be at least $5'),
  deliveryTimeDays: z.number().min(1, 'Delivery time must be at least 1 day'),
  revisionsAllowed: z.number().min(0).default(2),
  coverImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  status: z.enum(['published', 'draft', 'paused']).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(6000),
  category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).min(1, 'Specify at least one required skill'),
  budgetType: z.enum(['fixed', 'hourly']).default('fixed'),
  budgetMin: z.number().min(5, 'Minimum budget must be at least $5'),
  budgetMax: z.number().min(5, 'Maximum budget must be at least $5'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid deadline date is required',
  }),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        fileType: z.string().optional(),
      })
    )
    .optional(),
});

export const createProposalSchema = z.object({
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters').max(3000),
  bidAmount: z.number().min(5, 'Bid amount must be at least $5'),
  deliveryTimeDays: z.number().min(1, 'Estimated delivery days must be at least 1 day'),
});

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(2000),
});

export const deliverOrderSchema = z.object({
  deliveryNotes: z.string().min(10, 'Delivery notes must be at least 10 characters'),
  deliveryFiles: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number().optional(),
      })
    )
    .optional(),
});

export const revisionRequestSchema = z.object({
  revisionNotes: z.string().min(10, 'Please describe the revisions requested in detail'),
});
