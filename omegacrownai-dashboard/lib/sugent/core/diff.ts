export function diffJson(before: any, after: any) {
  return {
    before,
    after,
    summary: summarizeDiff(before, after),
  };
}

function summarizeDiff(before: any, after: any) {
  const beforeText = JSON.stringify(before || {});
  const afterText = JSON.stringify(after || {});

  return {
    beforeBytes: beforeText.length,
    afterBytes: afterText.length,
    changed: beforeText !== afterText,
  };
}
