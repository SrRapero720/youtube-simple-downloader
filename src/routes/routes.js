import { Router } from "express";
import Res from "../modules/res.js";
import ytdl from "ytdl-core";
import path from "path";

const app = Router();
const PRINT = new console.SrPrint("SYSTEM/" + process.pid);

app.get("/", (req, res) => res.sendFile(path.join(process.cwd(), "static/views/index.html")));

app.get("/execute/:ytid", (req, res) => {
    const url = req.params.ytid;
    if (url == null) return res.status(400).json(new Res(400, "Invalid ID " + url));

    PRINT.send("I", "Solicitud entrante de '", req.ips.join(" "), "' solicitando https://youtube.com/watch?v=" + url);

    // RUN
    try {
        res.header('Content-Disposition', `attachment; filename="${url}.mp4"`);
        res.header("Content-Type", "video/mp4");
        const yt = ytdl(url, { filter: (format) => format.hasVideo && format.hasAudio && format.container === "mp4", quality: "highest",  });
        
        yt.pipe(res);
        res.on("close", () => {
            yt.unpipe();
            yt.destroy();
        })
    } catch(e) { res.status(500).json(new Res(500, "Failed to load url " + url)); }
});

export default app;