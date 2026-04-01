<!-- //App.vue -->
<template>
  <div class="container-fluid app-main-container">
    <div class="row h-100">
      <div class="col-3 app-input-panel">
        <InputView 
          :nodes="myGraph.nodes" 
          v-model:start="search.start"
          v-model:end="search.end"
          @add-node="handleAddNode"
          @add-edge="handleAddEdge"
          @import-graph="handleImportGraph"
          @run-algorithm="runAlgorithm"
        />
      </div>
      
      <div class="col-6 app-graph-panel">
        <div class="graph-container">
          <GraphCanvas 
            :nodes="myGraph.nodes"
            :edges="myGraph.edges"
            :layouts="layouts"
            :path-ids="result.pathEdges"
            :graph-config="graphConfig"
            @create-node="handleCreateNodeFromCanvas"
            @create-edge="handleCreateEdgeFromCanvas"
          />
        </div>
        <NavBar 
          :start="search.start"
          :end="search.end"
          @run-algorithm="runAlgorithm"
        />
      </div>

      <div class="col-3 app-side-panel">
        <AnotherSet
          :result="result"
          :start="search.start"
          :end="search.end"
          :graph-config="graphConfig"
          @update-config="handleUpdateGraphConfig"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import InputView from './components/InputView2.vue';
import GraphCanvas from './components/GraphCanvas.vue';
import AnotherSet from './components/AnotherSet.vue';
import NavBar from './components/NavBar.vue';
import { Graph } from './Graph.js'; 

// Khởi tạo đối tượng đồ thị thực sự từ class và bọc trong reactive
const myGraph = reactive(new Graph());

// Theo dõi chỉ số đỉnh tiếp theo
const nextNodeIndex = ref(0);

// State để quản lý tọa độ của các node (bắt buộc cho v-network-graph)
const layouts = reactive({
  nodes: {}
});

// Thêm sẵn một vài dữ liệu mẫu để biểu đồ không bị trống lúc mới load
myGraph.addNode("A", "A", 100, 150);
myGraph.addNode("B", "B", 300, 50);
myGraph.addNode("C", "C", 300, 250);
myGraph.addNode("D", "D", 500, 150);
nextNodeIndex.value = 4;

// Khởi tạo layouts cho các node ban đầu
layouts.nodes.A = { x: 100, y: 150 };
layouts.nodes.B = { x: 300, y: 50 };
layouts.nodes.C = { x: 300, y: 250 };
layouts.nodes.D = { x: 500, y: 150 };

myGraph.addEdge("e1", "A", "B", 4);
myGraph.addEdge("e2", "A", "C", 2);
myGraph.addEdge("e3", "B", "C", 5);
myGraph.addEdge("e4", "B", "D", 10);
myGraph.addEdge("e5", "C", "D", 3);

// Trạng thái của điểm bắt đầu, điểm kết thúc
const search = reactive({ start: "A", end: "D" });

// Graph config state
const graphConfig = reactive({
  distanceMin: 120,
  chargeStrength: -400,
  alphaMin: 0.001,
  nodeRadius: 25,
  nodeColor: '#E1EFFF',
  nodeStrokeColor: '#0056B3',
  edgeWidth: 3,
  edgeGap: 40,
  edgeColor: '#cccccc',
  pathWidth: 6,
  pathColor: '#0056B3'
});

// Hàm xử lý thêm node ngẫu nhiên
const handleAddNode = (id) => {
   if (!myGraph.nodes[id]) {
     const randomX = Math.random() * 400 + 50;
     const randomY = Math.random() * 400 + 50;
     myGraph.addNode(id, id, randomX, randomY);
     layouts.nodes[id] = { x: randomX, y: randomY };
   }
};

// Hàm tạo đỉnh mới từ shift+click trên canvas
const handleCreateNodeFromCanvas = (coords) => {
  // Sinh tên đỉnh tự động
  const nodeName = myGraph.generateNodeName(nextNodeIndex.value);
  
  // Lấy tọa độ SVG đã được translate từ DOM
  const nodeX = Math.round(coords.x);
  const nodeY = Math.round(coords.y);
  
  // Thêm node vào graph
  myGraph.addNode(nodeName, nodeName, nodeX, nodeY);
  
  // QUAN TRỌNG: Cập nhật layouts với fixed: true để giữ vị trí tại click point
  layouts.nodes[nodeName] = { x: nodeX, y: nodeY, fixed: true };
  
  // Tăng chỉ số đỉnh tiếp theo
  nextNodeIndex.value++;
  
  console.log(`New node created: ${nodeName} at SVG coordinates (${nodeX}, ${nodeY})`);
};

// Hàm thêm cạnh mới từ canvas (Shift + Click 2 node)
const handleCreateEdgeFromCanvas = ({ source, target, weight }) => {
  const edgeId = `edge_${Date.now()}`;
  myGraph.addEdge(edgeId, source, target, weight);
  console.log(`New edge created from canvas: ${source} -> ${target} (weight: ${weight})`);
};

// Hàm thêm cạnh mới
const handleAddEdge = (e) => {
   const edgeId = `edge_${Date.now()}`;
   myGraph.addEdge(edgeId, e.s, e.t, e.w);
};

// Hàm Import đồ thị
const handleImportGraph = (graphData) => {
  graphData.nodes.forEach(nodeId => {
    handleAddNode(nodeId); 
  });
  graphData.edges.forEach((edge, index) => {
    const edgeId = `edge_${edge.s}_${edge.t}_${index}`;
    myGraph.addEdge(edgeId, edge.s, edge.t, edge.w);
  });
};

// Biến trạng thái chạy thuật toán
const isRun = ref(false); 

const runAlgorithm = () => {
  isRun.value = true;
  console.log("Đã nhận lệnh chạy Dijkstra từ InputView!");
};

// Cập nhật graph config từ AnotherSet
const handleUpdateGraphConfig = (newConfig) => {
  Object.assign(graphConfig, newConfig);
  console.log("Graph config updated:", graphConfig);
};

// Reset thuật toán khi đổi điểm bắt đầu hoặc kết thúc
watch(() => [search.start, search.end], () => {
  isRun.value = false; // Ẩn đường đi cũ khi đổi điểm khác
});

// Tính toán kết quả Dijkstra
const result = computed(() => {
   if (Object.keys(myGraph.nodes).length === 0 || !myGraph.nodes[search.start] || !isRun.value) {
      return { path: [], pathEdges: [], totalDistance: 0 };
   }

   const dijkstraResult = myGraph.dijkstra(search.start, search.end);
   const pathNodes = dijkstraResult.path;
   const pathEdges = [];

   // Chuyển mảng ID đỉnh thành mảng ID cạnh
   for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i];
      const v = pathNodes[i+1];
      
      const edgeId = Object.keys(myGraph.edges).find(id => {
         const e = myGraph.edges[id];
         return (e.source === u && e.target === v) || (e.source === v && e.target === u);
      });
      
      if (edgeId) {
          pathEdges.push(edgeId);
      }
   }

   const totalDist = dijkstraResult.distances[search.end];

   return {
      path: pathNodes,
      pathEdges: pathEdges,
      totalDistance: totalDist === Infinity ? 0 : totalDist
   };
});
</script>

<style>
:root {
  --bg-color: #FFFFFF;
  --text-main: #1A1A1B;
  --primary-color: #0056B3;
  --accent-color: #E1EFFF;
  --border-color: #dee2e6;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.card-component {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  overflow: auto;
}

.card-header-component {
  background-color: var(--accent-color);
  color: var(--primary-color);
  font-weight: 700;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
}

.btn-primary-custom {
  background-color: var(--primary-color);
  border: none;
  color: white;
  transition: transform 0.1s;
}

.btn-primary-custom:hover {
  background-color: #004494;
  color: white;
  transform: translateY(-1px);
}

.btn-outline-custom {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-custom:hover {
  background-color: var(--accent-color);
  color: var(--primary-color);
}

.graph-wrapper {
  flex-grow: 1;
  min-height: 0;
  background-image: radial-gradient(#d1d1d1 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.path-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
}

/* App Layout Fixes */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.app-main-container > .row {
  flex: 1;
  min-height: 0;
  margin: 0;
}

.app-input-panel,
.app-graph-panel,
.app-side-panel {
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-input-panel {
  border-right: 1px solid var(--border-color);
}

.app-side-panel {
  border-left: 1px solid var(--border-color);
}

.graph-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.graph-card {
  flex: 1;
  min-height: 0;
}
</style>