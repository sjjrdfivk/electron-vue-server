// 使用中间件代理
const express = require('express');
const app = express();
var {createProxyMiddleware} = require('http-proxy-middleware');
app.disable('etag')
app.all('*', function(req, res, next) { // 本地跨域问题
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With,DNT,X-CustomHeader,Keep-Alive,User-Agent,If-Modified-Since,Cache-Control,Content-Type,Access-Control-Allow-Headers,Authorization,Origin,Accept,Power-By,token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("accept",'image/webp,image/apng,image/*,*/*;q=0.8')
    // req.setHeader('Cache-Control', 'public, max-age=31557600')
    next();
});

var options = {
    target: 'https://yamimealcoreapitestwin.azurewebsites.net',
    // target: 'http://feature-pm1128.lms2uat.wiltechs.cn',
    changeOrigin: true,
    ws: true,
    onProxyReq: function(proxyRes, req, res){
        // 缓存
        proxyRes.setHeader('Cache-Control',  'public, max-age=31557600');
    },
};

app.use('**', createProxyMiddleware(options)); // 所有接口代理

app.listen('3000', function() {
    console.log('[DEMO] Server: listening on port 3000')
});