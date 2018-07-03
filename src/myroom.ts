import { statusType } from "statusType";

export class myroom {
    fatherRoom: Room;
    childRooms: Room[];
    spawns: StructureSpawn[];

    constructor(room: Room) {
        this.fatherRoom = room;
        this.childRooms = [];
        this.spawns = [];
        var spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN)
            }
        });
        for (var i = 0; i < spawns.length; i++){
            this.spawns.push(<StructureSpawn>spawns[i])
        }

    }

    public checkSourcer() {
        var sourcers = _.filter(Game.creeps, (creep) => creep.memory.role == 'sourcer');
        var sources = this.fatherRoom.find(FIND_SOURCES);
        for (var i = 0; i < this.childRooms.length; i++) {
            sources = sources.concat(this.childRooms[i].find(FIND_SOURCES));
        }

        for (var i = 0; i < sources.length; i++){
            var NeedSourcer = true;
            for (var j = 0; j < sourcers.length; j++){
                if (sourcers[j].memory.target == sources[i].id) {
                    var path = sourcers[j].pos.findPathTo(sources[i])
                }
            }
        }

        for (var i = 0; i < creeps.length; i++) {
            var machine = new statusMachine(creeps[i].memory.role);
            for (var j = 0; j < sources.length; j++) {
                if (sources[j].id == creeps[i].memory.source) {
                    sourcer[j]++;
                    break;
                }
                if (creeps[i].memory.role == "repairer") {
                    repairer++;
                    break;
                }
            }
            machine.execute(creeps[i]);
        }

        if (room.energyAvailable >= 550) {
            for (var i = 0; i < sources.length; i++) {
                if (sourcer[i] == 0) {
                    myroom.createNewSourcer(room, sources[i].id);
                    break;
                }
            }
        }
    }

    public buildroad() {

        if (room.controller) {
            const sources = room.find(FIND_SOURCES);
            for (var i = 0; i < sources.length; i++) {
                const road1 = room.findPath(sources[i].pos, room.controller.pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
                for (var r = 0; r < road1.length; r++) {
                    room.createConstructionSite(road1[r].x, road1[r].y, STRUCTURE_ROAD);
                }
                for (var xp = -1; xp < 2; xp++) {
                    for (var yp = -1; yp < 2; yp++) {
                        room.createConstructionSite(sources[i].pos.x + xp, sources[i].pos.y + yp, STRUCTURE_ROAD);
                    }
                }

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    const road2 = room.findPath(spawns[j].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
                    for (var r = 0; r < road2.length; r++) {
                        room.createConstructionSite(road2[r].x, road2[r].y, STRUCTURE_ROAD);
                    }
                    for (var xp = -1; xp < 2; xp++) {
                        for (var yp = -1; yp < 2; yp++) {
                            room.createConstructionSite(spawns[j].pos.x + xp, spawns[j].pos.y + yp, STRUCTURE_ROAD);
                        }
                    }
                }

            }

        }
    }

    public buildextention(room: Room) {
        if (room.controller) {
            const sources = room.find(FIND_SOURCES);
            const spawns = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
                }
            });
            for (var i = 0; i < sources.length; i++) {
                for (var j = 0; j < spawns.length; j++) {
                    const road = room.findPath(spawns[j].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
                    for (var r = 0; r < road.length; r++) {
                        for (var xp = -1; xp < 2; xp++) {
                            for (var yp = -1; yp < 2; yp++) {
                                if ((road[r].x + xp + road[r].y + yp) % 2 == 0) {
                                    var look = room.lookAt(road[r].x + xp, road[r].y + yp);
                                    var Canbuild = true;
                                    for (var l = 0; l < look.length; l++) {
                                        if (look[l].structure || look[l].constructionSite) {
                                            Canbuild = false;
                                            break;
                                        }
                                    }
                                    if (Canbuild)
                                        room.createConstructionSite(road[r].x + xp, road[r].y + yp, STRUCTURE_EXTENSION);
                                }
                            }
                        }
                    }
                }
                const road = room.findPath(sources[i].pos, room.controller.pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
                for (var r = 0; r < road.length; r++) {
                    for (var xp = -1; xp < 2; xp++) {
                        for (var yp = -1; yp < 2; yp++) {
                            if ((road[r].x + xp + road[r].y + yp) % 2 == 0) {
                                var look = room.lookAt(road[r].x + xp, road[r].y + yp);
                                var Canbuild = true;
                                for (var l = 0; l < look.length; l++) {
                                    if (look[l].structure || look[l].constructionSite) {
                                        Canbuild = false;
                                        break;
                                    }
                                }
                                if (Canbuild)
                                    room.createConstructionSite(road[r].x + xp, road[r].y + yp, STRUCTURE_EXTENSION);
                            }
                        }
                    }
                }
            }
        }
    }

    public buildcontainer(room: Room) {
        const sources = room.find(FIND_SOURCES);
        const spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN);
            }
        });
        for (var i = 0; i < sources.length; i++) {
            const road = room.findPath(spawns[0].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
            var len = road.length;
            room.createConstructionSite(road[len - 2].x, road[len - 2].y, STRUCTURE_CONTAINER);
        }
    }

    public createharvester(room: Room) {
        const harvestermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const harvestercost = [250, 500, 750, 1250];

        for (var i = harvestercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= harvestercost[i]) {

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]
                    if (!s.spawning) {
                        var newName = "Lv." + i + " harvester " + Game.time
                        s.spawnCreep(harvestermodel[i], newName,
                            { memory: { role: 'harvester', statusNow: statusType.wait, source: "", target: "" } });
                        console.log("create " + newName)
                        break;
                    }
                }
                break;
            }
        }
    }

    public createNewSourcer(room: Room, newsourcenum: string) {
        const sourcermodel = [WORK, WORK, WORK, WORK, WORK, MOVE];
        const spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN);
            }
        });
        for (var j = 0; j < spawns.length; j++) {
            var s = <StructureSpawn>spawns[j]
            if (!s.spawning) {
                var newName = "Sourcer " + Game.time
                s.spawnCreep(sourcermodel, newName,
                    { memory: { role: 'sourcer', statusNow: statusType.harvest, target: newsourcenum } });
            }
        }
    }

    public createRepairer(room: Room) {
        const repairermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]]
        const repairercost = [250, 500, 750];

        for (var i = repairercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= repairercost[i]) {

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]

                    if (!s.spawning) {
                        var newName = "Lv." + i + " repairer !!!!!!!" + Game.time
                        s.spawnCreep(repairermodel[i], newName,
                            { memory: { role: 'repairer', statusNow: statusType.wait, source: "", target: "" } });
                        console.log("create " + newName);
                        break;
                    }
                }
                break;
            }
        }
    }

    public createCarrier(room: Room) {
        const carriermodel = [[CARRY, CARRY, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const carriercost = [250, 500, 750, 1250];

        for (var i = carriercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= carriercost[i]) {

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]
                    if (!s.spawning) {
                        var newName = "Lv." + i + " carrier " + Game.time
                        s.spawnCreep(carriermodel[i], newName,
                            { memory: { role: 'carrier', statusNow: statusType.wait, source: "", target: "" } });
                        console.log("create " + newName)
                    }
                }
                break;
            }
        }
    }

    public createUpgrader(room: Room) {
        const upgradermodel = [
            [WORK, WORK, WORK, WORK, WORK,
                CARRY,
                MOVE, MOVE],
            [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY,
                MOVE, MOVE, MOVE, MOVE],
            [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]]
        const upgradercost = [650, 1250, 2450];

        for (var i = upgradercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= upgradercost[i]) {

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]
                    if (!s.spawning) {
                        var newName = "Lv." + i + " upgrader " + Game.time
                        s.spawnCreep(upgradermodel[i], newName,
                            { memory: { role: 'upgrader', statusNow: statusType.wait, source: "", target: "" } });
                        console.log("create " + newName)
                    }
                }
                break;
            }
        }
    }

    public buildstorage(room: Room) {
        const sources = room.find(FIND_SOURCES);
        if (room.controller) {
            const road = room.findPath(sources[0].pos, room.controller.pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true })
            var po = road.length - 3;
            room.createConstructionSite(road[po].x, road[po].y, STRUCTURE_STORAGE);
        }
    }

}
