#!/usr/bin/env node
/**
 * Validates subagent JSON envelope (schema v1) without external deps.
 * Usage: node scripts/validate-subagent-output.mjs <path-to.json>
 *    or:  echo '{"..."}' | node scripts/validate-subagent-output.mjs -
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES = new Set(["syntax", "runtime", "logical", "internal", "external"]);
const STATUSES = new Set(["success", "partial_success", "empty_result", "failure"]);
const ALERT_KINDS = new Set(["surprise", "confusion", "anomaly", "policy_block", "other"]);

function readInput(arg) {
  if (arg === "-" || arg === undefined) {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(path.resolve(arg), "utf8");
}

function err(msg) {
  console.error("validate-subagent-output:", msg);
  process.exit(1);
}

function validateErrorObject(e, i) {
  if (!e || typeof e !== "object") err(`errors[${i}] must be object`);
  if (!CATEGORIES.has(e.category)) err(`errors[${i}].category invalid`);
  if (typeof e.message !== "string" || e.message.trim().length < 3) {
    err(`errors[${i}].message must be specific (min 3 chars)`);
  }
}

function validateCoordinatorAlert(a, i) {
  if (!a || typeof a !== "object") err(`coordinator_alerts[${i}] must be object`);
  if (!ALERT_KINDS.has(a.kind)) err(`coordinator_alerts[${i}].kind invalid`);
  if (typeof a.summary !== "string" || a.summary.trim().length < 1) {
    err(`coordinator_alerts[${i}].summary required`);
  }
}

function validate(data) {
  if (!data || typeof data !== "object") err("root must be object");
  if (typeof data.agent !== "string" || !data.agent) err("agent required");
  if (data.schema_version !== "1") err("schema_version must be '1'");
  if (!STATUSES.has(data.status)) err("status invalid");

  if (Array.isArray(data.coordinator_alerts)) {
    data.coordinator_alerts.forEach(validateCoordinatorAlert);
  } else if (data.coordinator_alerts !== undefined) {
    err("coordinator_alerts must be an array when present");
  }

  switch (data.status) {
    case "success":
      if (data.payload === undefined) err("success requires payload");
      break;
    case "partial_success":
      if (data.payload === undefined) err("partial_success should include payload or use failure");
      if (Array.isArray(data.errors)) data.errors.forEach(validateErrorObject);
      break;
    case "empty_result":
      if (!data.empty_result || typeof data.empty_result !== "object") {
        err("empty_result requires empty_result object");
      }
      break;
    case "failure":
      if (!Array.isArray(data.errors) || data.errors.length === 0) {
        err("failure requires non-empty errors[]");
      }
      data.errors.forEach(validateErrorObject);
      if (!Array.isArray(data.what_was_attempted) || data.what_was_attempted.length === 0) {
        err("failure requires what_was_attempted[]");
      }
      break;
    default:
      err("unknown status");
  }
}

function main() {
  const arg = process.argv[2];
  let raw;
  try {
    raw = readInput(arg);
  } catch (e) {
    err(String(e.message || e));
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    err("invalid JSON");
  }
  validate(data);
  console.log("OK");
}

main();
