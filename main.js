
<<<<<<< HEAD
const TeleBot = require('telebot');
const bot = new TeleBot('1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ');
bot.on('text', (msg) => msg.reply.text(msg.text));
bot.on(['/start', '/hello'], (msg) => msg.reply.text('Hi, '));
bot.start();
=======
const token = '1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Это FoodSherryBot');
});

bot.on(['/start', '/hello'], (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hi!');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сам ' + msg.text);
});
>>>>>>> 8fd40db9f01c1e188fdaed52868cb34862e8390b
