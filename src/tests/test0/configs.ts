import { PlateIdConfigType, KeySetType } from "../../mainTypes";

export let keysConfig: KeySetType = {
  plateIdKey: "plate_id",
  wellIdKey: "well_id",
  sourePlateKey: "src",
  destPlateKey: "dst",
  volumeKey: "v",
  sourceWellKey: "swell",
  destWellKey: "Destination Well",
};

export let platesConfig: PlateIdConfigType[] = [
  {
    id: "ss",
    layoutId: "plate96",
    instructionId: "splate-96-1",
    size: 96,
    suffix: "_d96",
    isEmpty: false,
  },
  {
    id: "bpos",
    layoutId: "plate6",
    instructionId: "splate-6-1", //empty destination
    size: 6,
    suffix: "_s6",
    isEmpty: false,
  },
  {
    id: "bdds",
    layoutId: "",
    instructionId: "dplate-6-2", //empty destination
    size: 6,
    suffix: "_d6",
    isEmpty: true,
  },
  {
    id: "dd",
    layoutId: "media",
    instructionId: "smedia bottle",
    size: 1,
    suffix: "_media",
    isEmpty: false,
  },
  {
    id: "ff",
    layoutId: "destmap24",
    instructionId: "dplate-24-1",
    size: 24,
    suffix: "_d24",
    isEmpty: false,
  },
];
