const express = require('express');
const app = express();

app.use(express.json()); // Middleware để xử lý JSON request

app.use('/api/auth', require("./routes/user"));

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
