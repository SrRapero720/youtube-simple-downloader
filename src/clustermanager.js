import cluster from 'node:cluster';
import os from "os";

const PRINT = new console.SrPrint("SYSTEM/" + process.pid);
const MODE = process.env.YTSD_THREADS_MODE;
let numCPUs = os.availableParallelism();

const warnMem = parseInt(process.env.WARN_MEM);
const maxMem = parseInt(process.env.MAX_MEM);

let isWarned = false;
let tpm = 0;

/**
 * @constant
 * @type {Worker[]}
 */
const forks = [];

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
        cluster.on("listening", (worker) => { if (this.__created < numCPUs) this.__fork() });
        cluster.on('exit', (worker, code, signal) => console.fatalBack(`Cluster`, worker.process.pid, `died with status code`, code));

        this.startTicker();

        return true;
    }

    static startTicker() {
        setInterval(() => {
            let mem = 0;
            tpm++;
            forks.forEach(f => mem = mem + f.memory);
            PRINT.send("D", mem);

            if (mem > warnMem) {
                if (mem < maxMem) {
                    if (isWarned && tpm < 300) return;
                    PRINT.send("W", "Server is using", mem, "MB, a dangerous amount of RAM");
                    isWarned = true;
                    tpm = 0;
                } else {
                    if (tpm > 10) {
                        PRINT.send("E", "Server is using a critical amount of RAM... FORCING PROCESS RESTARTING");
                        forks.forEach(f => f.kill());
                        while (forks.length != 0) forks.pop();
                        this.__created = 0;
                        this.__fork();
                        tpm = 0;
                    }
                }
            }
        }, 1000);
    }

    static async __fork() {
        const fork = cluster.fork();
        fork.memory = 0;
        fork.on("message", (msg) => {
            if (msg.includes("memory")) fork.memory = parseFloat(msg.split(":")[1]);
        });
        forks.push(fork);
        this.__created++;
    }
}