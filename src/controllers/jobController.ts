import { Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/auth';

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, company, location, type, salaryMin, salaryMax, skills } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      type,
      salaryMin,
      salaryMax,
      skills,
      postedBy: req.user!._id,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating job' });
  }
};

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, type, location, skills, page = 1, limit = 10 } = req.query;

    const filter: Record<string, any> = { isActive: true };

    if (search) {
      filter.$text = { $search: search as string };
    }
    if (type) {
      filter.type = type;
    }
    if (location) {
      filter.location = { $regex: location as string, $options: 'i' };
    }
    if (skills) {
      const skillArray = (skills as string).split(',').map((s) => s.trim());
      filter.skills = { $in: skillArray };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this job' });
      return;
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this job' });
      return;
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user!._id;

    const [totalJobs, applicationStats, topSkills] = await Promise.all([
      Job.countDocuments({ postedBy: recruiterId }),

      Job.aggregate([
        { $match: { postedBy: recruiterId } },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'job',
            as: 'applications',
          },
        },
        {
          $project: {
            title: 1,
            applicationCount: { $size: '$applications' },
            isActive: 1,
          },
        },
        { $sort: { applicationCount: -1 } },
      ]),

      Job.aggregate([
        { $match: { postedBy: recruiterId } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { skill: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalJobs,
        applicationStats,
        topSkills,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};