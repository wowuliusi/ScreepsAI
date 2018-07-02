import { status } from "status";
import { statusType } from "statusType";

export class harvesterWait extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.wait;
        creep.say("wait");
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }
    execute(creep: Creep): string {
        if (creep.spawning)
            return statusType.wait;
        this.repairNearby(creep);
        if (creep.carry.energy < creep.carryCapacity / 4) {
            return statusType.getEnergy;
        }

        if (this.transferAll(creep)){
            return statusType.transfer;
        }

        const con = creep.room.controller;
        if (con) {
            if (con.level == 1) {
                if (this.upgrade(creep))
                    return statusType.upgrade;
            } else {
                if (harvesterWait.buildExtention(creep))
                    return statusType.build;
                if (this.build(creep))
                    return statusType.build;
                if (this.upgrade(creep))
                    return statusType.upgrade;
            }
        }
        console.log(creep.name + "has nonthing to do!")
        return statusType.wait;
    }

    public static buildExtention(creep: Creep): boolean {
        var targetstructure = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION)
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            return true;
        }
        return false;
    }


}
