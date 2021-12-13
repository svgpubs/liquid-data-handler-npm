import {
  PlateSizeType,
  TransferInstructionsRowType,
  PlateMapRowType,
  ClashStrategyType,
  StrategyType,
  SeparatorType,
} from "./PlateTypes";

interface KeySetType {
  plateIdKey: string;
  wellIdKey: string;
  sourePlateKey: string;
  destPlateKey: string;
  volumeKey: string;
  sourceWellKey: string;
  destWellKey: string;
}
interface PlateIdConfigType {
  id: string;
  layoutId: string;
  instructionId: string;
  size: PlateSizeType;
  suffix: string;
  isEmpty: boolean;
}

interface AnyStringObjectType {
  [key: string]: string;
}

interface SpecificColumnClashesType extends ClashStrategyType {
  source?: string;
  destination?: string;
}

interface PlateColumnSuffixObjectType {
  [key: string]: string[][];
}

// interface plateMapColumnType {
// "Plate": []
// }
export type {
  TransferInstructionsRowType,
  KeySetType,
  PlateIdConfigType,
  AnyStringObjectType,
  PlateMapRowType,
  ClashStrategyType,
  StrategyType,
  SpecificColumnClashesType,
  PlateColumnSuffixObjectType,
  SeparatorType,
};
