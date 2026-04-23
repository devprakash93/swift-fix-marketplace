import Job from '../models/Job.js';
import User from '../models/User.js';
import { io } from '../server.js';

export const createJob = async (req, res) => {
  const { description, category, location, address, imageUrl, basePrice } = req.body;
  try {
    const job = await Job.create({
      customer: req.user._id,
      description,
      category,
      location, // Use the full GeoJSON object sent from frontend
      address,
      imageUrl,
      basePrice
    });

    // Find nearby online plumbers
    const nearbyPlumbers = await User.find({
      role: 'plumber',
      isOnline: true,
      kycStatus: 'approved',
      location: {
        $near: {
          $geometry: location,
          $maxDistance: 10000 // Increased to 10km
        }
      }
    });

    // Broadcast new job to nearby plumbers
    nearbyPlumbers.forEach(plumber => {
      console.log(`Emitting newJob to plumber room: ${plumber._id}`);
      io.to(plumber._id.toString()).emit('newJob', job);
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Only customer can cancel their own job
    if (job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this job' });
    }

    job.status = 'cancelled';
    await job.save();

    // Notify all nearby plumbers that the job is gone
    io.emit('jobCancelled', job._id);

    res.json({ message: 'Job cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'searching') return res.status(400).json({ message: 'Job already taken' });

    job.plumber = req.user._id;
    job.status = 'assigned';
    job.updatedAt = Date.now();
    await job.save();

    // Notify customer
    io.to(job.customer.toString()).emit('jobAccepted', { job, plumber: req.user });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.status = status;
    job.updatedAt = Date.now();
    await job.save();

    // Notify customer
    io.to(job.customer.toString()).emit('statusUpdate', job);

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobHistory = async (req, res) => {
  try {
    const query = req.user.role === 'customer' ? { customer: req.user._id } : { plumber: req.user._id };
    const jobs = await Job.find(query).sort({ createdAt: -1 }).populate('customer plumber', 'name email rating');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
