<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();
import { useRoute } from "vue-router";
import { watch, onMounted, ref } from "vue";
import PostListComponent from "../Post/PostListComponent.vue";
import BioComponent from "./BioComponent.vue";

const { currentUsername } = storeToRefs(userStore);
const isMyAccount = ref(false);
const route = useRoute();

const checkUsername = () => {
  const routeUsername = Array.isArray(route.params.username) ? route.params.username[0] : route.params.username;
  isMyAccount.value = routeUsername === currentUsername.value;
};

onMounted(() => {
  checkUsername();
});

watch(
  () => route.params.username,
  () => {
    checkUsername();
  },
);
</script>

<template>
  <div>
    <template v-if="isMyAccount">
      <BioComponent :username="currentUsername" />
      <PostListComponent :author="currentUsername" />
    </template>
    <template v-else>
      <BioComponent :username="Array.isArray(route.params.username) ? route.params.username[0] : route.params.username" />
      <PostListComponent :author="Array.isArray(route.params.username) ? route.params.username[0] : route.params.username" />
    </template>
  </div>
</template>

<style scoped></style>
