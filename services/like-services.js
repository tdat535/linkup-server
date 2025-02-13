const Like = require('../models/like'); // Assuming you have a User model

const createLike = async (like) => {
    try {
        const newLike = new Like({
            post_id: like.post_id,
            user_id: like.user_id
        });
        await newLike.save();
        return {
            id: like.id,
            post_id: like.post_id,
            user_id: like.user_id
        };
    } catch (error) {
        throw new Error('Error creating like: ' + error.message);
    }
};

const getLikes = async (post_id) => {
    try {
        const likes = await Like.findAll({
            where: { post_id }, 
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