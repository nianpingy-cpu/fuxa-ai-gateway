import { describe, it, expect } from 'vitest';
import { DeviceGraph } from '../../src/semantic/graph.js';

function buildSampleGraph(): DeviceGraph {
  const graph = new DeviceGraph();
  graph.addNode({ id: 'plant-1', name: 'Main Plant', kind: 'plant' });
  graph.addNode({ id: 'sys-1', name: 'Cooling System', kind: 'system' });
  graph.addNode({ id: 'dev-1', name: 'Cooling Pump', kind: 'device' });
  graph.addNode({ id: 'sen-1', name: 'Temperature Sensor', kind: 'sensor' });
  graph.addEdge('plant-1', 'sys-1');
  graph.addEdge('sys-1', 'dev-1');
  graph.addEdge('dev-1', 'sen-1');
  return graph;
}

describe('DeviceGraph', () => {
  it('adds nodes and edges', () => {
    const graph = buildSampleGraph();
    expect(graph.getNode('plant-1')?.name).toBe('Main Plant');
    expect(graph.getNode('sen-1')?.kind).toBe('sensor');
  });

  it('returns direct children of a node', () => {
    const graph = buildSampleGraph();
    const children = graph.getChildren('sys-1');
    expect(children.map((n) => n.id)).toEqual(['dev-1']);
  });

  it('returns neighbors of a node', () => {
    const graph = buildSampleGraph();
    const neighbors = graph.getNeighbors('dev-1');
    const ids = neighbors.map((n) => n.id).sort();
    expect(ids).toEqual(['sen-1', 'sys-1']);
  });

  it('returns an empty result for an unknown node', () => {
    const graph = buildSampleGraph();
    expect(graph.getChildren('missing')).toHaveLength(0);
    expect(graph.getNeighbors('missing')).toHaveLength(0);
  });

  it('finds a path between two nodes', () => {
    const graph = buildSampleGraph();
    const path = graph.getPath('plant-1', 'sen-1');
    expect(path.map((n) => n.id)).toEqual(['plant-1', 'sys-1', 'dev-1', 'sen-1']);
  });

  it('returns an empty path when no path exists', () => {
    const graph = buildSampleGraph();
    graph.addNode({ id: 'other', name: 'Other', kind: 'device' });
    expect(graph.getPath('plant-1', 'other')).toHaveLength(0);
  });
});
