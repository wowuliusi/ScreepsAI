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
        for (var name in Game.rooms){
            var room = Game.rooms[name];
            //console.log("room.energyAvailable:", room.energyAvailable)
            myroom.buildroad(room)
            myroom.buildextention(room)
            let sourcenum = [0,0]
            var creeps = room.find(FIND_CREEPS)
            var sources = room.find(FIND_SOURCES)
            for (var i = 0; i < creeps.length; i++){
                var s = Game.getObjectById(creeps[i].memory.target)
                for (var j = 0; j < sources.length; j++){
                    if (sources[j] == s){
                        sourcenum[j]++;
                    }
                }
                roleHarvester.run(creeps[i]);
            }
            var newsourcenum;
            if (sourcenum[0] < sourcenum[1]) {
                newsourcenum = sources[0].id
            } else {
                newsourcenum = sources[1].id
            }
            if (creeps.length < 9) {
                myroom.createHavester(room, newsourcenum)
            }
        }
    }
}
