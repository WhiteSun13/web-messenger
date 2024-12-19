const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Заполните все поля");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Пользователь уже существует");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      createdAt: user.createdAt,  // Добавляем дату создания
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Не удалось создать пользователя");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      createdAt: user.createdAt,  // Добавляем дату создания
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Неверный email или пароль");
  }
});

// /api/user?search={name}
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.send(users);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId, newName, newPic } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("Необходимо указать ID пользователя");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("Пользователь не найден");
  }

  if (newName) user.name = newName;
  if (newPic) user.pic = newPic;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    pic: updatedUser.pic,
    createdAt: updatedUser.createdAt,
    token: generateToken(updatedUser._id),
  });
});

module.exports = { registerUser, authUser, allUsers, updateUserProfile };
