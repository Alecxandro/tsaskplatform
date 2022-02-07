import express from "express";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

import { Router, Request, Response } from "express";

const app = express();
const route = Router();
const PORT = 7070;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const prisma = new PrismaClient({});

app.use(express.json());

route.get("/", async (req: Request, res: Response) => {
  //res.json({message: 'hello world with typescript!'});
  const question = await prisma.questions.findMany({});
  res.render("index", {
    question: question,
  });
});

route.get("/ask", async (req: Request, res: Response) => {
  res.render("ask");
});

route.get("/question/:id", async (req: Request, res: Response) => {
  const {id} = req.params;

  const question = await prisma.questions.findUnique({
    where: {id: Number(id)},
  })

  if (question !== undefined) {
    const answer = await prisma.answers.findMany({
        where: {id: Number(id)},
        orderBy: {id: 'desc'}
    })

    res.render("question", {
      question: question,
      answer: answer,
    })
  }

  
})

route.post("/savequestion", async (req: Request, res: Response) => {
  const { questionTitle, questionDescription } = req.body;

  if (questionTitle && questionDescription) {
    try {
      const question = await prisma.questions.create({
        data: {
          title: questionTitle,
          description: questionDescription,
        },
      });
      console.log(`${question} saved!`);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("you need to fill all the fields");
    res.redirect("/ask");
  }
});

app.use(route);

app.listen(PORT, () => `server running on port ${PORT}...`);
