<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import { ref } from "vue";

const showRegister = ref(false);
</script>

<template>
  <main class="main-container">
    <div class="logo-container">
      <img src="../assets/images/sapiens-box.png" alt="Social Media Logo" class="logo" />
    </div>
    <div class="sections">
      <div class="left-section">
        <span class="welcome-text">Welcome to Sapiens</span>
        <p class="emoji-text">🔍 Discover & Engage</p>
        <p>Dive into a world focused on meaningful content, leaving behind the clutter of irrelevant posts. No cat videos, just valuable discussions!</p>
        <p class="emoji-text">🤖 AI-First Social Media</p>
        <p>Our generative AI tailors your feed to your unique interests, making you a superuser. Just type your preferences, and voila!</p>
        <p class="emoji-text">📅 Find a topic you love?</p>
        <p>AI Assistant will curate a daily learning plan, transforming your feed into a powerful tool for intellectual growth.</p>
      </div>
      <div class="right-section">
        <div v-if="showRegister">
          <RegisterForm />
        </div>
        <div v-else>
          <LoginForm />
        </div>
        <hr />
        <button class="global-button local-button" @click="showRegister = !showRegister">
          {{ showRegister ? "Already have an account? Login" : "Create Account" }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.sections {
  display: flex;
  flex-direction: row;
}

.left-section,
.right-section {
  width: 48%;
  border: 1px;
  margin: 0 100px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 100px;
}

.logo {
  width: 90px;
  height: auto;
}

.welcome-text {
  font-family: "Noto Sans", sans-serif;
  font-weight: 700;
  font-size: 36px;
}
.local-button {
  width: 50%;
  background-color: #ffe9d6;
  color: black;
  padding: 14px 20px;
  margin: 8px 0;
  border: 1px solid black;
  border-color: black;
  font-weight: 550;
  border-radius: 5px;
}

.feature-list {
  list-style: disc;
  margin-top: 20px;
  padding-left: 20px;
}

.right-section {
  width: 28%;
  margin-right: 200px;
  margin-left: 0;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.emoji-text {
  font-size: 24px;
}

.logo-top-center {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

hr {
  width: 70%;
  border: 0.4px solid #ccc;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>
