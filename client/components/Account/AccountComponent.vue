<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();
import { useRoute } from "vue-router";
import { watch, onMounted, ref } from "vue";
import PostListComponent from "../Post/PostListComponent.vue";

const { currentUsername } = storeToRefs(userStore);
const isMyAccount = ref(false);
const route = useRoute();

const checkUsername = () => {
  const routeUsername = route.params.username;
  isMyAccount.value = routeUsername === currentUsername.value;
};

onMounted(() => {
  checkUsername();
});

watch(
  () => route.params.username,
  () => {
    checkUsername(); // Re-check when the route changes
  },
);
</script>

<template>
  <div>
    <template v-if="isMyAccount">
      <PostListComponent :author="currentUsername" />
    </template>
    <template v-else>
      <PostListComponent :author="route.params.username" />
    </template>
  </div>
</template>

<style scoped></style>
