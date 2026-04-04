<!-- //App.vue -->
<template>
  <div class="container-fluid app-main-container">
    <!-- Header Điều hướng -->
    <header class="app-header d-flex justify-content-between align-items-center px-4 py-2 border-bottom shadow-sm">
      <div class="d-flex align-items-center gap-4">
        <h5 class="mb-0 text-primary fw-bold"><i class="fas fa-network-wired me-2"></i>Graph Algo</h5>
        <ul class="nav nav-pills">
          <li class="nav-item">
            <button class="nav-link fw-bold" :class="{ active: currentPage === 1 }" @click="currentPage = 1">
              <i class="fas fa-draw-polygon me-1"></i> Trang 1: Đồ thị & Thuật toán
            </button>
          </li>
          <li class="nav-item ms-2">
            <button class="nav-link fw-bold" :class="{ active: currentPage === 2 }" @click="currentPage = 2">
              <i class="fas fa-layer-group me-1"></i> Trang 2: Bộ phận liên thông
            </button>
          </li>
        </ul>
      </div>
      
      <!-- Nút kích hoạt AnotherSet ở Trang 1 -->
      <div v-if="currentPage === 1">
        <button class="btn btn-outline-primary btn-sm fw-bold d-flex align-items-center gap-2" @click="showAnotherSet = !showAnotherSet">
          <i class="fas" :class="showAnotherSet ? 'fa-eye-slash' : 'fa-cog'"></i>
          {{ showAnotherSet ? 'Đóng cài đặt' : 'Mở cài đặt' }}
        </button>
      </div>
    </header>

    <!-- TRANG 1: Đồ thị & Thuật toán -->
    <div class="row flex-grow-1 m-0 h-100" v-if="currentPage === 1" style="min-height: 0;">
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
      
      <!-- Graph Canvas có thể co giãn linh hoạt khi bật/tắt AnotherSet -->
      <div :class="showAnotherSet ? 'col-6' : 'col-9'" class="app-graph-panel transition-width">
        <div class="graph-container">
          <GraphCanvas 
            :nodes="myGraph.nodes"
            :edges="myGraph.edges"
            :layouts="layouts"
            :path-ids="result.pathEdges"
            :graph-config="graphConfig"
            v-model:selectedNodes="selectedNodes"
            v-model:selectedEdges="selectedEdges"
            @create-node="handleCreateNodeFromCanvas"
            @create-edge="handleCreateEdgeFromCanvas"
          />
        </div>
        <NavBar 
          :start="search.start"
          :end="search.end"
          @run-algorithm="runAlgorithm"
          @delete-all="handleDeleteAll"
        />
      </div>

      <!-- Bảng AnotherSet được ẩn/hiện -->
      <div class="col-3 app-side-panel slide-in-right" v-if="showAnotherSet">
        <AnotherSet
          :result="result"
          :start="search.start"
          :end="search.end"
          :graph-config="graphConfig"
          @update-config="handleUpdateGraphConfig"
        />
      </div>
    </div>

    <!-- TRANG 2: Bộ phận liên thông -->
    <div class="row flex-grow-1 m-0 p-4" v-if="currentPage === 2" style="background-color: #f8f9fa; min-height: 0; overflow-y: auto;">
      <div class="col-12 col-lg-8 mx-auto" style="height: 100%;">
        <ConnectedComponents :components="connectedComponentsList" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import InputView from './components/InputView2.vue';
import GraphCanvas from './components/GraphCanvas.vue';
import AnotherSet from './components/AnotherSet.vue';
import NavBar from './components/NavBar.vue';
import ConnectedComponents from './components/ConnectedComponents.vue'; 
import { Graph } from './Graph.js'; 

// Quản lý state cho Điều hướng trang
const currentPage = ref(1);
const showAnotherSet = ref(false);

// Khởi tạo đối tượng đồ thị thực sự từ class và bọc trong reactive
const myGraph = reactive(new Graph());

// Theo dõi chỉ số đỉnh tiếp theo
const nextNodeIndex = ref(0);

// State để quản lý tọa độ của các node
const layouts = reactive({
  nodes: {}
});

// State lưu trữ các đỉnh và cạnh đang được click chọn trên Canvas
const selectedNodes = ref([]);
const selectedEdges = ref([]);

// Thêm sẵn một vài dữ liệu mẫu
myGraph.addNode("A", "A", 100, 150);
myGraph.addNode("B", "B", 300, 50);
myGraph.addNode("C", "C", 300, 250);
myGraph.addNode("D", "D", 500, 150);
nextNodeIndex.value = 4;

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
  const nodeName = myGraph.generateNodeName(nextNodeIndex.value);
  const nodeX = Math.round(coords.x);
  const nodeY = Math.round(coords.y);
  
  myGraph.addNode(nodeName, nodeName, nodeX, nodeY);
  layouts.nodes[nodeName] = { x: nodeX, y: nodeY, fixed: true };
  nextNodeIndex.value++;
};

// Hàm thêm cạnh mới từ canvas (Shift + Click 2 node)
const handleCreateEdgeFromCanvas = ({ source, target, weight }) => {
  const edgeId = `edge_${Date.now()}`;
  myGraph.addEdge(edgeId, source, target, weight);
};

// Hàm thêm cạnh mới từ InputView
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
};

// --- XÓA TOÀN BỘ ĐỒ THỊ ---
const handleDeleteAll = () => {
  // Xóa sạch dữ liệu trong graph object
  Object.keys(myGraph.nodes).forEach(id => delete myGraph.nodes[id]);
  Object.keys(myGraph.edges).forEach(id => delete myGraph.edges[id]);
  
  // Xóa sạch dữ liệu tọa độ của component hiển thị
  Object.keys(layouts.nodes).forEach(id => delete layouts.nodes[id]);

  // Đặt lại các biến trạng thái
  nextNodeIndex.value = 0; // Trở lại tạo đỉnh 'A'
  selectedNodes.value = [];
  selectedEdges.value = [];
  isRun.value = false;
  
  console.log("Đã xóa toàn bộ đồ thị.");
};

// Cập nhật graph config
const handleUpdateGraphConfig = (newConfig) => {
  Object.assign(graphConfig, newConfig);
};

// Reset thuật toán khi đổi điểm bắt đầu hoặc kết thúc
watch(() => [search.start, search.end], () => {
  isRun.value = false;
});

// --- LẮNG NGHE SỰ KIỆN XÓA (DELETE / BACKSPACE) ---
const handleDeleteKey = (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea') return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    let hasChanges = false;

    if (selectedEdges.value.length > 0) {
      selectedEdges.value.forEach(edgeId => myGraph.removeEdge(edgeId));
      selectedEdges.value = [];
      hasChanges = true;
    }

    if (selectedNodes.value.length > 0) {
      selectedNodes.value.forEach(nodeId => {
        myGraph.removeNode(nodeId);
        delete layouts.nodes[nodeId];
      });
      selectedNodes.value = [];
      hasChanges = true;
    }

    if (hasChanges) {
      isRun.value = false;
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleDeleteKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleDeleteKey);
});

// --- TÍNH TOÁN CÁC BỘ PHẬN LIÊN THÔNG ---
const connectedComponentsList = computed(() => {
  const nodeCount = Object.keys(myGraph.nodes).length;
  const edgeCount = Object.keys(myGraph.edges).length;
  if (nodeCount === 0) return [];
  
  return myGraph.getConnectedComponents();
});

// Tính toán kết quả Dijkstra
const result = computed(() => {
   if (Object.keys(myGraph.nodes).length === 0 || !myGraph.nodes[search.start] || !isRun.value) {
      return { path: [], pathEdges: [], totalDistance: 0 };
   }

   const dijkstraResult = myGraph.dijkstra(search.start, search.end);
   const pathNodes = dijkstraResult.path;
   const pathEdges = [];

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

/* Các thuộc tính thẻ Card */
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

.app-header {
  background-color: var(--bg-color);
  z-index: 10;
}

.nav-pills .nav-link {
  color: var(--text-main);
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-pills .nav-link.active {
  background-color: var(--accent-color);
  color: var(--primary-color);
}

.transition-width {
  transition: width 0.3s ease-in-out;
}

.slide-in-right {
  animation: slideInRight 0.3s forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
</style>