import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);