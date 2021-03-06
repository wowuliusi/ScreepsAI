import { ErrorMapper } from "utils/ErrorMapper";
import { brain } from "./brain";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
if (Game.spawns['Spawn1'].memory.queue == null) {
    Game.spawns['Spawn1'].memory.queue = [];
}

export const loop = ErrorMapper.wrapLoop(() => {
  //console.log(`Current game tick is ${Game.time}`);
  brain.run();
});
