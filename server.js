var fs = require("fs")
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//所有接口跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/',function(req,res){
    res.json('helloword')
})

app.post('/login', function (req, res) {
    fs.readFile('public/user.json', 'utf-8', function (error, data) {
        if (error) return console.error(error)
        var person = JSON.parse(data)
        var userStatus = false;  //用户是否存在
        var passStatus = false;  //密码错误是否存在
        for(var i=0;i<person.length;i++){
            var userdata = person[i];
            if(userdata['name'] === req.body.username){
                if(userdata['password'] === req.body.password){
                    passStatus = true
                }
                userStatus = true
            }
        }
        if (!userStatus) {
            res.status(200)
            res.json({message:'不存在用户!',status:false})
        } else if (!passStatus) {
            res.status(200)
            res.json({message:'用户密码错误!',status:false})
        } else {
            res.status(200)
            res.json({message:'成功！',status:true})
        }
    })
})

var server = app.listen(8087, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
