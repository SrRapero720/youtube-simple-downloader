import cluster from 'node:cluster';
import os from "os";

const PRINT = new console.SrPrint("SYSTEM/" + process.pid);
const MODE = process.env.YTSD_THREADS_MODE;
let numCPUs = os.availableParallelism();

if (!isNaN(parseInt(MODE))) numCPUs = parseInt(MODE);
if (MODE == "HALF") numCPUs = numCPUs / 2;
if (MODE == "SINGLE") numCPUs = -1;

export default class ClusterManager {
    static __created = 0;
    static isPrimary() {
        if (numCPUs == -1) return false;
        return cluster.isPrimary;
    }

    static async load() {
        // IDENTIFY
        PRINT.send("L", `> Information del sistema:
            - OS: ${os.platform()}
            - ARCH: ${os.arch()}
            - CPU: ${os.cpus()[0].model}
            - RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB
            `);

        const pgk = await import("../package.json", { assert: { type: "json" } });
        PRINT.send("L", `> Información de la aplicación
            - NOMBRE DE LA APP: ${pgk.name}
            - VERSION: ${pgk.version}
            - NODE: ${process.version}
            `);

        // RUNNING
        PRINT.send("L", `Running primary cluster using PID`, process.pid);
        PRINT.send("L", `Preparing to run forks`);

        // PATCHER
        await import("./tools/patcher.js");

        // fork using clusters
        if (this.__created < numCPUs) this.__fork();
        PRINT.send("L", `First fork running and waiting for`, numCPUs, "more");

        // fatalback when died
        cluster.on("listening", (worker) => { if (this.__created < numCPUs) setTimeout(() => {
            this.__fork();
        }, 500); });
        cluster.on('exit', (worker, code, signal) => console.fatalBack(`Cluster`, worker.process.pid, `died with status code`, code));

        return true;
    }

    static async __fork() {
        cluster.fork();
        this.__created++;
    }
}