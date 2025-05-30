import express from 'express';
import cors from 'cors';

async function evalAndCaptureOutput(code) {
  const oldLog = console.log;
  const oldError = console.error;

  const output = [];
  const errorOutput = []; 

  console.log = (...args) => output.push(args.join(' '));
  console.error = (...args) => errorOutput.push(args.join(' '));

  try {
    await eval(code);
  } catch (error) {
    errorOutput.push(error.message);
  }

  console.log = oldLog;
  console.error = oldError;

  return {stdout: output.join('\n'), stderr: errorOutput.join('\n')};
}

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({origin: '*'}));

app.post('/', async (req, res) => {
    const {code} = req.body;
    console.log('------------------------------------');
    console.log('Code to execute:', code);
    console.log('------------------------------------');
    
    const result = await evalAndCaptureOutput(code);

    res.json(result);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});