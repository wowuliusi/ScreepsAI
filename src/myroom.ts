

export class myroom {
    public static buildroad(room: Room) {
        if (room.controller) {
            const sources = room.find(FIND_SOURCES);
            for (var i = 0; i < sources.length; i++) {
                const road1 = room.findPath(sources[i].pos, room.controller.pos, { ignoreCreeps: true, ignoreRoads: true })
                for (var r = 0; r < road1.length; r++) {
                    room.createConstructionSite(road1[r].x, road1[r].y, STRUCTURE_ROAD);
                }
                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    const road2 = room.findPath(sources[i].pos, spawns[j].pos, { ignoreCreeps: true, ignoreRoads: true })
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
            for (var j = 0; j < spawns.length; j++) {
                for (var i = 0; i < sources.length; i++) {
                    const road = room.findPath(spawns[j].pos, sources[i].pos, { ignoreCreeps: true, ignoreRoads: true })
                    for (var r = 0; r < road.length; r++) {
                        for (var xp = -1; xp < 2; xp++) {
                            for (var yp = -1; yp < 2; yp++) {
                                var look = room.lookAt(road[r].x + xp, road[r].y + yp);
                                var Canbuild = true;
                                for (var l = 0; l < look.length; l++) {
                                    if (look[l].structure) {
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
                const road = room.findPath(spawns[j].pos, room.controller.pos, { ignoreCreeps: true, ignoreRoads: true })
                for (var r = 0; r < road.length; r++) {
                    for (var xp = -1; xp < 2; xp++) {
                        for (var yp = -1; yp < 2; yp++) {
                            var look = room.lookAt(road[r].x + xp, road[r].y + yp);
                            var Canbuild = true;
                            for (var l = 0; l < look.length; l++) {
                                if (look[l].structure) {
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

    public static createHavester(room: Room, newsourcenum: string) {
        const haverstermodel = [[WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]];
        const haverstercost = [250, 500, 750, 1250];

        for (var i = haverstercost.length - 1; i >= 0; i--) {
            if (room.energyAvailable >= haverstercost[i]) {
                console.log("room.energyAvailable:", room.energyAvailable)
                const spawns = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
                for (var j = 0; j < spawns.length; j++) {
                    var s = <StructureSpawn>spawns[j]
                    if (!s.spawning) {
                        var newName = "Lv." + i + " Havester " + Game.time
                        s.spawnCreep(haverstermodel[i], newName,
                            { memory: { role: 'havester', workingType: "wait", source: newsourcenum, target: ""} });
                    }
                }
                break;
            }
        }
    }
}
