export class roleHarvester {

    /** @param {Creep} creep **/
    public static run(creep: Creep) {

        switch (creep.memory.workingType) {
            case "harvest": {
                var source = <Source>Game.getObjectById(creep.memory.source);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                if (creep.carry.energy == creep.carryCapacity) {
                    roleHarvester.findwork(creep);
                }

                break;
            }
            case "getdrop": {
                var drop = <Resource>Game.getObjectById(creep.memory.target);
                if (!drop){
                    roleHarvester.findwork(creep);
                    break;
                }
                if (drop.amount == 0) {
                    roleHarvester.findwork(creep);
                    break;
                }
                var resgetdrop = creep.pickup(drop);
                switch (resgetdrop) {
                    case ERR_NOT_IN_RANGE: {
                        creep.moveTo(drop, { visualizePathStyle: { stroke: '#ffffff' } });
                        break;
                    }
                    case OK: {
                        if (creep.carry.energy < creep.carryCapacity)
                            roleHarvester.findEnegy(creep);
                        else
                            roleHarvester.findwork(creep);
                        break;
                    }
                    default: {
                        console.log("getdrop wrong!")
                        roleHarvester.findwork(creep);
                        break;
                    }
                }
                break;
            }
            case "transfer": {
                var stru = <StructureSpawn>Game.getObjectById(creep.memory.target);
                if (stru.energy == stru.energyCapacity) {
                    roleHarvester.findwork(creep);
                }
                var res = creep.transfer(stru, RESOURCE_ENERGY);
                switch (res) {
                    case ERR_NOT_IN_RANGE: {
                        creep.moveTo(stru, { visualizePathStyle: { stroke: '#ffffff' } });
                        break;
                    }
                    case OK: {
                        roleHarvester.findwork(creep);
                        break;
                    }
                    default: {
                        roleHarvester.findwork(creep);
                        break;
                    }
                }
                break;
            }
            case "build": {
                var site = <ConstructionSite>Game.getObjectById(creep.memory.target);
                var resbuild = creep.build(site);
                switch (resbuild) {
                    case ERR_NOT_ENOUGH_RESOURCES: {
                        roleHarvester.findEnegy(creep);
                        break;
                    }
                    case ERR_NOT_IN_RANGE: {
                        creep.moveTo(site, { visualizePathStyle: { stroke: '#ffffff' } });
                        break;
                    }
                    case OK: {
                        break;
                    }
                    default: {
                        console.log("build wrong!")
                        roleHarvester.findwork(creep);
                        break;
                    }
                }
                break;
            }
            case "upgrade": {
                if (creep.room.controller) {

                    var resupgrade = creep.upgradeController(creep.room.controller);
                    switch (resupgrade) {
                        case ERR_NOT_ENOUGH_RESOURCES: {
                            roleHarvester.findEnegy(creep);
                            break;
                        }
                        case ERR_NOT_IN_RANGE: {
                            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                            break;
                        }
                        case OK: {
                            break;
                        }
                        default: {
                            console.log("unpgrade wrong!")
                            roleHarvester.findwork(creep);
                            break;
                        }
                    }
                } else {
                    console.log("upgrade wrong!")
                    roleHarvester.findwork(creep);
                }
                break;
            }
            case "wait": {
                roleHarvester.findwork(creep);
                break;
            }
        }
    }
    public static findwork(creep: Creep) {
        if (creep.carry.energy == 0){
            roleHarvester.findEnegy(creep);
            return;
        }

        //transfer
        var targetstructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_LAB) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            creep.memory.workingType = "transfer";
            //roleHarvester.run(creep);
            return;
        }

        //build
        var targetsite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (targetsite) {
            creep.memory.target = targetsite.id;
            creep.memory.workingType = "build";
            //roleHarvester.run(creep);
            return;
        }

        //upgrade
        if (creep.room.controller){
            creep.memory.target = creep.room.controller.id;
            creep.memory.workingType = "upgrade";
            //roleHarvester.run(creep);
            return;
        }

        console.log(creep.name + "has nonthing to do!")
    }
    public static findEnegy(creep: Creep) {
        if (creep.carry.energy == creep.carryCapacity){
            roleHarvester.findwork(creep);
            return;
        }
        const drops = creep.room.find(FIND_DROPPED_RESOURCES);
        if (drops.length > 0){
            var maxdrop = 0;
            for (var i = 1; i < drops.length; i++){
                if (drops[i].amount > drops[maxdrop].amount){
                    maxdrop = i;
                }
            }
            creep.memory.target = drops[maxdrop].id;
            creep.memory.workingType = "getdrop";
            //roleHarvester.run(creep);
            return;
        }
        var t = <Source>Game.getObjectById(creep.memory.source);
        creep.memory.target = t.id;
        creep.memory.workingType = "harvest";
        //roleHarvester.run(creep);
        return;
    }
}
