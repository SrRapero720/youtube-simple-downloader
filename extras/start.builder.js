const net = require("net");

module.exports = class StartBuilder extends String {
    static DEFAULT_MESSAGE_FULL = 
`==== SERVIDOR INICIADO ====
    HOSTNAME: %host%
    IP/FAMILY: %ipv%
    PUERTO: %port%
    RAM INICIAL: %ram%MB
`;

    static DEFAULT_MESSAGE_EMPTY = "=== SERVIDOR INICIADO: No se encontro informacion del Address";
    constructor(info, /*discord?: Client*/) {
        super(typeof info === "object" && info !== null 
        ? StartBuilder.DEFAULT_MESSAGE_FULL
            .replace(/%host%/gi, info.address)
            .replace(/%ipv%/gi, info.family)
            .replace(/%port%/gi, info.port.toString())
            .replace(/%ram%/gi, console.memory.toString())
            // .replace(/%discord%/, discord?.user?.username ?? "No detectado")
            // .replace(/%discord_guild%/, discord?.guilds.cache.size.toString() ?? "0")
            // .replace(/%discord_status%/, discord?.isReady() + "")
        : typeof info === "string" ? info : StartBuilder.DEFAULT_MESSAGE_EMPTY)
    }
}