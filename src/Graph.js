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
    this.isDirected = false; // Cờ loại đồ thị: false = vô hướng, true = có hướng
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
    const components = [];
    const nodeIds = Object.keys(this.nodes);

    if (this.isDirected) {
      // TRƯỜNG HỢP CÓ HƯỚNG: Sử dụng Thuật toán Tarjan để tìm Thành phần liên thông mạnh (SCC)
      let index = 0;
      const stack = [];
      const indices = {};
      const lowlink = {};
      const onStack = {};

      // Xây dựng danh sách kề có hướng
      const adj = {};
      nodeIds.forEach((id) => (adj[id] = []));
      Object.values(this.edges).forEach((edge) => {
        adj[edge.source].push(edge.target);
      });

      const strongconnect = (v) => {
        indices[v] = index;
        lowlink[v] = index;
        index++;
        stack.push(v);
        onStack[v] = true;

        (adj[v] || []).forEach((w) => {
          if (indices[w] === undefined) {
            // Đỉnh w chưa được thăm
            strongconnect(w);
            lowlink[v] = Math.min(lowlink[v], lowlink[w]);
          } else if (onStack[w]) {
            // Đỉnh w đã nằm trên stack (tạo thành một chu trình)
            lowlink[v] = Math.min(lowlink[v], indices[w]);
          }
        });

        // Nếu v là đỉnh gốc của một SCC
        if (lowlink[v] === indices[v]) {
          const currentComponentNodes = [];
          let w;
          do {
            w = stack.pop();
            onStack[w] = false;
            currentComponentNodes.push(w);
          } while (w !== v);

          // Đóng gói Nodes và Edges cho SCC này
          const compEdges = Object.values(this.edges).filter(
            (edge) =>
              currentComponentNodes.includes(String(edge.source)) &&
              currentComponentNodes.includes(String(edge.target)),
          );
          const compNodes = currentComponentNodes.map((id) => this.nodes[id]);

          components.push({
            nodeIds: currentComponentNodes,
            nodes: compNodes,
            edges: compEdges,
          });
        }
      };

      // Chạy thuật toán Tarjan cho mọi đỉnh
      nodeIds.forEach((v) => {
        if (indices[v] === undefined) {
          strongconnect(v);
        }
      });
    } else {
      // TRƯỜNG HỢP VÔ HƯỚNG: Chạy BFS bình thường như cũ
      const visited = new Set();
      const adj = {};
      nodeIds.forEach((id) => (adj[id] = []));

      Object.values(this.edges).forEach((edge) => {
        adj[edge.source].push(edge.target);
        adj[edge.target].push(edge.source);
      });

      for (const startNodeId of nodeIds) {
        if (!visited.has(startNodeId)) {
          const currentComponentNodes = [];
          const queue = [startNodeId];
          visited.add(startNodeId);

          while (queue.length > 0) {
            const currNodeId = queue.shift();
            currentComponentNodes.push(currNodeId);

            (adj[currNodeId] || []).forEach((neighborId) => {
              if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push(neighborId);
              }
            });
          }

          // Đóng gói Nodes và Edges cho cụm này
          const compEdges = Object.values(this.edges).filter(
            (edge) =>
              currentComponentNodes.includes(String(edge.source)) &&
              currentComponentNodes.includes(String(edge.target)),
          );
          const compNodes = currentComponentNodes.map((id) => this.nodes[id]);

          components.push({
            nodeIds: currentComponentNodes,
            nodes: compNodes,
            edges: compEdges,
          });
        }
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

      // Bước 2: Duyệt qua các cạnh kề
      for (const edgeId in this.edges) {
        const edge = this.edges[edgeId];
        let neighborId = null;

        // Logic điều chỉnh theo loại đồ thị:
        if (edge.source === currNodeId) {
          neighborId = edge.target;
        } else if (!this.isDirected && edge.target === currNodeId) {
          neighborId = edge.source;
        }

        if (neighborId && !visited.has(neighborId)) {
          const alt = distances[currNodeId] + edge.weight;
          if (alt < distances[neighborId]) {
            distances[neighborId] = alt;
            // SỬA TẠI ĐÂY: Lưu cả đỉnh trước đó VÀ ID của cạnh được chọn
            previous[neighborId] = { node: currNodeId, edge: edgeId };
          }
        }
      }
    }

    // Tái cấu trúc đường đi nếu có endNodeId
    let path = [];
    let pathEdges = [];
    if (endNodeId) {
      let temp = endNodeId;
      if (previous[temp] !== null || temp === startNodeId) {
        while (temp !== null) {
          path.unshift(temp);
          if (previous[temp] !== null) {
            pathEdges.unshift(previous[temp].edge);
            temp = previous[temp].node;
          } else {
            temp = null;
          }
        }
      }
    }

    return { distances, previous, path, pathEdges };
  }

  /**
   * Thuật toán Dijkstra cho đồ thị vô hướng (Dạng Generator để làm Animation)
   * Ở mỗi bước quan trọng, hàm sẽ 'yield' ra trạng thái hiện tại.
   */
  *dijkstraGenerator(startNodeId, endNodeId = null) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const nodes = Object.keys(this.nodes);

    // Khởi tạo
    for (const nodeId of nodes) {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
    }
    distances[startNodeId] = 0;

    // YIELD 1: Trạng thái khởi tạo xong
    yield {
      type: "INIT",
      distances: { ...distances },
      visited: new Set(visited),
    };

    while (visited.size < nodes.length) {
      let currNodeId = null;
      let minDistance = Infinity;

      for (const nodeId of nodes) {
        if (!visited.has(nodeId) && distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currNodeId = nodeId;
        }
      }

      if (currNodeId === null || currNodeId === endNodeId) break;

      // YIELD 2: Tô màu đỉnh đang xét (Current Node)
      yield { type: "CURRENT_NODE", currNodeId, distances: { ...distances } };

      visited.add(currNodeId);

      for (const edgeId in this.edges) {
        const edge = this.edges[edgeId];
        let neighborId = null;

        if (edge.source === currNodeId) {
          neighborId = edge.target;
        } else if (!this.isDirected && edge.target === currNodeId) {
          neighborId = edge.source;
        }

        if (neighborId && !visited.has(neighborId)) {
          // YIELD 3: Tô màu đỉnh lân cận đang chuẩn bị tính toán
          yield { type: "CHECKING_NEIGHBOR", currNodeId, neighborId };

          const alt = distances[currNodeId] + edge.weight;
          if (alt < distances[neighborId]) {
            distances[neighborId] = alt;
            // SỬA TẠI ĐÂY: Lưu cả đỉnh trước đó VÀ ID của cạnh được chọn
            previous[neighborId] = { node: currNodeId, edge: edgeId };

            // YIELD 4: Nếu tìm thấy đường ngắn hơn, báo cho UI biết để chớp nháy/cập nhật bảng
            yield {
              type: "UPDATED_DISTANCE",
              neighborId,
              newDist: alt,
              distances: { ...distances },
            };
          }
        }
      }

      // YIELD 5: Đã duyệt xong đỉnh này (chuyển sang màu Xám/Đen đánh dấu đã Visited)
      yield { type: "VISITED", currNodeId };
    }

    // Tái cấu trúc đường đi
    let pathNodes = [];
    let pathEdgesIds = [];
    if (endNodeId) {
      let temp = endNodeId;
      if (previous[temp] !== null || temp === startNodeId) {
        while (temp !== null) {
          pathNodes.unshift(temp);
          if (previous[temp] !== null) {
            pathEdgesIds.unshift(previous[temp].edge);
            temp = previous[temp].node;
          } else {
            temp = null;
          }
        }
      }
    }

    // YIELD 6: Xong, trả về đường đi để UI tô đậm nét (Highlight Path)
    yield {
      type: "DONE",
      path: pathNodes,
      pathEdges: pathEdgesIds,
      distances,
      previous,
    };
  }
}

export { Node, Edge, Graph };
