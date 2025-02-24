const Messenger = require('../models/messenger');

const createMessenger = async (messenger) => {
    try {
        const newMessenger = new Messenger({
            content: messenger.content,
            image: messenger.image,
            senderId: messenger.senderId,
            receiverId: messenger.receiverId
        });
        await newMessenger.save();
        return {
            id: newMessenger.id,
            content: newMessenger.content,
            image: newMessenger.image,
            senderId: newMessenger.senderId,
            receiverId: newMessenger.receiverId
        };
    } catch (error) {
        throw new Error('Error creating messenger: ' + error.message);
    }
};

const getMessenger = async (senderId, receiverId) => {
    try {
        const messengers = await Messenger.findAll({
            where: { senderId, receiverId },
            order: [['receivingDate', 'createdAt', 'ASC']]
        });
        return {
            success: true,
            data: messengers
        };
    }   catch (error) {
        throw new Error('Error getting messengers: ' + error.message);
    }
}

module.exports = { getMessenger, createMessenger};