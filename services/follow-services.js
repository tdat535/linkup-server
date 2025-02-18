const Follow = require('../models/follow'); // Assuming you have a User model

const createFollow = async (followData) => {
    try {
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
        throw new Error('Error creating media post: ' + error.message);
    }
};

module.exports = { createFollow };