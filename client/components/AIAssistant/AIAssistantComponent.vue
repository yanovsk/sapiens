<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import AIAssistantDashboard from "@/components/AIAssistant/AIAssistantDashboard.vue";

const userMessage = ref("");
const messages = ref<Array<{ sender: "user" | "assistant"; text: string }>>([]);

const sendMessage = async () => {
  messages.value.push({ sender: "user", text: userMessage.value });
  const response = await fetchy("/api/aiassistant/setgoal", "POST", { body: { goal: userMessage.value } });
  return response.msg;
};
</script>

<template>
  <div>
    <h3>AI</h3>
    <div class="chat-box">
      <div v-for="message in messages" :class="message.sender" :key="message.text">
        {{ message.text }}
      </div>
    </div>
    <input type="text" v-model="userMessage" @keyup.enter="sendMessage" placeholder="Enter your message" />
    <button @click="sendMessage">Send</button>
  </div>

  <div>
    <AIAssistantDashboard />
  </div>
</template>

<style>
.chat-box {
  max-height: 400px;
  overflow-y: auto;
}
.user {
  background-color: #e6e6e6;
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
}
.assistant {
  background-color: #f1f1f1;
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
}
</style>
