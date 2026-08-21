import { FuxaClient } from '../adapters/fuxa/client.js';
import { mapTag } from '../semantic/mapper.js';
import { Tag } from '../semantic/model.js';

export interface TagSearchResult {
  id: string;
  name: string;
  unit?: string;
  device?: string;
  description?: string;
  score: number;
}

const MAX_RESULTS = 10;

/**
 * Performs natural-language search over semantic tags.
 *
 * The query is tokenized and each tag is scored by token overlap across its
 * name, description, device, and unit fields. Results are ranked by score.
 */
export class TagSearchService {
  private readonly client: FuxaClient;

  constructor(client: FuxaClient) {
    this.client = client;
  }

  async search(query: string): Promise<TagSearchResult[]> {
    const tokens = tokenize(query);
    if (tokens.length === 0) {
      return [];
    }

    const rawTags = await this.client.listTags();
    const tags = rawTags.map(mapTag);

    const scored = tags
      .map((tag) => ({ tag, score: scoreTag(tag, tokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    return scored.map(({ tag, score }) => ({
      id: tag.id,
      name: tag.name,
      unit: tag.unit,
      device: tag.device,
      description: tag.description,
      score,
    }));
  }
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

function scoreTag(tag: Tag, tokens: string[]): number {
  const name = tag.name.toLowerCase();
  const description = (tag.description ?? '').toLowerCase();
  const device = (tag.device ?? '').toLowerCase();
  const unit = (tag.unit ?? '').toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (name.includes(token)) {
      score += 3;
    }
    if (description.includes(token)) {
      score += 2;
    }
    if (device.includes(token)) {
      score += 1;
    }
    if (unit.includes(token)) {
      score += 1;
    }
  }
  return score;
}
