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
app.use("/", express.static(join(process.cwd(), "/static/public")));

// ROUTES
app.use(routes);

function run() {
    server.listen(process.env.PORT || 80, () => {
        const addr = server.address();
        PRINT.send("S", new StartBuilder(addr).toString());
    });
}

// START
run();
setInterval(() => PRINT.send("D", "Memory used:", console.memory.toString().concat("MB")), 1000 * 60 * 60);
setInterval(() => process.send("memory:" + console.memory), 1000);