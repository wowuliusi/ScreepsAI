import { status } from "status";
import { statusType } from "statusType";

export class getEnergyFromAll extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.getEnergy;
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }
    execute(creep: Creep): string {
        if (creep.spawning)
            return statusType.wait;
        if (creep.carry.energy == creep.carryCapacity)
            return statusType.wait;

        var now = this.getEnergyFromDropOrContainer(creep);
        switch (now) {
            case "fromContainer":
                return statusType.withdraw;

            case "fromDrop":
                return statusType.getdrop;

            default:

                if (this.getEnergyFromStorage(creep)) {

                    return statusType.withdraw;
                }

                this.harvest(creep);
                return statusType.harvest;
        }
    }
}
