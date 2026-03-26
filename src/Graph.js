/**
 * Lớp Node đại diện cho một đỉnh trong đồ thị
 */
class Node {
  constructor(id, name = "", x = 0, y = 0) {
    this.id = id;
    this.name = name || id;
    // Tọa độ x, y để tương thích với v-network-graph layout
    this.x = x;
    this.y = y;
    this.fixed = false; // Cờ để cố định vị trí đỉnh
  }
}

/**
 * Lớp Edge đại diện cho một cạnh nối giữa hai đỉnh (vô hướng)
 */
class Edge {
  constructor(id, source, target, weight = 1) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.weight = weight;
  }
}

/**
 * Lớp Graph quản lý tập hợp Nodes và Edges, hỗ trợ thuật toán Dijkstra
 */
class Graph {
  constructor() {
    // Sử dụng Object thay vì Map để Vue 3 dễ dàng theo dõi (reactivity)
    this.nodes = {};
    this.edges = {};
  }

  /**
   * Sinh tên đỉnh tự động theo thứ tự: A, B, C, ..., Z, AA, AB, ...
   * @param {number} index - Chỉ số đỉnh (0-based)
   * @returns {string} Tên đỉnh
   */
  generateNodeName(index) {
    if (index < 26) {
      return String.fromCharCode(65 + index); // A-Z
    }
    const firstChar = String.fromCharCode(65 + Math.floor((index - 26) / 26));
    const secondChar = String.fromCharCode(65 + ((index - 26) % 26));
    return firstChar + secondChar; // AA, AB, AC, ...
  }

  /**
   * Sinh tên đỉnh tự động theo thứ tự: A, B, C, ..., Z, AA, AB, ...
   * @param {number} index - Chỉ số đỉnh (0-based)
   * @returns {string} Tên đỉnh
   */
  generateNodeName(index) {
    if (index < 26) {
      return String.fromCharCode(65 + index); // A-Z
    }
    const firstChar = String.fromCharCode(65 + Math.floor((index - 26) / 26));
    const secondChar = String.fromCharCode(65 + ((index - 26) % 26));
    return firstChar + secondChar; // AA, AB, AC, ...
  }

  addNode(id, name, x, y) {
    this.nodes[id] = new Node(id, name, x, y);
  }

  addEdge(id, source, target, weight) {
    if (this.nodes[source] && this.nodes[target]) {
      this.edges[id] = new Edge(id, source, target, weight);
    }
  }

  /**
   * Cố định vị trí của một đỉnh (ngăn nó trôi do lực layout)
   * @param {string} nodeId - ID của đỉnh
   */
  fixNodePosition(nodeId) {
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].fixed = true;
    }
  }

  /**
   * Cố định vị trí của một đỉnh (ngăn nó trôi do lực layout)
   * @param {string} nodeId - ID của đỉnh
   */
  fixNodePosition(nodeId) {
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].fixed = true;
    }
  }

  /**
   * Thuật toán Dijkstra cho đồ thị vô hướng
   * @param {string} startNodeId - ID đỉnh bắt đầu
   * @param {string} endNodeId - ID đỉnh kết thúc (tùy chọn)
   * @returns {Object} { distances, previous, path }
   */
  dijkstra(startNodeId, endNodeId = null) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const nodes = Object.keys(this.nodes);

    // Bước 1: Khởi tạo khoảng cách
    for (const nodeId of nodes) {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
    }
    distances[startNodeId] = 0;

    while (visited.size < nodes.length) {
      // Tìm đỉnh chưa thăm có khoảng cách nhỏ nhất
      let currNodeId = null;
      let minDistance = Infinity;

      for (const nodeId of nodes) {
        if (!visited.has(nodeId) && distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currNodeId = nodeId;
        }
      }

      // Nếu không tìm thấy đỉnh nào có thể đi tiếp hoặc đã đến đích
      if (currNodeId === null || currNodeId === endNodeId) break;

      visited.add(currNodeId);

      // Bước 2: Duyệt qua các cạnh kề (vì là đồ thị vô hướng)
      for (const edgeId in this.edges) {
        const edge = this.edges[edgeId];
        let neighborId = null;

        if (edge.source === currNodeId) neighborId = edge.target;
        else if (edge.target === currNodeId) neighborId = edge.source;

        if (neighborId && !visited.has(neighborId)) {
          const alt = distances[currNodeId] + edge.weight;
          if (alt < distances[neighborId]) {
            distances[neighborId] = alt;
            previous[neighborId] = currNodeId;
          }
        }
      }
    }

    // Tái cấu trúc đường đi nếu có endNodeId
    let path = [];
    if (endNodeId) {
      let temp = endNodeId;
      if (previous[temp] !== null || temp === startNodeId) {
        while (temp !== null) {
          path.unshift(temp);
          temp = previous[temp];
        }
      }
    }

    return { distances, previous, path };
  }
}

export { Node, Edge, Graph };
