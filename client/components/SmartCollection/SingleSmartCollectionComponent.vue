<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import PostListComponent from "../Post/PostListComponent.vue";

import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);
const following = ref<string[]>([]);

interface SmartCollection {
  _id: string;
  collectionName: string;
  collectionTopic: string;
  collectionTags: string[] | null;
  containedPosts: string[];
  dateCreated: string;
  dateUpdated: string;
}

const smartColl = ref<SmartCollection | null>(null);
const smartCollPosts = ref<Array<Record<string, string>>>([]);
const isFollowingCollection = ref(false);

const route = useRoute();

async function getCollection() {
  const collectionname = Array.isArray(route.params.collectionname) ? route.params.collectionname[0] : route.params.collectionname;
  const smartCollection = await fetchy(`/api/smartcollection/${collectionname}`, "GET", {});
  smartColl.value = smartCollection.smartCollection;
  smartCollPosts.value = smartCollection.posts;
}

async function getUserFollows() {
  try {
    const uFollowing = await fetchy(`/api/following/${currentUsername.value}/collection`, "GET", {});
    following.value = uFollowing;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}
async function followCollection() {
  try {
    await fetchy(`/api/smartcollection/follow/${smartColl.value?.collectionName}`, "POST", {});
    isFollowingCollection.value = true;
  } catch (error) {
    console.error("Error following collection", error);
  }
}

async function unfollowCollection() {
  try {
    await fetchy(`/api/smartcollection/unfollow/${smartColl.value?.collectionName}`, "DELETE", {});
    isFollowingCollection.value = false;
  } catch (error) {
    console.error("Error following collection", error);
  }
}

onMounted(async () => {
  await getCollection();
  await getUserFollows();
  if (smartColl.value) isFollowingCollection.value = following.value.includes(smartColl.value._id);
});

watch(
  () => route.params.collectionname,
  async () => {
    await getCollection();
  },
);
</script>

<template>
  <div>
    <div v-if="smartColl" class="smart-collection-block">
      <div class="header">
        <h3>{{ smartColl.collectionTopic }}</h3>
        <button class="global-button-green" v-if="!isFollowingCollection" @click="followCollection">Follow</button>
        <button class="global-button-blue" v-else @click="unfollowCollection">Unfollow</button>
      </div>

      <div class="smart-collection-tags">
        <span v-for="tag in smartColl.collectionTags?.slice(0, 7)" :key="tag" class="smart-tag">{{ tag }}</span>
      </div>
      <p>Date Created: {{ smartColl?.dateCreated.split("T")[0] }}</p>
      <p>Last Updated: {{ smartColl?.dateUpdated.split("T")[0] }}</p>
    </div>
    <br />
    <div class="smart-collection-feed">
      <div class="feed-row">
        <PostListComponent @refreshPosts="getCollection" :posts="smartCollPosts.slice(smartCollPosts.length / 2)" :canEdit="false" />
      </div>
      <div class="feed-row">
        <PostListComponent @refreshPosts="getCollection" :posts="smartCollPosts.slice(0, smartCollPosts.length / 2)" :canEdit="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-row {
  width: 50%;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.smart-collection-block {
  border: 1px solid #d9cafa;
  padding: 15px;
  border-radius: 8px;
}

.smart-collection-feed {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.smart-collection-block,
.smartcollection-feed {
  width: 97%;
}

h3 {
  margin-bottom: 10px;
  color: #333;
}

p {
  margin-bottom: 5px;
  color: #555;
}
</style>
