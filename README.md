# http-proxy

使用http-proxy-middleware，创建测试接口，修改接口数据，缓存静态网页。

## 创建测试接口
```
const proxy = createProxyMiddleware({
  target: 'https://tiny.vision',
  changeOrigin: true,
  selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    console.log(proxyRes.headers['content-type'])
    console.log(proxyRes.req.path)
    let p = proxyRes.req.path;

    if(p == '/mockapi')
    {
      return 'mockapi'
    }

    return responseBuffer;
  }),
});
```

## 修改接口返回数据
```
const proxy = createProxyMiddleware({
  target: 'https://tiny.vision',
  changeOrigin: true,
  selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    console.log(proxyRes.headers['content-type'])
    console.log(proxyRes.req.path)
    let p = proxyRes.req.path;

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

    return responseBuffer;
  }),
});
```

## 缓存静态网页
浏览器访问http://localhost:8070/demos/TinyRacing/Wasm/TinyRacing.html测试
```
const proxy = createProxyMiddleware({
  target: 'https://tiny.vision',
  changeOrigin: true,
  selfHandleResponse: true, 

  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    console.log(proxyRes.headers['content-type'])
    console.log(proxyRes.req.path)
    let p = proxyRes.req.path;

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
```