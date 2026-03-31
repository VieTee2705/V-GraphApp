<template>
  <div class="card-component graph-card">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-network-wired me-2"></i>Trực Quan Hóa Đồ Thị</span>
      <span class="badge bg-white text-primary border border-primary">Shift + Click để thêm đỉnh</span>
    </div>
    <div class="card-body p-0 graph-wrapper">
      <v-network-graph
        ref="graphRef"
        :nodes="nodes"
        :edges="edges"
        :layouts="layouts"
        :configs="configs"
        :paths="pathData"
        :event-handlers="eventHandlers"
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
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch } from 'vue';
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
  }
});

const emit = defineEmits(['create-node']);

// Reference đến instance của v-network-graph để gọi các hàm API bên trong
const graphRef = ref(null);

// Xử lý các sự kiện tương tác
const eventHandlers = {
  "view:click": (payload) => {
    // Trích xuất MouseEvent (tùy thuộc vào phiên bản v-network-graph, payload có thể bọc event ở trong)
    const mouseEvent = payload.event || payload;
    
    // Chỉ xử lý khi người dùng giữ phím Shift
    if (!mouseEvent.shiftKey) return;

    if (!graphRef.value) return;

    // 1. Lấy tọa độ click trên màn hình trình duyệt (DOM point)
    const domPoint = { x: mouseEvent.clientX, y: mouseEvent.clientY };
    
    // 2. Chuyển đổi DOM point sang hệ tọa độ thực tế của đồ thị SVG (đã tính toán zoom/pan)
    const svgPoint = graphRef.value.translateFromDomToSvgCoordinates(domPoint);

    console.log(`Đã tính toán tọa độ SVG: x=${svgPoint.x}, y=${svgPoint.y}`);

    // Phát sự kiện lên component cha (App.vue) cùng với tọa độ chuẩn
    emit('create-node', { x: svgPoint.x, y: svgPoint.y });
  }
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
        color: cfg.nodeColor || '#E1EFFF',
        strokeWidth: 3,
        strokeColor: cfg.nodeStrokeColor || '#0056B3'
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
</style>