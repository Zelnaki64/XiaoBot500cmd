const Command = require('../../structures/Command');
const { stripIndents } = require('common-tags');
const { formatNumber } = require('../../util/Util');

module.exports = class GroupLeaderboardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'group-leaderboard',
			aliases: ['grp-lb', 'grp-leaderboard', 'group-lb'],
			group: 'util-public',
			memberName: 'group-leaderboard',
			description: 'Responds with the bot\'s most used command groups.',
			guarded: true,
			args: [
				{
					key: 'page',
					prompt: 'What page do you want to view?',
					type: 'integer',
					default: 1,
					min: 1
				}
			]
		});
	}

	run(msg, { page }) {
		const groups = this.client.registry.groups.map(group => {
			return {
				uses: group.commands.reduce((a, b) => a + (b.uses || 0), 0),
				group
			};
		});
		const totalPages = Math.ceil(groups.size / 10);
		if (page > totalPages) return msg.say(`Page ${page} does not exist (yet).`);
		return msg.say(stripIndents`
			__**Command Group Usage Leaderboard (Page ${page}/${totalPages}):**__
			${this.makeLeaderboard(groups, page).join('\n')}
		`);
	}

	makeLeaderboard(groups, page) {
		let i = 0;
		let previousPts = null;
		let positionsMoved = 1;
		return groups
			.sort((a, b) => b.uses - a.uses)
			.map(groups => {
				if (previousPts === groups.uses) {
					positionsMoved++;
				} else {
					i += positionsMoved;
					positionsMoved = 1;
				}
				previousPts = groups.uses;
				return `**${i}.** ${group.group.name} (${formatNumber(groups.uses)} Use${groups.uses === 1 ? '' : 's'})`;
			})
			.slice((page - 1) * 10, page * 10);
	}
};