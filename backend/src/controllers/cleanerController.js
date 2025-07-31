import Cleaner from "../models/cleaner.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"

export async function getAllCleanersForDashboard(_, res){ // tested
   try {
    // Fetch a random set of cleaners
    const cleaners = await Cleaner.aggregate([
      { $sample: { size: 20 } }  // This will return 20 random cleaners for paging
    ]);

    // If no cleaners are found
    if (!cleaners.length) {
      return res.status(404).json({ message: 'No cleaners found' });
    }
    
    // Return the random list of cleaners
    res.json(cleaners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function filterCleaners(req, res) { // tested
  try {
    const filter = {};

    const {
      stars,
      price,
      age,
      gender,
      service
    } = req.body;

    if (stars) {
      const [minStars, maxStars] = stars.split('-');
      filter.stars = { $gte: Number(minStars), $lte: Number(maxStars) };
    }

    if (price) {
      const [minPrice, maxPrice] = price.split('-');
      filter.hourlyPrice = { $gte: Number(minPrice), $lte: Number(maxPrice) }; // Changed from 'price' to 'hourlyPrice'
    }

    if (age) {
      const [minAge, maxAge] = age.split('-');
      filter.age = { $gte: Number(minAge), $lte: Number(maxAge) };
    }

    if (gender) {
      filter.gender = gender;
    }

    if (service) {
      filter.service = service;
    }

    const cleaners = await Cleaner.find(filter);

    if (!cleaners.length) {
      return res.status(404).json({ message: 'No cleaners found matching your filters.' });
    }

    const randomCleaners = await Cleaner.aggregate([
      { $match: { _id: { $in: cleaners.map(c => c._id) } } },
      { $sample: { size: 20 } } // 20 random cleaners per page 
    ]);

    res.json(randomCleaners);
  } catch (err) {
    console.error("Error in filterCleaners controller", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function getCleanerByID(req, res) { //tested
    try{
    const cleaner = await Cleaner.findById(req.params.id);
    if (!cleaner) {return res.status(404).json({message: "Cleaner not found!"})};
    res.json(cleaner);
    }
    catch(err){
        console.error("Error in getCleanerByID controller", err);
        res.status(500).json({message: 'Server error'});
    }
};

export async function updateCleaner(req, res) { //tested
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedCleaner = await Cleaner.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCleaner) {
      return res.status(404).json({ message: 'Cleaner not found' });
    }

    res.json(updatedCleaner);
  } catch (err) {
    console.error("Error in updateCleaner controller", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function createCleaner(req, res) { //tested
    try {
    const { username, password, name, phoneNumber, email, gender, age, service, schedule, hourlyPrice } = req.body;

    // Validation
    if (!username || !password || !name || !phoneNumber || !email || !service || !gender || !age || !hourlyPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if cleaner already exists
    const existingCleaner = await Cleaner.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingCleaner) {
      return res.status(400).json({ 
        message: 'Cleaner with this username or email already exists' 
      });
    }

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const cleaner = new Cleaner({
      username,
      password: hashedPassword, // Storing the hashed password
      name,
      phoneNumber,
      email,
      gender,
      age,
      service,
      schedule,
      hourlyPrice,
    });

    const savedCleaner = await cleaner.save();
    
    // Remove password from response
    const cleanerResponse = savedCleaner.toObject();
    delete cleanerResponse.password;
    
    res.status(201).json(cleanerResponse);
  } catch (err) {
    console.error('Error in createCleaner controller', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

export async function deleteCleaner(req, res) { //tested
  const { id } = req.params;

  try {
    const deletedCleaner = await Cleaner.findByIdAndDelete(id);

    if (!deletedCleaner) {
      return res.status(404).json({ message: 'Cleaner not found' });
    }

    res.json({ message: 'Cleaner deleted successfully' });
  } catch (err) {
    console.error("Error in deleteCleaner controller", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function loginCleaner(req, res) {
  const { username, password } = req.body;

  try {
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find cleaner by username
    const cleaner = await Cleaner.findOne({ username });

    if (!cleaner) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, cleaner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token 
    const token = jwt.sign(
      { 
        id: cleaner._id,
        role: 'cleaner',
        username: cleaner.username
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Remove password from cleaner object before sending response
    const cleanerResponse = cleaner.toObject();
    delete cleanerResponse.password;

    res.json({ 
      message: 'Login successful',
      token, 
      cleaner: cleanerResponse 
    });

  } catch (err) {
    console.error('Error in loginCleaner controller', err);
    res.status(500).json({ message: 'Server error' });
  }
}

//all controllers are tested and working