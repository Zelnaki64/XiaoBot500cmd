const { CommandoClient } = require('discord.js-commando');
const { WebhookClient } = require('discord.js');
const Collection = require('@discordjs/collection');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const PokemonStore = require('./pokemon/PokemonStore');
const MemePosterClient = require('./MemePoster');
const activities = require('../assets/json/activity');
const leaveMsgs = require('../assets/json/leave-messages');
const subreddits = require('../assets/json/meme');
const { XIAO_WEBHOOK_ID, XIAO_WEBHOOK_TOKEN, POSTER_ID, POSTER_TOKEN, POSTER_TIME } = process.env;

module.exports = class XiaoClient extends CommandoClient {
	constructor(options) {
		super(options);

		this.logger = winston.createLogger({
			transports: [new winston.transports.Console()],
			format: winston.format.combine(
				winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
				winston.format.printf(log => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`)
			)
		});
		this.webhook = new WebhookClient(XIAO_WEBHOOK_ID, XIAO_WEBHOOK_TOKEN, { disableMentions: 'everyone' });
		this.pokemon = new PokemonStore();
		this.memePoster = POSTER_ID && POSTER_TOKEN ? new MemePosterClient(POSTER_ID, POSTER_TOKEN, {
			subreddits,
			postTypes: ['image', 'rich:video'],
			postInterval: POSTER_TIME,
			disableMentions: 'everyone'
		}) : null;
		this.games = new Collection();
		this.phone = new Collection();
		this.activities = activities;
		this.leaveMessages = leaveMsgs;
	}

	inPhoneCall(channel) {
		return this.phone.some(call => call.origin.id === channel.id || call.recipient.id === channel.id);
	}

	importCommandLeaderboard() {
		const read = fs.readFileSync(path.join(__dirname, '..', 'command-leaderboard.json'), {
			encoding: 'utf8'
		});
		const file = JSON.parse(read);
		if (typeof file !== 'object' || Array.isArray(file)) return null;
		for (const [id, value] of Object.entries(file)) {
			if (typeof value !== 'number') continue;
			const found = this.client.registry.commands.get(id);
			if (!found || found.uses === undefined) continue;
			found.uses = value;
		}
		return file;
	}
};
