export class roleSourcer {

    /** @param {Creep} creep **/
    public static run(creep:Creep) {
		var sources = creep.room.find(FIND_SOURCES);
    	if (creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[creep.memory.source], { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}
};
