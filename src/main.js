import "sr-console";
import express, { json, urlencoded, text } from "express";
import StartBuilder from "./modules/start.builder.js";
import Res from "./modules/res.js";
import ytdl from "ytdl-core";
import { join } from "path";

const app = express();
app.use(json({ limit: "100mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(text({ limit: "8mb" }));
app.enable("verbose errors");

console.send("Iniciando servidor");

app.get("/", (req, res) => {
    res.status(200).sendFile(join(__dirname, "/html/index.html"));
})

app.get("/execute/:ytid", (req, res) => {
    console.debug("Nueva solicitud de '", req.ips.join(" "), "' O de la principal", req.ip);
    const url = req.params.ytid ?? req.body.ytid;
    if (url == null) return res.status(400).json(new Res(400, "Invalid ID " + url))

    try {
        res.header('Content-Disposition', `attachment; filename="${url}.mp4"`);
        ytdl(url, { filter: (format) => format.container == "mp4" && format.hasVideo && format.hasAudio,  }).pipe(res);
    } catch(e) {
        res.status(500).json(new Res(500, "Failed to load url " + url));
    }
});


console.warn("Ruta principal agregada");


const net = app.listen(process.env.PORT || 80, () => {
    console.success(new StartBuilder(net.address()).toString());
    console.success("Completado")
    console.success("...")
});