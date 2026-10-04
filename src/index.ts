import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

// app.get("/", (req: Request, res: Response) => {
//     res.send("AAAAAAAAAAAAA")
// });

app.listen(PORT, () => {
    console.log(`API rodando na porta: ${PORT}`);
});