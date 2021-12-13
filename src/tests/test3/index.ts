// test3  -  media bottle and 6-well-plate into a 12-wellplate
// sample_id is in 6-well-plat layout1 and layout_media bottle - and both are given to empty 12-well-plate

import { layout1, layout_media } from "./layouts";
import instructions from "./instructions";
import { keysConfig, platesConfig } from "./configs";
const layouts = [layout1, layout_media];

export { layouts, keysConfig, platesConfig, instructions };
