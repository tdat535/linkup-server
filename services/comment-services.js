const Comment = require('../models/comment'); // Assuming you have a User model

const createComment = async (comment) => {
    try {
        const newComment = new Comment({
            content: comment.content,
            image: comment.image,
            post_id: comment.post_id,
            user_id: comment.user_id
        });
        await newComment.save();
        return {
            id: comment.id,
            content: comment.content,
            image: comment.image,
            post_id: comment.post_id,
            user_id: comment.user_id
        };
    } catch (error) {
        throw new Error('Error creating comment: ' + error.message);
    }
};

const getComments = async (post_id) => {
    if (!post_id) {
        return {
            error: 'post_id is required to get comments'
        };
    }

    try {
        const comments = await Comment.findAll({
            where: { post_id }, 
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