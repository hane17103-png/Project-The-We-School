const defaultProblems = [
  {
    id: "1",
    title: "هدر المياه في المنازل",
    category: "البيئة",
    difficulty: "متوسط",
    icon: "💧",
    description: "استهلاك كميات كبيرة من المياه بسبب التسريبات وعدم متابعة الاستهلاك.",
    impact: "الأسر والمجتمع"
  },
  {
    id: "2",
    title: "نقص الأدوية في الأسواق",
    category: "الصحة",
    difficulty: "متوسط",
    icon: "✚",
    description: "صعوبة معرفة الصيدليات التي يتوفر لديها الدواء المطلوب.",
    impact: "المرضى والصيدليات"
  },
  {
    id: "3",
    title: "تشتت مصادر المذاكرة",
    category: "التعليم",
    difficulty: "سهل",
    icon: "📚",
    description: "صعوبة تنظيم المراجع والملخصات ومتابعة التقدم الدراسي.",
    impact: "الطلاب"
  },
  {
    id: "4",
    title: "المخلفات الإلكترونية",
    category: "البيئة",
    difficulty: "متوسط",
    icon: "♻️",
    description: "تراكم الأجهزة القديمة وعدم التخلص منها بطريقة صحيحة.",
    impact: "البيئة والمجتمع"
  },
  {
    id: "5",
    title: "تنظيم المواصلات",
    category: "المجتمع",
    difficulty: "متقدم",
    icon: "🚌",
    description: "صعوبة معرفة أوقات الانتظار وتنظيم الرحلات اليومية.",
    impact: "الطلاب والموظفون"
  },
  {
    id: "6",
    title: "الأخبار المضللة",
    category: "التكنولوجيا",
    difficulty: "متقدم",
    icon: "🔎",
    description: "انتشار معلومات غير دقيقة وصعوبة التحقق من مصادر الأخبار.",
    impact: "مستخدمو الإنترنت"
  }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function readData(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

let problems = readData("ibProblems", defaultProblems);
let solutions = readData("ibSolutions", []);
let role = readData("ibRole", "student");
let currentMode = "ideas";

function saveData() {
  localStorage.setItem("ibProblems", JSON.stringify(problems));
  localStorage.setItem("ibSolutions", JSON.stringify(solutions));
  localStorage.setItem("ibRole", JSON.stringify(role));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function showPage(pageName) {
  $$(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageName);
  });

  $$(".nav").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  const titles = {
    home: "مرحباً بك في IdeaBridge",
    problems: "اكتشف المشكلات",
    assistant: "المساعد الذكي",
    submit: "شارك حلك",
    projects: "معرض المشاريع",
    review: "مراجعة الحلول"
  };

  $("#pageTitle").textContent = titles[pageName] || "IdeaBridge";
}

function problemCard(problem) {
  return `
    <article class="problem-card">
      <div>
        <span class="category">${escapeHTML(problem.category)}</span>
        <span class="difficulty">${escapeHTML(problem.difficulty)}</span>
      </div>

      <h3>${problem.icon || "◈"} ${escapeHTML(problem.title)}</h3>

      <p>${escapeHTML(problem.description)}</p>

      <div class="card-bottom">
        <span>${escapeHTML(problem.impact || "المجتمع")}</span>
        <button class="small-btn" data-use="${problem.id}">
          اقترح حلاً ←
        </button>
      </div>
    </article>
  `;
}

function renderProblems() {
  $("#featuredProblems").innerHTML =
    problems.slice(0, 3).map(problemCard).join("");

  const search = $("#searchInput").value.toLowerCase().trim();
  const category = $("#categoryFilter").value;

  const filtered = problems.filter(problem => {
    const matchesSearch =
      `${problem.title} ${problem.description} ${problem.category}`
      .toLowerCase()
      .includes(search);

    const matchesCategory =
      category === "all" || problem.category === category;

    return matchesSearch && matchesCategory;
  });

  $("#allProblems").innerHTML = filtered.length
    ? filtered.map(problemCard).join("")
    : `<div class="empty">لا توجد مشكلات مطابقة للبحث.</div>`;

  $("#solutionProblem").innerHTML = problems.map(problem => `
    <option value="${problem.id}">
      ${escapeHTML(problem.title)}
    </option>
  `).join("");
}

function solutionCard(solution, review = false) {
  const problem = problems.find(p => p.id === solution.problemId);

  let statusText = "قيد المراجعة";

  if (solution.status === "approved") statusText = "تمت الموافقة";
  if (solution.status === "rejected") statusText = "مرفوض";

  return `
    <article class="project-card">
      <div>
        <span class="category">
          ${escapeHTML(problem?.category || "مشروع")}
        </span>

        <span class="status">${statusText}</span>

        <h3>${escapeHTML(solution.title)}</h3>

        <p>${escapeHTML(solution.description)}</p>

        <small>
          المشكلة: ${escapeHTML(problem?.title || "غير محددة")}
        </small>

        <p>التقنيات: ${escapeHTML(solution.tech || "غير محددة")}</p>
      </div>

      ${
        review && solution.status === "pending"
        ? `
          <div class="actions">
            <button class="approve" data-approve="${solution.id}">
              موافقة
            </button>

            <button class="reject" data-reject="${solution.id}">
              رفض
            </button>
          </div>
        `
        : ""
      }
    </article>
  `;
}

function renderProjects() {
  const approved = solutions.filter(
    solution => solution.status === "approved"
  );

  const pending = solutions.filter(
    solution => solution.status === "pending"
  );

  $("#projectList").innerHTML = approved.length
    ? approved.map(solution => solutionCard(solution)).join("")
    : `<div class="empty">لا توجد مشاريع منشورة حتى الآن.</div>`;

  $("#reviewList").innerHTML = pending.length
    ? pending.map(solution => solutionCard(solution, true)).join("")
    : `<div class="empty">لا توجد حلول تحتاج إلى مراجعة.</div>`;
}

function render() {
  $("#problemCount").textContent = problems.length;
  $("#solutionCount").textContent = solutions.length;

  $("#projectCount").textContent =
    solutions.filter(s => s.status === "approved").length;

  renderProblems();
  renderProjects();

  document.body.classList.toggle(
    "staff-visible",
    role !== "student"
  );

  $("#roleSelect").value = role;

  $("#roleName").textContent =
    role === "admin" ? "مدير النظام" :
    role === "supervisor" ? "مشرف" : "طالب";
}

// التنقل بين الصفحات
$$("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

// أزرار الانتقال داخل الصفحة
document.addEventListener("click", event => {
  const goButton = event.target.closest("[data-go]");

  if (goButton) {
    showPage(goButton.dataset.go);
  }

  // اختيار مشكلة لإضافة حل
  const useButton = event.target.closest("[data-use]");

  if (useButton) {
    $("#solutionProblem").value = useButton.dataset.use;
    showPage("submit");
  }

  // موافقة المشرف
  const approveButton = event.target.closest("[data-approve]");

  if (approveButton) {
    solutions = solutions.map(solution =>
      solution.id === approveButton.dataset.approve
        ? { ...solution, status: "approved" }
        : solution
    );

    saveData();
    render();
    showToast("تمت الموافقة على المشروع.");
  }

  // رفض الحل
  const rejectButton = event.target.closest("[data-reject]");

  if (rejectButton) {
    solutions = solutions.map(solution =>
      solution.id === rejectButton.dataset.reject
        ? { ...solution, status: "rejected" }
        : solution
    );

    saveData();
    render();
    showToast("تم تحديث حالة الحل.");
  }
});

// تغيير نوع الحساب
$("#roleSelect").addEventListener("change", event => {
  role = event.target.value;
  saveData();
  render();
  showToast("تم تغيير نوع الحساب.");
});

// البحث والتصفية
$("#searchInput").addEventListener("input", renderProblems);
$("#categoryFilter").addEventListener("change", renderProblems);

// إرسال الحل
$("#solutionForm").addEventListener("submit", event => {
  event.preventDefault();

  if (role !== "student") {
    showToast("اختر حساب الطالب لتقديم حل.");
    return;
  }

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  solutions.unshift({
    id: Date.now().toString(),
    ...data,
    status: "pending",
    createdAt: new Date().toISOString()
  });

  saveData();
  render();

  event.target.reset();
  showPage("projects");

  showToast("تم إرسال الحل للمراجعة بنجاح.");
});

// اختيار نوع المساعدة في الذكاء الاصطناعي
$$(".mode").forEach(button => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;

    $$(".mode").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
  });
});

function addMessage(message, type) {
  const element = document.createElement("div");

  element.className = `message ${type}`;
  element.textContent = message;

  $("#messages").appendChild(element);
  $("#messages").scrollTop = $("#messages").scrollHeight;

  return element;
}

// الاتصال بمساعد الذكاء الاصطناعي
$("#aiForm").addEventListener("submit", async event => {
  event.preventDefault();

  const input = $("#aiInput");
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const waiting = addMessage("جاري التفكير في إجابتك...", "bot");
  const sendButton = $("#aiForm button");

  sendButton.disabled = true;

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        mode: currentMode
      })
    });

    const data = await response.json();

    waiting.textContent = response.ok
      ? data.answer
      : data.error || "حدث خطأ أثناء الاتصال.";
  } catch (error) {
    waiting.textContent =
      "تعذر الاتصال بالخادم. تأكد من تشغيل الموقع باستخدام npm start.";
  } finally {
    sendButton.disabled = false;
    $("#messages").scrollTop = $("#messages").scrollHeight;
  }
});

// إعادة بيانات التجربة
$("#resetBtn").addEventListener("click", () => {
  const confirmed = confirm("هل تريد إعادة ضبط بيانات الموقع؟");

  if (!confirmed) return;

  problems = [...defaultProblems];
  solutions = [];
  role = "student";

  saveData();
  render();
  showPage("home");

  showToast("تمت إعادة ضبط البيانات.");
});

// تشغيل الموقع
render();
showPage("home");