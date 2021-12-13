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
    id: "p96",
    layoutId: "layout1",
    instructionId: "plate96",
    size: 96,
    suffix: "_Q1",
    isEmpty: false,
  },
  {
    id: "p384",
    layoutId: "",
    instructionId: "plate384",
    size: 384,
    suffix: "_p384",
    isEmpty: true,
  },
];
