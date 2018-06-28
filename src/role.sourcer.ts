export class roleSourcer {

    /** @param {Creep} creep **/
    public static run(creep:Creep) {
		var source = <Source>Game.getObjectById(creep.memory.source);
    	if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}
};
