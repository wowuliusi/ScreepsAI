import { status } from "status";
import { statusType } from "statusType";

export class sourcerWait extends status {
	Enter(creep: Creep): void {
		creep.memory.statusNow = statusType.wait;
		creep.say("wait");
	}
	execute(creep: Creep): string {
		if (!creep.spawning){
			this.repairNearby(creep);
			return statusType.harvest;
		}
		return statusType.wait;
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
    }

}
