// 4 96 well plates with sample_id
// layout1, layout2, layout3, layout4 plate names
// padded well formats

import { getPlate } from "well-id-formatter";

export const layout1 = getPlate(6).map((row, idx) => {
  return {
    Plate: "layout1",
    Well: row["padded"],
    sample_id: `lay1${row["number"]}`,
    cell_type: "thyroid",
  };
});

export const layout_media = [
  {
    Plate: "layout_media",
    Well: "A01",
    sample_id: `acid_buffer`,
  },
];
