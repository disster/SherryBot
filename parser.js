exports.getPosts = function (group, totalCount) {
    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
    let xhr = new XMLHttpRequest();
    let token = 'db948772db948772db948772dcdbe635baddb94db94877285796a874e9a0d9f41f4c77a';
    let version = '5.110';
    let count = 100;
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
                if (data[i].attachments[0].type == 'photo') {
                    for (let image of data[i].attachments[0].photo.sizes) {
                        if (image.type == 'y') {
                            images.push(image.url);
                        }
                    }
                }
            }
            let postUrl = `https://vk.com/sharingfood?w=wall${data[i].owner_id}_${data[i].id}`
            data[i] = {
                postUrl: postUrl,
                date: data[i].date,
                text: data[i].text,
                images: images
            }
        }
        offset += 100;
        posts = posts.concat(data);
    }
    return posts;
}



