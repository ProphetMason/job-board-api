import { Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/auth';

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      res.status(404).json({ message: 'Job not found or no longer active' });
      return;
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user!._id,
    });
    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied to this job' });
      return;
    }

    const newApplication = new Application({
      job: jobId,
      candidate: req.user!._id,
      coverLetter,
    });

    await newApplication.save();

    const application = await Application.findById(newApplication._id)
      .populate('job', 'title company location');

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ candidate: req.user!._id })
      .populate('job', 'title company location type isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view these applications' });
      return;
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    const job = await Job.findById(application.job);
    if (!job || job.postedBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this application' });
      return;
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating application status' });
  }
};