import { status } from "status";
import { statusType } from "statusType";

export class upgraderWait extends status {
	Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.wait;
        creep.say("wait");
	}
	execute(creep: Creep): string {
		if (creep.spawning){
            return statusType.wait;
        }
        this.repairNearby(creep);
        if (creep.carry.energy == 0) {
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            });
            if (structure) {
                creep.memory.target = structure.id;
                return statusType.withdraw;
            }
            return statusType.wait;
        } else {
            if (this.upgrade) {
                return statusType.upgrade;
            }
            return statusType.wait;
        }
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
    }

}
