import { getPlateWells, wellIDFormatter } from "well-id-formatter";
import {
  PlateRelationshipType,
  ClashStrategyType,
  TransferInstructionsRowType,
  PlateMapRowType,
  StrategyType,
  SeparatorType,
  // PlateSizeType,
  WellType,
} from "./PlateTypes";
import _ from "lodash";
import {
  PlateSizesType,
  WellFormatsType,
} from "well-id-formatter/dist/wellTypes";
import { start } from "repl";
// transforms 1 source to 1 dest plate
interface anyObjectType {
  [key: string]: string | number | null;
}

class PlateTransformer {
  //class types
  columnClashStrategies: ClashStrategyType[];
  instructions: TransferInstructionsRowType[];
  sourceMap: PlateMapRowType[];
  destMap: PlateMapRowType[];
  newDestMap: PlateMapRowType[];
  defaultClashStragty: StrategyType;
  defaultSeparator: SeparatorType;
  newDestMapCols: ("Plate" | "Well" | string)[];
  internalWellType: WellType;
  clashedColumns: string[];
  sourceRelationship: PlateRelationshipType;
  destRelationship: PlateRelationshipType;

  constructor(
    sourceMap: PlateMapRowType[],
    destMap: PlateMapRowType[],
    instructions: TransferInstructionsRowType[],
    sourceRelationship: PlateRelationshipType,
    destRelationship: PlateRelationshipType,
    columnClashStrategies: ClashStrategyType[] = []
  ) {
    this.sourceMap = sourceMap;
    this.destMap = destMap;
    this.newDestMap = _.cloneDeep(destMap);
    this.instructions = instructions;
    this.sourceRelationship = sourceRelationship;
    this.destRelationship = destRelationship;
    this.defaultClashStragty = "suffix";
    this.defaultSeparator = ", ";
    this.internalWellType = "padded";
    this.columnClashStrategies = columnClashStrategies;
    this.newDestMapCols = Object.keys(this.newDestMap[0]);
    this.clashedColumns = [];
    this.validateAndFormatData();
  }

  validateLayoutKeys(): void {
    const destKeysValid = this.destMap.every(
      (well) => !!well["Well"] && !!well["Plate"]
    );
    const srcKeysValid = this.sourceMap.every(
      (well) => !!well["Well"] && !!well["Plate"]
    );
    if (!(destKeysValid && srcKeysValid)) {
      throw Error(
        `PlateLayout Keys Invalid. Source and Destination Platelayouts both require "Plate" and "Well" keys.`
      );
    }
  }

  validateInstructionsKeys(): void {
    const instructionKeysValid = this.instructions.every(
      (t) =>
        t["Source Plate"] &&
        t["Destination Well"] &&
        t["Source Well"] &&
        t["Volume"] &&
        t["Destination Plate"]
    );
    if (!instructionKeysValid) {
      throw Error(
        `Transfer Instruction Keys Invalid. Keys must be "Source Plate", "Destination Plate", "Source Well", "Destination Well", and "Volume"`
      );
    }
  }

  validateAndFormatData(): void {
    this.validateInstructionsKeys();
    this.validateLayoutKeys();
    this.validateInstructionIDs();
    this.validateMapIDs();
    this.validateAndConvertWellFormats(this.internalWellType);
    this.fillMissingWells();
    if (this.sourceMap.length !== +this.sourceRelationship.plate_size) {
      throw Error(
        `Source Map must have ${this.sourceRelationship.plate_size} rows, not ${this.sourceMap.length}`
      );
    }
    if (this.newDestMap.length !== this.destRelationship.plate_size) {
      throw Error(
        `Destination Map must have ${this.destRelationship.plate_size} rows, not ${this.newDestMap.length}`
      );
    }
  }

  setDefaultClashStrategy(strategy: StrategyType): void {
    this.defaultClashStragty = strategy;
  }

  setClashConcatenationSeparator(separator: SeparatorType): void {
    this.defaultSeparator = separator;
  }

  assigncolumnClashStrategies(
    columnClashStrategies: ClashStrategyType[]
  ): void {
    this.columnClashStrategies = columnClashStrategies;
  }

  fillMissingWells(): void {
    // if well data are missing, (ex, missing object for well A4),
    // insert them to make the plate complete, setting values to null
    //internalWellType should be sortable, either 'padded' or 'number', not unpadded
    // const sourceMapInternal: PlateMapRowType[] = _.cloneDeep(this.sourceMap);
    // const destMapInternal: PlateMapRowType[] = _.cloneDeep(this.newDestMap);
    //get complete array of source well ids
    const sourcePlateWells = getPlateWells(
      this.sourceRelationship.plate_size,
      this.internalWellType
    );
    //get complete array of dest well ids
    const destPlateWells = getPlateWells(
      this.destRelationship.plate_size,
      this.internalWellType
    );

    const sourceNewMapInternal: PlateMapRowType[] = [];
    const destNewMapInternal: PlateMapRowType[] = [];

    type NullPairsArr = [string, null];

    //create an object of each variable with the value set to null
    //from sourcemap
    const sourceMapRowInternalArr: NullPairsArr[] = Object.keys(
      this.sourceMap[0]
    )
      .filter((d) => d !== "Plate" && d !== "Well")
      .map((d) => [d, null]);
    const sourceMapRowInternalObj: anyObjectType = _.fromPairs(
      sourceMapRowInternalArr
    );

    let idxCount = 0;
    sourcePlateWells.forEach((well) => {
      const srcMapRow = this.sourceMap[idxCount];
      const srcMapRowWellIsCorrect = srcMapRow["Well"] === well;
      if (!srcMapRowWellIsCorrect) {
        // push an empty row into the new plate
        sourceNewMapInternal.push({
          Plate: this.sourceRelationship.plate_map_id,
          Well: well,
          ...sourceMapRowInternalObj,
        });
      } else {
        //if the well is correct
        idxCount += 1;
        sourceNewMapInternal.push({ ...srcMapRow });
      }
    });
    //repeate steps for destination source
    const destMapRowInternalArr: NullPairsArr[] = Object.keys(
      this.newDestMap[0]
    )
      .filter((d) => d !== "Plate" && d !== "Well")
      .map((d) => [d, null]);
    const destMapRowInternalObj: anyObjectType = _.fromPairs(
      destMapRowInternalArr
    );
    idxCount = 0;

    destPlateWells.forEach((well) => {
      const destMapRow = this.newDestMap[idxCount];
      const destMapRowWell = destMapRow["Well"] === well;
      if (!destMapRowWell) {
        destNewMapInternal.push({
          Plate: this.destRelationship.plate_map_id,
          Well: well,
          ...destMapRowInternalObj,
        });
      } else {
        idxCount += 1;
        destNewMapInternal.push({ ...destMapRow });
      }
    });
    //assign complete maps
    this.sourceMap = sourceNewMapInternal;
    this.newDestMap = destNewMapInternal;
  }

  validateAndConvertWellFormats(wellFormat: WellFormatsType): void {
    let newWell;
    const destPlateSize: PlateSizesType = this.destRelationship.plate_size;
    const sourcePlateSize: PlateSizesType = this.sourceRelationship.plate_size;
    this.newDestMap = this.newDestMap.map((row) => {
      newWell = wellIDFormatter(row["Well"], wellFormat, destPlateSize);
      if (typeof newWell === "string") {
        row["Well"] = newWell;
        return row;
      } else {
        throw Error(
          `${row["Well"]} not recognized in ${destPlateSize} well plate`
        );
      }
    });
    this.sourceMap = this.sourceMap.map((row) => {
      newWell = wellIDFormatter(row["Well"], wellFormat, sourcePlateSize);
      if (typeof newWell === "string") {
        row["Well"] = newWell;
        return row;
      } else {
        throw Error(
          `${row["Well"]} not recognized in ${sourcePlateSize} well plate`
        );
      }
    });
  }

  transformPlates(wellformat: WellType | null): PlateMapRowType[] {
    let localClashedCols: string[] = [];

    if (this.columnClashStrategies.length) {
      localClashedCols = this.columnClashStrategies.map((cc) => cc.column_name);
    }
    const sourceCols = Object.keys(this.sourceMap[0]).filter(
      (d) => d !== "Plate" && d !== "Well"
    );
    const destCols = Object.keys(this.destMap[0]).filter(
      (d) => d !== "Plate" && d !== "Well"
    );

    // add source source columns to the new destination map
    //unless those columns already exist on the destination map.
    //initiate new destColumns if they do not already exist

    sourceCols.forEach((scol) => {
      // if (!destCols.includes(scol) && localClashedCols.includes(scol)) {
      if (!destCols.includes(scol) && !localClashedCols.includes(scol)) {
        //add a null col if the destCol doesn't have the source col and if it isn't a clashign col
        this.newDestMap = this.newDestMap.map((d) => {
          return { ...d, [scol]: null };
        });
      }
    });

    //add the volumn column to destmap = the amount of volume transfered to dest plate from source plate
    const volColname = `volume${this.sourceRelationship.plate_suffix}`;

    sourceCols.forEach((scol) => {
      if (!destCols.includes(scol)) {
        this.newDestMap = this.newDestMap.map((d) => ({
          ...d,
          [volColname]: 0,
        }));
      }
    });

    //transfer source values to dest values
    this.instructions.forEach((inst) => {
      const sourceMapRow = {
        ...this.sourceMap.filter(
          (smap) => inst["Source Well"] === smap.Well
        )[0],
      };

      const destMapRow = _.find(
        this.newDestMap,
        (dmap) => inst["Destination Well"] === dmap.Well
      ); //mutable row

      if (sourceMapRow) {
        //if we have a sourceMapRow
        sourceCols.forEach((scol) => {
          let isClashedCol = this.columnClashStrategies.some(
            (strat) => strat.column_name === scol
          );
          if (destMapRow) {
            if (destMapRow[scol] === null && !isClashedCol) {
              //assign source col & value to destMap
              destMapRow[scol] = sourceMapRow[scol];
            } else {
              console.log(sourceMapRow, destMapRow);
              //if value clashes: destMapRow[scol] already has been assigned a value
              this.mutateDestMapRowWithClashedValues(
                destMapRow,
                sourceMapRow,
                scol
              );
            }
          }
        });
        //add the volume from source to destination well
        const instructionVolume = inst.Volume == null ? 0 : +inst.Volume;
        if (destMapRow) {
          let previousVolume = destMapRow[volColname];
          previousVolume =
            !(previousVolume == null) && typeof previousVolume === "number"
              ? previousVolume
              : 0;
          //assign updated volume
          destMapRow[volColname] = instructionVolume + previousVolume;
        }
      }
    });
    if (!(wellformat == null) && wellformat !== this.internalWellType) {
      //if there is a different well
      this.validateAndConvertWellFormats(wellformat);
    }

    return this.newDestMap;
  }

  assignNewColnameToDestMap(newColname: string): void {
    this.newDestMap.forEach((row) => {
      row[newColname] = row[newColname] ? row[newColname] : null;
    });
  }

  mutateDestMapRowWithClashedValues(
    destMapRow: PlateMapRowType,
    sourceMapRow: PlateMapRowType,
    colname: string
  ): PlateMapRowType {
    if (!this.clashedColumns.includes(colname)) {
      this.clashedColumns.push(colname);
    }
    let newColname: string | null = null; //in case we add suffix to the colname
    let stragety = this.defaultClashStragty;
    let separator = this.defaultSeparator;
    //adjust strategy and separator if we have a specific clashStrategy for this colname
    const specificClashStrategy = this.columnClashStrategies.filter(
      (cs) => cs.column_name === colname
    );
    if (specificClashStrategy.length) {
      stragety = specificClashStrategy[0].strategy;
      separator = specificClashStrategy[0].concatenation_separator;
    }

    switch (stragety) {
      case "concatenate":
        destMapRow[colname] = [destMapRow[colname], sourceMapRow[colname]].join(
          separator
        );
        break;
      case "keepDestination":
        break;
      case "keepSource":
        destMapRow[colname] = sourceMapRow[colname];
        break;
      case "suffix": {
        newColname = `${colname}${this.sourceRelationship.plate_suffix}`;
        if (!this.newDestMapCols.includes(newColname)) {
          this.assignNewColnameToDestMap(newColname);
          this.newDestMapCols.push(newColname);
        }
        destMapRow[newColname] = sourceMapRow[colname];
        break;
      }
      default:
        throw Error(`${stragety} not recognized as a clash strategy`);
    }
    return destMapRow;
  }

  validateMapIDs(): void {
    //ensures that the plate ids match
    //get all the plate ids from the dest map
    const mapDestIdArr = _.uniq(this.destMap.map((row) => row["Plate"]));
    //get all the plate ids from the source map
    const mapSourceIdArr = _.uniq(this.sourceMap.map((row) => row["Plate"]));
    //we only transfer one plate at a time.
    if (mapDestIdArr.length > 1) {
      throw Error(`PlateTransformerClass Destination Plate Maps contains more than one 'Plate': "${mapDestIdArr.join(
        " and "
      )}".
      Must only have one Plate.`);
    }
    if (mapSourceIdArr.length > 1) {
      throw Error(`PlateTransformerClass Source Plate Maps contains more than one 'Plate': "${mapSourceIdArr.join(
        " and "
      )}".
      Must only have one Plate.`);
    }
    //instructions and plate maps just have one plate id for source and destinatino
    const mapDestId = mapDestIdArr[0];
    const mapSourceId = mapSourceIdArr[0];
    //make sure that destination plate map Plate ID is found in plate relationships
    if (this.destRelationship.plate_map_id !== mapDestId) {
      throw Error(
        `Destination Plate Relationship Plate ID "${this.destRelationship.plate_map_id}" does NOT match Plate Map Plate ID "${mapDestId}"`
      );
    }
    //make sure that source Plate Map Plate ID is found in plate relationships
    if (this.sourceRelationship.plate_map_id !== mapSourceId) {
      throw Error(
        `Source Plate Relationship Plate ID "${this.sourceRelationship.plate_map_id}" does NOT match Plate Map Plate ID "${mapSourceId}"`
      );
    }
  }

  validateInstructionIDs(): void {
    //throw error if there are more than one source and one destination in instructions
    const instDestIdArr = _.uniq(
      this.instructions.map((inst) => inst["Destination Plate"])
    );
    const instSourceIdArr = _.uniq(
      this.instructions.map((inst) => inst["Source Plate"])
    );
    if (instDestIdArr.length > 1) {
      throw Error(`PlateTransformerClass Instructions contains more than one 'Destination Plate': "${instDestIdArr.join(
        " and "
      )}".
       Must only have one Destination Plate.`);
    }
    if (instSourceIdArr.length > 1) {
      throw Error(`PlateTransformerClass Instructions contains more than one 'Source Plate': "${instSourceIdArr.join(
        " and "
      )}".
       Must only have one Source Plate.`);
    }
    const instDestId = instDestIdArr[0];
    const instSourceId = instSourceIdArr[0];
    //make sure that instructions Destination Plate ID is found in destination plate relationships
    if (this.destRelationship.plate_instruction_id !== instDestId) {
      throw Error(
        `Destination Plate Relationship Plate ID "${this.destRelationship.plate_instruction_id}"
        does NOT match Destintation Plate in transfer instructions "${instDestId}"`
      );
    }
    //make sure that instruction Source Plate ID is found in plate relationships
    if (this.sourceRelationship.plate_instruction_id !== instSourceId) {
      throw Error(
        `Source Plate Relationship Plate ID "${this.sourceRelationship.plate_instruction_id}"
        does NOT match Source Plate in transfer instructions "${instSourceId}"`
      );
    }
  }
}

export default PlateTransformer;
