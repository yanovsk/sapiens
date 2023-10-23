<script setup lang="ts">
import AIFeed from "@/components/Feed/AIFeed.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, reactive, ref } from "vue";
import PostListComponent from "../Post/PostListComponent.vue";

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);

const state = reactive({
  inputValue: "",
});

async function updateFeedPreference() {
  loaded.value = false;
  let userQuery = state.inputValue;

  let query: Record<string, string> = { userQuery };

  try {
    const response = await fetchy("/api/smartfeed/update", "POST", { query });
    posts.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    loaded.value = true;
  }
}

async function getFeed() {
  try {
    const response = await fetchy("/api/smartfeed", "GET");
    posts.value = response;
  } catch (error) {
    console.error(error);
  }
}
async function resetFeed() {
  try {
    await fetchy("/api/smartfeed/reset", "POST");
    await getFeed();
  } catch (error) {
    console.error(error);
  }
}

onBeforeMount(async () => {
  await getFeed();
  loaded.value = true;
});
</script>

<template>
  <div>
    <h3>SmartFeed</h3>

    <div class="input-container">
      <input v-model="state.inputValue" placeholder="How would you like to personalize your feed?" />
      <button @click="updateFeedPreference">Submit</button>
      <button @click="resetFeed">Reset Feed</button>
    </div>

    <section class="feed-container" v-if="loaded && posts.length !== 0">
      <div class="feed-preference"></div>
      <AIFeed />
      <PostListComponent :posts="posts" :canEdit="false" />
    </section>
    <p v-else-if="loaded">No posts found</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
  margin-bottom: 1em;
  font-size: 1.5rem;
}

.feed-preference {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  width: 1rem;
}

.feed-container {
  max-width: 62%;
  margin: 0 auto;
}

.post {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 1em;
  margin-bottom: 1em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.post-author {
  color: #888;
  font-size: 0.9rem;
}

.post-content {
  margin-top: 0.5em;
}

p {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 1em;
}

.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-bottom: 1em;
}

input {
  width: 60%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
