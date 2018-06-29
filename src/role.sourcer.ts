export class roleSourcer {

    /** @param {Creep} creep **/
    public static run(creep:Creep) {
		var source = <Source>Game.getObjectById(creep.memory.source);
    	if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
			var container = source.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER)
				}
			})
			if (container)
				creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
			else
				creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}
};
