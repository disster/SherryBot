exports.getPosts = function (group, totalCount) {
    function request(token, version, count, offset, group) {
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
            let words = ['забрал', 'отдал'];
            for (let j = 0; j < words.length; j++) {
                if (data[i].text.toLowerCase().indexOf(words[j]) != -1) {
                    status = 3;
                    break;
                }
            }
            data[i] = {
                status: status,
                link: postUrl,
                image: images[0],
                upload_time: data[i].date,
                text: data[i].text
            }
        }
        return data;
    }

    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
    let xhr = new XMLHttpRequest();
    let token = 'db948772db948772db948772dcdbe635baddb94db94877285796a874e9a0d9f41f4c77a';
    let version = '5.110';
    let count = 100;
    let offset = 0;
    let posts = [];
    if (totalCount < 100) {
        count = totalCount;
        let data = request(token, version, count, offset, group);
        posts = posts.concat(data);
    } else {
        while (offset < totalCount) {
            let data = request(token, version, count, offset, group);
            offset += 100;
            posts = posts.concat(data);
        }
    }
    return posts;
}