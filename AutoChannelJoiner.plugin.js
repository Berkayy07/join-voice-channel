/**
 * @name AutoChannelJoiner
 * @version 1.0.0
 * @description Belirli bir role sahip kullanıcıları belirli bir ses kanalına taşır ve sizin yanınıza getirir.
 * @author laelareal
 * @source https://github.com/Berkayy07/join-voice-channel
 */

const config = {
    roleId: "1065713892686311464", // Belirlediğiniz rolün ID'sini buraya girin
    originalChannelId: "1065714205057093632", // Kullanıcıların orijinal olarak girdiği ses kanalının ID'sini buraya girin
    newChannelId: "1214920886730096651" // Kullanıcıların taşınacağı yeni ses kanalının ID'sini buraya girin
};

class AutoChannelJoiner {
    constructor() {
        this._config = config;
    }

    start() {
        this.observeVoiceStateUpdate();
    }

    stop() {
        // Herhangi bir durdurma işlemi gerekiyorsa burada gerçekleştirilebilir
    }

    async moveToNewChannel(userId) {
        const { DiscordModules } = ZeresPluginLibrary;

        const voiceState = DiscordModules.VoiceStateStore.getVoiceState(userId);
        if (!voiceState || voiceState.channelId !== config.originalChannelId) return;

        const member = DiscordModules.GuildMemberStore.getMember(voiceState.guildId, userId);
        if (!member || !member.roles.includes(config.roleId)) return;

        await DiscordModules.VoiceStateStore.connectToVoiceChannel(config.newChannelId);
    }

    observeVoiceStateUpdate() {
        const { DiscordModules, Patcher } = ZeresPluginLibrary;

        Patcher.after(DiscordModules.VoiceStateStore, "setSelfDeaf", (_, [, value]) => {
            if (!value) return; // Deaf modu değişmediyse işlemi atla
            const userId = DiscordModules.UserStore.getCurrentUser().id;
            this.moveToNewChannel(userId);
        });
    }
}

module.exports = AutoChannelJoiner;
