/**
 * Device relationship graph modeling the industrial hierarchy:
 * Plant -> System -> Device -> Sensor.
 */

export type NodeKind = 'plant' | 'system' | 'device' | 'sensor';

export interface GraphNode {
  id: string;
  name: string;
  kind: NodeKind;
}

/**
 * A directed tree representing the plant hierarchy. Supports node lookup,
 * child/neighbor queries, and path traversal.
 */
export class DeviceGraph {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly children = new Map<string, string[]>();
  private readonly parents = new Map<string, string>();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.children.has(node.id)) {
      this.children.set(node.id, []);
    }
  }

  addEdge(parentId: string, childId: string): void {
    if (!this.nodes.has(parentId) || !this.nodes.has(childId)) {
      return;
    }
    const siblings = this.children.get(parentId) ?? [];
    if (!siblings.includes(childId)) {
      siblings.push(childId);
      this.children.set(parentId, siblings);
    }
    this.parents.set(childId, parentId);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getChildren(id: string): GraphNode[] {
    const ids = this.children.get(id) ?? [];
    return ids
      .map((childId) => this.nodes.get(childId))
      .filter((node): node is GraphNode => node !== undefined);
  }

  getNeighbors(id: string): GraphNode[] {
    const result: GraphNode[] = [];
    const parentId = this.parents.get(id);
    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        result.push(parent);
      }
    }
    result.push(...this.getChildren(id));
    return result;
  }

  /**
   * Find the path from `fromId` to `toId` following parent/child edges.
   * Returns an empty array if no path exists.
   */
  getPath(fromId: string, toId: string): GraphNode[] {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      return [];
    }
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];
    visited.add(fromId);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }
      if (current.id === toId) {
        return current.path
          .map((id) => this.nodes.get(id))
          .filter((node): node is GraphNode => node !== undefined);
      }
      for (const neighbor of this.getNeighbors(current.id)) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push({ id: neighbor.id, path: [...current.path, neighbor.id] });
        }
      }
    }
    return [];
  }
}
