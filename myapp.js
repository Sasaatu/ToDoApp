// expressというライブラリを読み込む（Webサーバー作るため）
const express = require('express');

// PostgreSQLに接続するためのライブラリ
const { Pool } = require('pg');

// expressアプリを作る（これがサーバー本体）
const app = express();

// ブラウザからサーバーにアクセスできるようにする設定
const cors = require('cors');
app.use(cors()); 

// JSON形式のデータを受け取れるようにする（超重要）
app.use(express.json());


// =====================
// DB接続設定
// =====================
const pool = new Pool({
  user: 'sasaatu',      // DBのユーザー名
  host: 'localhost',    // DBの場所（自分のPC）
  database: 'myapp',    // 使うデータベース名
  password: '93618frc', // パスワード
  port: 5432,           // PostgreSQLのポート
});

// =====================
// ユーザー登録API
// =====================
// POST /register にリクエストが来たときに実行される
app.post('/register', async (req, res) => {

  // リクエストの中からデータを取り出す
  // 例：{ "name": "taro", "email": "...", "password": "..." }
  const { name, email, password } = req.body;

  try {
    // SQLを実行してDBにデータを入れる
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password] // ← $1, $2, $3 に対応
    );

    // 成功したら、登録したデータをそのまま返す
    res.json(result.rows[0]);

  } catch (err) {
    // エラーが起きたらエラーメッセージ返す
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

    // パスワードチェック（今はそのまま比較）
    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong password' });
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
  const { title, completed } = req.body;

  try {
    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [title, completed, id]
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
// ポート3000でサーバーを起動する
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});