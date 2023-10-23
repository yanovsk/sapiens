<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { defineProps, onMounted, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

const props = defineProps({ username: String });
const fullName = ref("");
const bio = ref("");
const picLink = ref("");
const followers = ref<string[]>([]);
const following = ref<string[]>([]);
const isFollowing = ref(false);
const followTrigger = ref(0);

async function followUser() {
  try {
    await fetchy(`/api/follow/${props.username}`, "POST", {});
    isFollowing.value = true;
    followTrigger.value++;
  } catch (error) {
    isFollowing.value = false;
    console.error("Error following user", error);
  }
}

async function unfollowUser() {
  try {
    await fetchy(`/api/unfollow/${props.username}`, "DELETE", {});
    isFollowing.value = false;
    followTrigger.value++;
  } catch (error) {
    isFollowing.value = true;
    console.error("Error unfollowing user", error);
  }
}

async function getUserInfo() {
  try {
    const fetchedInfo = await fetchy(`/api/users/${props.username}`, "GET", {});
    fullName.value = fetchedInfo.fullname;
    bio.value = fetchedInfo.bio;
    picLink.value = fetchedInfo.picture;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

async function getUserFollows() {
  try {
    const uFollowing = await fetchy(`/api/following/${currentUsername.value}/user`, "GET", {});
    const uFollowers = await fetchy(`/api/followers/${currentUsername.value}/user`, "GET", {});
    following.value = uFollowing;
    followers.value = uFollowers;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

onMounted(async () => {
  await getUserInfo();
  await getUserFollows();
  const username = props.username;
  //getting id by username
  const user = await fetchy(`/api/users/${username}`, "GET", {});
  isFollowing.value = following.value.includes(user._id);
});

watch(
  () => [props.username, followTrigger.value],
  async () => {
    await getUserInfo();
    await getUserFollows();
  },
);
</script>

<template>
  <div class="profile-container">
    <img :src="picLink" alt="Profile Picture" class="profile-pic" />
    <div class="profile-info">
      <h3 class="profile-name">{{ fullName }}</h3>
      <p class="profile-bio">{{ bio }}</p>
      <div class="profile-follow">
        <p class="follow-count">Followers: {{ followers.length }}</p>
        <p class="follow-count">Following: {{ following.length }}</p>
      </div>
      <div v-if="props.username !== currentUsername" class="follow-actions">
        <button v-if="!isFollowing" @click="followUser">Follow</button>
        <button v-else @click="unfollowUser">Unfollow</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin: 15px;
}
.profile-follow {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #777;
  margin-top: 10px;
}
.follow-actions {
  margin-top: 10px;
}
.follow-count {
  margin: 0;
  padding: 0;
}
.profile-pic {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
}

.profile-bio {
  font-size: 14px;
  color: #666;
}
</style>
