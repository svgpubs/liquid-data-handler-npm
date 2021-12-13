// test2  -  1x96-to-1x384 app
// expands 96 well plate into 384 well plate.
// layout1 A1 expands into 4 wells A1 A2 B1 B2 in 384 wellplate

import { layout1 } from "./layouts";
import instructions from "./instructions";
import { keysConfig, platesConfig } from "./configs";
const layouts = [layout1];

export { layouts, keysConfig, platesConfig, instructions };
