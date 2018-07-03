import { status } from "status";
import { statusType } from "statusType";

export class harvestAndDrop extends status {
	Enter(creep: Creep): void {
		creep.memory.statusNow = statusType.harvest;
	}
	Exit(creep: Creep): void {
		creep.memory.statusNow = statusType.none;
	}
	execute(creep: Creep): string {
		var source = <Source>Game.getObjectById(creep.memory.target);
    	if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
			var container = source.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER)
				}
			})
			if (container){
				var distance = creep.room.findPath(container.pos, source.pos)
				if (distance.length < 2){
					creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
					return statusType.harvest;
				}
			}
			creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
		creep.drop(RESOURCE_ENERGY);
		return statusType.harvest;
	}

}
