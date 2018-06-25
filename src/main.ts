import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "./role.harvester";
import { roleUpgrader } from "./role.upgrader";
import { roleBuilder } from "role.builder";
import { roleRepairer } from "role.repairer";
import { roleSourcer } from "role.sourcer";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
  let sourcenum: number[] = [0,0];
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];

    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
    if (creep.memory.role == 'sourcer'){
      sourcenum[creep.memory.source]++
      roleSourcer.run(creep)
    }
  }
  var newsourcenum;
  if (sourcenum[0] < sourcenum[1]){
    newsourcenum = 0
  } else {
    newsourcenum = 1
  }
  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  console.log('Harvesters: ' + harvesters.length);

  var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  //console.log('upgrader: ' + upgrader.length);
  if (upgrader.length < 0) {
    var newName = 'Upgrader' + Game.time;
    console.log('Spawning new Upgrader: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
      { memory: { role: 'upgrader', working: false, source: newsourcenum } });
  }

  var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  console.log('builder: ' + builder.length);
  if (builder.length < 2) {
    var newName = 'builder' + Game.time;
    console.log('Spawning new builder: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
      { memory: { role: 'builder', working: false, source: newsourcenum  } });
  }

  var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
  console.log('repairer: ' + repairer.length);
  if (repairer.length < 1) {
    var newName = 'repairer' + Game.time;
    console.log('Spawning new repairer: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
      { memory: { role: 'repairer', working: false, source: newsourcenum  } });
  }

  if (harvesters.length < 4) {
    var newName = 'Harvester' + Game.time;
    console.log('Spawning new harvester: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
      { memory: { role: 'harvester', working: false, source: newsourcenum  } });
  }

  for (var i=0; i<2; i++){

  }

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
});
