import { status } from "status";
import { statusType } from "statusType";

export class withdraw extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.withdraw;
        creep.say("withdraw");
    }
    execute(creep: Creep): string {
        var structure = <StructureContainer>Game.getObjectById(creep.memory.target);
        if (!structure) {
            console.log("structure missing");
            return statusType.wait;
        }
        if (structure.store.energy == 0) {
            return statusType.wait;
        }
        var reswithdraw = creep.withdraw(structure, RESOURCE_ENERGY);
        switch (reswithdraw) {
            case ERR_NOT_IN_RANGE: {
                creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffffff' } });
                return statusType.withdraw
            }
            case OK:
            case ERR_FULL:
                return statusType.wait;
            default: {
                console.log("withdraw wrong! code:" + reswithdraw)
                return statusType.wait;
            }
        }
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }

}
