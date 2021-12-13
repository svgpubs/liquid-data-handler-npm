import _, { sum } from "lodash";
import {
  arrayToObject,
  ObjectOfArraysType,
  objectToArray,
} from "array-object-transformer";
// import PlateTransformer from "plate-data-transfer/dist/tsc/main";
import PlateTransformer from "./PlateTransformerClass";
import getGeneratorOfTransferInstructions from "./getNextPlateInstructions";
import {
  DEST_PLATE_KEY,
  DEST_WELL_KEY,
  SRC_PLATE_KEY,
  SRC_WELL_KEY,
  VOL_KEY,
} from "./keys/InstructionKeys";
import { PLATE_ID_KEY, WELL_ID_KEY } from "./keys/LayoutKeys";

import {
  KeySetType,
  PlateIdConfigType,
  TransferInstructionsRowType,
  AnyStringObjectType,
  PlateMapRowType,
  ClashStrategyType,
  StrategyType,
  PlateColumnSuffixObjectType,
  SpecificColumnClashesType,
} from "./mainTypes";
// import { TransferInstructionsType } from "plate-data-transfer";
import { getPlate } from "well-id-formatter";
import { PlateRelationshipType, SeparatorType } from "./PlateTypes";

const sufSep = "_suftag_";

function getAllIndexes(arr: string[], val: string) {
  var indexes = [],
    i = -1;
  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indexes.push(i);
  }
  return indexes;
}

interface ClashReportType {
  discoveredClashes: discoveredClashesType[];
  defaultClashStrategy: string;
  clashColumnStrategies: SpecificColumnClashesType[];
}

interface anystringarrayOT {
  [key: string]: string[];
}
interface ColLayoutType {
  [key: string]: string[];
  Plate: string[];
  Well: string[];
}
interface PlateTransformerParamsType {
  srcLayout: PlateMapRowType[];
  destLayout: PlateMapRowType[];
  srcPlateRel: PlateRelationshipType;
  destPlateRel: PlateRelationshipType;
}
interface discoveredClashesType {
  plate_id: string;
  colname: string;
  suffixColnames: string[];
  isActualClash: boolean;
  clashingIndexes: number[];
}

interface layoutGroup {
  plate_id: string;
  group: string;
}
class liquidDataHander {
  inputInstructions: AnyStringObjectType[] = [];
  inputLayouts: AnyStringObjectType[][] = []; //each plate in its own
  instructions: TransferInstructionsRowType[] = [];
  layouts: PlateMapRowType[][] = [];
  layoutsSuffix: PlateMapRowType[][] = [];
  plateInfo: PlateIdConfigType[];
  keySet: KeySetType;
  clashStrategy: StrategyType;
  columnSuffixNames: PlateColumnSuffixObjectType;
  clashColumnStrategies: ClashStrategyType[];
  finalDestPlates: PlateMapRowType[][] = [];
  discoveredClashes: discoveredClashesType[] = [];
  layoutGroups: layoutGroup[] = [];
  removeVolumes: boolean = false;
  constructor(
    inputLayouts: AnyStringObjectType[][],
    inputInstructions: AnyStringObjectType[],
    platesInfo: PlateIdConfigType[],
    keySet: KeySetType,
    clashColumnStrategies: ClashStrategyType[] = []
  ) {
    this.inputLayouts = inputLayouts;
    this.inputInstructions = inputInstructions;

    this.plateInfo = platesInfo.map((plate) => ({
      ...plate,
      suffix: `${sufSep}${plate.suffix}`,
    }));

    this.keySet = keySet;
    this.layouts = [];
    this.layoutsSuffix = []; //layouts but colnames all have plate suffix
    this.columnSuffixNames = {};
    this.instructions = [];
    this.clashStrategy = "suffix";
    this.clashColumnStrategies = clashColumnStrategies; // not implemented yet
    this.finalDestPlates = [];
    this.discoveredClashes = [];
    this.layoutGroups = [];
    this.removeVolumes = false; //if user doesn't care about volumes //TODO
    this.setup();
  }

  setup() {
    this.formatLayouts();
    this.addMissingPlateLayouts();
    this.detectLayoutGroups();
    this.formatInstructions();
    this.detectUnusedPlates();
    this.assertUniqueSuffixes();
    this.setLayoutSuffix();
  }

  detectLayoutGroups() {
    //if a user uploads multiple layout plates, some of them will have the same column headers
    //here we idenitfy which plates are grouped with which
    this.layouts.forEach((layout) => {
      let plate_id = layout[0].Plate;
      let colnames = Object.keys(layout[0]).filter(
        (colname) => ![PLATE_ID_KEY, WELL_ID_KEY].includes(colname)
      ); //get colnames
      let colnamesString = colnames.sort().join("");
      this.layoutGroups.push({ plate_id, group: colnamesString });
    });
  }

  fillMissingColumnsInPlateLayoutGroups() {
    //if 2+ destination plates have the same column names as input,
    //we should ensure they have the same column names as output
    //user will likely concatenate them.
    const volumeRegex = new RegExp(`volume${sufSep}`);

    let groupObj: anystringarrayOT = {};
    this.layoutGroups.forEach((origGroup) => {
      if (groupObj.hasOwnProperty(origGroup.group)) {
        groupObj[origGroup.group].push(origGroup.plate_id);
      } else if (origGroup.group !== "") {
        //don't add empty plates
        groupObj[origGroup.group] = [origGroup.plate_id];
      }
    });
    let plateGroups = Object.values(groupObj);
    plateGroups.forEach((plateGroup) => {
      let allGroupColnamesSet = new Set<string>();
      plateGroup.forEach((plateid) => {
        const layout = this.layouts.filter((d) => d[0].Plate === plateid)[0];
        layout.forEach((row) => {
          [...Object.keys(row)].reduce((a, e) => a.add(e), allGroupColnamesSet);
        });
      });
      //all the colnames required for each plate in the group
      let allGroupColnamesArray: string[] = Array.from(allGroupColnamesSet);
      plateGroup.forEach((plateid) => {
        //iterate over plate in layout, and add on the colname if they do not exist
        this.layouts.forEach((layout) => {
          if (layout[0].Plate === plateid) {
            layout.forEach((row) => {
              allGroupColnamesArray.forEach((colname) => {
                if (!row.hasOwnProperty(colname)) {
                  row[colname] = colname.match(volumeRegex) ? 0 : null;
                }
              });
            });
          }
        });
      });
    });
  }

  fillMissingColumnsWithinPlateLayout() {
    //collect all the column names in this layout
    const volumeRegex = new RegExp(`volume${sufSep}`);
    this.layouts.forEach((layout) => {
      let allColnamesSet = new Set<string>();
      layout.forEach((row) => {
        [...Object.keys(row)].reduce((a, e) => a.add(e), allColnamesSet);

        let allColnamesArray: string[] = Array.from(allColnamesSet);
        //make sure each row has all column names
        layout.forEach((row) => {
          allColnamesArray.forEach((colname) => {
            if (colname.match(volumeRegex)) {
              //missing volumes should be 0, not null
              row[colname] = row.hasOwnProperty(colname) ? row[colname] : 0;
            } else {
              row[colname] = row.hasOwnProperty(colname) ? row[colname] : null;
            }
          });
        });
      });
    });
  }

  getClashReport(): ClashReportType {
    this.runLiquidDataHandlerAllSuffix(); // this is resetting the source map
    this.discoverClashes();
    return {
      discoveredClashes: this.discoveredClashes,
      defaultClashStrategy: this.clashStrategy,
      clashColumnStrategies: this.clashColumnStrategies,
    };
  }

  getFinalPlateLayouts(
    clashColumnStrategies: ClashStrategyType[] = [],
    defaultClashStrategy: StrategyType = "suffix"
  ) {
    this.runLiquidDataHandlerWithClashStrategies(
      clashColumnStrategies,
      defaultClashStrategy
    );
    this.fillMissingColumnsWithinPlateLayout();
    this.fillMissingColumnsInPlateLayoutGroups();
    this.removeSufTags();
    // if (this.removeVolumes) {
    //   //take out volumes if user doesn't care
    //   //TODO
    // }
    return this.layouts;
  }

  removeSufTags() {
    //not removing user's suffix
    //removing internal suffix tag

    this.layouts.forEach((layout, i) => {
      let output: ColLayoutType = { Plate: [], Well: [] };
      let collayout = arrayToObject(layout);
      Object.entries(collayout).forEach((arr) => {
        let newplatename = arr[0].replace(sufSep, "");
        output[newplatename] = arr[1];
      });
      let newArray: any = objectToArray(output);
      this.layouts[i] = newArray;
    });
  }

  runLiquidDataHandlerWithClashStrategies(
    clashColumnStrategies: ClashStrategyType[],
    defaultClashStrategy: StrategyType,
    defaultSeparator: SeparatorType = " + "
  ) {
    let plateInstructionChunk = getGeneratorOfTransferInstructions(
      this.instructions
    );
    let stillRunning: boolean = true;
    while (stillRunning) {
      let nextChunk: any = plateInstructionChunk.next();
      if (!nextChunk.done) {
        //get sourceLayout, getDestLayout, chunkInstructions sourcePlateInfo, destPlateInf
        let chunkInstructions: TransferInstructionsRowType[] = nextChunk.value;

        let { srcLayout, destLayout, srcPlateRel, destPlateRel } =
          this.getPlateTransformerParams(chunkInstructions, "layouts");

        let transformer = new PlateTransformer(
          srcLayout,
          destLayout,
          chunkInstructions,
          srcPlateRel,
          destPlateRel,
          clashColumnStrategies
        );

        //get new destination plate layout
        transformer.assigncolumnClashStrategies(clashColumnStrategies);
        transformer.defaultClashStragty = defaultClashStrategy;
        transformer.defaultSeparator = defaultSeparator;

        let newDestLayout = transformer.transformPlates(null);
        //now update the destPlate with newDestLayout

        this.layouts.forEach((layout, i) => {
          if (layout[0]["Plate"] === newDestLayout[0]["Plate"]) {
            //the new layout is updates to include transfered wells
            this.layouts[i] = newDestLayout;
          }
        });
      } else {
        //no more instructions
        stillRunning = false;
      }
    }
  }

  runLiquidDataHandlerAllSuffix() {
    let plateInstructionChunk = getGeneratorOfTransferInstructions(
      this.instructions
    );
    let stillRunning: boolean = true;
    while (stillRunning) {
      let nextChunk: any = plateInstructionChunk.next();
      if (!nextChunk.done) {
        //get sourceLayout, getDestLayout, chunkInstructions sourcePlateInfo, destPlateInf
        let chunkInstructions: TransferInstructionsRowType[] = nextChunk.value;

        let { srcLayout, destLayout, srcPlateRel, destPlateRel } =
          this.getPlateTransformerParams(chunkInstructions, "layoutsSuffix");

        let transformer = new PlateTransformer(
          srcLayout,
          destLayout,
          chunkInstructions,
          srcPlateRel,
          destPlateRel
        );
        //get new destination plate layout
        let newDestLayout = transformer.transformPlates(null);
        //now update the destPlate with newDestLayout
        this.layoutsSuffix.forEach((layout, i) => {
          if (layout[0]["Plate"] === newDestLayout[0]["Plate"]) {
            //the new layout is updates to include transfered wells
            this.layoutsSuffix[i] = newDestLayout;
          }
        });
      } else {
        //no more instructions
        stillRunning = false;
      }
    }
  }

  resolveClashes() {
    // if repeated columns do not have clashed values
    // then ignore
    // if
  }

  getClashingIndexes(
    repeatedSuffixColnames: string[],
    columnLayout: ObjectOfArraysType
  ) {
    let arraysOfValuesFromRepeatedCols = repeatedSuffixColnames.map(
      (cn) => columnLayout[cn]
    );
    //get an array of rows counting the number of non-null values.
    //clashing values have 2 or more.
    let numberValuesArray = _.zip(...arraysOfValuesFromRepeatedCols).map(
      (arr) => sum(arr.map((val) => val !== null))
    );
    let clashingIndexes = numberValuesArray.reduce<number[]>(
      (acc, cur, idx) => {
        if (cur > 1) {
          acc.push(idx);
        }
        return acc;
      },
      []
    );

    return clashingIndexes;
  }
  discoverClashes() {
    //after layoutSuffix is run, discover where there are clashes
    //then create a table for user to
    this.layoutsSuffix.forEach((layout) => {
      let plateid = layout[0]["Plate"];
      let suffix = this.plateInfo.filter(
        (plate) => plate.layoutId === plateid
      )[0]["suffix"];
      if (suffix) {
        let columnLayout = arrayToObject(layout);
        let suffixColnames = Object.keys(columnLayout);
        let suffixRegEx = new RegExp(`^(.*)${sufSep}(.*)$`);
        let noSuffixColnames = suffixColnames.map((sufcol) => {
          let match = suffixRegEx.exec(sufcol);
          return match && match[1] ? match[1] : sufcol;
        });
        let uniqNoSuffColnames = _.uniq(noSuffixColnames);
        if (uniqNoSuffColnames.length + 1 === noSuffixColnames.length) {
        } else {
          //create an object specifiy the potentially clashing column names
          uniqNoSuffColnames.forEach((noSuffixColname) => {
            if (noSuffixColname !== "volume_") {
              let indexes = getAllIndexes(noSuffixColnames, noSuffixColname);
              if (indexes.length > 1) {
                //the column name is present more than one time
                //get the repeated equivalents of the colnams with suffixes
                let repeatedSuffixColnames = indexes.map(
                  (idx) => suffixColnames[idx]
                );
                //just because it is repeated doesn't mean there are clashes in the actual wells
                //it could be that different plates transfer different into non-overlapping wells.
                //see if the actual values clash - if one has a value while the other is null, it isn't a real clash;

                let clashingIndexes = this.getClashingIndexes(
                  repeatedSuffixColnames,
                  columnLayout
                );
                this.discoveredClashes.push({
                  plate_id: plateid,
                  colname: noSuffixColname,
                  suffixColnames: repeatedSuffixColnames,
                  isActualClash: clashingIndexes.length > 1,
                  clashingIndexes,
                });
              }
            }
          });
        }
      } else {
        throw Error(`No suffix error on plate ${plateid}`);
      }
    });
  }
  getPlateTransformerParams(
    chunkInstructions: TransferInstructionsRowType[],
    layoutChoice: "layoutsSuffix" | "layouts"
  ): PlateTransformerParamsType {
    //get source plate info

    let srcInstructionsPlateID = chunkInstructions[0]["Source Plate"];
    let srcPlateIDArr = this.plateInfo.filter(
      (info) => info["instructionId"] === srcInstructionsPlateID
    );
    if (srcPlateIDArr.length === 0) {
      throw Error(
        `Report Program Error: instruction plate ${srcInstructionsPlateID} not in plateInfo`
      );
    }
    let srcInfo = srcPlateIDArr[0];
    let srcLayoutPlateID = srcInfo["layoutId"];

    let srcLayoutArr = this[layoutChoice].filter(
      (layout) => layout[0]["Plate"] === srcLayoutPlateID
    );
    if (!srcLayoutArr.length) {
      throw Error(`Source Plate ${srcLayoutPlateID} not in PlateInfo`);
    }
    let srcLayout = srcLayoutArr[0];

    //get destination plate info
    let destInstructionsPlateID = chunkInstructions[0]["Destination Plate"];
    let destPlateIDarr = this.plateInfo.filter(
      (info) => info["instructionId"] === destInstructionsPlateID
    );

    if (destPlateIDarr.length === 0) {
      throw Error(
        `Report Program Error: instruction plate ${destInstructionsPlateID} not in plateInfo`
      );
    }
    let destInfo = destPlateIDarr[0];
    let destLayoutPlateID = destInfo["layoutId"];
    let destLayoutArr = this[layoutChoice].filter(
      (layout) => layout[0]["Plate"] === destLayoutPlateID
    );
    if (!destLayoutArr) {
      throw Error(`Destination plate ${destLayoutPlateID} not in plateInfo`);
    }
    let destLayout = destLayoutArr[0];

    let srcPlateRel = {
      plate_map_id: srcInfo.layoutId,
      plate_instruction_id: srcInfo.instructionId,
      plate_size: srcInfo.size,
      plate_suffix: srcInfo.suffix,
    };
    let destPlateRel = {
      plate_map_id: destInfo.layoutId,
      plate_instruction_id: destInfo.instructionId,
      plate_size: destInfo.size,
      plate_suffix: destInfo.suffix,
    };
    return {
      srcLayout,
      destLayout,
      srcPlateRel,
      destPlateRel,
    };
  }
  detectUnusedPlates() {
    //throw errors for following senarios.

    let configLayoutPlates = this.plateInfo.map((plt) => plt.layoutId);
    let configInstructionPlates = this.plateInfo.map(
      (plt) => plt.instructionId
    );
    // let configPlates = [...configInstructionPlates, ...configLayoutPlates];
    let sourceInstructionPlates = _.uniq(
      this.instructions.map((i) => i["Source Plate"])
    );
    let destinationInstructionPlates = _.uniq(
      this.instructions.map((i) => i["Destination Plate"])
    );
    let instructionPlates = _.uniq([
      ...sourceInstructionPlates,
      ...destinationInstructionPlates,
    ]);
    let layoutPlates = _.uniq(
      this.layouts.map((layout) => layout[0][PLATE_ID_KEY])
    );
    //a plate in config is not present in instructions
    configInstructionPlates.forEach((plate_name) => {
      if (!instructionPlates.includes(plate_name)) {
        throw Error(
          `plate id ${plate_name} is missing from transfer instructions.`
        );
      }
    });
    //a plate in config is not present in layouts
    configLayoutPlates.forEach((plate_name) => {
      if (!layoutPlates.includes(plate_name)) {
        throw Error(`plate id "${plate_name}" is missing from plate layouts.`);
      }
    });
    //a layout is not present in config
    layoutPlates.forEach((plate_name) => {
      if (!configLayoutPlates.includes(plate_name)) {
        throw Error(
          `layout plate id "${plate_name}" is missing from plate configuration object.`
        );
      }
    });
    //an instructions plate is not present in config
    instructionPlates.forEach((plate_name) => {
      if (!configInstructionPlates.includes(plate_name)) {
        throw Error(
          `transfer instructions plate id "${plate_name}" is missing from plate configuration object.`
        );
      }
    });
  }
  assertUniqueSuffixes() {
    let suffixes = this.plateInfo.map((p) => p.suffix);
    let uniq_suffixes = _.uniq(suffixes);
    if (uniq_suffixes.length < suffixes.length) {
      throw Error("Error: All plates must have a unique suffix.");
    }
  }
  setLayoutSuffix() {
    //create a copy of plate layouts with changed column names to contain plate suffix in all columns
    _.cloneDeep(this.layouts).forEach((layout) => {
      let columnLayout = arrayToObject(layout);
      let suffixArr = this.plateInfo.filter(
        (plate) => plate.layoutId === columnLayout[PLATE_ID_KEY][0]
      );
      if (suffixArr.length === 0) {
        throw Error(
          `A plate layout is defined in config, but not : ${columnLayout[PLATE_ID_KEY][0]}`
        );
      }
      let suffix = this.plateInfo.filter(
        (plate) => plate.layoutId === columnLayout[PLATE_ID_KEY][0]
      )[0].suffix;
      if (suffix) {
        let colnames = Object.keys(columnLayout).map((col) => {
          let col_suff = [PLATE_ID_KEY, WELL_ID_KEY].includes(col)
            ? col
            : `${col}${suffix}`;
          return [col, col_suff];
        });
        //record the columns and column_suffixes
        this.columnSuffixNames[columnLayout[PLATE_ID_KEY][0]] = colnames;
        //change the column names to include the suffix
        colnames.forEach((colArr) => {
          columnLayout[colArr[1]] = columnLayout[colArr[0]];
          if (![PLATE_ID_KEY, WELL_ID_KEY].includes(colArr[0])) {
            delete columnLayout[colArr[0]];
          }
        });

        let rowLayout: any = objectToArray(columnLayout);

        if (rowLayout[0][PLATE_ID_KEY] && rowLayout[0][WELL_ID_KEY]) {
          this.layoutsSuffix.push(rowLayout);
        } else {
          throw Error(
            "Report This Error to www.github.com/svgpubs: Missing Plate and Well : this is a problem with the program. "
          );
        }
      }
    });
  }

  get columnClashes() {
    //runLiquidDataHandler and records clashes
    return this.clashColumnStrategies;
  }

  set columnClashStragtegies(strats: ClashStrategyType[]) {
    this.clashColumnStrategies = strats;
  }

  addMissingPlateLayouts() {
    this.plateInfo.forEach((plate) => {
      if (plate.isEmpty && plate.layoutId === "") {
        let newPlate = getPlate(plate.size).map((wellrow) => {
          return { Plate: plate.instructionId, Well: wellrow["padded"] };
        });
        plate.layoutId = plate.instructionId; //now it has a layout id
        //add the empty plate layout to this.layouts
        this.layouts.push(newPlate);
      } else if (plate.isEmpty || plate.layoutId === "") {
        throw Error(
          `Error: Plate Config plate "isEmpty = ${plate.isEmpty}"" but layoutId = ${plate.layoutId}. This is an error.`
        );
      }
    });
  }

  formatLayouts() {
    // create empty plates for destinatios that are missing plate layouts
    var inputLayoutsCopy = _.cloneDeep(this.inputLayouts);
    //ensure well data has correct Plate and Well keys
    inputLayoutsCopy.forEach((layout, layoutIndex) => {
      this.layouts.push([]);
      layout.forEach((wellRow) => {
        let plateID = wellRow[this.keySet["plateIdKey"]];
        let wellId = wellRow[this.keySet["wellIdKey"]];
        delete wellRow[this.keySet["plateIdKey"]];
        delete wellRow[this.keySet["wellIdKey"]];
        this.layouts[layoutIndex].push({
          ...wellRow,
          [PLATE_ID_KEY]: plateID,
          [WELL_ID_KEY]: wellId,
        });
      });
    });
  }

  formatInstructions() {
    var inputInstructionsCopy = _.cloneDeep(this.inputInstructions);
    let newRow;
    inputInstructionsCopy.forEach((inst) => {
      newRow = {
        [SRC_PLATE_KEY]: inst[this.keySet["sourePlateKey"]],
        [SRC_WELL_KEY]: inst[this.keySet["sourceWellKey"]],
        [VOL_KEY]: +inst[this.keySet["volumeKey"]],
        [DEST_PLATE_KEY]: inst[this.keySet["destPlateKey"]],
        [DEST_WELL_KEY]: inst[this.keySet["destWellKey"]],
      };
      this.instructions.push(newRow);
    });
  }
}

export default liquidDataHander;
