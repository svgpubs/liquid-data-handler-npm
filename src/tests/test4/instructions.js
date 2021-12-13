const { objectToArray } = require("array-object-transformer");
var _ = require("lodash");

const headers = [
  "Source Plate",
  "Source Well",
  "Volume",
  "Destination Plate",
  "Destination Well",
];
const transfers = [
  ["plate6", "A01", "1", "plate12", "A01"],
  ["plate6", "A02", "1", "plate12", "B01"],
  ["plate6", "A03", "1", "plate12", "C01"],
  ["plate6", "A01", "1", "plate12", "A02"],
  ["plate6", "A02", "1", "plate12", "B02"],
  ["plate6", "A03", "1", "plate12", "C02"],
  ["plate6", "B01", "1", "plate12", "A03"],
  ["plate6", "B02", "1", "plate12", "B03"],
  ["plate6", "B03", "1", "plate12", "C03"],
  ["plate6", "B01", "1", "plate12", "A04"],
  ["plate6", "B02", "1", "plate12", "B04"],
  ["plate6", "B03", "1", "plate12", "C04"],
  ["media", "A01", "1", "plate12", "A01"],
  ["media", "A01", "1", "plate12", "A02"],
  ["media", "A01", "1", "plate12", "A03"],
  ["media", "A01", "1", "plate12", "A04"],
  ["media", "A01", "1", "plate12", "C01"],
  ["media", "A01", "1", "plate12", "C02"],
  ["media", "A01", "1", "plate12", "C03"],
  ["media", "A01", "1", "plate12", "C04"],
];

const instructionsCols = _.zip(...transfers);

const colLayout = {};

headers.forEach((header, idx) => {
  colLayout[header] = instructionsCols[idx];
});

let instructions: TransferInstructionsRowType[] = objectToArray(colLayout);

export default instructions;
