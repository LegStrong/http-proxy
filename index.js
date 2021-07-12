const express = require('express')
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');



const app = express()
const port = 3000


const proxy = createProxyMiddleware({
  target: 'http://localhost',
  changeOrigin: true, // for vhosted sites

  /**
   * IMPORTANT: avoid res.end being called automatically
   **/
  selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

  /**
   * Intercept response and replace 'Hello' with 'Teapot' with 418 http response status code
   **/
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    //res.statusCode = 418; // set different response status code

    // const response = responseBuffer.toString('utf8');
    // return response.replace('Hello', 'Teapot');
    console.log(proxyRes.req.path)
    console.log(req.path)

    return responseBuffer;
  }),
});


app.use('/', proxy)

app.listen(port, ()=>{
    console.log(`Listening at http://localhost${port}`)
})