<script setup lang="ts">
import AIAssistantComponent from "@/components/AIAssistant/AIAssistantComponent.vue";
import AIAssistantDashboard from "@/components/AIAssistant/AIAssistantDashboard.vue";
</script>

<template>
  <main>
    <h3 class="global-title">AI Assistant</h3>
    <section class="global-page-layout">
      <h3>Set New Learning Cycle</h3>
      <AIAssistantComponent />
      <AIAssistantDashboard />
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
