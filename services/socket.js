const { Server } = require('socket.io');
const Messenger = require('../models/messenger');

let io;
const onlineUsers = new Map(); // Lưu user đang online

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Lắng nghe user đăng nhập và lưu vào danh sách online
        socket.on('userOnline', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} online`);
        });

        // Xử lý gửi tin nhắn
        socket.on('sendMessage', async (message) => {
            const { senderId, receiverId, content, image } = message;
        
            // Lưu tin nhắn vào database
            const newMessage = await Messenger.create({ senderId, receiverId, content, image });
        
            // Lấy lại tin nhắn vừa tạo với thông tin người gửi và người nhận
            const fullMessage = await Messenger.findOne({
                where: { id: newMessage.id },
                include: [
                    { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
                    { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
                ]
            });
        
            // Gửi tin nhắn ngay đến người nhận nếu họ đang online
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', fullMessage);
            }
        });
        

        // Xử lý khi user disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (let [userId, socketId] of onlineUsers) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

module.exports = { initSocket };
