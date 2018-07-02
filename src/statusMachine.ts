import { Dictionary } from "lodash";
import { status } from "status";
import { statusType } from "statusType";
import { harvestAndDrop } from "status.harvestAndDrop";
import { sourcerWait } from "status.sourcerWait";
import { harvesterWait } from "status.harvesterWait";
import { build } from "status.build";
import { getdrop } from "status.getdrop";
import { withdraw } from "status.withdraw";
import { upgrade } from "status.upgrade";
import { transfer } from "status.transfer";
import { carrierWait } from "status.carrierWait";
import { harvest } from "status.harvest";
import { upgraderWait } from "status.upgraderWait";
import { carry } from "status.carry";
import { repair } from "status.repair";
import { repairerWait } from "status.repairerWait";
import { getEnergyFromAll } from "find.getEnergyFromAll";
import { upgradeAndWithdraw } from "status.upgradeAndWithdraw";
import { getEnergyFromContainers } from "find.getEnergyFromContainers";

export class statusMachine {
    statusDict: Dictionary<status> = {};
    /**
     *
     */
    constructor(role: string) {
        switch (role) {
            case "sourcer":
                this.statusDict[statusType.harvest] = new harvestAndDrop();
                this.statusDict[statusType.wait] = new sourcerWait();
                break;

            case "harvester":
                this.statusDict[statusType.harvest] = new harvest();
                this.statusDict[statusType.getdrop] = new getdrop();
                this.statusDict[statusType.withdraw] = new withdraw();
                this.statusDict[statusType.transfer] = new transfer();
                this.statusDict[statusType.build] = new build();
                this.statusDict[statusType.wait] = new harvesterWait();
                this.statusDict[statusType.upgrade] = new upgrade();
                this.statusDict[statusType.getEnergy] = new getEnergyFromAll();
                break;

            case "carrier":
                this.statusDict[statusType.getdrop] = new getdrop();
                this.statusDict[statusType.withdraw] = new withdraw();
                this.statusDict[statusType.transfer] = new transfer();
                this.statusDict[statusType.carry] = new carry();
                this.statusDict[statusType.wait] = new carrierWait();
                this.statusDict[statusType.getEnergy] = new getEnergyFromContainers();
                break;

            case "upgrader":
                this.statusDict[statusType.withdraw] = new withdraw();
                this.statusDict[statusType.upgrade] = new upgradeAndWithdraw();
                this.statusDict[statusType.wait] = new upgraderWait();
                break;

            case "repairer":
                this.statusDict[statusType.repair] = new repair();
                this.statusDict[statusType.wait] = new repairerWait();
                this.statusDict[statusType.getEnergy] = new getEnergyFromAll();
                this.statusDict[statusType.harvest] = new harvest();
                this.statusDict[statusType.getdrop] = new getdrop();
                this.statusDict[statusType.withdraw] = new withdraw();
                break;

            default:
                console.log("non-existing role!!!!!")
                break;
        }
    }

    public execute(creep: Creep) {
        var curstatus = creep.memory.statusNow;
        var nextstatus = this.statusDict[curstatus].execute(creep);
        if (nextstatus != curstatus){
            //console.log("curstatus:" + curstatus + "-> nextstatus:" + nextstatus)
            this.statusDict[curstatus].Exit(creep);
            this.statusDict[nextstatus].Enter(creep);
        }

        while (nextstatus != "wait" && nextstatus != curstatus){
            curstatus = creep.memory.statusNow;
            nextstatus = this.statusDict[curstatus].execute(creep);
            this.statusDict[curstatus].Exit(creep);
            this.statusDict[nextstatus].Enter(creep);
            //console.log("curstatus:" + curstatus + "-> nextstatus:" + nextstatus)
        }
    }
}
