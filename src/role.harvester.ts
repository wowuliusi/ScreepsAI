export class roleHarvester {

    /** @param {Creep} creep **/
    public static run(creep: Creep) {

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('recharge');
        }
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('work');
        }

        if (creep.memory.working) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_LAB) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                var t = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: (structure : AnyStructure) => {
                        return structure.hits < structure.hitsMax;
                    }
                });
                if (t.length > 0) {
                    creep.repair(t[0]);
                } else {
                    var t2 = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (t2.length > 0) {
                        if (creep.build(t2[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(t2[0], { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    } else if (creep.room.controller) {
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
            }
        }
        else {
            const drops = creep.room.find(FIND_DROPPED_RESOURCES);
            var target = null;
            if (drops.length > 0) {
                for (let d of drops) {
                    if (d.amount > creep.carryCapacity) {
                        target = Game.getObjectById(d.id);
                    }
                }
            }
            if (target == null) {
                var sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.source], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            (structure.store.energy > creep.carryCapacity);
                    }
                });
                if (targets.length > 0){
                    if (creep.withdraw(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }

        }
    }
}
