import { status } from "status";
import { statusType } from "statusType";

export class carrierWait extends status {
	Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.wait;
        creep.say("wait");
	}
	execute(creep: Creep): string {
		if (creep.spawning){
			return statusType.wait;
        }
        if (creep.carry.energy < creep.carryCapacity / 4) {
            return statusType.getEnergy;
        } else {
            if (this.transferAll(creep)){
                return statusType.transfer;
            } else {
                if (this.carry(creep)){
                    return statusType.carry;
                } else {
                    console.log("Carrier " + creep.name + "have nothing to do!")
                }
            }
        }
		return statusType.wait;
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
    }

    public carry(creep: Creep) : boolean {
        var targetstructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE) &&
                    structure.store.energy < structure.storeCapacity;
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            return true;
        }
        return false;
    }
}
