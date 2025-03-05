const Comment = require('../models/comment'); // Assuming you have a User model

const createComment = async (comment) => {
    try {
        const newComment = new Comment({
            content: comment.content,
            image: comment.image,
            postId: comment.postId,
            userId: comment.userId
        });
        await newComment.save();
        return {
            id: comment.id,
            content: comment.content,
            image: comment.image,
            postId: comment.postId,
            userId: comment.userId
        };
    } catch (error) {
        throw new Error('Error creating comment: ' + error.message);
    }
};

const getComments = async (postId) => {
    if (!postId) {
        return {
            error: 'postId is required to get comments'
        };
    }

    try {
        const comments = await Comment.findAll({
            where: { postId }, 
            order: [['createdAt', 'DESC']] 
        });

        return {
            success: true,
            data: comments
        };
    } catch (error) {
        throw new Error('Error getting comments: ' + error.message);
    }
};

module.exports = { getComments, createComment};