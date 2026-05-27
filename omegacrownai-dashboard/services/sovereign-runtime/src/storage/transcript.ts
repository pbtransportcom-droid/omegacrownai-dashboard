import fs from "fs";
import path from "path";

const transcriptDir = path.join(process.cwd(), "data", "transcripts");
fs.mkdirSync(transcriptDir, { recursive: true });

export function appendTranscript(projectId: string, message: string) {
  const file = path.join(transcriptDir, `${projectId}.log`);
  fs.appendFileSync(file, `[${new Date().toISOString()}] ${message}\n`);
}
