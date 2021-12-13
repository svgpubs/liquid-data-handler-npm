// 4 96 well plates with sample_id
// layout1, layout2, layout3, layout4 plate names
// padded well formats

import { getPlate } from "well-id-formatter";

export const layout1 = getPlate(96).map((row) => {
  return {
    Plate: "layout1",
    Well: row["padded"],
    sample_id: `lay1_${row["number"]}`,
  };
});

export const layout2 = getPlate(96).map((row) => {
  return {
    Plate: "layout2",
    Well: row["padded"],
    sample_id: `lay2_${+row["number"]}`,
  };
});

export const layout3 = getPlate(96).map((row) => {
  return {
    Plate: "layout3",
    Well: row["padded"],
    sample_id: `lay3_${+row["number"]}`,
  };
});

export const layout4 = getPlate(96).map((row) => {
  return {
    Plate: "layout4",
    Well: row["padded"],
    sample_id: `lay4_${+row["number"]}`,
  };
});
