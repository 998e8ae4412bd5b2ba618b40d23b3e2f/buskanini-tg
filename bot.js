const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

// Токен вашого бота
const TOKEN = process.env.TOKEN;

// Ініціалізація бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Ініціалізація сервера Express
const app = express();
app.use(bodyParser.json());
app.use(cors());


// Налаштування multer для роботи з файлами
const upload = multer({ dest: 'uploads/' });

// Обробник отримання повідомлень
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Привітальне повідомлення
    bot.sendMessage(chatId, 'Привіт! Я отримую дані із сайту та можу надсилати файли.');
});

// Endpoint для отримання даних із сайту
app.post('/send-data', upload.single('file'), (req, res) => {
    const { chatId, message, fileType } = req.body;
    const filePath = req.file ? req.file.path : null; // Шлях до файлу, якщо є

    // Надсилання текстового повідомлення
    if (message) {
        bot.sendMessage(chatId, message)
            .catch((err) => console.error('Error sending message:', err));
    }

    // Надсилання файлу
    if (filePath) {
        const sendFile = () => {
            switch (fileType) {
                case 'document':
                    return bot.sendDocument(chatId, filePath);
                case 'photo':
                    return bot.sendPhoto(chatId, filePath);
                case 'video':
                    return bot.sendVideo(chatId, filePath);
                default:
                    throw new Error('Unsupported file type');
            }
        };

        sendFile()
            .then(() => {
                res.status(200).send('File sent successfully');
                // Видалення файлу після відправлення
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            })
            .catch((err) => {
                res.status(500).send('Error sending file');
                console.error('Error sending file:', err);
            });
    } else {
        res.status(200).send('No file to send');
    }
});

// Запуск сервера
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});