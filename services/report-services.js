const Report = require("../models/report");
const { hideMediaPost } = require("./admin-services");

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

// const reportMessage = async (RpMessageData) => {
//     try {
//         const reportResult = await Report.create({
//         reporterId: RpMessageData.userId,
//         reportedMessageId: RpMessageData.reportedMessageId,
//         type: "message",
//         reason: RpMessageData.reason,
//         });
    
//         return {
//         isSuccess: true,
//         status: 200,
//         message: "Báo cáo tin nhắn thành công",
//         data: reportResult,
//         };
//     } catch (error) {
//         throw new Error("Error reporting user: " + error.message);
//     }
// }

const resolvePostReport = async (reportId, action) => { // Thêm action
    try {
      const report = await Report.findByPk(reportId);
  
      if (!report || report.type !== 'post') {
        return {
          isSuccess: false,
          status: 404,
          message: 'Không tìm thấy báo cáo bài viết hợp lệ.',
        };
      }
  
      // Ẩn hoặc hiện bài viết tuỳ vào action
      const hideResult = await hideMediaPost(report.reportedPostId, action); // truyền action vào
  
      if (!hideResult.isSuccess) {
        return hideResult;
      }
  
      // Cập nhật trạng thái báo cáo thành 'finished' nếu action là 'hide'
      if (action === 'hide') {
        await report.update({ status: 'finished' });
      }
  
      return {
        isSuccess: true,
        status: 200,
        message:
          action === 'hide'
            ? 'Đã ẩn bài viết và xử lý báo cáo.'
            : 'Đã hiển thị lại bài viết thành công.',
      };
    } catch (error) {
      console.error('Error resolving post report:', error);
      throw new Error('Lỗi xử lý báo cáo: ' + error.message);
    }
  };
  

module.exports = { reportUser, reportPost, resolvePostReport };