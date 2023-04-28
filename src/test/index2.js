import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
let writted = 0;

const stream = fs.createWriteStream(path.join(process.cwd(), "./video_2.mp4")).on('data', data => {
    writted += data.length;
    console.log(`Guardados ${writted} de ${stream.writableLength} bytes (${(writted/stream.writableLength*100).toFixed(2)}%)`);
}).on("error",  (err) => console.error).on("pipe", (readable) => { readable.on("data", 
(data) => {
    writted += data.lenght;
    console.log(`Guardados ${writted} de ${readable.readableLength} bytes (${(writted/stream.writableLength*100).toFixed(2)}%)`);
}) }).on("finish", () => { console.log("finalizado")});

ytdl("https://www.youtube.com/watch?v=cl3xvk18x_A&ab_channel=VirtualConflux").pipe(stream);