//LIBRARIES
import express from "express";
import StartBuilder from "../modules/start.builder.js";
import { join } from "path";
import spdy from "spdy";
import SpdyData from "../constants/spdy-data.js";
import routes from "../routes/routes.js";

// INIT
const app = express();
const server = spdy.createServer(new SpdyData(), app)
const PRINT = new console.SrPrint("SYSTEM/" + process.pid);

// FASE 1
server.addListener("error", err => PRINT.send("E", err));
PRINT.send("L", "Preparing worker with PID", process.pid);

app.set("trust proxy", ['loopback', 'linklocal', 'uniquelocal']);
// app.use(express.json({ limit: "100mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(express.text({ limit: "8mb" }));
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
        ticker = setInterval(() => tick(), 1000);
        PRINT.send("I", "Server ticker is ticking");
        
        const addr = server.address()
        PRINT.send("S", new StartBuilder(addr).toString());
    });
}

// START
run();
setInterval(() => PRINT.send("D", "Memory used:", console.memory.toString().concat("MB")), 1000 * 60 * 60);