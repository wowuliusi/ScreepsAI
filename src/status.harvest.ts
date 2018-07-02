import { status } from "status";
import { statusType } from "statusType";

export class harvest extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.harvest;
        creep.say("harvest");
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }
    execute(creep: Creep): string {
        this.repairNearby(creep);
        var source = <Source>Game.getObjectById(creep.memory.target);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        if (creep.carry.energy == creep.carryCapacity) {
            return statusType.wait;
        }
        return statusType.harvest;
    }

}
