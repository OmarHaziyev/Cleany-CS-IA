import Request from "../models/request.js";

// Get all requests for a specific cleaner
export async function getRequestsForCleaner(req, res) {
  try {
    const { cleanerId } = req.params;
    
    const requests = await Request.find({ 
      cleaner: cleanerId,
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('client', 'name email phoneNumber')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching cleaner requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all general requests (open to all cleaners)
export async function getGeneralRequests(req, res) {
  try {
    const requests = await Request.find({ 
      requestType: 'general',
      status: 'open'
    })
    .populate('client', 'name email phoneNumber')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching general requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update request status (accept/decline)
export async function updateRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const cleanerId = req.user.id; // From auth middleware

    // Validate status
    if (!['accepted', 'declined', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if cleaner is authorized to update this request
    if (request.cleaner.toString() !== cleanerId) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    if (status === 'accepted') {
      request.acceptedAt = new Date();
    }

    await request.save();

    const populatedRequest = await Request.findById(requestId)
      .populate('client', 'name email phoneNumber');

    res.json(populatedRequest);
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Accept a general request (assign cleaner to general request)
export async function acceptGeneralRequest(req, res) {
  try {
    const { requestId } = req.params;
    const cleanerId = req.user.id; // From auth middleware

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if it's a general request and still open
    if (request.requestType !== 'general' || request.status !== 'open') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }

    // Assign cleaner and change status
    request.cleaner = cleanerId;
    request.status = 'accepted';
    request.acceptedAt = new Date();
    request.requestType = 'specific'; // Convert to specific request

    await request.save();

    const populatedRequest = await Request.findById(requestId)
      .populate('client', 'name email phoneNumber')
      .populate('cleaner', 'name email');

    res.json(populatedRequest);
  } catch (err) {
    console.error('Error accepting general request:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get completed jobs for a cleaner
export async function getCompletedJobs(req, res) {
  try {
    const { cleanerId } = req.params;
    
    const jobs = await Request.find({ 
      cleaner: cleanerId,
      status: 'completed'
    })
    .populate('client', 'name email phoneNumber')
    .sort({ updatedAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching completed jobs:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Create a new request (for clients)
export async function createRequest(req, res) {
  try {
    const {
      cleanerId,
      service,
      date,
      startTime,
      endTime,
      note,
      requestType = 'specific', // 'specific' or 'general'
      budget
    } = req.body;

    const clientId = req.user.id; // From auth middleware

    // Validation
    if (!service || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // For specific requests, cleanerId is required
    if (requestType === 'specific' && !cleanerId) {
      return res.status(400).json({ message: 'Cleaner ID is required for specific requests' });
    }

    const requestData = {
      client: clientId,
      service,
      date,
      startTime,
      endTime,
      note,
      requestType,
      status: requestType === 'general' ? 'open' : 'pending'
    };

    if (requestType === 'specific') {
      requestData.cleaner = cleanerId;
    }

    if (requestType === 'general' && budget) {
      requestData.budget = budget;
    }

    const request = new Request(requestData);
    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('client', 'name email phoneNumber')
      .populate('cleaner', 'name email');

    res.status(201).json(populatedRequest);
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ message: 'Server error' });
  }
}