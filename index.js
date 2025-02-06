const express = require('express');
const app = express();

app.use(express.json()); // Middleware để xử lý JSON request

app.get('/', (req, res) => {
    res.send('Hello, API is running!');
});

// API endpoint mẫu
app.use('/api/users', (req, res) => {
    res.json([{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }]);
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
