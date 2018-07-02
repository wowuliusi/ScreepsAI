import { status } from "status";
import { statusType } from "statusType";

export class upgrade extends status {
	Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.upgrade;
        creep.say("upgrade");
	}
	execute(creep: Creep): string {
        this.repairNearby(creep);
        if (creep.room.controller) {
            var resupgrade = creep.upgradeController(creep.room.controller);
            switch (resupgrade) {
                case ERR_NOT_ENOUGH_RESOURCES: {
                    return statusType.wait;
                }
                case ERR_NOT_IN_RANGE: {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                    return statusType.upgrade;
                }
                case OK: {
                    this.randomMove(creep, creep.room.controller.pos)
                    return statusType.upgrade;
                }
                default: {
                    console.log("unpgrade wrong!")
                    return statusType.wait;
                }
            }
        } else {
            console.log("upgrade wrong!")
            return statusType.wait;
        }
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
    }

}
