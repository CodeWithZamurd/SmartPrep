DOMAIN_LABELS = {
    # New slugs (match backend Domain seeds)
    "frontend": "Frontend Development (HTML, CSS, JavaScript, React/Vue, accessibility, performance)",
    "data-science": "Data Science (statistics, ML pipelines, pandas/numpy, model evaluation)",
    "devops": "DevOps (CI/CD, Docker/Kubernetes, infra-as-code, observability)",
    "cyber-security": "Cyber Security (AppSec, OWASP, cryptography basics, threat modeling)",
    "ai": "Artificial Intelligence (ML, deep learning, LLMs, prompt engineering)",
    "qa": "Quality Assurance (testing strategies, automation, bug triage, severity/priority)",
    "web": "Full-stack Web Development (HTTP, REST, databases, auth, deployment)",
    # Legacy slugs (kept for backwards compatibility)
    "software": "Software Development (data structures, algorithms, system design, web/backend)",
    "ai_ds": "AI / Data Science (ML fundamentals, statistics, Python, model evaluation)",
}

ANCHORS = {
    "frontend": [
        "Explain the difference between var, let, and const in JavaScript.",
        "What is the virtual DOM and how does React use it?",
        "How does CSS specificity work and how do you debug conflicts?",
        "Explain event delegation and when you would use it.",
        "What are React hooks? Compare useEffect and useLayoutEffect.",
        "How would you optimize the load time of a single-page application?",
        "What is the difference between localStorage, sessionStorage, and cookies?",
        "Describe the box model and how box-sizing: border-box changes it.",
        "What is a closure in JavaScript? Give a real-world example.",
        "How do you make a website accessible (a11y best practices)?",
    ],
    "data-science": [
        "Explain the bias-variance tradeoff with an example.",
        "What is the difference between supervised and unsupervised learning?",
        "How does regularization (L1 vs L2) prevent overfitting?",
        "Explain precision, recall, and F1 score and when each matters.",
        "What is cross-validation? Why is it important?",
        "Describe how a random forest differs from a single decision tree.",
        "How would you handle missing data in a dataset?",
        "Explain the difference between PCA and t-SNE.",
        "What is data leakage and how do you prevent it?",
        "Walk me through evaluating a binary classifier on imbalanced data.",
    ],
    "devops": [
        "Explain the difference between containers and virtual machines.",
        "Describe a typical CI/CD pipeline.",
        "How does Kubernetes handle pod scheduling and self-healing?",
        "What is infrastructure as code? Compare Terraform and CloudFormation.",
        "Explain blue-green vs canary deployments.",
        "How would you debug a production service that's intermittently slow?",
        "What is the role of a service mesh?",
        "Explain how secrets should be managed in a Kubernetes cluster.",
        "What metrics would you put on an SLO dashboard for an HTTP API?",
        "How would you design a zero-downtime deployment for a stateful service?",
    ],
    "cyber-security": [
        "Explain the OWASP Top 10 and pick three you'd prioritize fixing.",
        "What is the difference between authentication and authorization?",
        "How does TLS work at a high level?",
        "Explain SQL injection and how to prevent it.",
        "What is CSRF and how do CSRF tokens mitigate it?",
        "Describe the principle of least privilege with an example.",
        "How would you securely store passwords?",
        "Explain symmetric vs asymmetric encryption.",
        "What is a man-in-the-middle attack? How do you defend against it?",
        "Walk me through threat modeling for a new feature.",
    ],
    "ai": [
        "Explain what a transformer is and why it works for language tasks.",
        "What is the difference between fine-tuning and prompt engineering?",
        "How does retrieval-augmented generation (RAG) reduce hallucinations?",
        "What is gradient descent? Explain like I'm a junior dev.",
        "Compare supervised, self-supervised, and reinforcement learning.",
        "What is overfitting? How do you detect and prevent it?",
        "Explain attention mechanisms in plain English.",
        "What is embedding similarity and where do you use it?",
        "Walk me through how you would evaluate an LLM application.",
        "What are the trade-offs of using a larger vs smaller model?",
    ],
    "qa": [
        "Explain the difference between functional and non-functional testing.",
        "Describe the test pyramid (unit, integration, e2e).",
        "When you find a bug in production, walk me through your triage steps.",
        "Difference between Severity and Priority? Give an example of high-severity, low-priority.",
        "What is regression testing and how do you decide what to retest?",
        "How do you decide what to automate vs test manually?",
        "Explain boundary value analysis with an example.",
        "What's the difference between smoke and sanity testing?",
        "How would you test a payment checkout flow end-to-end?",
        "An API returns 200 OK but data isn't saved. How do you investigate?",
    ],
    "web": [
        "Explain how a browser renders a web page after receiving HTML.",
        "What is REST? What are its constraints?",
        "How does JWT-based authentication work?",
        "Compare server-side rendering and client-side rendering.",
        "What is database indexing and when does it hurt performance?",
        "How would you design a URL shortener?",
        "Explain CORS and how to configure it correctly.",
        "What is GraphQL and when would you choose it over REST?",
        "How do you handle file uploads at scale?",
        "Walk me through scaling a read-heavy web app.",
    ],
    # Legacy
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


def domain_label(slug: str) -> str:
    return DOMAIN_LABELS.get(slug, DOMAIN_LABELS.get("web"))


def domain_anchors(slug: str):
    return ANCHORS.get(slug, ANCHORS.get("web"))


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
        "produce: (1) a concise narrative summary (3-4 sentences); (2) exactly 3 actionable tips; "
        "(3) voice metrics (fillerWords, pacing, clarity, toneConfidence) on 0-100 derived from "
        "transcript quality cues; (4) body language metrics (eyeContact, facialSentiment, "
        "fidgeting, posture) on 0-100 — use neutral 80 defaults if no video signal is available; "
        "(5) personalized suggestions for technical, voice, and bodyLanguage focus areas (1-2 sentences each)."
    )


def system_challenge() -> str:
    return (
        "You generate one daily technical interview challenge question for a tech job seeker. "
        "Return JSON with keys: question (1-2 sentences), answer (concise model answer, 2-4 sentences), "
        "explanation (a deeper dive, 4-8 sentences, may include short bulleted insights). "
        "Keep the tone like a friendly senior engineer mentoring a junior."
    )
