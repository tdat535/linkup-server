const MediaPost = require('../models/mediaPost'); // Assuming you have a User model
const Follow = require('../models/follow')
const User = require('../models/user')
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

const getMediaPosts = async (userId) => {
    try {
        // Lấy danh sách những người mà userId đang theo dõi
        const followingList = await Follow.findAll({
            where: { followers: userId },
            attributes: ['followed']
        });

        // Chuyển danh sách thành mảng user_id của những người được theo dõi
        let followedIds = followingList.map(follow => follow.followed);

        // Thêm userId vào danh sách để lấy cả bài viết của chính mình
        followedIds.push(userId);

        // Lấy bài viết của những người trong danh sách theo dõi (bao gồm chính mình)
        const mediaPosts = await MediaPost.findAll({
            where: {
                user_id: followedIds
            },
            include: [{ model: User, attributes: ['username', 'email'] }] // Thêm thông tin người đăng bài
        });

        return { data: mediaPosts };
    } catch (error) {
        throw new Error('Error getting media posts: ' + error.message);
    }
};

const getAll= async () => {
    try {
        const list = await MediaPost.findAll();
        return {
            data: list
        };
    } catch (error) {
        throw new Error('Error getting media posts: ' + error.message);
    }
};

module.exports = { getMediaPosts, createMediaPost, getAll };