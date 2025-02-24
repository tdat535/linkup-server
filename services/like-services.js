const Like = require('../models/like'); // Assuming you have a User model

const createLike = async (like) => {
    try {
        const newLike = new Like({
            postId: like.postId,
            userId: like.userId
        });
        await newLike.save();
        return {
            id: like.id,
            postId: like.postId,
            userId: like.userId
        };
    } catch (error) {
        throw new Error('Error creating like: ' + error.message);
    }
};

const getLikes = async (postId) => {
    try {
        const likes = await Like.findAll({
            where: { postId }, 
            order: [['createdAt', 'DESC']] 
        });

        return {
            success: true,
            data: likes
        };
    } catch (error) {
        throw new Error('Error getting likes: ' + error.message);
    }
};

module.exports = { getLikes, createLike};