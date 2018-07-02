import { status } from "status";
import { statusType } from "statusType";

export class repairerWait extends status {
	Enter(creep: Creep): void {
		creep.memory.statusNow = statusType.wait;
		creep.say("wait");
	}
	execute(creep: Creep): string {
		if (creep.spawning){
			return statusType.wait;
		}
		if (creep.carry.energy == creep.carryCapacity)
			return statusType.repair;

		return statusType.getEnergy;
	}

	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
    }

}
