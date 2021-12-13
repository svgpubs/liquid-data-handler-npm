import { TransferInstructionsRowType } from "./mainTypes";

function* getGeneratorOfTransferInstructions(
  instructions: TransferInstructionsRowType[]
): IterableIterator<TransferInstructionsRowType[] | undefined> {
  let instructionChunk: TransferInstructionsRowType[] = [];
  const instructionChunks: TransferInstructionsRowType[][] = [];
  let curDest: string = instructions[0]["Destination Plate"];
  let curSrc: string = instructions[0]["Source Plate"];
  instructions.forEach((cur) => {
    if (
      curDest === cur["Destination Plate"] &&
      curSrc === cur["Source Plate"]
    ) {
      instructionChunk.push(cur);
    } else {
      instructionChunks.push(instructionChunk);
      curDest = cur["Destination Plate"];
      curSrc = cur["Source Plate"];
      instructionChunk = [cur];
    }
  });
  instructionChunks.push(instructionChunk);
  while (instructionChunks.length) {
    yield instructionChunks.shift();
  }
}

export default getGeneratorOfTransferInstructions;
