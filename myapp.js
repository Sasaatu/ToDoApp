// ライブラリのインポート
// Webサーバー作る
const express = require('express');
// PostgreSQLに接続する
const { Pool } = require('pg');
// ブラウザからサーバーにアクセスする
const cors = require('cors');
// パス機能
const path = require('path');
// パスワード暗号化
const bcrypt = require('bcrypt');

// デバッグモード
const mode = 'docker';
// 暗号化の強さ
const saltRounds = 10;

// expressアプリを作る（これがサーバー本体）
const app = express();

app.use(cors()); 

// JSON形式のデータを受け取れるようにする（超重要）
app.use(express.json());

// =====================
// DB接続設定
// =====================
let poolConfig;

switch (mode) {
  case 'local':
    // PCのlocalで動かす場合 
    poolConfig = {
      user: 'sasaatu',
      host: 'localhost',
      database: 'myapp',
      password: '93618frc',
      port: 5432
    };
    console.log('Running in LOCAL mode');
    break;
  case 'docker':
    // 2. Dockerコンテナ（docker-compose）で動かす場合
    poolConfig = {
      user: 'sasaatu',
      host: 'db',　// Docker内のサービス名
      database: 'myapp',
      password: '93618frc',
      port: 5432
    };
    console.log('Running in DOCKER mode');
    break;
  case 'deploy':
    // 3. デプロイ環境で動かす場合
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
    console.log('Running in DEPLOY mode');
    break;
}

const pool = new Pool(poolConfig);

// =====================
// フロントエンドの設定
// =====================
// URLアクセス時にExpressにどのファイルを起動すればいいか指定する
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'myapp.html'));
});

// =====================
// ユーザー登録API
// =====================
app.post('/register', async (req, res) => {
  // リクエストの中からデータを取り出す
  const { name, email, password } = req.body;

  try {
    // パスワードをハッシュ化する
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ハッシュ化したパスワードをDBに保存する
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );

    // 成功したら、登録したデータをそのまま返す
    res.json(result.rows[0]);

  } catch (err) {
    // エラーが起きたらエラーメッセージ返す
    res.status(500).json({ error: err.message });
  }
});

// =====================
// emailチェックAPI
// =====================
app.post('/check_users', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1);',
      [email]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ログインAPI
// =====================
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ユーザー取得
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // ユーザー存在チェック
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // パスワードチェック（入力されたパスワード vs DBのハッシュ）
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(402).json({ error: 'Invalid password' });
    }

    // 簡易トークン発行（適当でOK）
    const token = user.id + '-token';

    res.json({
      message: 'login success',
      token: token,
      userId: user.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// TODO作成API
// =====================
app.post('/todos', async (req, res) => {
  const { userId, title } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// TODO取得API
// =====================
app.get('/todos', async (req, res) => {
  const userId = req.query.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1',
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// TODO更新API
// =====================
app.put('/todos/:id', async (req, res) => {
  const id = req.params.id; // URLの:id
  const { completed } = req.body;

  try {
    const result = await pool.query(
      'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// TODO削除API
// =====================
app.delete('/todos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );

    res.json({ message: 'deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// サーバー起動
// =====================
// 環境変数があればそれを使い、なければ3000を使う
const PORT = process.env.PORT || 3000;
// ポートを選択してサーバーを起動する
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});