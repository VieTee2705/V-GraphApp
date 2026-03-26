<template>
  <div class="card-component graph-card">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-network-wired me-2"></i>Trực Quan Hóa Đồ Thị</span>
      <span class="badge bg-white text-primary border border-primary">Kéo thả để di chuyển</span>
    </div>
    <div class="card-body p-0 graph-wrapper" ref="graphWrapperRef" @dblclick.prevent.stop="handleCanvasDoubleClick">
      
      <v-network-graph
          ref="graphRef"
          :nodes="nodes"
          :edges="edges"
          :configs="configs"
          :paths="pathData"
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
  nodes: Object,
  edges: Object,
  pathIds: Array,
  graphConfig: Object
});

const emit = defineEmits(['create-node']);

const graphRef = ref(null);
const graphWrapperRef = ref(null);

const handleCanvasDoubleClick = (event) => {
  // Prevent browser's default double-click zoom behavior
  event.preventDefault();
  event.stopPropagation();
  
  // Get SVG coordinates from v-network-graph
  if (graphRef.value && graphRef.value.$el) {
    try {
      // Lấy SVG element từ v-network-graph
      const svg = graphRef.value.$el.querySelector('svg');
      if (!svg) return;
      
      // Create a point in SVG coordinate system
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      
      // Transform viewport coordinates to SVG coordinates
      const svgCoords = point.matrixTransform(svg.getScreenCTM().inverse());
      
      console.log(`Creating node at SVG coords: x=${svgCoords.x}, y=${svgCoords.y}`);
      
      // Emit event with SVG coordinates
      emit('create-node', { x: svgCoords.x, y: svgCoords.y });
    } catch (error) {
      console.error('Failed to calculate SVG coordinates:', error);
      // Fallback: use wrapper coordinates
      if (graphWrapperRef.value) {
        const rect = graphWrapperRef.value.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(`Fallback: Creating node at wrapper coords: x=${x}, y=${y}`);
        emit('create-node', { x, y });
      }
    }
  }
};

// Function to create configs with dynamic values
const createConfigs = () => {
  const cfg = props.graphConfig || {};
  return {
    view: {
      panEnabled: true,
      zoomEnabled: true,
      doubleClickZoomEnabled: false,  // 🚫 Tắt double-click zoom
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: false,
        createSimulation: (d3, nodes, edges) => {
          const forceLink = d3
            .forceLink(edges)
            .id(d => d.id)
            .distance(cfg.distanceMin || 120);
          
          return d3.forceSimulation(nodes)
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
        color: cfg.nodeColor || "#E1EFFF",
        strokeWidth: 3,
        strokeColor: cfg.nodeStrokeColor || "#0056B3"
      },
      hover: { color: cfg.nodeStrokeColor || "#0056B3" },
      label: { visible: true, fontFamily: "Inter", fontWeight: "bold", color: "#1A1A1B" }
    },
    edge: {
      normal: { color: cfg.edgeColor || "#cccccc", width: cfg.edgeWidth || 3 },
      label: { fontSize: 13, color: "#1A1A1B", fontWeight: "bold" },
      type: "curve",
      gap: cfg.edgeGap || 40,
      margin: 6
    },
    path: {
      visible: true,
      normal: { width: cfg.pathWidth || 6, color: cfg.pathColor || "#0056B3", dasharray: "0" }
    }
  };
};

const configs = reactive(createConfigs());

// Watch graphConfig changes and update configs
watch(() => props.graphConfig, (newConfig) => {
  const newConfigs = createConfigs();
  Object.assign(configs, newConfigs);
}, { deep: true });

const pathData = computed(() => {
  if (!props.pathIds || props.pathIds.length === 0) return {};
  return { shortestPath: { edges: props.pathIds } };
});
</script>

<style scoped>
/* graph-wrapper defined globally */
</style>