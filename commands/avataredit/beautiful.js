const { Command } = require('discord.js-commando');
const Jimp = require('jimp');

module.exports = class BeautifulCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'beautiful',
            aliases: [
                'grunklestan'
            ],
            group: 'avataredit',
            memberName: 'beautiful',
            description: 'Oh, this? This is beautiful.',
            args: [{
                key: 'user',
                prompt: 'Which user would you like to edit the avatar of?',
                type: 'user'
            }]
        });
    }

    async run(msg, args) {
        if (msg.channel.type !== 'dm')
            if (!msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES'))
                return msg.say('This Command requires the `Attach Files` Permission.');
        const { user } = args;
        const avatarURL = user.avatarURL('png', 2048);
        if (!avatarURL) return msg.say('This user has no avatar.');
        let images = [];
        images.push(Jimp.read(avatarURL));
        images.push(Jimp.read('https://i.imgur.com/OOQ9QwQ.jpg'));
        const [avatar, grunkle] = await Promise.all(images);
        avatar.resize(200, 200);
        grunkle.composite(avatar, 432, 42);
        avatar.resize(190, 190);
        grunkle.composite(avatar, 451, 434);
        grunkle.getBuffer(Jimp.MIME_PNG, (err, buff) => {
            if (err) return msg.say('An Unknown Error Occurred.');
            return msg.channel.send({files: [{attachment: buff}]});
        });
    }
};
