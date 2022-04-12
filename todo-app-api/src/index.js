const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const cors = require('cors');
require('./db/mongoose');

const app = express();
const port = process.env.port || 3001;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.use(cors());

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

