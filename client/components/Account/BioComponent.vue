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
const currUserFollowing = ref<string[]>([]);
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
    const uFollowing = await fetchy(`/api/following/${props.username}/user`, "GET", {});
    const uFollowers = await fetchy(`/api/followers/${props.username}/user`, "GET", {});
    following.value = uFollowing;
    followers.value = uFollowers;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

async function getCurrentUserFollowing() {
  try {
    const currFollowing = await fetchy(`/api/following/${currentUsername.value}/user`, "GET", {});
    currUserFollowing.value = currFollowing;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

onMounted(async () => {
  await getUserInfo();
  await getUserFollows();
  await getCurrentUserFollowing();
  const username = props.username;
  //getting id by username
  const user = await fetchy(`/api/users/${username}`, "GET", {});
  isFollowing.value = currUserFollowing.value.includes(user._id);
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
    <div class="profile-content">
      <img :src="picLink" alt="Profile Picture" class="profile-pic" />
      <div class="profile-info">
        <div class="name-and-follow">
          <h3>{{ fullName }}</h3>
          <p>@{{ props.username }}</p>
          <p class="profile-bio">{{ bio }}</p>
        </div>
        <div class="profile-follow">
          <p class="follow-count">Followers: {{ followers.length }}</p>
          <p class="follow-count">Following: {{ following.length }}</p>
        </div>
      </div>
    </div>
    <div class="follow-section">
      <div v-if="props.username !== currentUsername" class="follow-actions">
        <button class="global-button-blue" v-if="!isFollowing" @click="followUser">Follow</button>
        <button class="global-button-green" v-else @click="unfollowUser">Unfollow</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  align-items: start;
  border: 2px solid #d9cafa;
  border-radius: 10px;
  background-color: white;
  padding: 15px;
}
.profile-content {
  display: flex;
  align-items: start;
  width: 85%;
}
.profile-info {
  display: flex;
  flex-direction: column;
}
.name-and-follow {
  display: flex;
  flex-direction: column;
  align-items: start;
}

h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 0;
}
p {
  margin-top: 1px;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
}
.profile-bio {
  font-size: 14px;
  color: #666;
}
.profile-follow {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #000000;
}
.follow-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
}
.follow-actions {
  display: flex;
  flex-direction: column;
}
.follow-count {
  margin: 0;
  padding: 0;
}
.profile-pic {
  height: 27%;
  width: 27%;
  border-radius: 0%;
  object-fit: cover;
  margin-right: 15px;
}
</style>
