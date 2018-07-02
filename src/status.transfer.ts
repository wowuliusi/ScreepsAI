import { status } from "status";
import { statusType } from "statusType";

export class transfer extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.transfer;
        creep.say("transfer");
    }
    execute(creep: Creep): string {

        var stru = <StructureSpawn>Game.getObjectById(creep.memory.target);
        if (stru.energy == stru.energyCapacity) {
            return statusType.wait;
        }
        var res = creep.transfer(stru, RESOURCE_ENERGY);
        switch (res) {
            case ERR_NOT_IN_RANGE: {
                creep.moveTo(stru, { visualizePathStyle: { stroke: '#ffffff' } });
                return statusType.transfer;
            }
            case OK: {
                return statusType.wait;
            }
            default: {
                return statusType.wait;
            }
        }
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }

}
