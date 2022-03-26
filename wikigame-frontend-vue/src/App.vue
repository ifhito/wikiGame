<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, onMounted} from 'vue';
  const webSocket = ref<WebSocket>();
  const body = ref('')
  const aList = ref<string[]>([]);
  const title = ref<string|null|undefined>('')
  const delA = ['編集','英語版', '']
  const apiCall = {
    title: 'ランダム'
  }
  const getHeader = (parseBody:Document) => {
    title.value = parseBody?.getElementById('firstHeading')?.textContent
  }
  const deleteRef = (main:HTMLElement|null) => {
    const refElement = main?.querySelectorAll('.references');
      console.log(refElement);
      const refLen = refElement?.length;
      for(let key in [...Array(refLen).keys()]){
        console.log(refElement[key])
        refElement[key]?.remove();
      }
  }
  const createAList = (main:HTMLElement|null) => {
    const linkList= main?.querySelectorAll('a');
    linkList?.forEach(link => {
      aList.value.push(link.textContent as string);
    });
  }
  const createBodyList = (main:HTMLElement, parser: DOMParser) => {
    const BodyList = main.innerHTML.split(/<a(?: .+?)?>.*?<\/a>/g)
    const newBodyList = BodyList.map((b) => {
      const dom = parser.parseFromString(b, "text/html");
      return dom.documentElement.textContent;
    })
    return newBodyList;
  }
  const onClickSendText = (e) => {
    webSocket.value?.send(JSON.stringify({title: e.target.value}));
  }
  webSocket.value = new WebSocket("ws://localhost:80/");
  webSocket.value.onopen = () => {
    console.log('connect')
  }
  webSocket.value.onmessage = async ({data}:{data:string}) => {
      aList.value = [];
      body.value = '';
      title.value = '';
      const jsonBody = await JSON.parse(data);
      const parser = new DOMParser();
      const parseBody = parser.parseFromString(jsonBody, "text/html")
      const main = parseBody?.getElementById('mw-content-text');
      getHeader(parseBody);
      deleteRef(main);
      createAList(main);
      const bodyList = createBodyList(main as HTMLElement, parser)
      body.value = bodyList;
  };
</script>

<template>
  <div>
      <h1>{{title}}</h1>
      <template v-for="i in body.length" :key="i">
        <span v-html="body[i]"></span>
        <button v-if="!(delA.includes(aList[i]) || /[*.]/.test(aList[i]))" :value="aList[i]" @click="onClickSendText">{{aList[i]}}</button>
      </template>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
