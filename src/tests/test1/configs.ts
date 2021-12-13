import { PlateIdConfigType, KeySetType } from "../../mainTypes";
import { ClashStrategyType } from "../../PlateTypes";

export const keysConfig: KeySetType = {
  plateIdKey: "Plate",
  wellIdKey: "Well",
  sourePlateKey: "Source Plate",
  destPlateKey: "Destination Plate",
  volumeKey: "Volume",
  sourceWellKey: "Source Well",
  destWellKey: "Destination Well",
};

export const platesConfig: PlateIdConfigType[] = [
  {
    id: "p384",
    layoutId: "",
    instructionId: "empty384",
    size: 384,
    suffix: "_e384",
    isEmpty: true,
  },
  {
    id: "Q1",
    layoutId: "layout1",
    instructionId: "quadrant1",
    size: 96,
    suffix: "_Q1",
    isEmpty: false,
  },
  {
    id: "Q2",
    layoutId: "layout2",
    instructionId: "quadrant2",
    size: 96,
    suffix: "_Q2",
    isEmpty: false,
  },
  {
    id: "Q3",
    layoutId: "layout3",
    instructionId: "quadrant3",
    size: 96,
    suffix: "_Q3",
    isEmpty: false,
  },
  {
    id: "Q4",
    layoutId: "layout4",
    instructionId: "quadrant4",
    size: 96,
    suffix: "_Q4",
    isEmpty: false,
  },
];

export const clashStrategyConcat: ClashStrategyType = {
  column_name: "sample_id",
  concatenation_separator: "_",
  strategy: "concatenate",
};

export const clashStrategyKeepDest: ClashStrategyType = {
  column_name: "sample_id",
  concatenation_separator: "_",
  strategy: "keepDestination",
};

export const clashStrategyKeepSource: ClashStrategyType = {
  column_name: "sample_id",
  concatenation_separator: "_",
  strategy: "keepSource",
};

export const clashStrategySuffix: ClashStrategyType = {
  column_name: "sample_id",
  concatenation_separator: "_",
  strategy: "suffix",
};
