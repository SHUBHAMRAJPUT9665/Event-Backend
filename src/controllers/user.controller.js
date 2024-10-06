import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import Event from "../models/event.model.js";

const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  sameSite: "None",
};


// Register a new user
const register = async (req, res, next) => {
  const { fullName, password, email } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
      data: {},
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
      data: {},
    });
  }

  const user = await User.create({ fullName, email, password });
  if (!user) {
    return next(new ApiError(500, "Error creating user"));
  }

  const createdUser = await User.findById(user._id).select("-password");
  const token = user.generateJWTToken();
  res.cookie("token", token, cookieOptions);

  const subject = `Account Created at LEARN HUB`;
  const message = `Your account has been successfully created. Here are your login details:
  Username: ${fullName}
  Email: ${email}`;

  await sendEmail(email, subject, message);

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: createdUser,
  });
};



// Login user
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "User does not exist", data: {} });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid Credentials", data: {} });
  }

  const token = user.generateJWTToken();
  const loggedUser = await User.findById(user._id).select("-password");

  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: loggedUser,
    token,
  });
};


// Logout user
const logout = (req, res) => {
  res.clearCookie("token", {
    secure: true,
    maxAge: 0,
    httpOnly: true,
    sameSite: "Strict",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

// Get user profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User profile fetched",
    data: user,
  });
};



// Join event
const joinEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Find event and user
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if user is already in confirmed or waitlist
  if (
    event.confirmedParticipants.includes(userId) || 
    event.waitlistParticipants.includes(userId)
  ) {
    return res.status(400).json({ message: "User has already joined the event" });
  }

  // If confirmed list is not full, add user to confirmed participants
  if (event.confirmedParticipants.length < event.maxParticipants) {
    event.confirmedParticipants.push(userId);
    user.confirmedEvents.push(eventId); // Add to user's confirmed events list
    await event.save();
    await user.save();

    return res.status(200).json({ message: "User added to event confirmed list" });
  }

  // If confirmed list is full, add user to the waitlist
  event.waitlistParticipants.push(userId);
  user.waitlistEvents.push(eventId); // Add to user's waitlist events
  await event.save();
  await user.save();

  return res.status(200).json({ message: "User added to event waitlist" });
};


// Cancel event participation
const cancelParticipation = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Find event and user
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Check if the user is in the confirmed participants list
  const confirmedIndex = event.confirmedParticipants.indexOf(userId);
  if (confirmedIndex !== -1) {
    // Remove user from confirmed list
    event.confirmedParticipants.splice(confirmedIndex, 1);
    user.confirmedEvents = user.confirmedEvents.filter((e) => e.toString() !== eventId);

    // Promote the next user in the waitlist to the confirmed list
    if (event.waitlistParticipants.length > 0) {
      const nextInLine = event.waitlistParticipants.shift();
      event.confirmedParticipants.push(nextInLine);

      // Update next user's event details
      const nextUser = await User.findById(nextInLine);
      nextUser.waitlistEvents = nextUser.waitlistEvents.filter((e) => e.toString() !== eventId);
      nextUser.confirmedEvents.push(eventId);
      await nextUser.save();
    }

    await event.save();
    await user.save();

    return res.status(200).json({
      message: "Participation cancelled and waitlist updated",
    });
  }

  // If user is not in confirmed list, return error
  return res.status(400).json({ message: "User not in confirmed participants list" });
};

export { register, login, logout, getProfile, joinEvent, cancelParticipation };
