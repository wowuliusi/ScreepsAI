import { status } from "status";
import { statusType } from "statusType";

export class repair extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.repair;
        creep.say("repair");
    }
    execute(creep: Creep): string {
        var Needrepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure : AnyStructure) => {
                return structure.hits < structure.hitsMax;
            }
        });
        if (Needrepair){

            var res = creep.repair(Needrepair);
            switch (res) {
                case ERR_NOT_ENOUGH_RESOURCES:
                    return statusType.wait;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(Needrepair);
                    return statusType.repair;
                case OK:
                    return statusType.repair;
                default:
                    return statusType.repair;
            }
        } else {
            return statusType.wait;
        }
    }

    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }

}
