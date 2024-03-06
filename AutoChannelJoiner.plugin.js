// Meta bilgileri
const meta = {
    name: "JoinVoiceChannel",
    version: "1.0.0",
    author: "Berkayy07",
    description: "Belirli bir roldeki kullanıcıların belirli bir ses kanalına katılmasını sağlar.",
    github: "https://github.com/Berkayy07/join-voice-channel",
    github_raw: "https://raw.githubusercontent.com/Berkayy07/join-voice-channel/main/JoinVoiceChannel.plugin.js"
};


// Değiştirilmesi gerekenler
const channelIdToJoin = "123456789012345678"; // Kullanıcıların taşınacağı ses kanalının ID'si
const roleId = "123456789012345678"; // Kullanıcıların rolünün ID'si

class AutoChannelJoiner {
    constructor() {
        this._config = meta;
    }

    start() {
        // Kullanıcıların taşınacağı ses kanalının ID'sine bağlı olarak eylemleri gerçekleştirme
        this.moveToChannel();
    }

    stop() {
        // Eylemi durdurma
    }

    moveToChannel() {
        // Kullanıcıların taşınacağı ses kanalına taşıma işlemi
        const voiceState = BdApi.findModuleByProps("VoiceStateStore").getVoiceState();
        if (voiceState && voiceState.channelId === null) {
            BdApi.findModuleByProps("VoiceStateStore").connectToVoiceChannel(channelIdToJoin);
        }
    }
}

// BetterDiscord kütüphanesi yüklenmemişse kullanıcıya uyarı göster
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${meta.name} is missing. Please click Download Now to install it.`, {
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

// Plugini oluşturma
module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = meta;
    }
    start() {
        BdApi.showToast("Error", "Library Missing!", {
            type: "error"
        });
    }
    stop() {}
} : (([Plugin, Api]) => {
    const plugin = (Plugin, Api) => {
        const { Patcher } = Api;

        return class AutoChannelJoiner extends Plugin {
            onStart() {
                // Plugin başlatıldığında otomatik işlemi gerçekleştirme
                this.moveToChannel();
            }

            onStop() {
                // Plugin durdurulduğunda yapılacak işlemler
            }

            moveToChannel() {
                // Kullanıcıların taşınacağı ses kanalına taşıma işlemi
                const voiceState = BdApi.findModuleByProps("VoiceStateStore").getVoiceState();
                if (voiceState && voiceState.channelId === null) {
                    BdApi.findModuleByProps("VoiceStateStore").connectToVoiceChannel(channelIdToJoin);
                }
            }
        };
    };

    return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(meta));
