/**
 * @name JoinVoiceChannel
 * @description Belirli bir roldeki kullanıcıların belirli bir ses kanalına katılmasını sağlar.
 * @version 1.0.0
 * @author laelareal
 * @website [Your website]
 * @source [URL to your GitHub repository]
 */


const config = {
    name: "JoinVoiceChannel",
    version: "1.0.0",
    author: "laelareal",
    description: "Belirli bir roldeki kullanıcıların belirli bir ses kanalına katılmasını sağlar.",
    github: "https://github.com/Berkayy07/joinvoice",
    github_raw: "https://raw.githubusercontent.com/Berkayy07/joinvoice/main/JoinVoiceChannel.plugin.js"
};

// Değiştirmeniz gereken yerler
let originalChannelId = "1065714205057093632"; // Kullanıcıların orijinal olarak girdiği ses kanalının ID'sini buraya girin
let newChannelId = "1214920886730096651"; // Kullanıcıların taşınacağı yeni ses kanalının ID'sini buraya girin
let roleId = "1065713892686311464"; // Kullanıcıların rolünün ID'sini buraya girin

class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}

if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}

module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
    const plugin = (Plugin, Api) => {
        const {DiscordModules, Patcher} = Api;

        return class JoinVoiceChannel extends Plugin {
            onStart() {
                this.patchVoiceStates();
            }

            onStop() {
                Patcher.unpatchAll();
            }

            patchVoiceStates() {
                Patcher.after(DiscordModules.VoiceStateStore, "getVoiceStatesForChannel", (_, args, returnValue) => {
                    const [channelId] = args;
                    if (channelId === originalChannelId) {
                        const myId = DiscordModules.UserStore.getCurrentUser().id;
                        const memberIds = Object.keys(returnValue);
                        if (memberIds.some(id => DiscordModules.MemberStore.getMember(channelId, id) && DiscordModules.MemberStore.getMember(channelId, id).roles.includes(roleId) && id !== myId)) {
                            const myVoiceState = returnValue[myId];
                            if (myVoiceState && !myVoiceState.channelId) {
                                DiscordModules.VoiceStateStore.setSelfMute(false);
                                DiscordModules.VoiceStateStore.setSelfDeaf(false);
                                DiscordModules.VoiceStateStore.connectToVoiceChannel(newChannelId);
                            }
                        }
                    }
                });
            }
        };
    };

    return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
