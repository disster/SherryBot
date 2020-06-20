const TeleBot = require('telebot');
const bot = new TeleBot('1125357561:AAFGNZcowSJAKjR-XZ6Pr6Nc9glGl-znTxQ');
const firebase = require('firebase');
///////////////////////////////////////////////////////////////
//                       CLASSES
///////////////////////////////////////////////////////////////

class Post {
    constructor(u_id, d_id, msg_id, status, link, img, text, tags) {
        this.donor_id = u_id;
        this.donee_id = d_id;
        this.message_id = msg_id;
        this.status = status;
        this.link = link;
        this.image = img;
        this.text = text;
        this.tags = tags;
    }
}

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
const posts = ref.child("posts");

function addUser(u_id) {
    if (users.orderByChild("user_id").equalTo(u_id).once("value", snapshot => {
        if (snapshot.exists()) {
            console.log("Exists!" + u_id);
            return false;
        }
        console.log("Adding user " + u_id);
        users.push().set({
            user_id: u_id,
            status: false,
            donee_rating: 0,
            donor_rating: 0,
            priority: 0,
            geo: {long: 0.0, lat: 0.0}
        });
        return true;
    })) ;
}

function setUserStatus(s, u_id) {
    console.log("User " + u_id + " status is set to " + s);
    users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
        //console.log(snapshot.key);
        users.child(snapshot.key).update({status: s});
    });
}

function setUserGeo(u_id, long, lat) {
    console.log("User " + u_id + " geo is set!");
    users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
        //console.log(snapshot.key);
        users.child(snapshot.key).update({geo: {long: long, lat: lat}});
    });
}

function getUserPropertyValue(u_id, val_name) {
    var r = null;
    users.orderByChild("user_id").equalTo(u_id).on("child_added", snapshot => {
        users.child(snapshot.key + '/' + val_name).orderByChild(val_name).once("value", snapshot => {
            console.log("Func ref: " + snapshot.key + " --- Func val: " + snapshot.val());
            r = snapshot.val();
        });
    });

    return r;
}

function addPost(u_id = 0, d_id = 0, msg_id = 0, status = -1, link = '', img = '', text = '', tags = [], dt = null) {
    if (dt == null) dt = Math.round(new Date() / 1000);
    console.log("Adding post " + msg_id + " at " + dt);
    posts.push().set({
        donor_id: u_id,
        donee_id: d_id,
        msg_id: msg_id,
        status: status,
        link: link,
        image: img,
        text: text,
        tags: tags,
        upload_time: dt
    });
}

function matchPostByTag(tag = '', loc = '', dist = '') {

    function pair(key, val) {
        this.key = key;
        this.val = val;
    }

    let p = new Post();

    let list = [];

    posts.on('child_added', (snapshot) => {
        snapshot.forEach((child) => {
            if (child.key == 'status')
                if (child.val() == 1 || child.val() == 0) {
                    let k = child.ref.parent.key;
                    let v;
                    posts.child(k + '/upload_time').once('value', (snapshot) => {
                        v = snapshot.val();
                    });
                    list.push(new pair(k, v));
                }
        })
    });

    list.sort(function (a, b) {
        return a.val - b.val
    });

    if (list[0] == undefined)
        return p;

    //console.log(list[0]);

    let firstSnap;
    posts.child(list[0].key).once('value', (snapshot) => {
        firstSnap = snapshot;
    });

    p.donor_id = firstSnap.child('u_id').val();
    p.donee_id = firstSnap.child('d_id').val();
    p.message_id = firstSnap.child('msg_id').val();
    p.status = firstSnap.child('status').val();
    p.link = firstSnap.child('link').val();
    p.image = firstSnap.child('img').val();
    p.text = firstSnap.child('text').val();
    p.tags = firstSnap.child('tags').val();
    p.upload_time = firstSnap.child('upload_time').val();

    return p;
}

function calcDistOnGlobe(long1, lat1, long2, lat2) {
    var R = 6371;

    var dLat = (lat2 - lat1).toRad();
    var dLong = (long2 - long1).toRad();
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var dist = R * c;

    return Math.round(dist);
}


function setPostsInDb() {
    let parser = require("./parser");
    let postsArr = parser.getPosts('sharingfood', 20);
    for (let post of postsArr) {
        if (post.image != null && post.image != "" && post.text != null) {
            addPost(0, 0, 0, post.status, post.link, post.image, post.text, [], post.upload_time)
        }
    }
}

///////////////////////////////////////////////////////////////
//                          BOT
///////////////////////////////////////////////////////////////

let lastInlineMsgID = 0;

bot.on("polling_error", (m) => console.log(m));

bot.on('/fill_vk_posts', msg => {
    setPostsInDb();
})

bot.on(['/start', '/role'], msg => {
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
                ['Создать объявление', 'Настройки']
            ], {resize: true});
            return bot.sendMessage(msg.from.id, 'Роль установлена на отдающего!', {replyMarkup});

        case 'donee':
            setUserStatus(false, msg.from.id);
            replyMarkup = bot.keyboard([
                ['Поиск', 'Настройки']
            ], {resize: true});
            return bot.sendMessage(msg.from.id, 'Роль установлена на принимающего!', {replyMarkup});
    }
});

bot.on('text', msg => {

    let replyMarkup = null;

    switch (msg.text) {

        case 'Создать объявление':

            addPost(msg.from.id, 0, msg.message_id, 1)
            replyMarkup = bot.keyboard([
                ['Создать объявление', 'Настройки']
            ], {resize: true});
            return bot.sendMessage(msg.from.id, 'Объявление создано!', {replyMarkup});

        case 'Поиск':

            let p = matchPostByTag();

            console.log(p);

            if (p.status == 0) {
                replyMarkup = bot.inlineKeyboard([
                    [bot.inlineButton('Ссылка на пост', {url: p.link})]
                ], {resize: true});
            } else {
                replyMarkup = bot.inlineKeyboard([
                    [bot.inlineButton('Забронировать', {callback: 'reserve'})]
                ], {resize: true});
            }
            return bot.sendPhoto(msg.from.id, p.image, p.text, {replyMarkup});

        case 'Настройки':
            replyMarkup = bot.keyboard([
                [bot.button('location', 'Установить местоположение')],
                ['Сменить роль'],
                ['Назад']
            ], {resize: true});
            return bot.sendMessage(msg.from.id, 'Открываю меню настроек.', {replyMarkup});

        case 'Сменить роль':
            replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton('Я отдаю', {callback: 'donor'})],
                [bot.inlineButton('Я принимаю', {callback: 'donee'})]
            ]);
            return bot.sendMessage(msg.from.id, 'Выбор роли:', {replyMarkup});

        case 'Назад':
            if (getUserPropertyValue(msg.from.id, "status")) {
                replyMarkup = bot.keyboard([
                    ['Создать объявление', 'Настройки']
                ], {resize: true});
            } else {
                replyMarkup = bot.keyboard([
                    ['Поиск', 'Настройки']
                ], {resize: true});
            }
            return bot.sendMessage(msg.from.id, 'Возвращаю в главное меню.', {replyMarkup});
        default:
    }
});

bot.on('location', msg => {

    let replyMarkup = null;

    if (getUserPropertyValue(msg.from.id, "status")) {
        replyMarkup = bot.keyboard([
            ['Создать объявление', 'Настройки']
        ], {resize: true});
    } else {
        replyMarkup = bot.keyboard([
            ['Поиск', 'Настройки']
        ], {resize: true});
    }

    setUserGeo(msg.from.id, msg.location.longitude, msg.location.latitude);

    return bot.sendMessage(msg.from.id, 'Местоположение установлено!', {replyMarkup});
});
bot.start();
