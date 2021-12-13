import csvtxt from "./instructionsText";
import _ from "lodash";
import { AnyStringObjectType } from "../../mainTypes";
let csvLines = csvtxt
  .split(/\r\n?|\n/)
  .filter((d) => d !== "" && !d.match(/^\s*#/) && !d.match(/^\t*#/));
let firstLine = csvLines.shift();

let instructionsArray: AnyStringObjectType[] = [];
if (firstLine) {
  let headers = firstLine.split(",").map((header: string) => header.trim());
  let csvData: string[][] = csvLines.map((inst: string) =>
    inst.split(",").map((value: string) => value.trim())
  );

  let newRow: any = {};

  csvData.forEach((row) => {
    newRow = _.zip(headers, row);
    newRow = Object.fromEntries(newRow);

    if (newRow && Object.keys(newRow).length > 1) {
      instructionsArray.push(newRow);
    }
  });
} else {
  throw Error("error importing instruction file");
}

export default instructionsArray;
