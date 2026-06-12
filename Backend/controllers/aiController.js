import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateQuizHandler = async (req, res) => {
  try {
    const { topic, count = 5, level = 'beginner' } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate ${count} multiple choice quiz questions about "${topic}" for a ${level} level course.

Return ONLY a valid JSON array with no explanation, no markdown, no backticks. Format:
[
  {
    "question": "Question text here?",
    "answer": "Correct answer here",
    "options": ["Correct answer here", "Wrong option 1", "Wrong option 2", "Wrong option 3"],
    "points": 10
  }
]

Make sure:
- The correct answer is always included in the options array
- Options are shuffled (correct answer not always first)
- Questions are clear and educational
- All ${count} questions are about "${topic}"`,
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const quizzes = JSON.parse(clean);

    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error('AI Quiz Generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate quiz questions' });
  }
};

export const courseAssistantHandler = async (req, res) => {
  try {
    const { question, course_title, lesson_content, conversation_history = [] } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const systemPrompt = `You are a helpful course assistant for "${course_title || 'this course'}". 
Your job is to help students understand the course material.
${lesson_content ? `Current lesson content:\n${lesson_content}` : ''}
Be concise, clear, and educational. If a question is unrelated to the course, politely redirect.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history,
      { role: 'user', content: question },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;
    res.json({ success: true, data: { answer } });
  } catch (err) {
    console.error('AI Course Assistant error:', err);
    res.status(500).json({ success: false, message: 'Failed to get AI response' });
  }
};

export const assignmentFeedbackHandler = async (req, res) => {
  try {
    const { submission_content, assignment_title, assignment_description, max_points } = req.body;

    if (!submission_content) {
      return res.status(400).json({ success: false, message: 'Submission content is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are a teaching assistant helping grade an assignment.

Assignment: "${assignment_title}"
${assignment_description ? `Description: ${assignment_description}` : ''}
Max Points: ${max_points || 100}

Student Submission:
${submission_content}

Provide feedback in this JSON format only, no markdown, no backticks:
{
  "suggested_grade": 85,
  "summary": "Brief overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "detailed_feedback": "Detailed paragraph feedback here"
}`,
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = completion.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const feedback = JSON.parse(clean);

    res.json({ success: true, data: feedback });
  } catch (err) {
    console.error('AI Assignment Feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate feedback' });
  }
};