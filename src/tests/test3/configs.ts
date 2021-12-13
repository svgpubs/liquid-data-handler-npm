import { KeySetType, PlateIdConfigType } from "../../mainTypes";

export let keysConfig: KeySetType = {
  plateIdKey: "Plate",
  wellIdKey: "Well",
  sourePlateKey: "Source Plate",
  destPlateKey: "Destination Plate",
  volumeKey: "Volume",
  sourceWellKey: "Source Well",
  destWellKey: "Destination Well",
};

export let platesConfig: PlateIdConfigType[] = [
  {
    id: "p6",
    layoutId: "layout1",
    instructionId: "plate6",
    size: 6,
    suffix: "_p6",
    isEmpty: false,
  },
  {
    id: "p1",
    layoutId: "layout_media",
    instructionId: "media",
    size: 1,
    suffix: "_media",
    isEmpty: false,
  },
  {
    id: "p12",
    layoutId: "",
    instructionId: "plate12",
    size: 12,
    suffix: "_p12",
    isEmpty: true,
  },
];
