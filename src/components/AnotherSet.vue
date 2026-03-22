<template>
  <div class="container mt-4">
    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
      <li class="nav-item" v-for="tab in tabs" :key="tab.id">
        <button 
          class="nav-link" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          type="button"
        >
          {{ tab.title }}
        </button>
      </li>
    </ul>

    <div class="tab-content border p-4 rounded shadow-sm">
      <div v-if="activeTab === 'path'" class="tab-pane fade show active">
        <div>
          <!-- <ResultView 
              :path="result.path"
              :distance="result.totalDistance"
              :start="search.start"
              :end="search.end"
          /> -->
        </div>
      </div>

      <div v-if="activeTab === 'guidance'" class="tab-pane fade show active">
        <h3>Hướng dẫn</h3>
        <p>Phần hướng dẫn</p>
      </div>

      <div v-if="activeTab === 'settings'" class="tab-pane fade show active">
        <h3>⚙️ Cài đặt</h3>
        <div class="overflow-auto" style="max-height: 100px;">
          <p>Nội dung cài đặt rất dài cần thanh cuộn...</p>
          <p>Dòng 1...</p><p>Dòng 2...</p><p>Dòng 3...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ResultView from './ResultView.vue';

// Quản lý ID của tab đang mở
const activeTab = ref('path')

// Danh sách các tab (để render bằng v-for cho sạch code)
const tabs = [
  { id: 'guidance', title: 'Hướng dẫn' },
  { id: 'path', title: 'Đường đi ngắn nhất' },
  { id: 'settings', title: 'Cài đặt' }
]
</script>