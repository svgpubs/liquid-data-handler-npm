// 4 96 well plates with sample_id
// layout1, layout2, layout3, layout4 plate names
// padded well formats

import { getPlate } from "well-id-formatter";

export const layout1 = getPlate(96).map((row) => {
  return {
    Plate: "layout1",
    Well: row["padded"],
    sample_id: `lay1${row["number"]}`,
  };
});
