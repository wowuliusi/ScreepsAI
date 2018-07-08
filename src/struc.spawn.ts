export class StrucSpawn {
    spawn: StructureSpawn;
    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    public work() {
        if (this.spawn.spawning){

            this.spawn.memory.waitTime = 0;
            return;
        }

        if (this.spawn.memory.queue && this.spawn.memory.queue.length > 0){
            if (this.spawn.memory.waitTime < 100) {
                this.spawn.memory.waitTime = this.spawn.memory.waitTime + 1;
                let body = this.spawn.memory.queue[0].model;
                let newname = this.spawn.memory.queue[0].role + " " + Game.time;
                if (this.spawn.spawnCreep(body, newname, {memory: {role: this.spawn.memory.queue[0].role, target: this.spawn.memory.queue[0].target, statusNow: this.spawn.memory.queue[0].status}}))
                    this.spawn.memory.queue.shift();
            } else {
                let newname = "Tempory " + Game.time;
                this.spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newname, {memory: {role: "harvester", target: "", statusNow: "wait"}})
            }
        }
    }
}
