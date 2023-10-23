<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { RouterView, useRoute } from "vue-router";
const sidebarOpen = ref(true);

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <div class="app-container">
    <header v-if="isLoggedIn" :class="{ collapsed: !sidebarOpen }">
      <nav>
        <div class="title">
          <img src="@/assets/images/sapiens-logo.png" />
        </div>
        <div class="nav-buttons">
          <p @click="$router.push({ name: 'Feed' })" :class="{ active: currentRouteName == 'Feed' }">Feed</p>
          <p @click="$router.push({ name: 'SmartCollections' })" :class="{ active: currentRouteName == 'SmartCollections' }">SmartCollections</p>
          <p @click="$router.push({ name: 'AIAssistant' })" :class="{ active: currentRouteName == 'AIAssistant' }">AI Assistant</p>
          <p @click="$router.push(`/account/${currentUsername}`)" :class="{ active: currentRouteName == 'Account' }">My Account</p>
          <p @click="$router.push({ name: 'Settings' })" :class="{ active: currentRouteName == 'Settings' }">Settings</p>
        </div>
      </nav>
      <article v-if="toast !== null" class="toast" :class="toast.style">
        <p>{{ toast.message }}</p>
      </article>
    </header>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
@import "./assets/toast.css";
.app-container {
  display: flex;
  flex-direction: row;
}

nav {
  width: 20vh;
  height: 100vh;
  padding: 1em;
  position: sticky;
  top: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.content {
  flex-grow: 1;
  width: 100%;
}

.title {
  display: flex;
  gap: 0.5em;
}

img {
  height: 3.5em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

.nav-buttons p {
  cursor: pointer;
  padding: 0.5em;
  width: 100%;
  border-bottom: 1px solid #ccc;
}

.nav-buttons p:hover,
.nav-buttons p.active {
  background-color: #f0f2f5;
}
</style>
