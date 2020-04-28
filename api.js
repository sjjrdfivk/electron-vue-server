const express = require('express')
const app = express()
var fs = require("fs")
var url=require('url')
const server = require('http').Server(app)
const io = require('socket.io')(server)
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var uuid = require('node-uuid')
const moment = require('moment')

let onlineUsers = {};
let usocket = {}
io.on('connection', function(socket){
    console.log('连接');
     
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称
        socket.userid = obj.userid;
         
        //检查在线列表，如果不在里面就加入
        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.userid;
            usocket[obj.userid] = socket
        }
         
        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers:onlineUsers, user:obj});
        console.log(obj.userid+'加入了聊天室');
    });
     
    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.userid)) {
            //退出用户的信息
            var obj = {userid:socket.userid, username:onlineUsers[socket.userid]};
             
            //删除
            delete onlineUsers[socket.userid];
            delete usocket[obj.userid];
             
            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers,  user:obj});
            console.log(obj.username+'退出了聊天室');
        }
    });
    
    // 监听退出登录
    socket.on('logout', (obj) => {
        if (onlineUsers.hasOwnProperty(obj.userid)) {
            delete onlineUsers[socket.userid];
            delete usocket[obj.userid];
            console.log(obj.userid+'退出了聊天室');
        }
    })

    //监听用户发布聊天内容
    socket.on('message', function(obj){
        fs.readFile('public/user.json', 'utf-8', (error, data) => {
            if (error) return console.error(error)
            // let person = JSON.parse(data)
            //向客户端广播发布的消息
            if(obj.receiveId in usocket){ //消息接收者
                usocket[obj.receiveId].emit(`message-${obj.receiveId}`, obj);
            }else if(obj.sendId in usocket){ // 消息发送者

            }
        })
    });
   
});

//所有接口跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 登录接口
app.post('/login', function (req, res) {
    fs.readFile('public/user.json', 'utf-8', function (error, data) {
        if (error) return console.error(error)
        let person = JSON.parse(data)
        let userStatus = false;  //用户是否存在
        let passStatus = false;  //密码错误是否存在
        let user = {}
        for(var i=0;i<person.length;i++){
            var userdata = person[i];
            if(userdata['username'] === req.body.username){
                if(userdata['password'] === req.body.password){
                    passStatus = true
                }
                user = person[i]
                userStatus = true
            }
        }
        if (!userStatus) {
            res.status(200)
            res.json({message:'不存在用户!',status:false})
        } else if (!passStatus) {
            res.status(200)
            res.json({message:'用户密码错误!',status:false})
        } else if (onlineUsers.hasOwnProperty(user.userid)) {
            res.status(200)
            res.json({message:'该账号已登录!',status:false})
        } else {
            res.status(200)
            res.json({message:'成功！',status:true, data:user})
        }
    })
})

// 注册接口
app.post('/signUp', function (req, res) {
    fs.readFile('public/user.json','utf-8', function (error, data) { // 查询用户数据
        if (error) return console.error(error)
        let person = JSON.parse(data)
        let userStatus = false;  //用户是否存在
        let user = {}
        for(var i=0;i<person.length;i++){
            var userdata = person[i];
            if(userdata['username'] === req.body.username){
                userStatus = true
                user = person[i]
            }
        }
        if (userStatus) {
            res.status(200)
            res.json({message:'该账号已被注册！',status:false})
        } else {
            // 写入用户数据
            const uuid1 = uuid.v1()
            let params = {
                username:req.body.username,
                password: req.body.password,
                userid: uuid1,
                date: new Date(),
                record: []
            }
            let userData = [...person,params]
            fs.writeFile(`public/user.json`, JSON.stringify(userData), (err, v) => {
                if (err) return console.error(err)
                res.status(200)
                res.json({message:'成功！',status:true})
            })
        }
    })
})

// 聊天列表
app.get('/list',function (req, res){
    const { userid } = url.parse(req.url,true).query
    fs.readFile('public/user.json','utf-8', (error, data) => { // 查询用户数据
        if (error) return console.error(error)
        const params = JSON.parse(data).filter(item => item.userid !== userid)
        res.status(200)
        res.json({message:'成功！', status:true, data:params})
    })
})

server.listen('8087', '127.0.0.1', () => {
    console.log('open Browser on http://127.0.0.1:8087')
})