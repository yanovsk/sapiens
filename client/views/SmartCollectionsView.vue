<script setup lang="ts">
import AllSmartCollectionsComponent from "@/components/SmartCollection/AllSmartCollectionsComponent.vue";
import UserSmartCollectionsComponent from "@/components/SmartCollection/UserSmartCollectionsComponent.vue";
</script>

<template>
  <main class="column">
    <p>User</p>
    <UserSmartCollectionsComponent />
    <p>All</p>
    <AllSmartCollectionsComponent />
  </main>
</template>
