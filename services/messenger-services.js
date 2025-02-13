const Messenger = require('../models/messenger');

const createMessenger = async (messenger) => {
    try {
        const newMessenger = new Messenger({
            content: messenger.content,
            image: messenger.image,
            sender_id: messenger.sender_id,
            receiver_id: messenger.receiver_id
        });
        await newMessenger.save();
        return {
            id: newMessenger.id,
            content: newMessenger.content,
            image: newMessenger.image,
            sender_id: newMessenger.sender_id,
            receiver_id: newMessenger.receiver_id
        };
    } catch (error) {
        throw new Error('Error creating messenger: ' + error.message);
    }
};

const getMessenger = async (sender_id, receiver_id) => {
    try {
        const messengers = await Messenger.findAll({
            where: { sender_id, receiver_id },
            order: [['createdAt', 'ASC']]
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