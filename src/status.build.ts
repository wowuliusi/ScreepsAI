import { status } from "status";
import { statusType } from "statusType";

export class build extends status {
    Enter(creep: Creep): void {
        creep.memory.statusNow = statusType.build;
        creep.say("build");
    }
    execute(creep: Creep): string {
        var site = <ConstructionSite>Game.getObjectById(creep.memory.target);
        var resbuild = creep.build(site);
        switch (resbuild) {
            case ERR_NOT_ENOUGH_RESOURCES: {
                return statusType.wait;
            }
            case ERR_NOT_IN_RANGE: {
                creep.moveTo(site, { visualizePathStyle: { stroke: '#ffffff' } });
                return statusType.build;
            }
            case OK: {
                this.randomMove(creep, site.pos)
                return statusType.build;
            }
            default: {
                console.log("build wrong! code:" + resbuild)
                return statusType.wait;
            }
        }
    }
    Exit(creep: Creep): void {
        creep.memory.statusNow = statusType.none;
    }

}
