<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
// TODO: ユーザ名とルーム名を設定して、通信できるようにする
import { ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
const webSocket = ref<WebSocket>();
const body = ref('')
const aList = ref<string[]>([]);
const gameStatus = ref<boolean>(false)
const title = ref<string|null|undefined>('')
const answer = ref<string|null|undefined>('')
const winner = ref<string|null|undefined>('')
const defineWinner = ref<boolean>(false)
const connect = ref<boolean>(false);
const connectNum = ref<number>(0);
const errorMessage = ref<string>('');
const errorStatus = ref<boolean>(false);
const myNumber = ref<number>(0)
const nowNumber = ref<number>(0)
const route =useRoute()
const roomName = ref<string>('');
const name = ref<string>('');
roomName.value = route.query.roomName
console.log(roomName.value)
const identifier = JSON.stringify({
        channel: 'WikiGameChannel',
        room: roomName.value,
    })
name.value = route.params.name
const delA = ['編集','英語版', '']
const apiCall = {
title: 'ランダム'
}
const getHeader = (parseBody:Document) => {
title.value = parseBody?.getElementById('firstHeading')?.textContent
console.log(title.value, answer.value, title.value === answer.value)
if(title.value === answer.value){
    const msg = {
    command: 'message',
    identifier: identifier,
    data: JSON.stringify({action: "decied_winner", name:name}),
    };
    webSocket.value?.send(JSON.stringify(msg));
}
}
const deleteRef = (main:HTMLElement|null) => {
const refElement = main?.querySelectorAll('.references');
console.log(refElement)
    const refLen = refElement?.length;
    if(refLen === 0) return
    for(let key in [...Array(refLen).keys()]){
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
    const msg = {
        command: 'message',
        identifier: identifier,
        data: JSON.stringify({action: "send_url", title: e.target.value, myNumber: myNumber.value}),
        };
    webSocket.value?.send(JSON.stringify(msg));
}
webSocket.value = new WebSocket("ws://localhost:3030/cable");
webSocket.value.onopen = () => {
// const subscribeMsg = {"command":"subscribe", "identifier": "{\"channel\":\"WikiGameChannel\"}"}
// webSocket.value?.send(JSON.stringify(subscribeMsg))
    const msg = {
        command: 'subscribe',
        identifier: identifier,
    }
    webSocket.value?.send(JSON.stringify(msg));
    console.log('connect')
}

const onClickStartGame = (e) => {
gameStatus.value = true;
const msg = {
    command: 'message',
    identifier: identifier,
    data: JSON.stringify({action: 'start_game'})
    };
webSocket.value?.send(JSON.stringify(msg));
}

webSocket.value.onmessage = async (e) => {
    const incoming_msg = JSON.parse(e.data);
    console.log(incoming_msg)
    if (incoming_msg.type === "ping") { console.log('ping'); return; }
    if (incoming_msg.type === "welcome"){
    return
    }
    if (incoming_msg.type === "confirm_subscription"){
    return
    }
    const data = await JSON.parse(e.data)
    if(data.message.error){
        errorStatus.value = true
        errorMessage.value = data.message.message
    }
    if(data.message.message.answerTitle){
        if(!answer.value) answer.value = data.message.message.answerTitle.split(' - ')[0];
        if(myNumber.value === 0) myNumber.value = data.message.message.connectNumber
        connectNum.value = data.message.message.connectNumber
        nowNumber.value = data.message.message.nextNumber
        connect.value = true
        return
    }
    if(data.message.message.data.winner){
    console.log(data.message.message.data.winner)
    winner.value = data.message.message.data.winner
    defineWinner.value = true
    return
    }
    const jsonBody = data.message.message.data
    nowNumber.value = data.message.message.nextNumber
    gameStatus.value = true;
    aList.value = [];
    body.value = '';
    title.value = '';
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
  <div v-if="errorStatus">
  {{errorMessage}}
  </div>
  <div v-else-if="!connect">
  通信中
  </div>
  <div v-else-if="!gameStatus">
    <div>{{connectNum}}</div>
    <div>ルームID: {{roomName}}</div>
    <button @click="onClickStartGame">StartGame</button>
  </div>
  <div v-else-if="!defineWinner">
      <h1>{{title}}</h1>
      <div>{{myNumber}} {{nowNumber}}</div>
      <template v-for="i in body.length" :key="i">
        <span v-html="body[i]"></span>
        <span v-if="myNumber=== nowNumber">
        <button v-if="!(delA.includes(aList[i]) || /[*.]/.test(aList[i]))" :value="aList[i]" @click="onClickSendText">{{aList[i]}}</button>
        </span>
        <span v-else>
           <span v-if="!(delA.includes(aList[i]) || /[*.]/.test(aList[i]))" :value="aList[i]">{{aList[i]}}</span>
        </span>
      </template>
      <div>あなたの答え: {{answer}}</div>
      <div>あなたの名前: {{name}}</div>
  </div>
  <div v-else>
    勝者は{{winner}}さんです
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
