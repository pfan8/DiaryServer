// 引入 mysql 连接数据库
const DBHelper = require("./db");
// 数据库配置
const mongo = new DBHelper("mongodb://localhost:27017", "diary");

// 引入其他相关包
const express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
// 解析 post 请求体
app.use(bodyParser.json({ limit: "1mb" })); //body-parser 解析json格式数据
app.use(
  bodyParser.urlencoded({
    //此项必须在 bodyParser.json 下面,为参数编码
    extended: true,
  })
);
// 此变量为解析 token 密匙 变量比较隐私  应该放在其他地方 本文章简单使用一下
// 值为开发者随意设定的
const SECRET = "asdfjoijisadfjlkj";
// 创建服务器
// 监听3001端口
app.listen(3001, () => {
  console.log("服务器启动");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const phone = req.body.phone || "";
  // 密码进行加密
  const password = bcrypt.hashSync(req.body.password, 10);
  mongo.insert(
    "user",
    {
      name: username,
      password,
      phone,
      create_date: new Date(),
      update_date: new Date(),
      login: true,
    },
    (insertRes) => {
      if (!insertRes) {
        res.status(500).send("注册失败");
      } else {
        res.send("注册成功");
      }
    }
  );
});

app.post("/login", (req, res) => {
  // 从请求中获取请求体
  const { username, password } = req.body;
  mongo.find("user", { name: username }, (result) => {
    if (!result) {
      res.status(500).send("服务器错误，请稍后重试");
    }
    const user = result[0];
    // 如果查询不到用户
    if (!user) {
      res.send("用户名不存在");
      return;
    }
    // 判断用户输入的密码和数据库存储的是否对应 返回 true 或者 false
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      res.status(401).send("密码错误");
      return;
    }
    // 生成 token 将用户的唯一标识 id 作为第一个参数
    // SECRET 作为取得用户 id 密匙
    const token = jwt.sign({ id: user.id }, SECRET);
    // 如果都通过了 则返回user 和 token
    // 返回的 token 应该存储在客户端 以便后续发起请求需要在请求头里设置
    delete user.password;
    res.send({ user, token });
  });
});

app.post("/logout", (req, res) => {
  const { username } = req.body;
  mongo.update("user", { name: username }, { login: false }, (updateRes) => {
    if (!updateRes) {
      res.status(500).send("登出失败");
    } else {
      res.send("登出成功");
    }
  });
});

app.get("/profile", (req, res) => {
  // 从请求头里取出 token
  const token = req.headers.authorization.split(" ")[1];
  // token 验证取得 用户 id
  const { id } = jwt.verify(token, SECRET);
  // 查询用户
  const sql = `select * from user where id='${id}'`;
  exec(sql).then((result) => {
    // 返回用户信息
    res.send(result[0]);
  });
});
