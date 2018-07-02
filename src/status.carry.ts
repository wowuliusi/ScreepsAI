import { status } from "status";
import { statusType } from "statusType";

export class carry extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.carry;
        creep.say("carry");
    }
    execute(creep: Creep): string {

        var stru = <StructureStorage>Game.getObjectById(creep.memory.target);
        if (stru.store.energy == stru.storeCapacity) {
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
