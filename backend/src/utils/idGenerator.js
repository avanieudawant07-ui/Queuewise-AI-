import { v4 as uuidv4 } from "uuid";

export function generateRunId() {
  return `run_${uuidv4().substring(0, 12)}`;
}

export function generateIdempotencyKey(prefix = "key") {
  return `${prefix}_${uuidv4().substring(0, 8)}`;
}

export function generateOfferId() {
  return `off_${uuidv4().substring(0, 10)}`;
}
