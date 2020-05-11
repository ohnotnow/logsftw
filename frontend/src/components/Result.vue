<template>
  <div
    class="shadow mb-4 rounded-lg relative hover:bg-gray-100 hover:cursor-pointer"
    @click="toggleExpanded(result)"
    title="Expand"
    aria-label="Expand content"
  >
    <div class="grid grid-cols-6">
      <div>
        <span class="font-bold px-2">Action</span>
        <span v-text="result.action" />
      </div>
      <div>
        <span class="font-bold px-2">Hostname</span>
        <span v-text="result.computername" />
      </div>
      <div>
        <span class="font-bold px-2">IP</span>
        <span v-text="result.IP" />
      </div>
      <div>
        <span class="font-bold px-2">MAC</span>
        <span v-text="result.MAC" />
      </div>
      <div>
        <span class="font-bold px-2">Username</span>
        <span v-text="result.username" />
      </div>
      <div>
        <span class="font-bold px-2 overflow-hidden">Date</span>
        <span v-text="result.datetime.substr(0, result.datetime.length - 5)" />
      </div>

    </div>

    <div v-if="isExpanded(result)" class="overflow-scroll mt-2 ml-2 bg-gray-100 mr-2">
      <pre v-text="JSON.stringify(result, null, 2)"></pre>
    </div>
  </div>
</template>

<script>
import parseJSON from "date-fns/parseJSON";
import formatISO from "date-fns/formatISO";

export default {
  props: ["result"],
  data() {
    return {
      expanded: [],
      dockerTags: {
        Container: "_container_name",
        Image: "_image_name",
        Tag: "_tag",
        Created: "_created"
      }
    };
  },
  methods: {
    formatDate(date) {
      return formatISO(parseJSON(date));
    },
    isExpanded(result) {
      return this.expanded.indexOf(result._id) > -1;
    },
    toggleExpanded(result) {
      const index = this.expanded.indexOf(result._id);
      if (index > -1) {
        this.expanded = [
          ...this.expanded.slice(0, index),
          ...this.expanded.slice(index + 1)
        ];
        return;
      }
      this.expanded.push(result._id);
    }
  }
};
</script>