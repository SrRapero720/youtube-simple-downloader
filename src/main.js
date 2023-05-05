// PRE-INIT
import "sr-console";
import ClusterManager from "./clustermanager.js";

// CLUSTER

if (ClusterManager.isPrimary()) await ClusterManager.load() 
else { await import("./server/mainserver.js"); }