import { status } from "status";
import { statusType } from "statusType";

export class getdrop extends status {
	Enter(creep: Creep): void {
		creep.memory.statusNow = statusType.getdrop;
		creep.say("getdrop");
	}
	execute(creep: Creep): string {
		this.repairNearby(creep);
		var drop = <Resource>Game.getObjectById(creep.memory.target);
		if (!drop) {
			return statusType.wait;
		}
		if (drop.amount == 0) {
			return statusType.wait;
		}
		var resgetdrop = creep.pickup(drop);
		switch (resgetdrop) {
			case ERR_NOT_IN_RANGE: {
				creep.moveTo(drop, { visualizePathStyle: { stroke: '#ffffff' } });
				return statusType.getdrop;
			}
			case OK:
			case ERR_FULL:
				return statusType.wait;
			default: {
				console.log("getdrop wrong! code:" + resgetdrop)
				return statusType.wait;
			}
		}
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
	}

}
