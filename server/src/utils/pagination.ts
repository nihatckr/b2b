// 🔄 Pagination Types and Utilities

export interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export function encodeCursor(id: number): string {
  return Buffer.from(id.toString()).toString("base64");
}

export function decodeCursor(cursor: string): number {
  return parseInt(Buffer.from(cursor, "base64").toString("utf8"));
}

export function createConnection<T extends { id: number }>(
  items: T[],
  args: PaginationArgs,
  totalCount: number
): Connection<T> {
  const { first = 10, after, last, before } = args;

  let startIndex = 0;
  let endIndex = items.length;

  // Handle cursor-based pagination
  if (after) {
    const afterId = decodeCursor(after);
    startIndex = items.findIndex((item) => item.id > afterId);
    if (startIndex === -1) startIndex = items.length;
  }

  if (before) {
    const beforeId = decodeCursor(before);
    const beforeIndex = items.findIndex((item) => item.id >= beforeId);
    if (beforeIndex !== -1) endIndex = beforeIndex;
  }

  // Apply pagination limits
  if (first) {
    endIndex = Math.min(startIndex + first, endIndex);
  }

  if (last) {
    startIndex = Math.max(endIndex - last, startIndex);
  }

  const selectedItems = items.slice(startIndex, endIndex);

  const edges: Edge<T>[] = selectedItems.map((item) => ({
    node: item,
    cursor: encodeCursor(item.id),
  }));

  const pageInfo: PageInfo = {
    hasNextPage: endIndex < items.length,
    hasPreviousPage: startIndex > 0,
    startCursor: edges[0]?.cursor,
    endCursor: edges[edges.length - 1]?.cursor,
  };

  return {
    edges,
    pageInfo,
    totalCount,
  };
}
