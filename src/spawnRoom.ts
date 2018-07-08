import { statusType } from "statusType";
import { Creeptask } from "creeptask";

export class SpawnRoom {
    room: Room;
    spawns: StructureSpawn[];

    constructor(room: Room) {
        this.room = room;
        this.spawns = [];
        var spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN)
            }
        });
        for (var i = 0; i < spawns.length; i++) {
            this.spawns.push(<StructureSpawn>spawns[i])
        }
    }

    public findspawn(): StructureSpawn {
        var minnum = -1;
        var mintask = 9999;
        for (var i = 0; i < this.spawns.length; i++) {
            if (this.spawns[i].memory.queue.length < mintask) {
                minnum = i;
                mintask = this.spawns[i].memory.queue.length;
            }
        }
        if (minnum == -1) {
            console.log("Can't find spawn to put task!!!");
            return this.spawns[0];
        }
        return this.spawns[minnum];
    }

    public checkSourcer() {
        if (this.room.energyCapacityAvailable < 550)
            return;
        var sources = this.room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            var NeedSourcer = true;
            var sourcers = _.filter(Game.creeps, (creep) => (creep.memory.role == 'sourcer') && (creep.memory.target == sources[i].id));
            const spawn = <StructureSpawn>sources[i].pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN)
                }
            });
            if (!spawn) {
                console.log("ERR: Can't find any spawn!!!!!!!!!!!")
                return;
            }
            switch (sourcers.length) {
                case 0:
                    NeedSourcer = true;
                    break;
                case 1:
                    const path = this.room.findPath(spawn.pos, sources[i].pos, { ignoreCreeps: true });
                    var time = sourcers[0].ticksToLive;
                    if (time && time < path.length + 20) {
                        NeedSourcer = true;
                    } else {
                        NeedSourcer = false;
                    }
                    break;
                case 2:
                    NeedSourcer = false;
                    continue;
                default:
                    break;
            }
            if (!NeedSourcer)
                continue;
            var alreadyExist = false;
            for (var s = 0; s < spawn.memory.queue.length; s++) {
                if (spawn.memory.queue[s].target == sources[i].id) {
                    alreadyExist = true;
                    break;
                }
            }
            if (!alreadyExist)
                this.createSourcer(spawn, sources[i].id)
        }
    }

    public checkHarvester() {
        if (!this.room.controller)
            return;
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        if (this.room.controller.level < 3) {
            if (harvesters.length + this.spawns[0].memory.queue.length < 14) {
                this.createharvester(this.spawns[0]);
            }
        } else if (this.room.controller.level == 3) {
            if (this.spawns[0].memory.queue.length > 1)
                return;
            let nonstoreEnergy = this.nonstoreEnergy();
            if (nonstoreEnergy > 8000 || (nonstoreEnergy > 1500 && nonstoreEnergy > this.room.memory.nonstoreEnergy)) {
                this.createharvester(this.findspawn());
            }
        } else {
            var site = this.room.find(FIND_CONSTRUCTION_SITES);
            //console.log("here")
            if ((site.length > 0 && harvesters.length + this.spawns[0].memory.queue.length < 2 )|| harvesters.length < 3) {
                this.createharvester(this.findspawn());
            }
        }
    }

    public checkCarrier() {
        if (this.storeEnergy() == 0)
            return;
        let nonstoreEnergy = this.nonstoreEnergy();
        if (nonstoreEnergy > 15000 || (nonstoreEnergy > this.room.memory.nonstoreEnergy && nonstoreEnergy > 1500)) {
            this.createCarrier(this.findspawn());
        }
    }

    public checkUpgrader() {
        let storeEnergy = this.storeEnergy();
        if (storeEnergy > 8000 || (storeEnergy > 1500 && storeEnergy > this.room.memory.storeEnergy)) {
            this.createUpgrader(this.findspawn());
        }
    }

    public nonstoreEnergy(): number {
        var nonstoreEnergy = 0;
        const dropped = this.room.find(FIND_DROPPED_RESOURCES)
        for (var i = 0; i < dropped.length; i++) {
            nonstoreEnergy += dropped[i].amount;
        }
        const containers = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
            }
        });
        for (var i = 0; i < containers.length; i++) {
            const container = <StructureContainer>containers[i]
            nonstoreEnergy += container.store.energy;
        }
        return nonstoreEnergy;
    }

    public storeEnergy(): number {
        const storage = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
            }
        });
        if (storage.length > 0)
            return (<StructureContainer>storage[0]).store.energy;
        else
            return 0;
    }

    public updateEnergy() {
        console.log("storeEnergy:" + this.room.memory.storeEnergy + " => " + this.storeEnergy())
        console.log("nonstoreEnergy:" + this.room.memory.nonstoreEnergy + " => " + this.nonstoreEnergy())
        this.room.memory.storeEnergy = this.storeEnergy();
        this.room.memory.nonstoreEnergy = this.nonstoreEnergy();
    }

    public checkRoad(): boolean {

        if (this.roadBetweenControllerAndSources(this.room))
            return true;
        if (this.roadBetweenSpawnsAndSources(this.room))
            return true;
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
                var look = room.lookAt(road[r].x, road[r].y);
                var isExist = false;
                for (var l = 0; l < look.length; l++) {
                    if (look[l].structure) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    if (room.createConstructionSite(road[r].x, road[r].y, STRUCTURE_ROAD)) {
                        console.log(road[r].x, road[r].y)
                        builded = true;
                    }
                }
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
                    var look = room.lookAt(road[r].x, road[r].y);
                    var isExist = false;
                    for (var l = 0; l < look.length; l++) {
                        if (look[l].structure) {
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        if (room.createConstructionSite(road[r].x, road[r].y, STRUCTURE_ROAD))
                            builded = true;
                    }
                }
                if (builded)
                    break;
            }
        }
        return builded;
    }

    public checkExtension(): boolean {

        if (this.room.controller) {
            const extensions = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION);
                }
            });
            if (extensions.length < this.extensionLimit(this.room.controller.level)) {
                if (this.buildextention(this.room))
                    return true;
                else
                    console.log("Can't find extension position!!!!!!!");
            }
        }
        return false;
    }

    public extensionLimit(controllerlvl: number): number {
        switch (controllerlvl) {
            case 1:
                return 0;
            case 2:
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
        if (this.buildcontainer(this.room))
            return true;
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
        if (this.room.controller && this.room.controller.level > 3) {
            if (this.buildcontainer(this.room))
                return true;
        }
        return false;
    }

    public buildstorage(room: Room): boolean {
        const sources = room.find(FIND_SOURCES);
        if (room.controller) {
            const road = room.findPath(room.controller.pos, sources[0].pos, { ignoreCreeps: true })
            room.createConstructionSite(road[2].x, road[2].y, STRUCTURE_STORAGE)
            room.createConstructionSite(road[1].x, road[1].y, STRUCTURE_STORAGE)
            room.createConstructionSite(road[3].x, road[3].y, STRUCTURE_STORAGE)
        }
        return true;
    }

    public createharvester(spawn: StructureSpawn) {
        const harvestermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const harvestercost = [250, 500, 800, 1200, 1800];

        for (var i = harvestercost.length - 1; i >= 0; i--) {
            if (this.room.energyCapacityAvailable >= harvestercost[i]) {
                var minspawn = -1;
                var mintasks = 9999;
                for (var j = 0; j < this.spawns.length; j++) {
                    var s = this.spawns[j]
                    if (s.memory.queue.length < mintasks) {
                        minspawn = j;
                        mintasks = s.memory.queue.length;
                    }
                }
                if (minspawn == -1) {
                    console.log("ERR: Create Harvest Can't find spawn!!!!")
                    return;
                }
                var task = new Creeptask(harvestermodel[i], "harvester", statusType.wait, "");
                spawn.memory.queue.push(task);
                break;
            }
        }
    }

    public createSourcer(spawn: StructureSpawn, targetSource: string) {
        const sourcermodel1 = [WORK, WORK, WORK, WORK, WORK, MOVE];
        const sourcermodel2 = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE];
        const sourcermodel3 = [WORK, WORK, WORK, MOVE, MOVE, MOVE];
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

    public createRepairer(spawn: StructureSpawn) {
        const repairermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]]
        const repairercost = [250, 500, 750];

        for (var i = repairercost.length - 1; i >= 0; i--) {
            if (this.room.energyCapacityAvailable >= repairercost[i]) {
                var minspawn = -1;
                var mintasks = 9999;
                for (var j = 0; j < this.spawns.length; j++) {
                    var s = this.spawns[j]
                    if (s.memory.queue.length < mintasks) {
                        minspawn = j;
                        mintasks = s.memory.queue.length;
                    }
                }
                if (minspawn == -1) {
                    console.log("ERR: Create repairer Can't find spawn!!!!")
                    return;
                }
                var task = new Creeptask(repairermodel[i], "repairer", statusType.wait, "");
                spawn.memory.queue.push(task);
                break;
            }
        }
    }

    public createCarrier(spawn: StructureSpawn) {
        const carriermodel = [[CARRY, CARRY, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const carriercost = [250, 500, 750, 1250];

        for (var i = carriercost.length - 1; i >= 0; i--) {
            if (this.room.energyCapacityAvailable >= carriercost[i]) {
                var minspawn = -1;
                var mintasks = 9999;
                for (var j = 0; j < this.spawns.length; j++) {
                    var s = this.spawns[j]
                    if (s.memory.queue.length < mintasks) {
                        minspawn = j;
                        mintasks = s.memory.queue.length;
                    }
                }
                if (minspawn == -1) {
                    console.log("ERR: Create repairer Can't find spawn!!!!")
                    return;
                }
                var task = new Creeptask(carriermodel[i], "carrier", statusType.wait, "");
                spawn.memory.queue.push(task);
                break;
            }
        }
    }

    public createUpgrader(spawn: StructureSpawn) {
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
            if (this.room.energyCapacityAvailable >= upgradercost[i]) {
                var minspawn = -1;
                var mintasks = 9999;
                for (var j = 0; j < this.spawns.length; j++) {
                    var s = this.spawns[j]
                    if (s.memory.queue.length < mintasks) {
                        minspawn = j;
                        mintasks = s.memory.queue.length;
                    }
                }
                if (minspawn == -1) {
                    console.log("ERR: Create repairer Can't find spawn!!!!")
                    return;
                }
                var task = new Creeptask(upgradermodel[i], "upgrader", statusType.wait, "");
                spawn.memory.queue.push(task);
                break;
            }
        }
    }


}
