

export class myroom {
    public static buildroad(room: Room) {
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
                    const road2 = room.findPath(spawns[j].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true})
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

    public static buildextention(room: Room) {
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

    public static buildcontainer(room: Room) {
        const sources = room.find(FIND_SOURCES);
        const spawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN);
            }
        });
        for (var i = 0; i < sources.length; i++) {
            const road = room.findPath(spawns[0].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true})
            var len = road.length;
            room.createConstructionSite(road[len-2].x, road[len-2].y, STRUCTURE_CONTAINER);
        }
    }

    public static createharvester(room: Room) {
        const haverstermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const haverstercost = [250, 500, 750, 1250];

        for (var i = haverstercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= haverstercost[i]) {

                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]
                    if (!s.spawning) {
                        var newName = "Lv." + i + " harvester " + Game.time
                        s.spawnCreep(haverstermodel[i], newName,
                            { memory: { role: 'harvester', workingType: "wait", source: "", target: "" } });
                        console.log("create " + newName)
                    }
                }

                break;
            }
        }
    }

    public static createNewSourcer(room: Room, newsourcenum: string) {
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
                    { memory: { role: 'sourcer', workingType: "wait", source: newsourcenum, target: "" } });
            }
        }
    }
}
