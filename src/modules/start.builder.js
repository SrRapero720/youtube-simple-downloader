import net from "net";

export default class StartBuilder extends String {
//     static DEFAULT_MESSAGE_FULL = 
// `==== SERVIDOR INICIADO ====
//     PORT: %port%
//     MEMORY (RAM): %ram%MB
//     PID: %pid%
// `;

    static DEFAULT_MESSAGE_FULL = ` ** SERVER STARTED USING PORT %port% WITH %ram% OF RAM USED ON PID %pid% **`;

    static DEFAULT_MESSAGE_EMPTY = "=== SERVIDOR INICIADO: No se encontro informacion del Address";
    constructor(info, /*discord?: Client*/) {
        super(typeof info === "object" && info !== null 
        ? StartBuilder.DEFAULT_MESSAGE_FULL
            // .replace(/%host%/gi, info.address)
            // .replace(/%ipv%/gi, info.family)
            .replace(/%port%/gi, console.color("YELLOW") + info.port.toString() + console.color("GREEN"))
            .replace(/%ram%/gi, console.color("YELLOW") + console.memory.toString() + "MB" + console.color("GREEN"))
            .replace(/%pid%/gi, console.color("YELLOW") + process.pid + console.color("GREEN"))
            // .replace(/%discord%/, discord?.user?.username ?? "No detectado")
            // .replace(/%discord_guild%/, discord?.guilds.cache.size.toString() ?? "0")
            // .replace(/%discord_status%/, discord?.isReady() + "")
        : typeof info === "string" ? info : StartBuilder.DEFAULT_MESSAGE_EMPTY)
    }
}