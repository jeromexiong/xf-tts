const express = require("express");
const app = express();
const socketConnect = require("./socket").socketConnect;
global.path = require("path");

app.use(express.static(path.join(__dirname, "public")));

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
// });
