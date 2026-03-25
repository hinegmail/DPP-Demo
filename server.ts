import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const DATA_FILE = path.join(__dirname, 'public', 'demo.json');

app.use(express.json({ limit: '50mb' }));

// 获取数据 (Read Data)
app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('读取文件失败:', err);
      return res.status(500).send('读取数据失败');
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).send('解析数据失败');
    }
  });
});

// 保存数据 (Save Data)
app.post('/api/data', (req, res) => {
  const newData = req.body;
  fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 4), 'utf8', (err) => {
    if (err) {
      console.error('写入文件失败:', err);
      return res.status(500).send('保存数据失败');
    }
    res.send({ message: '数据保存成功' });
  });
});

app.listen(port, () => {
  console.log(`后端服务已启动: http://localhost:${port}`);
});
