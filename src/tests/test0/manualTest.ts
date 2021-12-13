import liquidDataHandler from "../../liquidDataHandler";
import instructionsArray from "./instructions";
import {
  destPlateMap24,
  // srcPlateMap12,
  srcPlateMap96,
  srcResevoir1,
  srcPlateMap6,
} from "./platelayouts";

import { keysConfig, platesConfig } from "./configs";
import { AnyStringObjectType } from "../../mainTypes";

const layouts: AnyStringObjectType[][] = [
  destPlateMap24,
  // srcPlateMap12,
  srcPlateMap96,
  srcResevoir1,
  srcPlateMap6,
];

const instructions: AnyStringObjectType[] = instructionsArray;

//now run the whole process
// let resq  = liquidDataHandler()

// const handleLiquidData = new liquidDataHandler(
//   layouts,
//   instructions,
//   platesConfig,
//   keysConfig
// );

export { layouts, instructions, platesConfig, keysConfig };
