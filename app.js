const TOOLS = [
  {
    title: "과목 선택 도우미",
    url: "course-selection.html",
    description: "2026학년도 입학생용 선택과목 추천·선택 조건 검증 도구",
    department: "진로교육부",
    colorIndex: 1,
  },
  {
    title: "1학년 과목 선택 도우미",
    url: "course-selection-grade1.html",
    description: "1학년 학생의 선택과목 설계와 선택 조건 확인을 돕는 도구",
    department: "교육과정부",
    colorIndex: 2,
  },
  {
    title: "2학년 과목 선택 도우미",
    url: "course-selection-grade2.html",
    description: "2학년 학생의 선택과목 설계와 선택 조건 확인을 돕는 도구",
    department: "교육과정부",
    colorIndex: 3,
  },
];

const COLOR_PALETTE = [
  ["#2970ff", "#155eef"],
  ["#7f56d9", "#6941c6"],
  ["#12b76a", "#039855"],
  ["#f79009", "#dc6803"],
];

const toolsGrid = document.querySelector("#toolsGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const toolCount = document.querySelector("#toolCount");
const cardTemplate = document.querySelector("#toolCardTemplate");

function renderTools() {
  const keyword = searchInput.value.trim().toLocaleLowerCase("ko");
  const filteredTools = TOOLS.filter((tool) =>
    `${tool.title} ${tool.description} ${tool.department}`
      .toLocaleLowerCase("ko")
      .includes(keyword),
  );

  toolsGrid.replaceChildren();

  filteredTools.forEach((tool) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const icon = fragment.querySelector(".tool-icon");
    const [startColor, endColor] = COLOR_PALETTE[tool.colorIndex];

    icon.textContent = [...tool.title][0];
    icon.style.background = `linear-gradient(145deg, ${startColor}, ${endColor})`;
    fragment.querySelector(".tool-department").textContent = tool.department;
    fragment.querySelector(".tool-title").textContent = tool.title;
    fragment.querySelector(".tool-description").textContent = tool.description;

    const link = fragment.querySelector(".tool-link");
    link.href = tool.url;
    link.setAttribute("aria-label", `${tool.title} 바로가기 (새 창)`);

    toolsGrid.appendChild(fragment);
  });

  emptyState.hidden = filteredTools.length > 0;
  toolCount.textContent = `등록된 웹툴 ${TOOLS.length}개`;
}

searchInput.addEventListener("input", renderTools);
document.addEventListener("keydown", (event) => {
  const isTyping = event.target.matches("input, textarea") || event.target.isContentEditable;
  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector("#currentYear").textContent = String(new Date().getFullYear());
renderTools();
