import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  postedBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote'],
      required: true,
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    skills: [{ type: String, trim: true }],
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', description: 'text', skills: 'text' });

export default mongoose.model<IJob>('Job', JobSchema);