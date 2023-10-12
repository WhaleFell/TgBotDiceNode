# NodeJS-Telegram-Bot

## Deploy

全程使用 docker 部署

### mariadb/mysql

```shell
docker pull mariadb

docker run -d --name mariadb \
-p 3306:3306 \
--restart=always \
-v /wfwork/mariadb:/var/lib/mysql \
-e MARIADB_ROOT_PASSWORD=lovehyy \
-e MARIADB_DATABASE=test \
-e TZ=Asia/Shanghai \
mariadb:latest
```

新建 tgbotdice 数据库并导入 `tgbotdice.sql` 文件。

### node app

```shell
docker pull node

# first run and install module
docker run -dit --name node \
-p 3888:3888 \
-v /wfwork/TgBotDiceNode:/wkdir/ \
-e TZ=Asia/Shanghai \
-w /wkdir/ \
node

# entry docker shell
docker exec -it node bash
npm install -g pnpm
pnpm install

# finally command
docker run -d --name TgBotDiceNode \
-p 3888:3888 \
-v /wfwork/TgBotDiceNode:/wkdir/ \
-e TZ=Asia/Shanghai \
-w /wkdir/ \
node app.js
```

### back-end

```shell
docker run -d --name TgBotDiceAdmin -p 999:80 -v /root/TgBotDiceAdmin:/usr/share/nginx/html nginx
```

## Update feature

- v2.0.0 新增开奖站接口，修复bug若干
- v2.0.1 优化封盘算法，开奖结果
- v2.0.2 优化投注失败提示
- v2.0.3 对用户发送的文字消息进行过滤，提高性能
- v2.0.4 限制过长的消息，防止对程序造成崩溃
