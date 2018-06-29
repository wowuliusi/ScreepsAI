export class roleHarvester {

    /** @param {Creep} creep **/
    public static run(creep: Creep) {

        switch (creep.memory.workingType) {
            case "harvest": {
                var source = <Source>Game.getObjectById(creep.memory.target);
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
                if (!drop) {
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
                    case OK:
                    case ERR_FULL:
                        {
                            if (creep.carry.energy < creep.carryCapacity)
                                roleHarvester.findEnegy(creep);
                            else
                                roleHarvester.findwork(creep);
                            break;
                        }
                    default: {
                        console.log("getdrop wrong! code:" + resgetdrop)
                        roleHarvester.findwork(creep);
                        break;
                    }
                }
                break;
            }

            case "withdraw": {
                var structure = <StructureContainer>Game.getObjectById(creep.memory.target);
                if (structure.store.energy == 0) {
                    roleHarvester.findwork(creep);
                    break;
                }
                var reswithdraw = creep.withdraw(structure, RESOURCE_ENERGY);
                switch (reswithdraw) {
                    case ERR_NOT_IN_RANGE: {
                        creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffffff' } });
                        break;
                    }
                    case OK:
                    case ERR_FULL:
                        {
                            if (creep.carry.energy < creep.carryCapacity)
                                roleHarvester.findEnegy(creep);
                            else
                                roleHarvester.findwork(creep);
                            break;
                        }
                    default: {
                        console.log("withdraw wrong! code:" + reswithdraw)
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
                        roleHarvester.randomMove(creep, site.pos)
                        break;
                    }
                    default: {
                        console.log("build wrong! code:" + resbuild)
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
                            roleHarvester.randomMove(creep, creep.room.controller.pos)
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
                if (!creep.spawning)
                    roleHarvester.findwork(creep);
                break;
            }
        }
    }
    public static findwork(creep: Creep) {
        if (creep.carry.energy == 0) {
            roleHarvester.findEnegy(creep);
            return;
        }

        if (roleHarvester.transfer(creep))
            return;

        const con = creep.room.controller;
        if (con) {
            if (con.level == 1) {
                if (roleHarvester.upgrade(creep))
                    return;
            } else {
                if (roleHarvester.buildExtention(creep))
                    return;
                if (roleHarvester.build(creep))
                    return;
                if (roleHarvester.upgrade(creep))
                    return;
            }
        }
        console.log(creep.name + "has nonthing to do!")
    }

    public static transfer(creep: Creep) {
        var targetstructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_LAB) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            creep.memory.workingType = "transfer";
            creep.say("transfer");
            //roleHarvester.run(creep);
            return true;
        }
        return false;
    }
    public static build(creep: Creep) {
        var targetsite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (targetsite) {
            creep.memory.target = targetsite.id;
            creep.memory.workingType = "build";
            creep.say("build");
            roleHarvester.run(creep);
            return true;
        }
        return false;
    }
    public static buildExtention(creep: Creep) {
        var targetstructure = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION)
            }
        });
        if (targetstructure) {
            creep.memory.target = targetstructure.id;
            creep.memory.workingType = "build";
            creep.say("buildExtention");
            roleHarvester.run(creep);
            return true;
        }
        return false;
    }
    public static upgrade(creep: Creep) {
        if (creep.room.controller) {
            creep.memory.target = creep.room.controller.id;
            creep.memory.workingType = "upgrade";
            creep.say("upgrade");
            roleHarvester.run(creep);
            return true;
        }
        return false;
    }

    public static findEnegy(creep: Creep) {
        if (creep.carry.energy == creep.carryCapacity) {
            roleHarvester.findwork(creep);
            return;
        }

        //withdraw
        var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                    structure.store.energy > creep.carryCapacity;
            }
        });
        if (structure) {
            creep.memory.target = structure.id;
            creep.memory.workingType = "withdraw";
            creep.say("withdraw");
            return;
        }

        //get drop
        const drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (drop) {
            creep.memory.target = drop.id;
            creep.memory.workingType = "getdrop";
            creep.say("getdrop");
            //roleHarvester.run(creep);
            return;
        }

        //harvest
        var sources = creep.room.find(FIND_SOURCES);
        var creeps = creep.room.find(FIND_CREEPS);
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
        creep.memory.workingType = "harvest";
        creep.say("harvest");
        roleHarvester.run(creep);
        return;
    }

    public static randomMove(creep: Creep, pos: RoomPosition) {
        var xp = Math.floor(Math.random() * 7 - 3);
        var yp = Math.floor(Math.random() * 7 - 3);
        if (xp == 0 && yp == 0)
            roleHarvester.randomMove(creep, pos);
        else
            creep.moveTo(pos.x + xp, pos.y + yp);
    }
}
