# 1. ベースとなるNode.jsのバージョンを指定
FROM node:15

# 2. コンテナ内の作業ディレクトリを作成
WORKDIR /app

# 3. package.json を先にコピーしてライブラリをインストール
# (コード修正のたびに install し直さないための工夫)
COPY package*.json ./
RUN npm install

# 4. 残りのソースコードをコピー
COPY . .

# 5. アプリが起動するポートを指定
EXPOSE 3000

# 6. アプリを起動するコマンド
CMD ["node", "myapp.js"]