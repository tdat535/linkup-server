const Report = require("../models/report");

const reportUser = async (RpUserData) => {
    try {
        const reportResult = await Report.create({
        reporterId: RpUserData.userId,
        reportedUserId: RpUserData.reportedUserId,
        type: "user",
        reason: RpUserData.reason,
        });
    
        return {
        isSuccess: true,
        status: 200,
        message: "Báo cáo người dùng thành công",
        data: reportResult,
        };
    } catch (error) {
        throw new Error("Error reporting user: " + error.message);
    }
}

const reportPost = async (RpPostData) => {
    try {
        const reportResult = await Report.create({
        reporterId: RpPostData.userId,
        reportedPostId: RpPostData.reportedPostId,
        type: "post",
        reason: RpPostData.reason,
        });
    
        return {
        isSuccess: true,
        status: 200,
        message: "Báo cáo bài viết thành công",
        data: reportResult,
        };
    } catch (error) {
        throw new Error("Error reporting user: " + error.message);
    }
}

const reportMessage = async (RpMessageData) => {
    try {
        const reportResult = await Report.create({
        reporterId: RpMessageData.userId,
        reportedMessageId: RpMessageData.reportedMessageId,
        type: "message",
        reason: RpMessageData.reason,
        });
    
        return {
        isSuccess: true,
        status: 200,
        message: "Báo cáo tin nhắn thành công",
        data: reportResult,
        };
    } catch (error) {
        throw new Error("Error reporting user: " + error.message);
    }
}

module.exports = { reportUser, reportPost, reportMessage };