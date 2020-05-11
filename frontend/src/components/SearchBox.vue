<template>
  <div>
    <div class="flex items-center border-b border-b-2 border-teal-500 py-2">
      <input
        class="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="Search for something..."
        aria-label="Search box"
        autofocus
        v-model="query"
        v-on:keyup.enter="search"
      />
      <button
        @click="search"
        class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
        type="button"
      >Search</button>
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="Hostname..."
        aria-label="Hostname name filter"
        autofocus
        v-model="hostname"
        v-on:keyup.enter="search"
      />
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="Username..."
        aria-label="Username filter"
        autofocus
        v-model="username"
        v-on:keyup.enter="search"
      />
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="IP..."
        aria-label="IP filter"
        autofocus
        v-model="ip"
        v-on:keyup.enter="search"
      />
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="MAC..."
        aria-label="MAC filter"
        autofocus
        v-model="mac"
        v-on:keyup.enter="search"
      />
    </div>
    <div class="flex items-center border-b border-b-2 border-teal-500 py-2">
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="Start date..."
        aria-label="Start date filter"
        autofocus
        v-model="start_date"
        v-on:keyup.enter="search"
        v-pikaday="pikadayOptions"
      />
      <input
        class="ml-4 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
        type="text"
        placeholder="End date..."
        aria-label="End date filter"
        autofocus
        v-model="end_date"
        v-on:keyup.enter="search"
        v-pikaday="pikadayOptions"
      />
      <button
        @click="reset"
        class="flex-shrink-0 mr-4 hover:bg-gray-700 border-gray-500 hover:border-gray-700 hover:text-gray-100 text-sm border-2 text-gray-700 py-1 px-2 rounded"
        type="button"
      >Reset</button>
    </div>
    <p class="text-red-500" v-text="error"></p>
  </div>
</template>

<script>
import axios from "axios";
import V_Pikaday from "vue-pikaday-directive";
import moment from "moment";

export default {
  props: ["page"],
  directives: {
    pikaday: V_Pikaday
  },
  data() {
    return {
      pikadayOptions: {
        format: "YYYY-MM-DD"
      },
      query: "",
      error: "",
      username: "",
      mac: "",
      ip: "",
      hostname: "",
      start_date: "",
      end_date: "",
      sodOff: "",
      apiKey: window.API_KEY ? window.API_KEY : process.env.VUE_APP_API_KEY,
      apiServer: window.API_SERVER
        ? window.API_SERVER
        : process.env.VUE_APP_API_SERVER
    };
  },
  watch: {
    page() {
      this.search();
    }
  },
  mounted() {
      this.sodOff = moment(); // keep vue happy about unused imports :-/
      this.search();
  },
  methods: {
    reset() {
      this.query = "";
      this.error = "";
      this.username = "";
      this.mac = "";
      this.ip = "";
      this.hostname = "";
      this.start_date = "";
      this.end_date = "";
    },
    search() {
      this.error = "";
      const queryString = this.buildQueryString();
      axios
        .get(this.apiServer + queryString, {
          headers: { "X-Auth": this.apiKey }
        })
        .then(res => {
          this.$emit("searched", res.data);
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            this.error = error.response.data + " " + error.response.status;
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            this.error = error.request;
          } else {
            // Something happened in setting up the request that triggered an Error
            this.error = error.message;
          }
        });
    },
    buildQueryString() {
      return `/search?q=${encodeURIComponent(
        this.query
      )}&page=${encodeURIComponent(
        this.page
      )}&computername=${encodeURIComponent(
        this.hostname
      )}&mac=${encodeURIComponent(this.mac)}&ip=${encodeURIComponent(
        this.ip
      )}&username=${encodeURIComponent(this.username)}&start_date=${
        this.start_date
      }&end_date=${this.end_date}`;
    }
  }
};
</script>