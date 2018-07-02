import { statusType } from "statusType";

export abstract class status {
    abstract Enter(creep: Creep): void;
    abstract execute(creep: Creep): string;
    abstract Exit(creep: Creep): void;

    public repairNearby(creep: Creep) {
        var Needrepair = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: (structure : AnyStructure) => {
                return structure.hits < structure.hitsMax;
            }
        });
        if (Needrepair.length > 0){
            creep.repair(Needrepair[0])
        }
    }

    public randomMove(creep: Creep, pos: RoomPosition) {
        var xp = Math.floor(Math.random() * 7 - 3);
        var yp = Math.floor(Math.random() * 7 - 3);
        if (xp == 0 && yp == 0)
            this.randomMove(creep, pos);
        else
            creep.moveTo(pos.x + xp, pos.y + yp);
    }

    public getEnergyFromDropOrContainer(creep: Creep) : string {
        const closestcontainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > creep.carryCapacity);
            }
        });
        const closestdrop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (drop) => {
                return (drop.amount > creep.carryCapacity);
            }
        });
        if (closestcontainer){
            if (closestdrop) {
                const conpath = creep.pos.findPathTo(closestcontainer);
                const droppath = creep.pos.findPathTo(closestdrop);
                if (conpath.length < droppath.length){
                    creep.memory.target = closestcontainer.id;
                    return "fromContainer";
                } else {
                    creep.memory.target = closestdrop.id;
                    return "fromDrop";
                }
            } else {
                creep.memory.target = closestcontainer.id;
                return "fromContainer";
            }
        } else {
            if (closestdrop) {
                creep.memory.target = closestdrop.id;
                return "fromDrop";
            } else {
                return "nothing"
            }
        }

    }

    public getEnergyFromStorage(creep: Creep) : boolean {
        const closestcontainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE && structure.store.energy > creep.carryCapacity);
            }
        });
        if (closestcontainer) {
            creep.memory.target = closestcontainer.id;
            return true;
        }
        return false;
    }

    public transferAll (creep: Creep) : boolean {
        var targetstructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_LAB) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            return true;
        }
        return false;
    }

    public build(creep: Creep): boolean {
        var targetsite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (targetsite) {
            creep.memory.target = targetsite.id;
            return true;
        }
        return false;
    }

    public upgrade(creep: Creep): boolean {
        if (creep.room.controller) {
            creep.memory.target = creep.room.controller.id;
            return true;
        }
        return false;
    }

    public harvest(creep: Creep) {
        var sources = creep.room.find(FIND_SOURCES);
        var creeps = creep.room.find(FIND_MY_CREEPS);
        var sourceWorker = [0, 0]
        for (var i = 0; i < creeps.length; i++) {
            for (var j = 0; j < sources.length; j++) {
                if (creeps[i].memory.target == sources[j].id) {
                    sourceWorker[j]++;
                    break;
                }
            }
        }
        var source;
        if (sourceWorker[0] < sourceWorker[1]) {
            source = sources[0].id;
        } else if (sourceWorker[1] < sourceWorker[0]) {
            source = sources[1].id;
        } else {
            var tmp = creep.pos.findClosestByPath(FIND_SOURCES);
            if (tmp)
                source = tmp.id;
            else
                source = sources[0].id;
        }
        creep.memory.target = source;
    }
}
