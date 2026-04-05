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
   * Tìm chỉ số node tiếp theo chưa sử dụng
   * Dịch vụ này quét tất cả node hiện tại để tìm chỉ số cao nhất
   * @returns {number} Chỉ số node tiếp theo
   */
  getNextNodeIndex() {
    let maxIndex = -1;

    for (const nodeId of Object.keys(this.nodes)) {
      // Nếu nodeId là một chữ cái (A-Z)
      if (nodeId.length === 1 && nodeId >= "A" && nodeId <= "Z") {
        const index = nodeId.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
        maxIndex = Math.max(maxIndex, index);
      }
      // Nếu nodeId là hai chữ cái (AA-ZZ)
      else if (nodeId.length === 2 && nodeId >= "AA" && nodeId <= "ZZ") {
        const firstIndex = nodeId.charCodeAt(0) - 65 + 1; // AA=26
        const secondIndex = nodeId.charCodeAt(1) - 65;
        const index = 26 + (firstIndex - 1) * 26 + secondIndex;
        maxIndex = Math.max(maxIndex, index);
      }
    }

    return maxIndex + 1; // Trả về chỉ số tiếp theo
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
   * Xóa một cạnh khỏi đồ thị
   */
  removeEdge(edgeId) {
    if (this.edges[edgeId]) {
      delete this.edges[edgeId];
    }
  }

  /**
   * Xóa một đỉnh khỏi đồ thị và dọn dẹp các cạnh liên quan
   */
  removeNode(nodeId) {
    if (this.nodes[nodeId]) {
      // 1. Tìm và xóa tất cả các cạnh nối với đỉnh này
      for (const edgeId in this.edges) {
        const edge = this.edges[edgeId];
        if (edge.source === nodeId || edge.target === nodeId) {
          delete this.edges[edgeId];
        }
      }
      // 2. Xóa đỉnh
      delete this.nodes[nodeId];
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
  getConnectedComponents() {
    const visited = new Set();
    const components = [];
    const nodeIds = Object.keys(this.nodes);

    for (const startNodeId of nodeIds) {
      // Nếu đỉnh này chưa được duyệt qua, nó thuộc về một bộ phận liên thông mới
      if (!visited.has(startNodeId)) {
        const currentComponent = [];
        const queue = [startNodeId];
        visited.add(startNodeId);

        // Bắt đầu BFS để quét tất cả các đỉnh kết nối với startNodeId
        while (queue.length > 0) {
          const currNodeId = queue.shift();
          currentComponent.push(currNodeId);

          // Tìm các đỉnh kề với currNodeId thông qua danh sách các cạnh
          for (const edgeId in this.edges) {
            const edge = this.edges[edgeId];
            let neighborId = null;

            if (edge.source === currNodeId) neighborId = edge.target;
            else if (edge.target === currNodeId) neighborId = edge.source;

            // Nếu kề và chưa từng được thăm thì đưa vào queue
            if (neighborId && !visited.has(neighborId)) {
              visited.add(neighborId);
              queue.push(neighborId);
            }
          }
        }

        // Thêm cụm vừa quét xong vào danh sách tổng
        components.push(currentComponent);
      }
    }

    return components;
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
