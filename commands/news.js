module.exports = {
    name: 'news',
    description: 'Get in-game news from WotV',
    execute(message, args) {
        var fs = require('fs');
        const cheerio = require('cheerio');
        const axios = require('axios');
        const Discord = require('discord.js');

        const baseUrl = 'https://site.na.wotvffbe.com'
        const postListUrl = `${baseUrl}//whatsnew/list?page=1&category=info&platform=&lang=en`

        var posts = fs.readFileSync('assets/posts.yml', 'utf-8').toString().split('\n');

        axios.get(postListUrl).then((response) => {
            const $ = cheerio.load(response.data);
            const items = $('.postList_item');

            // ignore old posts and dedupe new posts
            var unq = [];
            items.each(function (index, element) {
                var tab = element['attribs']['data-tab'];
                if (!posts.includes(tab) && !unq.includes(tab)) {
                    unq.push(tab);
                }
            });

            for (let post of unq) {
                console.log(`News! Adding: ${post}`)
                var success = true;
                try {
                    sendTitle(post);
                } catch (err) {
                    success = false;
                    console.log(`Nevermind. Not adding: ${post}`);
                    console.log(err);
                }
                if (success) {
                    fs.appendFile('assets/posts.yml', `${post}\n`, function (err) {
                        if (err) return console.log(err);
                    });
                }
            }
        })
        .catch((error) => {
            console.log(`uh oh: ${error}`)
        });

        function sendTitle(post) {
            const titleUrl = `${baseUrl}//whatsnew/detail?group_id=${post}&lang=en`
            axios.get(titleUrl).then((response) => {
                const $ = cheerio.load(response.data);
                const titleText = $("#article_title")[0].children[0]['data'];
                const embed = new Discord.MessageEmbed()
                    .setTitle(titleText)
                    .setURL(titleUrl)

                const img = $('div[class="article_header_image"] > img');
                if (img.length) {
                    embed.setImage(baseUrl + img[0].attribs['src'])
                }

                message.channel.send(embed);
            }).catch((error) => {
                console.log(`uh oh: ${error}`)
            });
        }
    }
}
