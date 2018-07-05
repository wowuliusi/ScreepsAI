export class StrucSpawn {
    spawn: StructureSpawn;
    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
    }

    public work() {
        if (this.spawn.spawning)
            return;
        if (this.spawn.memory.queue.length > 0){

        }
    }
}
