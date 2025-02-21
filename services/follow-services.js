const Follow = require("../models/follow"); // Assuming you have a User model
const User = require("../models/user");
const createFollow = async (followData) => {
  try {
    const existingUser = await User.findOne({
      where: { id: followData.followed },
    });

    if (!existingUser) {
      // Kiểm tra user không tồn tại
      return { error: "id ko tồn tại", status: 400 };
    }

    const newFollowData = new Follow({
      followers: followData.followers,
      followed: followData.followed,
    });
    await newFollowData.save();
    return {
      id: followData.id,
      followers: followData.followers,
      followed: followData.followed,
    };
  } catch (error) {
    throw new Error("Error creating media post: " + error.message);
  }
};

const getFollow = async () => {
  try {
    const listFollower = await Follow.findAll();
    return {
      data: listFollower,
    };
  } catch (error) {
    throw new Error("Error getting media posts: " + error.message);
  }
};

module.exports = { createFollow, getFollow };
