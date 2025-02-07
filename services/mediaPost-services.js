const MediaPost = require('../models/mediaPost'); // Assuming you have a User model

const createMediaPost = async (mediaPostData) => {
    try {
        const newMediaPost = new MediaPost({
            content: mediaPostData.content,
            image: mediaPostData.image,
            user_id: mediaPostData.user_id
        });
        await newMediaPost.save();
        return {
            id: newMediaPost.id,
            content: newMediaPost.content,
            image: newMediaPost.image,
            user_id: newMediaPost.user_id
        };
    } catch (error) {
        throw new Error('Error creating media post: ' + error.message);
    }
};

const getMediaPosts = async () => {
    try {
        const mediaPosts = await MediaPost.findAll();
        return {
            data: mediaPosts
        };
    } catch (error) {
        throw new Error('Error getting media posts: ' + error.message);
    }
};

const getMediaPostsById = async (id) => {
    try {
        const mediaPost = await MediaPost.findByPk(id);
        return {
            data: mediaPost
        }
    }
    catch (error) {
        throw new Error('Error getting media post by id: ' + error.message);
    }
}

module.exports = { getMediaPosts, createMediaPost};