<script setup lang="ts">
import { onMounted, ref } from "vue";

import { fetchy } from "../../utils/fetchy";

const apiResponse = ref();
const todayMessage = ref("");
const dayOfWeek = ref(1); // Initialize with Monday

const getAIAssistantDash = async () => {
  const response = await fetchy("/api/aiassistant", "GET");
  apiResponse.value = response.dailyPostsAndMsgs;

  const today = new Date();
  dayOfWeek.value = (today.getUTCDay() === 0 ? 7 : today.getUTCDay()) - 1;
  const todayISO = today.toISOString().split("T")[0];
  const todayData = apiResponse.value.find((item: any) => item.date.startsWith(todayISO));

  if (todayData) {
    todayMessage.value = todayData.dailyMessage;
  }
};

onMounted(async () => {
  await getAIAssistantDash();
});
</script>

<template>
  <div v-if="todayMessage">
    <h3>Current Learning Cycle</h3>
    <p>
      Day <b>{{ dayOfWeek }} </b> out of 7
    </p>
    <div class="post-container">
      <div class="container-left-side">
        <div class="post-header">
          <img src="../../assets/images/ai.png" alt="Profile Picture" class="profile-pic" />
          <div class="post-info">
            <p class="name-link">Today's message from AI Assistant</p>
            <p class="date">{{ new Date().toISOString().split("T")[0] }}</p>
          </div>
        </div>
        <p class="post-content">{{ todayMessage }}</p>
      </div>
    </div>
  </div>
  <br />
</template>

<style scoped>
.post-container {
  border: 1.5px solid #d9cafa;
  background-color: #f6ffdd8a;
  padding: 16px;
  border-radius: 4px;
  width: 100%;
  display: flex;
}

.post-header {
  display: flex;
  align-items: center;
}
.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}
.post-info {
  display: flex;
  flex-direction: column;
}
.name-link {
  font-weight: 600;
  text-decoration: none;
  color: black;
  line-height: 0.1;
  margin-bottom: 0;
  margin-top: 5px;
}
.date {
  font-weight: 400;
  color: darkgray;
  font-size: 12px;
  margin-bottom: 0px;
}
.post-content {
  margin-top: 12px;
}
.day-info {
  font-weight: 500;
  color: rgb(0, 0, 0);
}
</style>
