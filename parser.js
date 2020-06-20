exports.getPosts = function (group, totalCount) {
    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
    let xhr = new XMLHttpRequest();
    let token = 'db948772db948772db948772dcdbe635baddb94db94877285796a874e9a0d9f41f4c77a';
    let version = '5.110';
    let count = 1;
    let offset = 0;
    let posts = [];
    while (offset < totalCount) {
        let url = `https://api.vk.com/method/wall.get?access_token=${token}&v=${version}&count=${count}&offset=${offset}&domain=${group}`;
        xhr.open('GET', url, false);
        xhr.send();
        let data = JSON.parse(xhr.responseText).response.items;
        for (let i = 0; i < data.length; i++) {
            let images = [];
            if (data[i].attachments) {
                for (let attachment of data[i].attachments) {
                    if (attachment.type == 'photo') {
                        for (let image of attachment.photo.sizes) {
                            if (image.type == 'y') {
                                images.push(image.url);
                            }
                        }
                    }
                }
            }
            let postUrl = `https://vk.com/sharingfood?w=wall${data[i].owner_id}_${data[i].id}`;
            let status = 0;
            let words = ['забрал']
            // if (!data[i].text.toLowerCase().match(/(^|\A|\s|\-)[Зз]абр(али|ал|ала|ало)?[^а-яА-Я]*?(\s|$|\Z|\-)/)) {
            //     status = 3;
            // }
            data[i] = {
                status: status,
                link: postUrl,
                image: images[0],
                upload_time: data[i].date,
                text: data[i].text
            }
        }
        offset++;
        posts = posts.concat(data);
    }
    return posts;
}