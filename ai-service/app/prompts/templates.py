DOMAIN_LABELS = {
    "software": "Software Development (data structures, algorithms, system design, web/backend)",
    "ai_ds": "AI / Data Science (ML fundamentals, statistics, Python, model evaluation)",
}

# Anchor template questions per domain — bias the LLM to stay on track and behave like
# a real interview rather than freeform generation. The model is asked to either pick or
# rewrite from these.
ANCHORS = {
    "software": [
        "Explain the difference between an array and a linked list. When would you use each?",
        "What is Big-O notation? Give the complexity of binary search and explain why.",
        "Describe how HTTP differs from HTTPS at a high level.",
        "What is a database index and how does it speed up queries?",
        "Walk me through how you would design a URL shortener.",
        "What is the difference between processes and threads?",
        "How does garbage collection work in a language like Java or JavaScript?",
        "Explain SQL JOINs: inner, left, right.",
        "What is a REST API? What are its key principles?",
        "How would you debug a slow web page?",
    ],
    "ai_ds": [
        "Explain the bias-variance tradeoff.",
        "What is the difference between supervised and unsupervised learning?",
        "How does logistic regression differ from linear regression?",
        "What is overfitting and how can you prevent it?",
        "Explain precision, recall, and F1 score.",
        "What is a confusion matrix?",
        "Describe gradient descent in plain language.",
        "What is the curse of dimensionality?",
        "When would you use a decision tree vs a neural network?",
        "Explain cross-validation.",
    ],
}


def system_question_gen() -> str:
    return (
        "You are SmartPrep, an AI technical interviewer. "
        "Generate ONE interview question that fits the requested domain and difficulty. "
        "Keep it concise (1-2 sentences). Do not include the answer. "
        "Avoid repeating any question already asked in the history."
    )


def system_evaluator() -> str:
    return (
        "You are an expert technical interview evaluator. "
        "Given a question and the candidate's spoken answer (transcribed), "
        "score the answer on three axes from 0 to 100: "
        "technicalScore (correctness/depth), clarityScore (how clearly explained), "
        "confidenceScore (assertiveness/hedging cues from word choice). "
        "Also produce one short actionable suggestion (<=200 chars) and a "
        "nextDifficulty (easy|medium|hard) calibrated against current performance."
    )


def system_feedback() -> str:
    return (
        "You are SmartPrep's coach. Given the full interview transcript with per-turn scores, "
        "produce a concise narrative summary (3-4 sentences) and exactly 3 actionable tips "
        "(short bullet strings). Also compute overall scores on 0-100 by averaging turn scores."
    )


def system_challenge() -> str:
    return (
        "You generate one multiple-choice technical question. "
        "Return JSON: question, options (4 strings), correctIndex (0-3), explanation."
    )
