const Comment = require('../models/comment'); // Assuming you have a User model

const createComment = async (comment) => {
    try {
        const newComment = await Comment.create({
            content: comment.content,
            image: comment.image,
            postId: comment.postId,
            postType: comment.postType,  // Bổ sung postType
            userId: comment.userId
        });

        return {
            isSuccess: true,
            status: 200,
            message: "Tạo bình luận bài viết thành công",
            data: newComment
        };
    } catch (error) {
        throw new Error('Error creating comment: ' + error.message);
    }
};

const getComments = async (postId, postType) => {
    if (!postId || !postType) {
        return {
            error: 'postId and postType are required to get comments'
        };
    }

    try {
        const comments = await Comment.findAll({
            where: { postId, postType },  // Tìm theo cả postId và postType
            order: [['createdAt', 'DESC']]
        });

        return {
            isSuccess: true,
            status: 200,
            message: "Lấy danh sách bình luận bài viết thành công",
            data: comments
        };
    } catch (error) {
        throw new Error('Error getting comments: ' + error.message);
    }
};

module.exports = { getComments, createComment};