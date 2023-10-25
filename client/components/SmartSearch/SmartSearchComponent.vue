<script setup lang="ts">
import { validateInput } from "@/utils/validators";
import { onBeforeMount, reactive, ref } from "vue";
import PostListComponent from "../Post/PostListComponent.vue";
const isLoading = ref(false);

import { fetchy } from "../../utils/fetchy";

const props = defineProps({ username: String });

const errorMessage = ref("");
const inputValue = ref("");
const posts = ref<Array<{ _id: string }>>([]);

function performValidation() {
  const { isValid, message } = validateInput(inputValue.value);
  if (!isValid) {
    errorMessage.value = isValid ? "" : message;
  }
  return isValid;
}

async function searchAccount() {
  errorMessage.value = "";
  isLoading.value = true;
  const res = await fetchy(`/api/search/${props.username}`, "POST", { body: { userQuery: inputValue.value } });
  posts.value = res;
  isLoading.value = false;
}
</script>

<template>
  <div>
    <div>
      <button class="reset-btn" @click="$emit('showAll')">← Back to all posts</button>
    </div>
    <br />
    <span class="error-message">{{ errorMessage }}</span>
    <div class="input-container">
      <input v-model="inputValue" :placeholder="'Search for anything in @' + props.username + '\'s feed'" required />
      <button class="global-button-blue local-btn" @click="performValidation() && searchAccount()">Search</button>
    </div>
    <div class="pulsate" v-if="isLoading">Searching...</div>

    <div v-if="posts">
      <PostListComponent v-if="posts.length > 0" :posts="posts" :canEdit="false" />
    </div>
  </div>
</template>

<style scoped>
.feed-preference {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  width: 1rem;
}

.feed-personalization {
  display: flex;
  flex-direction: column;
}

.feed-container {
  margin: 0 auto;
}

.header-and-reset {
  display: flex;
  flex-direction: row;
}
.reset-btn {
  background: transparent;
  border: none;
  padding: 10px 10px 10px 10px;
  color: rgb(158, 6, 6);
  text-decoration: underline;
  font-size: 15px;
}

.personalize-header {
  width: 85%;
}
.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 1em;
}

.local-btn {
  margin-top: 0;
  padding: 15px 20px 15px;
  font-size: 1rem;
  border-radius: 4px;
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

input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
