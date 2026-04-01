<template>
  <div class="card-component graph-card">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-network-wired me-2"></i>Trực Quan Hóa Đồ Thị</span>
      <span class="badge bg-white text-primary border border-primary">Shift + Click để thêm đỉnh / Nối cạnh</span>
    </div>
    <div class="card-body p-0 graph-wrapper position-relative">
      <v-network-graph
        ref="graphRef"
        :nodes="nodes"
        :edges="edges"
        :layouts="layouts"
        :configs="configs"
        :paths="pathData"
        :event-handlers="eventHandlers"
        v-model:selected-nodes="selectedNodesModel"
        v-model:selected-edges="selectedEdgesModel"
      >
        <template #edge-label="{ edge, ...slotProps }">
          <v-edge-label
            :text="String(edge.weight)"
            :align="'center'"
            :vertical-align="'above'"
            v-bind="slotProps"
            style="font-size: 14px; font-weight: bold; fill: #1A1A1B;"
          />
        </template>
      </v-network-graph>

      <!-- Floating input for Edge weight -->
      <div v-if="showWeightInput" class="weight-input-overlay" :style="{ left: inputPos.x + 'px', top: inputPos.y + 'px' }">
        <input 
          ref="weightInputRef"
          type="number" 
          v-model.number="weightInputValue" 
          @keyup.enter="confirmEdge"
          @keyup.esc="cancelEdge"
          class="weight-input"
        />
        <span class="weight-hint">Enter để lưu</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch, nextTick } from 'vue';
import { ForceLayout } from 'v-network-graph/lib/force-layout';

const props = defineProps({
  nodes: {
    type: Object,
    required: true
  },
  edges: {
    type: Object,
    required: true
  },
  layouts: {
    type: Object,
    required: true
  },
  pathIds: {
    type: Array,
    default: () => []
  },
  graphConfig: {
    type: Object,
    default: () => ({})
  },
  selectedNodes: {
    type: Array,
    default: () => []
  },
  selectedEdges: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['create-node', 'create-edge', 'update:selectedNodes', 'update:selectedEdges']);

// Tạo computed để đồng bộ v-model hai chiều với component cha (App.vue)
const selectedNodesModel = computed({
  get: () => props.selectedNodes,
  set: (val) => emit('update:selectedNodes', val)
});

const selectedEdgesModel = computed({
  get: () => props.selectedEdges,
  set: (val) => emit('update:selectedEdges', val)
});

// Reference đến instance của v-network-graph để gọi các hàm API bên trong
const graphRef = ref(null);

// Trạng thái cho việc nối cạnh
const selectedSourceNode = ref(null);
const showWeightInput = ref(false);
const inputPos = reactive({ x: 0, y: 0 });
const pendingEdge = reactive({ source: '', target: '' });
const weightInputValue = ref(1);
const weightInputRef = ref(null);

// Xử lý các sự kiện tương tác
const eventHandlers = {
  "view:click": (payload) => {
    const mouseEvent = payload.event || payload;
    
    // Hủy quá trình nối cạnh / nhập liệu nếu click ra ngoài canvas
    if (showWeightInput.value) {
      cancelEdge();
      return;
    }
    selectedSourceNode.value = null;

    // Chỉ xử lý khi người dùng giữ phím Shift
    if (!mouseEvent.shiftKey) return;

    if (!graphRef.value) return;

    // 1. SỬA TẠI ĐÂY: Dùng offsetX và offsetY thay vì clientX và clientY
    const domPoint = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
    
    // 2. Chuyển đổi DOM point sang hệ tọa độ thực tế của đồ thị SVG (đã tính toán zoom/pan)
    const svgPoint = graphRef.value.translateFromDomToSvgCoordinates(domPoint);

    console.log(`Đã tính toán tọa độ SVG: x=${svgPoint.x}, y=${svgPoint.y}`);

    // Phát sự kiện lên component cha (App.vue) cùng với tọa độ chuẩn
    emit('create-node', { x: svgPoint.x, y: svgPoint.y });
  },
  "node:click": (payload) => {
    const mouseEvent = payload.event || payload.event;
    const nodeId = payload.node;
    
    if (showWeightInput.value) return; // Đang hiện ô nhập trọng số thì bỏ qua

    // Chỉ xử lý khi giữ phím Shift
    if (!mouseEvent.shiftKey) {
        selectedSourceNode.value = null;
        return;
    }

    if (!selectedSourceNode.value) {
      // Lần Shift+Click đầu tiên: Chọn đỉnh nguồn
      selectedSourceNode.value = nodeId;
    } else {
      // Lần Shift+Click thứ hai: Chọn đỉnh đích
      if (selectedSourceNode.value === nodeId) return; // Click trùng đỉnh cũ
      
      pendingEdge.source = selectedSourceNode.value;
      pendingEdge.target = nodeId;
      
      // Lấy tọa độ SVG của 2 đỉnh để tính trung điểm
      const sNode = props.layouts.nodes[pendingEdge.source];
      const tNode = props.layouts.nodes[pendingEdge.target];
      const svgMid = {
        x: (sNode.x + tNode.x) / 2,
        y: (sNode.y + tNode.y) / 2
      };
      
      // Chuyển trung điểm về tọa độ DOM để đặt ô Input nổi
      const domMid = graphRef.value.translateFromSvgToDomCoordinates(svgMid);
      inputPos.x = domMid.x;
      inputPos.y = domMid.y;
      
      weightInputValue.value = 1; // Reset trọng số mặc định
      showWeightInput.value = true;
      
      // Tự động focus vào ô input
      nextTick(() => {
        if (weightInputRef.value) weightInputRef.value.focus();
      });
      
      selectedSourceNode.value = null; // Xóa chọn nguồn để sẵn sàng cho lần sau
    }
  }
};

const confirmEdge = () => {
  console.log(`[GraphCanvas] Chuẩn bị thêm cạnh: ${pendingEdge.source} -> ${pendingEdge.target} | Trọng số: ${weightInputValue.value}`);
  
  if (pendingEdge.source && pendingEdge.target) {
    const edgeData = {
      source: pendingEdge.source,
      target: pendingEdge.target,
      weight: Number(weightInputValue.value) || 0
    };
    
    console.log('[GraphCanvas] Emit sự kiện create-edge với payload:', edgeData);
    emit('create-edge', edgeData);
  } else {
    console.warn('[GraphCanvas] Cảnh báo: Thiếu đỉnh source hoặc target khi thêm cạnh!', pendingEdge);
  }
  
  cancelEdge();
};

const cancelEdge = () => {
  showWeightInput.value = false;
  pendingEdge.source = '';
  pendingEdge.target = '';
};

// Khởi tạo cấu hình cho đồ thị
const createConfigs = () => {
  const cfg = props.graphConfig || {};
  return {
    view: {
      panEnabled: true,
      zoomEnabled: true,
      doubleClickZoomEnabled: true,
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: false,
        createSimulation: (d3, nodes, edges) => {
          const forceLink = d3
            .forceLink(edges)
            .id(d => d.id)
            .distance(cfg.distanceMin || 120);

          return d3
            .forceSimulation(nodes)
            .force('edge', forceLink)
            .force('charge', d3.forceManyBody().strength(cfg.chargeStrength || -400))
            .force('center', d3.forceCenter())
            .alphaMin(cfg.alphaMin || 0.001);
        }
      })
    },
    node: {
      selectable: true,
      normal: {
        radius: cfg.nodeRadius || 25,
        color: node => node.id === selectedSourceNode.value ? '#ffc107' : (cfg.nodeColor || '#E1EFFF'),
        strokeWidth: 3,
        strokeColor: node => node.id === selectedSourceNode.value ? '#d39e00' : (cfg.nodeStrokeColor || '#0056B3')
      },
      hover: {
        color: cfg.nodeHoverColor || '#0056B3'
      },
      label: {
        visible: true,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#1A1A1B'
      }
    },
    edge: {
      normal: {
        color: cfg.edgeColor || '#cccccc',
        width: cfg.edgeWidth || 3
      },
      label: {
        fontSize: 13,
        color: '#1A1A1B',
        fontWeight: 'bold'
      },
      type: 'curve',
      gap: cfg.edgeGap || 40,
      margin: 6
    },
    path: {
      visible: true,
      normal: {
        width: cfg.pathWidth || 6,
        color: cfg.pathColor || '#0056B3',
        dasharray: '0'
      }
    }
  };
};

const configs = reactive(createConfigs());

// Ép đồ thị vẽ lại khi chọn đỉnh nguồn để nổi bật màu đỉnh đang được chọn
watch(selectedSourceNode, () => {
  configs.node.normal.color = node => node.id === selectedSourceNode.value ? '#ffc107' : (props.graphConfig.nodeColor || '#E1EFFF');
  configs.node.normal.strokeColor = node => node.id === selectedSourceNode.value ? '#d39e00' : (props.graphConfig.nodeStrokeColor || '#0056B3');
});

// Theo dõi thay đổi từ graphConfig để cập nhật lại cấu hình
watch(
  () => props.graphConfig,
  (newConfig) => {
    const newConfigs = createConfigs();
    Object.assign(configs, newConfigs);
  },
  { deep: true }
);

// Tính toán dữ liệu đường đi (để highlight thuật toán)
const pathData = computed(() => {
  if (!props.pathIds || props.pathIds.length === 0) {
    return {};
  }
  return {
    shortestPath: {
      edges: props.pathIds
    }
  };
});
</script>

<style scoped>
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

.card-body {
  flex: 1;
  min-height: 0;
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

.position-relative {
  position: relative;
}

.weight-input-overlay {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.weight-input {
  width: 60px;
  text-align: center;
  font-weight: bold;
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  outline: none;
  background: transparent;
  color: var(--text-main);
  padding: 2px;
}

.weight-input:focus {
  background: rgba(255, 255, 255, 0.9);
}

.weight-hint {
  font-size: 11px;
  color: #555;
  font-weight: 600;
}
</style>