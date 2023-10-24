<script setup lang="ts">
import { onMounted, ref } from "vue";

import { fetchy } from "../../utils/fetchy";
const updating = ref(false);
const emit = defineEmits(["goalUpdated"]);

const userMessage = ref("");
const messages = ref<Array<{ sender: "user" | "assistant"; text: string }>>([]);
const combinedMessages = [
  "Ready to embark on a new learning journey? This chat helps you dive deep into any topic. Just say 'I want to learn about rockets', and I'll guide you through a 7-day tailored plan.",
  "Let's explore something new. Tell me your interest, like 'I want to learn about oceans'. I'll craft a 7-day learning path for you, with daily reflections right here.",
  "Knowledge awaits you. Express your curiosity, for example, 'I want to learn about ancient civilizations'. I'll then curate a week-long learning journey for you.",
  "Let's dive deep into a new topic. Mention your interest, perhaps 'I want to learn about space'. I'll set up a 7-day sequential learning experience for you.",
  "Let me guide you through a new subject. Share what intrigues you, maybe 'I want to learn about AI'. I'll prepare a week's worth of content, building on each day's knowledge.",
];
const randomMessage = combinedMessages[Math.floor(Math.random() * combinedMessages.length)];

onMounted(async () => {
  messages.value.push({ sender: "assistant", text: randomMessage });
});

const sendMessage = async () => {
  updating.value = true;
  messages.value.push({ sender: "assistant", text: "Updating learning goal" });
  const response = await fetchy("/api/aiassistant/setgoal", "POST", { body: { goal: userMessage.value } });
  userMessage.value = "";
  updating.value = false;
  messages.value.pop();
  messages.value.push({ sender: "assistant", text: "Learning goal updated" });
  emit("goalUpdated", userMessage.value);

  return response.msg;
};
</script>

<template>
  <div class="chat-container">
    <div class="chat-box">
      <div v-for="message in messages" :class="message.sender" :key="message.text">
        <div class="left-pic">
          <img v-if="message.sender === 'assistant'" src="../../assets/images/ai.png" alt="Assistant's Profile" class="profile-pic" />
        </div>
        <div class="right-text">
          <span :class="{ pulsate: updating && message.text === 'Updating learning goal' }">{{ message.text }}</span>
        </div>
      </div>
    </div>
    <div class="input-container">
      <input type="text" v-model="userMessage" @keyup.enter="sendMessage" placeholder="Type what you want to learn about..." />
      <button class="global-button-green" @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  border: 0.3px solid lightgray;
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  width: 100%;
  margin: 0 auto;
}

.chat-box {
  height: 32vh;
  overflow-y: auto;
  margin-bottom: 16px;
}

.input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input {
  width: 85%;
  padding: 8px 12px;
  border: 0.3px solid lightgray;
  border-radius: 4px;
  margin-right: 10px;
}

.pulsate {
  animation: pulsate 0.7s ease-in-out infinite alternate;
}

@keyframes pulsate {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.6;
  }
}

.global-button-green {
  padding: 8px 16px;
  border: 0.3px solid lightgray;
  border-radius: 4px;
  cursor: pointer;
}

.user {
  background-color: #f2f2f2;
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
  font-weight: 400;
  color: gray;
}

.assistant {
  display: flex;
  background-color: white;
  margin: 5px;
  padding: 10px;
  border: 0.3px solid lightgray;
  border-radius: 5px;
  font-weight: 400;
  color: black;
}
.left-pic {
  width: 10%;
}

.right-text {
  width: 80%;
}
</style>
