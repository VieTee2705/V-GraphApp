<!-- //App.vue -->
<template>
  <div class="container-fluid app-main-container">
    <!-- Header Điều hướng -->
    <header class="app-header d-flex justify-content-between align-items-center px-4 py-2 border-bottom shadow-sm">
      <div class="d-flex align-items-center gap-4">
        <h5 class="mb-0 text-primary fw-bold"><i class="fas fa-network-wired me-2"></i>V-Graph</h5>
        <ul class="nav nav-pills">
          <li class="nav-item">
            <button class="nav-link fw-bold" :class="{ active: currentPage === 1 }" @click="currentPage = 1">
              <i class="fas fa-draw-polygon me-1"></i> Đồ thị & Thuật toán
            </button>
          </li>
          <li class="nav-item ms-2">
            <button class="nav-link fw-bold" :class="{ active: currentPage === 2 }" @click="currentPage = 2">
              <i class="fas fa-layer-group me-1"></i> Bộ phận liên thông
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
      
      <!-- Cột Trái: Input / PseudoCode điều khiển bằng Tabs -->
      <div class="col-3 app-input-panel d-flex flex-column">
        <!-- Nút chuyển đổi Tab -->
        <div class="nav nav-pills nav-fill mb-3" role="tablist">
          <button 
            class="nav-link fw-bold border" 
            :class="{ 'active': leftPanelTab === 'input', 'text-primary': leftPanelTab !== 'input' }" 
            @click="leftPanelTab = 'input'" 
            style="border-radius: 8px 0 0 8px;">
            <i class="fas fa-edit me-1"></i> Nhập liệu
          </button>
          <button 
            class="nav-link fw-bold border" 
            :class="{ 'active': leftPanelTab === 'pseudo', 'text-primary': leftPanelTab !== 'pseudo' }" 
            @click="leftPanelTab = 'pseudo'" 
            style="border-radius: 0 8px 8px 0; margin-left: -1px;">
            <i class="fas fa-code me-1"></i> Mã giả
          </button>
        </div>

        <!-- Nội dung Tab -->
        <div class="flex-grow-1" style="overflow-y: auto; overflow-x: hidden;">
          <InputView 
            v-show="leftPanelTab === 'input'"
            :nodes="myGraph.nodes" 
            v-model:start="search.start"
            v-model:end="search.end"
            @add-node="handleAddNode"
            @add-edge="handleAddEdge"
            @import-graph="handleImportGraph"
            @run-algorithm="runAlgorithm"
          />
          <PseudoCode 
            v-show="leftPanelTab === 'pseudo'"
            :step="animStepType" 
            :u="animCurrentNode" 
            :v="animNeighborNode" 
            :w="animEdgeWeight" 
            :piU="animPiU" 
            :piV="animPiV" 
          />
        </div>
      </div>
      
      <!-- Graph Canvas có thể co giãn linh hoạt khi bật/tắt AnotherSet -->
      <div :class="showAnotherSet ? 'col-6' : 'col-9'" class="app-graph-panel transition-width">
        <GraphCanvas 
          ref="graphCanvasRef"
          :nodes="myGraph.nodes"
          :edges="myGraph.edges"
          :layouts="layouts"
          :graph-config="graphConfig"
          :is-directed="isDirected" 
          v-model:selectedNodes="selectedNodes"
          v-model:selectedEdges="selectedEdges"
          :anim-current-node="animCurrentNode"
          :anim-neighbor-node="animNeighborNode"
          :anim-visited-nodes="animVisitedNodes"
          :anim-path-edges="animPathEdges"
          @create-node="handleCreateNodeFromCanvas"
          @create-edge="handleCreateEdgeFromCanvas"
        />
        <ToolBar 
          :start="search.start"
          :end="search.end"
          v-model:isDirected="isDirected"
          v-model:isFixed="isFixed"
          @run-algorithm="runAlgorithm"
          @delete-all="handleDeleteAll"
          @export-graph="handleExportGraph"
        />
      </div>

      <!-- Bảng AnotherSet được ẩn/hiện -->
      <div class="col-3 app-side-panel slide-in-right" v-if="showAnotherSet">
        <SidePanel
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
        <ConnectedComponents 
          :components="connectedComponentsList" 
          :isDirected="isDirected" 
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import debounce from 'lodash/debounce';
import InputView from './components/InputView2.vue';
import GraphCanvas from './components/GraphCanvas.vue';
import SidePanel from './components/SidePanel.vue';
import ToolBar from './components/ToolBar.vue';
import ConnectedComponents from './components/ConnectedComponents.vue'; 
import PseudoCode from './components/PseudoCode.vue';
import { Graph } from './Graph.js'; 

const currentPage = ref(1);
const showAnotherSet = ref(false);
const leftPanelTab = ref('input'); // State quản lý tab cột trái ('input' hoặc 'pseudo')

const myGraph = reactive(new Graph());
const isDirected = ref(false);
const isFixed = ref(true);
const nextNodeIndex = ref(0);
const layouts = reactive({ nodes: {} });
const selectedNodes = ref([]);
const selectedEdges = ref([]);

const search = reactive({ start: "A", end: "D" });

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

const isLoaded = ref(false);

// --- ANIMATION STATE ---
const animState = ref('idle'); // idle, playing, done
const animCurrentNode = ref(null);
const animNeighborNode = ref(null);
const animVisitedNodes = ref(new Set());
const animPathEdges = ref([]);
const animStepType = ref('idle');
const animEdgeWeight = ref(0);
const animPiU = ref(Infinity);
const animPiV = ref(Infinity);
let animationTimer = null;

// Đối tượng result reactive để đồng bộ với AnotherSet Component
const result = reactive({
  path: [],
  pathEdges: [],
  totalDistance: 0,
  distances: {}
});

// Hàm dừng animation
const stopAnimation = () => {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
};

// Hàm Reset các state animation
const resetAnimationState = () => {
  stopAnimation();
  animState.value = 'idle';
  animCurrentNode.value = null;
  animNeighborNode.value = null;
  animVisitedNodes.value.clear();
  animPathEdges.value = [];
  animStepType.value = 'idle';
  animEdgeWeight.value = 0;
  animPiU.value = Infinity;
  animPiV.value = Infinity;
  result.path = [];
  result.pathEdges = [];
  result.totalDistance = 0;
  result.distances = {};
};

// --- LOGIC AUTO-SAVE & RESTORE ---
const getSaveState = () => {
  return JSON.parse(JSON.stringify({
    nodes: myGraph.nodes,
    edges: myGraph.edges,
    layouts: layouts.nodes,
    search: { start: search.start, end: search.end },
    graphConfig: graphConfig,
    isDirected: isDirected.value,
    isFixed: isFixed.value,
    nextNodeIndex: nextNodeIndex.value
  }));
};

const restoreState = (savedData) => {
  if (!savedData) return;
  Object.keys(myGraph.nodes).forEach(id => delete myGraph.nodes[id]);
  Object.keys(myGraph.edges).forEach(id => delete myGraph.edges[id]);
  Object.keys(layouts.nodes).forEach(id => delete layouts.nodes[id]);

  if (savedData.nodes) {
    Object.values(savedData.nodes).forEach(n => {
      myGraph.addNode(n.id, n.name, n.x, n.y);
      if (n.fixed) myGraph.fixNodePosition(n.id);
    });
  }

  if (savedData.edges) {
    Object.values(savedData.edges).forEach(e => {
      myGraph.addEdge(e.id, e.source, e.target, e.weight);
    });
  }

  if (savedData.layouts) Object.assign(layouts.nodes, savedData.layouts);
  if (savedData.search) {
    search.start = savedData.search.start || "";
    search.end = savedData.search.end || "";
  }
  if (savedData.graphConfig) Object.assign(graphConfig, savedData.graphConfig);
  if (savedData.isDirected !== undefined) {
    isDirected.value = savedData.isDirected;
    myGraph.isDirected = savedData.isDirected;
  }
  if (savedData.isFixed !== undefined) isFixed.value = savedData.isFixed;
  if (savedData.nextNodeIndex !== undefined) nextNodeIndex.value = savedData.nextNodeIndex;
};

const debouncedSave = debounce(async () => {
  if (window.electronAPI) {
    const data = getSaveState();
    await window.electronAPI.saveGraph(data);
    console.log("Đã auto-save trạng thái.");
  }
}, 1000);

watch(
  () => [myGraph.nodes, myGraph.edges, layouts.nodes, search, graphConfig, isDirected.value, isFixed.value],
  () => { if (isLoaded.value) debouncedSave(); },
  { deep: true }
);

watch(isDirected, (newVal) => {
  myGraph.isDirected = newVal;
  resetAnimationState();
});

watch(isFixed, (newVal) => {
  Object.keys(layouts.nodes).forEach(nodeId => { layouts.nodes[nodeId].fixed = newVal; });
});

watch(() => [search.start, search.end], () => {
  resetAnimationState();
});

// --- CÁC HÀM XỬ LÝ SỰ KIỆN CANVAS ---
const handleAddNode = (id, shouldFix = null) => {
   if (!myGraph.nodes[id]) {
     const randomX = Math.random() * 400 + 50;
     const randomY = Math.random() * 400 + 50;
     myGraph.addNode(id, id, randomX, randomY);
     const fixed = shouldFix !== null ? shouldFix : isFixed.value;
     layouts.nodes[id] = { x: randomX, y: randomY, fixed: fixed };
     nextNodeIndex.value = myGraph.getNextNodeIndex();
   }
};

const handleCreateNodeFromCanvas = (coords) => {
  const nodeName = myGraph.generateNodeName(nextNodeIndex.value);
  myGraph.addNode(nodeName, nodeName, Math.round(coords.x), Math.round(coords.y));
  layouts.nodes[nodeName] = { x: Math.round(coords.x), y: Math.round(coords.y), fixed: isFixed.value };
  nextNodeIndex.value = myGraph.getNextNodeIndex();
};

const handleCreateEdgeFromCanvas = ({ source, target, weight }) => {
  myGraph.addEdge(`edge_${Date.now()}`, source, target, weight);
};

const handleAddEdge = (e) => {
   myGraph.addEdge(`edge_${Date.now()}`, e.s, e.t, e.w);
};

const handleImportGraph = (graphData) => {
  graphData.nodes.forEach(nodeId => handleAddNode(nodeId, false));
  graphData.edges.forEach((edge, index) => myGraph.addEdge(`edge_${edge.s}_${edge.t}_${index}`, edge.s, edge.t, edge.w));
  nextNodeIndex.value = myGraph.getNextNodeIndex();
};

const handleDeleteAll = () => {
  resetAnimationState();
  Object.keys(myGraph.nodes).forEach(id => delete myGraph.nodes[id]);
  Object.keys(myGraph.edges).forEach(id => delete myGraph.edges[id]);
  Object.keys(layouts.nodes).forEach(id => delete layouts.nodes[id]);
  nextNodeIndex.value = 0; 
  selectedNodes.value = [];
  selectedEdges.value = [];
};

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
      resetAnimationState();
      nextNodeIndex.value = myGraph.getNextNodeIndex();
    }
  }
};

const handleUpdateGraphConfig = (newConfig) => Object.assign(graphConfig, newConfig);

// --- HÀM CHẠY THUẬT TOÁN (ANIMATION) ---
const runAlgorithm = () => {
  if (Object.keys(myGraph.nodes).length === 0 || !myGraph.nodes[search.start]) return;

  // Tự động chuyển tab sang Mã giả khi bắt đầu chạy thuật toán
  leftPanelTab.value = 'pseudo'; 

  resetAnimationState();
  animState.value = 'playing';

  // Khởi tạo Generator
  const generator = myGraph.dijkstraGenerator(search.start, search.end);

  // Vòng lặp animation mỗi 500ms
  animationTimer = setInterval(() => {
    const step = generator.next();
    
    if (step.done) {
      stopAnimation();
      animState.value = 'done';
      animStepType.value = 'DONE';
      return;
    }

    const state = step.value;
    animStepType.value = state.type;
    
    switch(state.type) {
      case 'INIT':
        Object.assign(result.distances, state.distances);
        animVisitedNodes.value = new Set(state.visited);
        break;
      case 'CURRENT_NODE':
        animCurrentNode.value = state.currNodeId;
        animNeighborNode.value = null; // Xóa neighbor cũ
        animPiU.value = state.distances[state.currNodeId];
        Object.assign(result.distances, state.distances);
        break;
      case 'CHECKING_NEIGHBOR':
        animNeighborNode.value = state.neighborId;
        const edgeId = Object.keys(myGraph.edges).find(id => {
          const e = myGraph.edges[id];
          return (e.source === state.currNodeId && e.target === state.neighborId) || 
                 (!isDirected.value && e.source === state.neighborId && e.target === state.currNodeId);
        });
        animEdgeWeight.value = edgeId ? myGraph.edges[edgeId].weight : 0;
        animPiV.value = result.distances[state.neighborId];
        break;
      case 'UPDATED_DISTANCE':
        Object.assign(result.distances, state.distances);
        animPiV.value = state.distances[state.neighborId]; // Cập nhật ngay giá trị mới để highlight hiển thị kịp thời
        break;
      case 'VISITED':
        animVisitedNodes.value.add(state.currNodeId);
        animCurrentNode.value = null;
        animNeighborNode.value = null;
        break;
      case 'DONE':
        // SỬA TẠI ĐÂY: Lấy trực tiếp mảng cung tối ưu từ thuật toán trả về
        animPathEdges.value = state.pathEdges;
        result.path = state.path;
        result.pathEdges = state.pathEdges;
        result.totalDistance = state.distances[search.end] !== Infinity ? state.distances[search.end] : 0;
        break;
    }
  }, 500); // Tốc độ animation: 500ms/bước
};

// --- LIFECYCLE ---
const handleBeforeUnload = () => debouncedSave.flush(); 

onMounted(async () => {
  window.addEventListener('keydown', handleDeleteKey);
  window.addEventListener('beforeunload', handleBeforeUnload);

  if (window.electronAPI) {
    try {
      const savedData = await window.electronAPI.loadGraph();
      if (savedData) restoreState(savedData);
    } catch (error) { console.error("Lỗi khởi tạo state:", error); }
  }
  await nextTick();
  isLoaded.value = true;
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleDeleteKey);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  stopAnimation();
});

// --- COMPUTEDS CHO TRANG 2 ---
const connectedComponentsList = computed(() => {
  // MẸO: Truy cập các giá trị này để ép Vue tạo dependency. 
  // Mỗi khi số lượng đỉnh, số cạnh, hoặc chế độ có hướng thay đổi, computed sẽ tự chạy lại.
  const _trackNodesCount = Object.keys(myGraph.nodes).length;
  const _trackEdgesCount = Object.keys(myGraph.edges).length;
  const _trackDirected = isDirected.value;

  if (_trackNodesCount === 0) return [];
  
  return myGraph.getConnectedComponents();
});

const graphCanvasRef = ref(null);
const handleExportGraph = (format) => {
  if (graphCanvasRef.value) graphCanvasRef.value.exportGraph(format);
};
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

.row.flex-grow-1 {
  min-height: 0;
  height: 100%;
  display: flex;
}

.slide-in-right {
  animation: slideInRight 0.3s forwards;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.app-input-panel,
.app-graph-panel,
.app-side-panel {
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.app-input-panel { border-right: 1px solid var(--border-color); }
.app-side-panel { border-left: 1px solid var(--border-color); }

.graph-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}
</style>