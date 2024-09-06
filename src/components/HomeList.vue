<template>
  <div class="dashboard">
    <h2>Dashboard</h2>
    <BarChart />
  </div>
</template>

<script>
import BarChart from './BarChartList.vue';

export default {
  components: {
    BarChart,
  },
};
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

/* Breadcrumb */
.breadcrumb {
  background: none;
  margin-bottom: 20px;
}

.breadcrumb li {
  display: inline-block;
}

/* Caja */
.box {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
}

.box-header h3 {
  margin: 0;
}
</style>
