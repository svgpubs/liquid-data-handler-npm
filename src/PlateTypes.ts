interface PlateWellsType {
  padded: string;
  unpadded: string;
  number: string;
  row: string;
  column: string;
}

interface PlatesObjectType {
  [key: number]: PlateWellsType[];
}

type PlateSizeType = 1 | 6 | 12 | 24 | 48 | 96 | 384;

interface PlateMapRowType {
  Plate: string;
  Well: string;
  [key: string]: string | number | null;
}

type PlateMapType = PlateMapRowType[];

interface TransferInstructionsRowType {
  "Source Plate": string;
  "Source Well": string;
  "Destination Plate": string;
  "Destination Well": string;
  Volume: number;
}

type TransferInstructionsType = TransferInstructionsRowType[];

interface PlateRelationshipType {
  plate_map_id: string;
  plate_instruction_id: string;
  plate_size: PlateSizeType;
  plate_suffix: string;
}

type StrategyType =
  | "keepSource"
  | "keepDestination"
  | "concatenate"
  | "suffix"
  | "suffixAll";

type SeparatorType = ", " | "-" | "_" | " " | " + " | "" | string;

interface ClashStrategyType {
  column_name: string;
  strategy: StrategyType;
  concatenation_separator: SeparatorType;
  plate_id?: string;
}

interface SpecificColumnClashesType {
  source: string;
  destination: string;
  column: string;
  strategy: StrategyType;
  concatenation_separator: SeparatorType;
}

type WellType = "padded" | "unpadded" | "number";

export type {
  PlateSizeType,
  PlateWellsType,
  PlatesObjectType,
  TransferInstructionsRowType,
  TransferInstructionsType,
  PlateMapRowType,
  PlateMapType,
  PlateRelationshipType,
  ClashStrategyType,
  StrategyType,
  SeparatorType,
  WellType,
  SpecificColumnClashesType,
};
