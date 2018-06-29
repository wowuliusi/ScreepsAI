import { roleHarvester } from "role.harvester";
import { roleSourcer } from "role.sourcer";
import { myroom } from "myroom";

export class brain {
    public static run() {
        // Automatically delete memory of missing creeps
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        var spawn1 = Game.spawns['Spawn1'];
        if (spawn1.spawning) {
            var spawningCreep = Game.creeps[spawn1.spawning.name];
            spawn1.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn1.pos.x + 1,
                spawn1.pos.y,
                { align: 'left', opacity: 0.8 });
        }

        for (var name in Game.structures) {
            var structure = Game.structures[name];
            if (structure.structureType == STRUCTURE_TOWER) {
                var tower = <StructureTower>structure;
                if (tower) {
                    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (closestHostile) {
                        tower.attack(closestHostile);
                    }
                }
            }
        }

        for (var name in Game.rooms) {
            var room = Game.rooms[name];
            //console.log("room.energyAvailable:", room.energyAvailable)
            let sourcer = [0, 0]
            var creeps = room.find(FIND_CREEPS)
            var sources = room.find(FIND_SOURCES)
            for (var i = 0; i < creeps.length; i++) {
                switch (creeps[i].memory.role){
                    case "harvester":{
                        roleHarvester.run(creeps[i]);
                        break;
                    }
                    case "sourcer":{
                        roleSourcer.run(creeps[i])
                        var s = Game.getObjectById(creeps[i].memory.source)
                        for (var j = 0; j < sources.length; j++) {
                            if (sources[j] == s) {
                                sourcer[j]++;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            if (room.energyAvailable >= 550){
                for (var i = 0; i < sources.length; i++){
                    if (sourcer[i] == 0){
                        myroom.createNewSourcer(room, sources[i].id);
                        break;
                    }
                }
            }

            if (Game.time % 50 == 0) {
                myroom.buildextention(room)
                var con = Game.spawns["Spawn1"].room.controller;
                if (con){
                    if (con.level > 1){
                        myroom.buildroad(room);
                        myroom.buildcontainer(room);
                    }
                    if (con.level < 3){
                        if (creeps.length < 18) {
                            myroom.createharvester(room);
                        }
                    } else {
                        if (Game.time % 100 == 0){
                            var energy = 0;
                            var cons = room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_CONTAINER)
                                }
                            });
                            for (var i = 0; i < cons.length; i++){
                                var str = <StructureContainer>cons[i];
                                energy += str.store.energy;
                            }

                            cons = room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_STORAGE)
                                }
                            });
                            for (var i = 0; i < cons.length; i++){
                                var str2 = <StructureStorage>cons[i];
                                energy += str2.store.energy;
                            }
                            var dropped = room.find(FIND_DROPPED_RESOURCES)
                            for (var i = 0; i < dropped.length; i++){
                                energy += dropped[i].amount;
                            }
                            if (energy > 4000 || (energy > room.memory.availableEnergy && energy > 1000)) {
                                myroom.createharvester(room);
                            }
                            console.log("energy:" + room.memory.availableEnergy + "=> " + energy);
                            room.memory.availableEnergy = energy;
                        }
                    }
                }


            }

        }
    }
}
