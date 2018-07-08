
import { SpawnRoom } from "spawnRoom";
import { statusMachine } from "statusMachine";
import { StrucSpawn } from "struc.spawn";
import { Dictionary } from "lodash";

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
            if (room.controller && room.controller.my) {
                var _myroom = new SpawnRoom(room);
                //spawns echo
                var spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                });
                for (var i = 0; i < spawns.length; i++) {
                    var spawn = <StructureSpawn>spawns[i];
                    if (spawn.spawning) {
                        var spawningCreep = Game.creeps[spawn.spawning.name];
                        spawn.room.visual.text(
                            '🛠️' + spawningCreep.memory.role,
                            spawn.pos.x + 1,
                            spawn.pos.y,
                            { align: 'left', opacity: 0.8 });
                    }
                }
                if (Game.time % 10 == 0)
                    _myroom.checkSourcer();
                if (Game.time % 50 == 0) {
                    if (!_myroom.checkExtension())
                        if (!_myroom.checkRoad()) {
                            _myroom.checkContainer()
                            _myroom.checkStorage();
                        }
                }

                if (Game.time % 50 == 0) {
                    _myroom.updateEnergy();
                }

                if (Game.time % 5 == 0)
                    _myroom.checkSourcer();

                if (Game.time % 50 == 1)
                    _myroom.checkHarvester();

                if (Game.time % 50 == 2)
                    _myroom.checkCarrier();

                if (Game.time % 50 == 3)
                    _myroom.checkUpgrader();
            }
        }

        for (var name in Game.spawns) {
            let spawn = new StrucSpawn(Game.spawns[name]);
            spawn.work();
        }
        var Machine: Dictionary<statusMachine> = {};
        Machine["harvester"] = new statusMachine("harvester");
        Machine["upgrader"] = new statusMachine("upgrader");
        Machine["sourcer"] = new statusMachine("sourcer");
        Machine["carrier"] = new statusMachine("carrier");
        Machine["repairer"] = new statusMachine("repairer");
        for (var name in Game.creeps) {
            Machine[Game.creeps[name].memory.role].execute(Game.creeps[name]);
        }
    }
}
