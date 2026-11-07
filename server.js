import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.post("/api/ai", async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: "أضف مفتاح OpenAI API في ملف .env أولاً."
      });
    }

    const { message, mode } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "من فضلك اكتب سؤالك."
      });
    }

    const instructions = {
      ideas: "اقترح ثلاث أفكار كابستون عملية واشرح كل فكرة.",
      analyze: "حلل المشكلة واشرح أسبابها والمتضررين منها وآثارها.",
      solution: "اقترح ثلاثة حلول وقارن بينها من حيث التكلفة والسهولة.",
      plan: "أنشئ خطة تنفيذ للمشروع على مراحل مع تحديد المهام."
    };

    const response = await ai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `
        أنت مساعد IdeaBridge.
        ساعد الطلاب في مشروعات الكابستون.
        أجب باللغة العربية الواضحة.
        اجعل الإجابات منظمة وعملية.
        لا تخترع معلومات ولا تضمن نجاح أي مشروع.
        ${instructions[mode] || "ساعد الطالب في تطوير مشروعه."}
      `,
      input: message
    });

    res.json({
      answer: response.output_text || "حاول مرة أخرى."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "حدث خطأ في الاتصال بالذكاء الاصطناعي."
    });
  }
});

app.listen(PORT, () => {
  console.log(`IdeaBridge يعمل على http://localhost:${PORT}`);
});