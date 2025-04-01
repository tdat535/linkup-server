const Like = require('../models/like'); // Assuming you have a User model

const createLike = async (like) => {
    try {
        const newLike = new Like({
            postId: like.postId,
            userId: like.userId,
            postType: like.postType,  // Bổ sung postType
        });
        await newLike.save();
        return {
            isSuccess: true,
            status: 200,
            message: "Tạo lượt thích bài viết thành công",
            data: newLike
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
            isSuccess: true,
            status: 200,
            message: "Lấy danh sách lượt thích bài viết thành công",
            data: likes
        };
    } catch (error) {
        throw new Error('Error getting likes: ' + error.message);
    }
};

module.exports = { getLikes, createLike};