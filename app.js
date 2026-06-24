const STORAGE_KEY = "ungcheon-high-school-work-tools";
const COLOR_PALETTE = [
  ["#2970ff", "#155eef"],
  ["#7f56d9", "#6941c6"],
  ["#12b76a", "#039855"],
  ["#f79009", "#dc6803"],
  ["#f04438", "#d92d20"],
  ["#06aed4", "#088ab2"],
  ["#ee46bc", "#dd2590"],
  ["#6172f3", "#444ce7"],
];

const state = {
  tools: loadTools(),
  editingId: null,
  deletingId: null,
  searchTerm: "",
};

const elements = {
  toolsGrid: document.querySelector("#toolsGrid"),
  emptyState: document.querySelector("#emptyState"),
  emptyStateTitle: document.querySelector("#emptyStateTitle"),
  emptyStateDescription: document.querySelector("#emptyStateDescription"),
  toolCount: document.querySelector("#toolCount"),
  searchInput: document.querySelector("#searchInput"),
  toolDialog: document.querySelector("#toolDialog"),
  toolForm: document.querySelector("#toolForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  submitButtonText: document.querySelector("#submitButtonText"),
  titleInput: document.querySelector("#titleInput"),
  urlInput: document.querySelector("#urlInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  descriptionCount: document.querySelector("#descriptionCount"),
  titleError: document.querySelector("#titleError"),
  urlError: document.querySelector("#urlError"),
  deleteDialog: document.querySelector("#deleteDialog"),
  deleteToolName: document.querySelector("#deleteToolName"),
  toast: document.querySelector("#toast"),
  toastMessage: document.querySelector("#toastMessage"),
  restoreInput: document.querySelector("#restoreInput"),
  cardTemplate: document.querySelector("#toolCardTemplate"),
};

let toastTimer;

function loadTools() {
  try {
    const savedTools = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTools) ? savedTools : [];
  } catch {
    return [];
  }
}

function saveTools() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tools));
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value) {
  try {
    const url = new URL(normalizeUrl(value));
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function getInitial(title) {
  const firstCharacter = [...title.trim()][0];
  return firstCharacter ? firstCharacter.toUpperCase() : "W";
}

function getColorIndex(tool) {
  if (Number.isInteger(tool.colorIndex)) return tool.colorIndex % COLOR_PALETTE.length;
  return Math.abs(
    [...tool.title].reduce((sum, character) => sum + character.codePointAt(0), 0),
  ) % COLOR_PALETTE.length;
}

function getFilteredTools() {
  const keyword = state.searchTerm.trim().toLocaleLowerCase("ko");
  if (!keyword) return state.tools;

  return state.tools.filter((tool) => {
    const searchableText = `${tool.title} ${tool.description ?? ""}`.toLocaleLowerCase("ko");
    return searchableText.includes(keyword);
  });
}

function renderTools() {
  const filteredTools = getFilteredTools();
  elements.toolsGrid.replaceChildren();

  filteredTools.forEach((tool) => {
    const fragment = elements.cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".tool-card");
    const icon = fragment.querySelector(".tool-icon");
    const menuButton = fragment.querySelector(".menu-button");
    const menu = fragment.querySelector(".card-menu");
    const editButton = fragment.querySelector(".edit-button");
    const deleteButton = fragment.querySelector(".delete-button");
    const title = fragment.querySelector(".tool-title");
    const description = fragment.querySelector(".tool-description");
    const link = fragment.querySelector(".tool-link");
    const [startColor, endColor] = COLOR_PALETTE[getColorIndex(tool)];

    card.dataset.id = tool.id;
    icon.textContent = getInitial(tool.title);
    icon.style.background = `linear-gradient(145deg, ${startColor}, ${endColor})`;
    title.textContent = tool.title;
    description.textContent = tool.description || "설명이 등록되지 않았습니다.";
    link.href = tool.url;
    link.setAttribute("aria-label", `${tool.title} 바로가기 (새 창)`);

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeAllMenus(menu);
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    editButton.addEventListener("click", () => openToolDialog(tool));
    deleteButton.addEventListener("click", () => openDeleteDialog(tool));
    elements.toolsGrid.appendChild(fragment);
  });

  const hasSearchTerm = Boolean(state.searchTerm.trim());
  const showEmptyState = filteredTools.length === 0;

  elements.emptyState.hidden = !showEmptyState;
  elements.emptyStateTitle.textContent = hasSearchTerm
    ? "검색 결과가 없어요"
    : "아직 등록된 웹툴이 없어요";
  elements.emptyStateDescription.innerHTML = hasSearchTerm
    ? "다른 검색어를 입력하거나<br />새 웹툴을 추가해보세요."
    : "자주 사용하는 업무 도구를 추가해<br />나만의 바로가기를 만들어보세요.";

  elements.toolCount.textContent = `등록된 웹툴 ${state.tools.length}개`;
}

function closeAllMenus(except = null) {
  document.querySelectorAll(".card-menu.is-open").forEach((menu) => {
    if (menu !== except) {
      menu.classList.remove("is-open");
      menu
        .closest(".card-menu-wrap")
        .querySelector(".menu-button")
        .setAttribute("aria-expanded", "false");
    }
  });
}

function resetValidation() {
  elements.titleError.textContent = "";
  elements.urlError.textContent = "";
  elements.titleInput.classList.remove("is-invalid");
  elements.urlInput.classList.remove("is-invalid");
}

function openToolDialog(tool = null) {
  state.editingId = tool?.id ?? null;
  elements.dialogTitle.textContent = tool ? "웹툴 정보 수정" : "새 웹툴 추가";
  elements.submitButtonText.textContent = tool ? "수정하기" : "추가하기";
  elements.titleInput.value = tool?.title ?? "";
  elements.urlInput.value = tool?.url ?? "";
  elements.descriptionInput.value = tool?.description ?? "";
  elements.descriptionCount.textContent = String(elements.descriptionInput.value.length);
  resetValidation();
  closeAllMenus();
  elements.toolDialog.showModal();
  window.setTimeout(() => elements.titleInput.focus(), 50);
}

function closeToolDialog() {
  elements.toolDialog.close();
  state.editingId = null;
  elements.toolForm.reset();
  elements.descriptionCount.textContent = "0";
  resetValidation();
}

function validateForm() {
  let isValid = true;
  const title = elements.titleInput.value.trim();
  const url = elements.urlInput.value.trim();

  resetValidation();

  if (!title) {
    elements.titleError.textContent = "웹툴 제목을 입력해주세요.";
    elements.titleInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!url) {
    elements.urlError.textContent = "웹툴 링크를 입력해주세요.";
    elements.urlInput.classList.add("is-invalid");
    isValid = false;
  } else if (!isValidUrl(url)) {
    elements.urlError.textContent = "올바른 웹 주소를 입력해주세요.";
    elements.urlInput.classList.add("is-invalid");
    isValid = false;
  }

  return isValid;
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const toolData = {
    title: elements.titleInput.value.trim(),
    url: normalizeUrl(elements.urlInput.value),
    description: elements.descriptionInput.value.trim(),
  };

  if (state.editingId) {
    const toolIndex = state.tools.findIndex((tool) => tool.id === state.editingId);
    if (toolIndex !== -1) {
      state.tools[toolIndex] = { ...state.tools[toolIndex], ...toolData };
      showToast("웹툴 정보가 수정되었습니다.");
    }
  } else {
    state.tools.unshift({
      id: crypto.randomUUID(),
      ...toolData,
      colorIndex: state.tools.length % COLOR_PALETTE.length,
      createdAt: new Date().toISOString(),
    });
    showToast("새 웹툴이 추가되었습니다.");
  }

  saveTools();
  renderTools();
  closeToolDialog();
}

function openDeleteDialog(tool) {
  state.deletingId = tool.id;
  elements.deleteToolName.textContent = tool.title;
  closeAllMenus();
  elements.deleteDialog.showModal();
}

function closeDeleteDialog() {
  elements.deleteDialog.close();
  state.deletingId = null;
}

function deleteTool() {
  const tool = state.tools.find((item) => item.id === state.deletingId);
  if (!tool) return;

  state.tools = state.tools.filter((item) => item.id !== state.deletingId);
  saveTools();
  renderTools();
  closeDeleteDialog();
  showToast(`${tool.title} 항목을 삭제했습니다.`);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toastMessage.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function exportBackup() {
  const backup = {
    app: "웅천고등학교 업무 웹툴 모음",
    version: 1,
    exportedAt: new Date().toISOString(),
    tools: state.tools,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll(". ", "-")
    .replace(".", "");

  anchor.href = url;
  anchor.download = `웅천고-업무웹툴-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("백업 파일을 저장했습니다.");
}

async function restoreBackup(file) {
  try {
    const backup = JSON.parse(await file.text());
    const importedTools = Array.isArray(backup) ? backup : backup.tools;

    if (!Array.isArray(importedTools)) {
      throw new Error("Invalid backup");
    }

    const validTools = importedTools
      .filter(
        (tool) =>
          tool &&
          typeof tool.title === "string" &&
          typeof tool.url === "string" &&
          isValidUrl(tool.url),
      )
      .map((tool, index) => ({
        id: typeof tool.id === "string" ? tool.id : crypto.randomUUID(),
        title: tool.title.trim().slice(0, 40),
        url: normalizeUrl(tool.url),
        description:
          typeof tool.description === "string" ? tool.description.trim().slice(0, 140) : "",
        colorIndex: Number.isInteger(tool.colorIndex)
          ? tool.colorIndex
          : index % COLOR_PALETTE.length,
        createdAt: typeof tool.createdAt === "string" ? tool.createdAt : new Date().toISOString(),
      }));

    state.tools = validTools;
    saveTools();
    renderTools();
    showToast(`웹툴 ${validTools.length}개를 불러왔습니다.`);
  } catch {
    showToast("올바른 백업 파일이 아닙니다.");
  } finally {
    elements.restoreInput.value = "";
  }
}

document.querySelector("#openAddDialogButton").addEventListener("click", () => openToolDialog());
document.querySelector("#heroAddButton").addEventListener("click", () => openToolDialog());
document.querySelector("#emptyAddButton").addEventListener("click", () => openToolDialog());
document.querySelector("#closeDialogButton").addEventListener("click", closeToolDialog);
document.querySelector("#cancelDialogButton").addEventListener("click", closeToolDialog);
document.querySelector("#cancelDeleteButton").addEventListener("click", closeDeleteDialog);
document.querySelector("#confirmDeleteButton").addEventListener("click", deleteTool);
document.querySelector("#backupButton").addEventListener("click", exportBackup);
document.querySelector("#restoreButton").addEventListener("click", () => elements.restoreInput.click());

elements.toolForm.addEventListener("submit", handleFormSubmit);
elements.searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value;
  renderTools();
});
elements.descriptionInput.addEventListener("input", (event) => {
  elements.descriptionCount.textContent = String(event.target.value.length);
});
elements.restoreInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) restoreBackup(file);
});

elements.titleInput.addEventListener("input", () => {
  elements.titleInput.classList.remove("is-invalid");
  elements.titleError.textContent = "";
});
elements.urlInput.addEventListener("input", () => {
  elements.urlInput.classList.remove("is-invalid");
  elements.urlError.textContent = "";
});

elements.toolDialog.addEventListener("click", (event) => {
  if (event.target === elements.toolDialog) closeToolDialog();
});
elements.deleteDialog.addEventListener("click", (event) => {
  if (event.target === elements.deleteDialog) closeDeleteDialog();
});

document.addEventListener("click", () => closeAllMenus());
document.addEventListener("keydown", (event) => {
  const isTyping =
    event.target.matches("input, textarea") || event.target.isContentEditable;
  if (event.key === "/" && !isTyping && !elements.toolDialog.open) {
    event.preventDefault();
    elements.searchInput.focus();
  }
  if (event.key === "Escape") closeAllMenus();
});

document.querySelector("#currentYear").textContent = String(new Date().getFullYear());
renderTools();
