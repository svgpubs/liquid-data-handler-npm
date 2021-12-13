// 4 96 well plates with sample_id
// layout1, layout2, layout3, layout4 plate names
// padded well formats
// tests a true clash between layout_media and layout1 in destination 12-well-plate

import { getPlate } from "well-id-formatter";

export const layout1 = getPlate(6).map((row) => {
  return {
    Plate: "layout1",
    Well: row["padded"],
    sample_id: `lay1${row["number"]}`,
    cell_type: "thyroid",
  };
});

export const layout2 = getPlate(12).map((row) => {
  return {
    Plate: "layout2",
    Well: row["padded"],
    sample_id: null,
    cell_type: +row["number"] % 2 === 0 ? null : "bone",
  };
});
export const layout_media = [
  {
    Plate: "layout_media",
    Well: "A01",
    meida: `acid_buffer`,
  },
];
