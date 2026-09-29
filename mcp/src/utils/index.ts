export function toolResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}