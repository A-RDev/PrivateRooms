const database = require('./database.json');

/**
 * ----------------------------------------------
 * Please do not change anything under this text,
 * if you don't know how does it work. Thanks!
 * ----------------------------------------------
 */
const Discord = require('discord.js');
const cooldowns = new Map();
const mutedInPrivate = [];
const deafenedInPrivate = [];
const withDeafToo = [];
/**
 * @param {Discord.Client} client 
 */
module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => {
        database.forEach(config => {
            voiceStateUpdateHandle(config, oldVoiceState, newVoiceState);
        });
    })

    function muteOrDeafActions(oldVoiceState,newVoiceState) {
        if (oldVoiceState.serverMute != newVoiceState.serverMute) {//action is mute
            if (oldVoiceState.serverMute && !mutedInPrivate.includes(oldVoiceState.id)) ifActionNotByAdmin(newVoiceState,() => newVoiceState.setMute(true)); //if has been muted by admin
            else if (newVoiceState.serverMute && !mutedInPrivate.includes(newVoiceState.id)) ifActionNotByAdmin(newVoiceState,voiceState => mutedInPrivate.push(voiceState.id)) // add to mute list
            else if (mutedInPrivate.includes(newVoiceState.id)) mutedInPrivate.splice(mutedInPrivate.indexOf(newVoiceState.id)); // remove from mute list
        } else if (oldVoiceState.serverDeaf != newVoiceState.serverDeaf) { //action is deaf
            if (oldVoiceState.serverDeaf && !deafenedInPrivate.includes(oldVoiceState.id)) ifActionNotByAdmin(newVoiceState,() => newVoiceState.setDeaf(true)); //if has been deafened by admin
            else if (newVoiceState.serverDeaf && !deafenedInPrivate.includes(newVoiceState.id)) ifActionNotByAdmin(newVoiceState,voiceState => deafenedInPrivate.push(voiceState.id)) // add to deaf list
            else if (deafenedInPrivate.includes(newVoiceState.id)) deafenedInPrivate.splice(deafenedInPrivate.indexOf(newVoiceState.id)); // remove from deaf list
        }
        return;
    };

    function voiceStateUpdateHandle(configuration, oldVoiceState, newVoiceState) {
        if (newVoiceState.channel != null) { // The member connected. to a channel.
            try {
                if (oldVoiceState.channel.parentID == oldVoiceState.guild.channels.cache.find(channel => channel.id === config.create_rooms_channel_id).parentID) { // if action in private channel
                    if (oldVoiceState.channel != newVoiceState.channel) {if (!oldVoiceState.channel.members.size && oldVoiceState.channelID != config.create_rooms_channel_id) oldVoiceState.channel.delete()} // if Empty -> delete channel
                    else muteOrDeafActions(oldVoiceState,newVoiceState) // check... if action is mute or deaf -> (un)mute/(un)deaf
                } //if action not in private -> return
            } catch (error) {}

        if (oldVoiceState.channel != newVoiceState.channel || withDeafToo.includes(newVoiceState.id)) { // if user goes to another channel
            if (mutedInPrivate.includes(newVoiceState.id)) {
                mutedInPrivate.splice(mutedInPrivate.indexOf(newVoiceState.id));
                newVoiceState.setMute(false);
                if (newVoiceState.serverDeaf && deafenedInPrivate.includes(newVoiceState.id)) withDeafToo.push(newVoiceState.id)
                return
            } // if Muted in Private -> unmute
            else if (deafenedInPrivate.includes(newVoiceState.id)) {
                deafenedInPrivate.splice(deafenedInPrivate.indexOf(newVoiceState.id));
                newVoiceState.setDeaf(false);
                if (withDeafToo.includes(newVoiceState.id)) withDeafToo.splice(withDeafToo.indexOf(newVoiceState.id));
                return
            } // if Deaf in Private -> unDeaf
        }
        if (newVoiceState.channelID != configuration.create_rooms_channel_id) return // if channel user go to is not 'Creating new' -> return
        if (!cooldowns.has("voiceCreate")) cooldowns.set("voiceCreate", new Discord.Collection())
        const current_time = Date.now()
        const time_stamps = cooldowns.get("voiceCreate")
        const cooldowns_amount = 10 * 1000
        if(time_stamps.has(newVoiceState.member.user.id)) {
            const expiration_time = time_stamps.get(newVoiceState.member.user.id)+cooldowns_amount
            if (current_time < expiration_time) {
                const time_left = (expiration_time - current_time) / 1000
                newVoiceState.kick()
                const Emed = new Discord.MessageEmbed().setColor(0xFF0022).setDescription(`**Не так часто!** Подождите ещё **${time_left.toFixed(1)}**с. чтобы создать канал\n**Not so often!** Wait another **${time_left.toFixed(1)}**s. to create a voice channel`)
                newVoiceState.member.send(Emed).catch(() => console.log(generateTimeLog()+`\u001b[33mUnable to send message\u001b[0m ${newVoiceState.member.user.tag}`))
                return
            }
        }
        let name = newVoiceState.member.nickname
        if (!name) name = newVoiceState.member.user.username
        newVoiceState.guild.channels.create(name+'\'s channel', {
            type: 'voice',
            parent: newVoiceState.guild.channels.cache.find(channel => channel.id === configuration.create_rooms_channel_id).parentID,
            permissionOverwrites: [
            {
            id: newVoiceState.member.user.id,
            allow: ['MANAGE_CHANNELS','MOVE_MEMBERS','MANAGE_ROLES','MUTE_MEMBERS','DEAFEN_MEMBERS','VIEW_CHANNEL'],
        },
        ],
        }).then((channeL) => {
        newVoiceState.setChannel(channeL.id)
        console.log(`\u001b[32mVoice channel created\u001b[0m ${newVoiceState.member.user.tag}`, "info");
        time_stamps.set(newVoiceState.member.user.id, current_time) //set cooldown for user
        }).catch(() => console.log(`\u001b[31mVoice channel creation error\u001b[0m ${newVoiceState.member.user.tag}`, "err"))
        } else if (oldVoiceState.channel) { // The member disconnected from a channel.
        if (oldVoiceState.channel != newVoiceState.channel && true) {if (!oldVoiceState.channel.members.size && oldVoiceState.channelID != configuration.create_rooms_channel_id) return oldVoiceState.channel.delete()} // if Empty -> delete channel
    }}
}