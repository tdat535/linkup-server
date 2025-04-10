const express = require("express");
const {
  reportPost,
  reportUser,
  reportMessage,
} = require("../services/report-services");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.post("/reportUser", authenticateToken, async (req, res) => {
  try {
    const reportData = {
      userId: req.user.id,
      reportedUserId: req.body.reportedUserId,
      reason: req.body.reason,
    };
    const reportResult = await reportUser(reportData);
    if (!reportResult.isSuccess) {
      return res.status(reportResult.status).send({
        isSuccess: false,
        status: reportResult.status,
        message: reportResult.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(reportResult);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Có lỗi xảy ra khi báo cáo người dùng.",
    });
  }
});

router.post("/reportPost", authenticateToken, async (req, res) => {
  try {
    const reportData = {
      userId: req.user.id,
      reportedPostId: req.body.reportedPostId,
      reason: req.body.reason,
    };
    const reportResult = await reportPost(reportData);
    if (!reportResult.isSuccess) {
      return res.status(reportResult.status).send({
        isSuccess: false,
        status: reportResult.status,
        message: reportResult.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(reportResult);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Có lỗi xảy ra khi báo cáo bài viết.",
    });
  }
});

router.post("/reportMessage", authenticateToken, async (req, res) => {
  try {
    const reportData = {
      userId: req.user.id,
      reportedMessageId: req.body.reportedMessageId,
      reason: req.body.reason,
    };
    const reportResult = await reportMessage(reportData);
    if (!reportResult.isSuccess) {
      return res.status(reportResult.status).send({
        isSuccess: false,
        status: reportResult.status,
        message: reportResult.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(reportResult);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Có lỗi xảy ra khi báo cáo tin nhắn.",
    });
  }
});

module.exports = router;
