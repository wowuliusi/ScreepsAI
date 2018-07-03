import { statusType } from "statusType";

export class Creeptask implements ICreeptask {
    model: BodyPartConstant[];
    role: string;
    status: string;
    target: string;

    constructor(model: BodyPartConstant[], role: string, status: string, target: string) {
        this.model = model;
        this.role = role;
        this.status = status;
        this.target = target;

    }
}

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
        for (var i = 0; i < spawns.length; i++) {
            this.spawns.push(<StructureSpawn>spawns[i])
        }
        for (var i = 0; i < room.memory.childrooms.length; i++) {
            var r = Game.rooms[room.memory.childrooms[i]];
            this.childRooms.push(r);
        }
    }

    public checkSourcer() {
        var sourcers = _.filter(Game.creeps, (creep) => creep.memory.role == 'sourcer');
        var sources = this.fatherRoom.find(FIND_SOURCES);
        for (var i = 0; i < this.childRooms.length; i++) {
            sources = sources.concat(this.childRooms[i].find(FIND_SOURCES));
        }

        for (var i = 0; i < sources.length; i++) {
            var NeedSourcer = true;
            for (var j = 0; j < sourcers.length; j++) {
                if (sourcers[j].memory.target == sources[i].id) {
                    var minDis = 99999;
                    var minNum = -1;
                    for (var k = 0; k < this.spawns.length; k++) {
                        const path = this.fatherRoom.findPath(this.spawns[k].pos, sources[i].pos, { ignoreCreeps: true });
                        if (path.length < minDis) {
                            minNum = k;
                            minDis = path.length
                        }
                    }
                    if (minNum == -1) {
                        console.log("Can't find any spawn!!!!!!!!!!!")
                    } else {
                        var time = sourcers[j].ticksToLive;
                        if (time && time < minDis) {
                            var alreadyExist = false;
                            for (var s = 0; s < this.spawns[minNum].memory.queue.length; s++) {
                                if (this.spawns[minNum].memory.queue[s].target == sources[i].id) {
                                    alreadyExist = true;
                                    break;
                                }
                            }
                            if (!alreadyExist)
                                this.createNewSourcer(this.spawns[minNum], sources[i].id)
                            break;
                        } else {
                            NeedSourcer = false;
                        }
                    }
                }
            }
            if (NeedSourcer) {
                var minDis = 99999;
                var minNum = -1;
                for (var k = 0; k < this.spawns.length; k++) {
                    const path = this.fatherRoom.findPath(this.spawns[k].pos, sources[i].pos, { ignoreCreeps: true });
                    if (path.length < minDis) {
                        minNum = k;
                        minDis = path.length;
                    }
                }
                if (minNum == -1)
                    console.log("Can't find any spawn!!!!!!!!!!!")
                else {
                    var alreadyExist = false;
                    for (var s = 0; s < this.spawns[minNum].memory.queue.length; s++) {
                        if (this.spawns[minNum].memory.queue[s].target == sources[i].id) {
                            alreadyExist = true;
                            break;
                        }
                    }
                    if (!alreadyExist)
                        this.createNewSourcer(this.spawns[minNum], sources[i].id)
                }

            }
        }
    }

    public checkRoad(): boolean {
        if (this.roadBetweenControllerAndSources(this.fatherRoom))
            return true;
        if (this.roadBetweenSpawnsAndSources(this.fatherRoom))
            return true;
        for (var i = 0; i < this.childRooms.length; i++) {
            if (this.roadBetweenControllerAndSources(this.childRooms[i]))
                return true;
            if (this.roadBetweenSpawnsAndSources(this.childRooms[i]))
                return true;
        }
        return false;
    }

    public roadBetweenControllerAndSources(room: Room): boolean {
        if (!room.controller)
            return false;
        var builded = false;
        const sources = room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            const road = room.findPath(sources[i].pos, room.controller.pos, { ignoreCreeps: true })
            for (var r = 0; r < road.length; r++) {
                if (room.createConstructionSite(road[r].x, road[r].y, STRUCTURE_ROAD))
                    builded = true;
            }
            if (builded)
                break;
        }
        return builded;
    }

    public roadBetweenSpawnsAndSources(room: Room): boolean {
        var spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN)
            }
        });
        if (spawns.length == 0)
            return false;
        var builded = false;
        const sources = room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            for (var j = 0; j < spawns.length; j++) {
                const road = room.findPath(sources[i].pos, spawns[j].pos, { ignoreCreeps: true })
                for (var r = 0; r < road.length; r++) {
                    if (room.createConstructionSite(road[r].x, road[r].y, STRUCTURE_ROAD))
                        builded = true;
                }
                if (builded)
                    break;
            }
            if (builded)
                break;
        }
        return builded;
    }

    public checkExtension(): boolean {
        if (this.fatherRoom.controller) {
            const extensions = this.fatherRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION);
                }
            });
            if (extensions.length < this.extensionLimit(this.fatherRoom.controller.level)) {
                if (this.buildextention(this.fatherRoom))
                    return true;
                else
                    console.log("Can't find extension position!!!!!!!");
            }
            for (var i = 0; i < this.childRooms.length; i++) {
                const extensions2 = this.childRooms[i].find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION);
                    }
                });
                if (extensions2.length < this.extensionLimit(this.fatherRoom.controller.level)) {
                    if (this.buildextention(this.fatherRoom))
                        return true;
                    else
                        console.log("Can't find extension position!!!!!!!");
                }
            }
        }
        return false;
    }

    public extensionLimit(controllerlvl: number): number {
        switch (controllerlvl) {
            case 1:
                return 5;
            default:
                return (controllerlvl - 2) * 10
        }
    }

    public buildextention(room: Room): boolean {
        if (room.controller) {
            var builded = false;
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
                                    if (Canbuild) {
                                        if (room.createConstructionSite(road[r].x + xp, road[r].y + yp, STRUCTURE_EXTENSION)) {
                                            builded = true;
                                        }
                                    }

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
                                if (Canbuild) {
                                    if (room.createConstructionSite(road[r].x + xp, road[r].y + yp, STRUCTURE_EXTENSION)) {
                                        builded = true;
                                    }
                                }

                            }
                        }
                    }
                }
            }
            return builded;
        }
        return false;
    }

    public checkContainer() {
        if (this.buildcontainer(this.fatherRoom))
            return true;
        for (var i = 0; i < this.childRooms.length; i++) {
            if (this.buildcontainer(this.childRooms[i]))
                return true;
        }
        return false;
    }

    public buildcontainer(room: Room): boolean {
        if (!room.controller)
            return false;
        var builded = false;
        const sources = room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            var con = sources[i].pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure: Structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (con.length > 0)
                continue
            const road = room.findPath(sources[i].pos, room.controller.pos, { ignoreCreeps: true })
            var len = road.length;
            if (room.createConstructionSite(road[0].x, road[0].y, STRUCTURE_CONTAINER)) {
                builded = true;
            }
        }
        return false;
    }

    public checkStorage(): boolean {
        if (this.fatherRoom.controller && this.fatherRoom.controller.level > 3) {
            if (this.buildcontainer(this.fatherRoom))
                return true;
        }

        for (var i = 0; i < this.childRooms.length; i++) {
            var lvl = this.childRooms[i].controller;
            if (lvl && lvl.level > 3) {
                if (this.buildcontainer(this.childRooms[i]))
                    return true;
            }
        }
        return false;
    }

    public buildstorage(room: Room): boolean {
        const sources = room.find(FIND_SOURCES);
        if (room.controller) {
            const road = room.findPath(room.controller.pos, sources[0].pos, { ignoreCreeps: true })
            if (room.createConstructionSite(road[2].x, road[2].y, STRUCTURE_STORAGE))
                return true;
        }
        return false;
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

    public createNewSourcer(spawn: StructureSpawn, targetSource: string) {
        const sourcermodel1 = [WORK, WORK, WORK, WORK, WORK, MOVE];
        const sourcermodel2 = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE];
        var source = <Source>Game.getObjectById(targetSource);
        if (spawn.room.energyCapacityAvailable >= 650) {
            var task = new Creeptask(sourcermodel2, "sourcer", statusType.harvest, targetSource);
            spawn.memory.queue.push(task);
        } else {
            if (spawn.room.name == source.room.name && spawn.room.energyCapacityAvailable >= 550) {
                var task = new Creeptask(sourcermodel1, "sourcer", statusType.harvest, targetSource);
                spawn.memory.queue.push(task);
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


}
