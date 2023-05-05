// PRE-INIT
import "sr-console";
import "./tools/patcher.js";

//LIBRARIES
import express from "express";
import StartBuilder from "./modules/start.builder.js";
import os from "os";
import { join } from "path";
import spdy from "spdy";
import SpdyData from "./constants/spdy-data.js";
import routes from "./routes/routes.js";
import pgk from "../package.json" assert { type: "json" }

// INIT
const app = express();
const server = spdy.createServer(new SpdyData(), app)
const PRINT = console.defaultPrint;

// IDENTIFY
PRINT.send("L", `> Information del sistema:
    - OS: ${os.platform()}
    - ARCH: ${os.arch()}
    - CPU: ${os.cpus()[0].model}
    - RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`);
PRINT.send("L", `> Información de la aplicación
    - NOMBRE DE LA APP: ${pgk.name}
    - VERSION: ${pgk.version}
    - NODE: ${process.version}`);

// FASE 1
server.addListener("listening", async () => PRINT.send("S", "> > > INICIALIZADO: SPDY SERVER"));
server.addListener("error", err => PRINT.send("E", err));

app.set("trust proxy", ['loopback', 'linklocal', 'uniquelocal']);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.text({ limit: "8mb" }));
app.use("/", express.static(join(process.cwd(), "/static/public")));

// ROUTES
app.use(routes);

// TICKER
let ticker;
let isWarned = false;
function tick() {
    if (console.memory > 512) {
        if (console.memory < 1024) {
            if (isWarned) return;
            PRINT.send("W", "Server is using", console.memory, "MB, a dangerous amount of RAM");
            isWarned = true;
        } else {
            PRINT.send("E", "Server is using a critical amount of RAM... FORCING AUTO-RESTART");
            server.closeAllConnections();
            server.closeIdleConnections();
            server.close();
            clearInterval(ticker);
            run();
        }
    }
}

function run() {
    server.listen(process.env.PORT || 80, () => {
        const addr = server.address()
        PRINT.send("S", "Server active on port", server.listening ? `${console.color("YELLOW")}${addr?.port}`: `${console.color("RED")}<No port detected>`);
        PRINT.send("S", new StartBuilder(addr).toString());
        PRINT.send("S", "Server loaded successfuly");
    
        ticker = setInterval(() => tick(), 1000);
    
    });
}

// START
run();
setInterval(() => PRINT.send("D", "Memory used:", console.memory.toString().concat("MB")), 1000 * 60 * 60);