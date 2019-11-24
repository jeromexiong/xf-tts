const express = require("express");
const app = express();
const socketConnect = require("./socket").socketConnect;
global.path = require("path");

app.use(express.static(path.join(__dirname, "public")));
//设置跨域访问
app.all("*", (req, res, next) => {
  const orginList = ["http://localhost:3000", "http://test.api.audio.kilomap.cn", "http://test.audio.kilomap.cn"];
  let origin = req.headers.origin;
  if (origin && orginList.includes(origin.toLowerCase())) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, token"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", "3.2.1");

  if (req.method == "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/audio", function(req, res) {
  res.sendFile(__dirname + "/public/audio.html");
});
app.get("/demo", function(req, res) {
  const text = req.query.text;
  socketConnect(text).then(data => {
    console.log(data);
    res.json(data);
  });
});

app.listen(3000, () => {
  console.log(`成功监听端口：${3000}`);
});
// const text = "不是所有牛奶都叫特仑苏。它的产地——中国乳都核心区和林格尔，依托北纬40度左右、中温带暖湿季风性气候、优质奶源带等一系列得天独厚的优势自然条件，提供了市场稀缺的高品质奶源。";
// socketConnect(text).then(res => {
//   console.log(res);
// }).catch(e => {
//   console.log(e)
// });
