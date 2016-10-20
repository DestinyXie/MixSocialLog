社交化日志工具

## Installation

    npm i mix-social-log

## Usage

```js
var socialLog = require('mix-social-log');

/**
 * 发送统计及修改分享相关链接
 * @param {string=} opt_appid 项目id
 * @param {string=} opt_openid 用户唯一id，如果没有则生成唯一id并存入
 * @param {string=} opt_shareLink 传入原始分享链接，用户客户端可以通过微信js sdk修改分享链接添加分享来源
 * @return {string} 修改fromid之后的分享链接
 */
var shareLink = socialLog(opt_appid, opt_openid, opt_shareLink);

```

## License
<a href="http://nate.mit-license.org">MIT</a>