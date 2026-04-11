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
        <GraphCanvas 
          ref="graphCanvasRef"
          :nodes="myGraph.nodes"
          :edges="myGraph.edges"
          :layouts="layouts"
          :path-ids="result.pathEdges"
          :graph-config="graphConfig"
          :is-directed="isDirected" v-model:selectedNodes="selectedNodes"
          v-model:selectedEdges="selectedEdges"
          @create-node="handleCreateNodeFromCanvas"
          @create-edge="handleCreateEdgeFromCanvas"
        />
        <NavBar 
          :start="search.start"
          :end="search.end"
          v-model:isDirected="isDirected"
          v-model:isFixed="isFixed"
          @run-algorithm="runAlgorithm"
          @delete-all="handleDeleteAll"
          @export-graph="handleExportGraph"
          @fix-nodes="handleFixAllNodes"
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
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import debounce from 'lodash/debounce'; // <-- Thêm lodash debounce
import InputView from './components/InputView2.vue';
import GraphCanvas from './components/GraphCanvas.vue';
import AnotherSet from './components/AnotherSet.vue';
import NavBar from './components/NavBar.vue';
import ConnectedComponents from './components/ConnectedComponents.vue'; 
import { Graph } from './Graph.js'; 

const currentPage = ref(1);
const showAnotherSet = ref(false);

const myGraph = reactive(new Graph());
const isDirected = ref(false); // State cho ha đồ thị có hướng/vô hướng
const isFixed = ref(true); // State cho cố định / trôi tự do các node
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

const isLoaded = ref(false); // Cờ kiểm tra đã load data lần đầu chưa

// --- LOGIC AUTO-SAVE & RESTORE ---

// Gom nhóm dữ liệu cần lưu
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

// Hàm khôi phục dữ liệu từ file
const restoreState = (savedData) => {
  if (!savedData) return;

  // Xóa sạch graph cũ
  Object.keys(myGraph.nodes).forEach(id => delete myGraph.nodes[id]);
  Object.keys(myGraph.edges).forEach(id => delete myGraph.edges[id]);
  Object.keys(layouts.nodes).forEach(id => delete layouts.nodes[id]);

  // Nạp lại Nodes
  if (savedData.nodes) {
    Object.values(savedData.nodes).forEach(n => {
      myGraph.addNode(n.id, n.name, n.x, n.y);
      if (n.fixed) myGraph.fixNodePosition(n.id);
    });
  }

  // Nạp lại Edges
  if (savedData.edges) {
    Object.values(savedData.edges).forEach(e => {
      myGraph.addEdge(e.id, e.source, e.target, e.weight);
    });
  }

  // Nạp lại Layouts (tọa độ canvas)
  if (savedData.layouts) {
    Object.assign(layouts.nodes, savedData.layouts);
  }

  // Nạp lại cài đặt khác
  if (savedData.search) {
    search.start = savedData.search.start || "";
    search.end = savedData.search.end || "";
  }
  if (savedData.graphConfig) {
    Object.assign(graphConfig, savedData.graphConfig);
  }
  if (savedData.isDirected !== undefined) {
    isDirected.value = savedData.isDirected;
    myGraph.isDirected = savedData.isDirected;
  }
  if (savedData.isFixed !== undefined) {
    isFixed.value = savedData.isFixed;
  }
  if (savedData.nextNodeIndex !== undefined) {
    nextNodeIndex.value = savedData.nextNodeIndex;
  }
};

// Hàm Auto Save (Debounce 1 giây)
const debouncedSave = debounce(async () => {
  if (window.electronAPI) {
    const data = getSaveState();
    await window.electronAPI.saveGraph(data);
    console.log("Đã auto-save trạng thái.");
  }
}, 1000);

// Theo dõi mọi thay đổi trong đồ thị để kích hoạt save
watch(
  () => [myGraph.nodes, myGraph.edges, layouts.nodes, search, graphConfig, isDirected.value, isFixed.value],
  () => {
    // Chỉ save khi hệ thống đã load xong file cấu hình ban đầu
    if (isLoaded.value) {
      debouncedSave();
    }
  },
  { deep: true }
);

// Watch sự thay đổi của isDirected để cập nhật graph và reset kết quả
watch(isDirected, (newVal) => {
  myGraph.isDirected = newVal;
  isRun.value = false; // Reset kết quả thuật toán khi đổi mode
});

// Watch sự thay đổi của isFixed để cập nhật trạng thái fixed của tất cả nodes
watch(isFixed, (newVal) => {
  Object.keys(layouts.nodes).forEach(nodeId => {
    layouts.nodes[nodeId].fixed = newVal;
  });
});

// --- CÁC HÀM XỬ LÝ SỰ KIỆN CŨ ---

const handleAddNode = (id, shouldFix = null) => {
   if (!myGraph.nodes[id]) {
     const randomX = Math.random() * 400 + 50;
     const randomY = Math.random() * 400 + 50;
     myGraph.addNode(id, id, randomX, randomY);
     // Nếu shouldFix không chỉ định, dùng trạng thái isFixed hiện tại
     const fixed = shouldFix !== null ? shouldFix : isFixed.value;
     layouts.nodes[id] = { x: randomX, y: randomY, fixed: fixed };
     nextNodeIndex.value = myGraph.getNextNodeIndex();
   }
};

const handleCreateNodeFromCanvas = (coords) => {
  const nodeName = myGraph.generateNodeName(nextNodeIndex.value);
  const nodeX = Math.round(coords.x);
  const nodeY = Math.round(coords.y);
  
  myGraph.addNode(nodeName, nodeName, nodeX, nodeY);
  layouts.nodes[nodeName] = { x: nodeX, y: nodeY, fixed: isFixed.value };
  nextNodeIndex.value = myGraph.getNextNodeIndex();
};

const handleCreateEdgeFromCanvas = ({ source, target, weight }) => {
  const edgeId = `edge_${Date.now()}`;
  myGraph.addEdge(edgeId, source, target, weight);
};

const handleAddEdge = (e) => {
   const edgeId = `edge_${Date.now()}`;
   myGraph.addEdge(edgeId, e.s, e.t, e.w);
};

const handleImportGraph = (graphData) => {
  graphData.nodes.forEach(nodeId => {
    handleAddNode(nodeId, false); // Import node không bị fixed, để chúng trôi
  });
  graphData.edges.forEach((edge, index) => {
    const edgeId = `edge_${edge.s}_${edge.t}_${index}`;
    myGraph.addEdge(edgeId, edge.s, edge.t, edge.w);
  });
  nextNodeIndex.value = myGraph.getNextNodeIndex();
};

const isRun = ref(false); 

const runAlgorithm = () => {
  isRun.value = true;
};

const handleDeleteAll = () => {
  Object.keys(myGraph.nodes).forEach(id => delete myGraph.nodes[id]);
  Object.keys(myGraph.edges).forEach(id => delete myGraph.edges[id]);
  Object.keys(layouts.nodes).forEach(id => delete layouts.nodes[id]);

  nextNodeIndex.value = 0; 
  selectedNodes.value = [];
  selectedEdges.value = [];
  isRun.value = false;
};

const handleUpdateGraphConfig = (newConfig) => {
  Object.assign(graphConfig, newConfig);
};

watch(() => [search.start, search.end], () => {
  isRun.value = false;
});

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
      nextNodeIndex.value = myGraph.getNextNodeIndex();
    }
  }
};

// --- XỬ LÝ SỰ KIỆN KHI NGƯỜI DÙNG ĐÓNG APP ---
const handleBeforeUnload = () => {
  // Bỏ qua thời gian chờ 1 giây, ép thực thi lệnh save ngay lập tức
  debouncedSave.flush(); 
};

// --- LIFECYCLE HOOKS ---

onMounted(async () => {
  window.addEventListener('keydown', handleDeleteKey);
  window.addEventListener('beforeunload', handleBeforeUnload); // Bắt sự kiện tắt app

  // Thử load trạng thái từ phiên trước
  if (window.electronAPI) {
    try {
      const savedData = await window.electronAPI.loadGraph();
      if (savedData) {
         restoreState(savedData);
      }
    } catch (error) {
      console.error("Lỗi khởi tạo state:", error);
    }
  } else {
    // Nếu in ra dòng này trên F12, nghĩa là preload.js chưa chạy!
    console.error("CẢNH BÁO: Không tìm thấy window.electronAPI. Vui lòng kiểm tra lại đường dẫn file preload.js trong file main.js!");
  }
  
  // Dùng nextTick để đợi Vue cập nhật DOM xong xuôi quá trình Restore
  await nextTick();
  // Đánh dấu đã load xong để Watcher bắt đầu theo dõi auto-save từ thao tác tiếp theo
  isLoaded.value = true;
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleDeleteKey);
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// --- COMPUTEDS ---

const connectedComponentsList = computed(() => {
  const nodeCount = Object.keys(myGraph.nodes).length;
  const edgeCount = Object.keys(myGraph.edges).length;
  if (nodeCount === 0) return [];
  
  return myGraph.getConnectedComponents();
});

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
const graphCanvasRef = ref(null);
const handleExportGraph = (format) => {
  if (graphCanvasRef.value) {
    graphCanvasRef.value.exportGraph(format);
  }
};
</script>

<style>
/* CSS giữ nguyên như code cũ của bạn */
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
  min-height: 0;
  height: 100%;
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