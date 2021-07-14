const { json } = require('express');
const express = require('express')
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const fs = require("fs")
var path = require('path');

const app = express()
const port = 8070


// https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/response-interceptor.md#manipulate-image-response

const proxy = createProxyMiddleware({
  target: 'https://tiny.vision',
  changeOrigin: true,
  selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    console.log(proxyRes.headers['content-type'])
    console.log(proxyRes.req.path)
    let p = proxyRes.req.path;

    //创建测试接口
    if (p == '/mockapi') {
      return 'mockapi'
    }

    // 覆盖接口
    if (proxyRes.headers['content-type'] == 'application/json') {
      // 修改返回json
      // let data = JSON.parse(responseBuffer.toString('utf8'));
      // // manipulate JSON data here
      // data = Object.assign({}, data, { extra: 'foo bar' });
      // // return manipulated JSON
      // return JSON.stringify(data);

      var content = responseBuffer.toString('utf-8');
      console.log(content);

      // 使用json文件内容
      if (p == '/data-api/terminalBG/digitalMedia?dateType=1&spaceId=221&spaceType=2') {
        return fs.readFileSync('test.json', 'utf8')
      }
    }

    // 缓存静态网页
    if (!(p.includes('?') || p.endsWith('/'))) {
      let cacheDir = './cache'
      let dir = cacheDir + path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(cacheDir + p, responseBuffer, 'binary');
    }

    return responseBuffer;
  }),
});


app.use('/', proxy)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})