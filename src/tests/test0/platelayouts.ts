import { getPlate } from "well-id-formatter";

export var srcPlateMap12 = getPlate(12).map((well) => {
  return {
    plate_id: "plate12",
    well_id: well["padded"],
    dataomega: `${+well["number"] * 2}`,
    datadelta: "thisisMyp12",
    buffer: `${+well["number"] % 2 ? true : false}`,
  };
}); // this plate isn't used in instructions

export var srcPlateMap6 = getPlate(6).map((well) => {
  return {
    plate_id: "plate6",
    well_id: well["padded"],
    dataepsi: `${+well["number"] * 3}`,
    datafddo: "thisisMyp12",
    buffer: `${+well["number"] % 2 ? true : false}`,
  };
});

export var srcPlateMap96 = getPlate(96).map((well) => {
  return {
    plate_id: "plate96",
    well_id: well["unpadded"],
    data99sdf: `${+well["number"] * 2}`,
    dataalpha: "thisisMyp96",
  };
});

export var srcResevoir1 = [
  { plate_id: "media", well_id: "A1", buffer: "10mM Tris pH 8" },
];

export var destPlateMap24 = getPlate(24).map((well) => {
  return {
    plate_id: "destmap24",
    well_id: well["unpadded"],
    buffer: "100mM HEPES pH 6",
  };
});
