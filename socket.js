const CryptoJS = require("crypto-js");
const requestHost = "tts-api.xfyun.cn";
const host = "ws-api.xfyun.cn";
const url = "/v2/tts";
const date = new Date().toUTCString();
const app_id = "app_id";
const api_key = "api_key";
const apiSecret = "apiSecret";
const signature_origin = `host: ${host}\ndate: ${date}\nGET ${url} HTTP/1.1`;
const hash = CryptoJS.HmacSHA256(signature_origin, apiSecret);
const signature = CryptoJS.enc.Base64.stringify(hash);
// console.log(signature_origin, signature)
const authorization_origin = `api_key="${api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
const authorization = CryptoJS.enc.Base64.stringify(
  CryptoJS.enc.Utf8.parse(authorization_origin)
);
// console.log(authorization_origin, authorization)
const wss = `wss://${requestHost}${url}?authorization=${authorization}&date=${encodeURI(
  date
)}&host=${host}`;
// console.log(wss)

const fs = require("fs");
const WebSocketClient = require("websocket").client;

const socketConnect = (text, vcn = "xiaoyan") => {
  let fileInit = true;
  const fileName = Date.now();
  const common = { app_id };
  const business = {
    aue: "raw",
    auf: "audio/L16;rate=16000",
    vcn,
    tte: "utf8"
  };
  const data = {
    status: 2,
    text: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
  };
  const params = JSON.stringify({ common, business, data });
  const client = new WebSocketClient();
  return new Promise((resolve, reject) => {
    client.on("connectFailed", function(error) {
      console.log("Connect Error: " + error.toString());
      reject(error);
    });

    client.on("connect", function(connection) {
      console.log("WebSocket client connected");
      connection.send(params);
      connection.on("error", function(error) {
        console.log("Connection Error: " + error.toString());
        reject(error);
      });
      connection.on("close", function() {
        console.log("Connection Closed");
        resolve({ code: 0, msg: "Connection Closed" });
      });
      connection.on("message", function(message) {
        const res = JSON.parse(message.utf8Data);
        if (res.code != 0) {
          console.log(res.toString());
          return resolve(res);
        }
        const { status, ced } = res.data;
        // base64 => buffer
        const buffer = new Buffer(res.data.audio, "base64");
        const savePath = `./public/audio/${fileName}.pcm`;
        // 需要添加完成标志，否则会一直追加
        fs.writeFile(savePath, buffer, { flag: fileInit ? "w" : "a" }, err => {
          fileInit = res.data.status == 2;
          if (err) {
            throw err;
          }
          console.log(status, ced, fileInit);
          if (fileInit) resolve({ code: 0, data: { status, savePath, fileName } });
        });
      });
    });
    client.connect(wss);
  });
};
module.exports = { socketConnect };
