const TeleBot = require('telebot');
const bot = new TeleBot('1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ');
const firebase = require('firebase');

///////////////////////////////////////////////////////////////
//                       DATABASE
///////////////////////////////////////////////////////////////

const app = firebase.initializeApp({
  apiKey: "AIzaSyDj1qpNvjnKSeRwRCZeuw-ZDzn8lRqKsQQ",
  authDomain: "sherrybot-c50eb.firebaseapp.com",
  databaseURL: "https://sherrybot-c50eb.firebaseio.com",
  projectId: "sherrybot-c50eb",
  storageBucket: "sherrybot-c50eb.appspot.com",
  messagingSenderId: "510629674250"
});

const ref = firebase.database().ref();
const users = ref.child("users");

function addUser(u_id) {
  if(users.orderByChild("user_id").equalTo(u_id).once("value",snapshot => {
    if (snapshot.exists()){
      console.log("Exists!" + u_id);
      return false;
    }
    console.log("Adding user " + u_id);
    users.push().set({
        user_id: u_id,
        status: false,
        donee_rating: 0,
        donor_rating: 0,
        priority: 0
      });
    return true;
  }));
}

function setUserStatus(s, u_id){
  console.log("User " + u_id + " status is set to " + s);
  users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
    //console.log(snapshot.key);
    users.child(snapshot.key).update({status: s});
  });
}

function getUserPropertyValue(u_id, val_name) {

}

///////////////////////////////////////////////////////////////
//                          BOT
///////////////////////////////////////////////////////////////

bot.on("polling_error", (m) => console.log(m));

bot.on(['/start','/role'], msg => {

  let replyMarkup = bot.inlineKeyboard([
    [bot.inlineButton('Я отдаю', {callback: 'donor'})],
    [bot.inlineButton('Я принимаю', {callback: 'donee'})]
  ]);

    addUser(msg.from.id);

    return bot.sendMessage(msg.from.id, 'Здравствуйте, ' + msg.from.first_name + '! Вы отдающая или принимающая сторона?', {replyMarkup});
});

bot.on('callbackQuery', msg => {

    let replyMarkup = null;

    switch (msg.data) {
      case 'donor':
          setUserStatus(true, msg.from.id);

          replyMarkup = bot.keyboard([
            ['Создать объявление','Настройки']
          ], {resize: true});

        break;

      case 'donee':
          setUserStatus(false, msg.from.id);

          replyMarkup = bot.keyboard([
            ['Поиск','Настройки']
          ], {resize: true});

        break;

      default:

    }

    return bot.sendMessage(msg.from.id, 'Готово!', {replyMarkup});
});

bot.on('text', msg => {

  let replyMarkup = null;

  switch (msg.text) {
    case 'Настройки':
      replyMarkup = bot.keyboard([
        ['Локация','Назад']
      ], {resize: true});
        console.log(getUserPropertyValue(msg.from.id, "status"));
      return bot.sendMessage(msg.from.id, 'Доступные настройки:', {replyMarkup});
    default:
      return bot.sendMessage(msg.from.id, 'Дефолт', {replyMarkup});
  }


});

bot.start();
