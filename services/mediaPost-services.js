const MediaPost = require('../models/mediaPost'); // Assuming you have a User model
const Follow = require('../models/follow')
const User = require('../models/user')
const createMediaPost = async (mediaPostData) => {
    try {
        const newMediaPost = new MediaPost({
            content: mediaPostData.content,
            image: mediaPostData.image,
            userId: mediaPostData.userId
        });
        await newMediaPost.save();
        return {
            id: newMediaPost.id,
            content: newMediaPost.content,
            image: newMediaPost.image,
            userId: newMediaPost.userId
        };
    } catch (error) {
        throw new Error('Error creating media post: ' + error.message);
    }
};

const getMediaPosts = async (userId) => {
    try {
        // Tìm danh sách những người mà user đang theo dõi và trạng thái là "accepted"
        const followingList = await Follow.findAll({
            where: { 
                followerId: userId, 
                status: 'accepted'  // Chỉ lấy các follow với trạng thái 'accepted'
            },
            attributes: ['followingId']  // Chỉ lấy ID người được theo dõi
        });

        // Lấy danh sách ID của những người mà user đang theo dõi
        let followedIds = followingList.map(follow => follow.followingId);

        // Thêm chính userId để lấy cả bài viết của người đó
        followedIds.push(userId);

        // Lấy bài viết của những người trong danh sách theo dõi (bao gồm chính mình)
        const mediaPosts = await MediaPost.findAll({
            where: {
                userId: followedIds  // Tìm bài viết của userId và những người mà user đang theo dõi
            },
            include: [{ 
                model: User, 
                attributes: ['username', 'avatar']  // Thêm thông tin username của người đăng bài
            }]
        });

        return mediaPosts;
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