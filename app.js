/* ============================================================
   区块开始：全局状态 & 数据管理
   ============================================================ */

const APP_STORAGE_KEY = 'petly_app_data';

const defaultData = () => ({
  courses: [],
  todos: [],
  anniversaries: [],
  pets: [],
  vocab: [],
  settings: {
    theme: 'light',
    bgType: 'default',
    bgCustom: '',
    apiBase: 'https://api.deepseek.com',
    apiKey: '',
    apiModel: '',
    notifyEnabled: true,
    notifyMinutes: 15,
    petNotifyEnabled: true
  },
  petStates: {},
  vocabStats: { streak: 0, lastDate: '' }
});

let appData = loadData();

function loadData() {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const def = defaultData();
      return {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) }
      };
    }
  } catch (e) {
    console.error('数据加载失败:', e);}
  return defaultData();
}

function saveData() {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
  } catch (e) {
    console.error('数据保存失败:', e);
    showToast('数据保存失败', 'error');
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ============================================================
   区块结束：全局状态 & 数据管理
   ============================================================ */

/* ============================================================
   区块开始：工具函数
   ============================================================ */

function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateCN(date) {
  const d = new Date(date);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: 'LATE NIGHT', emoji: '🌙' };
  if (h < 9) return { text: 'GOOD MORNING', emoji: '🌅' };
  if (h < 12) return { text: 'GOOD MORNING', emoji: '☀️' };
  if (h < 14) return { text: 'GOOD AFTERNOON', emoji: '🌤️' };
  if (h < 18) return { text: 'GOOD AFTERNOON', emoji: '🌇' };
  if (h < 22) return { text: 'GOOD EVENING', emoji: '🌆' };
  return { text: 'GOOD NIGHT', emoji: '🌙' };
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 周一为起始
}

function isSameDay(d1, d2) {
  return formatDate(d1) === formatDate(d2);
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return1 + Math.round(((d - week1) / 86400000 -3 + (week1.getDay() + 6) % 7) / 7);
}

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  }
  return dates;
}

function getCoursesForDate(dateStr) {
  return appData.courses.filter(c => c.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function getTodosForDate(dateStr) {
  return appData.todos.filter(t => t.date === dateStr);
}

function getAnniversariesForDate(dateStr) {
  const d = new Date(dateStr);
  return appData.anniversaries.filter(a => {
    const ad = new Date(a.date);
    return ad.getMonth() === d.getMonth() && ad.getDate() === d.getDate();
  });
}

/* ============================================================
   区块结束：工具函数
   ============================================================ */

/* ============================================================
   区块开始：Toast 通知系统
   ============================================================ */

function showToast(message, type = 'success', duration = 3000) {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   区块结束：Toast 通知系统
   ============================================================ */

/* ============================================================
   区块开始：主题 & 背景管理
   ============================================================ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  appData.settings.theme = theme;
  const btn = $('btn-theme');
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#0f0f1e' : '#f5f3ff';
  }
  saveData();
}

function toggleTheme() {
  const current = appData.settings.theme;
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

const BG_PRESETS = {
  default: 'linear-gradient(135deg, #e8e4ff 0%, #fce4f3 40%, #e4f0ff 100%)',
  sunset: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ocean: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  forest: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  night: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  rose: 'linear-gradient(135deg, #fecfef 0%, #ff9a9e 100%)',
  mint: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)',
  lavender: 'linear-gradient(135deg, #c3b1e1 0%, #e8d5f5 100%)'
};

const BG_PRESETS_DARK = {
  default: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 40%, #0a1628 100%)',
  sunset: 'linear-gradient(135deg, #3d1c00 0%, #5c1a0a 100%)',
  ocean: 'linear-gradient(135deg, #0a1929 0%, #0d2137 100%)',
  forest: 'linear-gradient(135deg, #0a1f0a 0%, #0d2a14 100%)',
  night: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  rose: 'linear-gradient(135deg, #2a0a1a 0%, #3d0a14 100%)',
  mint: 'linear-gradient(135deg, #0a1f14 0%, #0d2a1e 100%)',
  lavender: 'linear-gradient(135deg, #1a0f2e 0%, #2a1a3d 100%)'
};

function applyBackground() {
  const bgLayer = $('bg-layer');
  const { bgType, bgCustom, theme } = appData.settings;

  bgLayer.classList.remove('has-image');

  if (bgCustom) {
    bgLayer.style.background = 'none';
    bgLayer.style.backgroundImage = `url("${bgCustom}")`;
    bgLayer.style.backgroundSize = 'cover';
    bgLayer.style.backgroundPosition = 'center';
    bgLayer.classList.add('has-image');
  } else {
    const presets = theme === 'dark' ? BG_PRESETS_DARK : BG_PRESETS;
    bgLayer.style.backgroundImage = 'none';
    bgLayer.style.background = presets[bgType] || presets.default;
  }

  // 更新预设选中状态
  $$('.bg-preset-item').forEach(item => {
    item.classList.toggle('active', item.dataset.bg === bgType && !bgCustom);
  });
}

function initBgSettings() {
  // 预设点击
  $$('.bg-preset-item').forEach(item => {
    item.addEventListener('click', () => {
      appData.settings.bgType = item.dataset.bg;
      appData.settings.bgCustom = '';
      saveData();
      applyBackground();
    });
  });

  // URL 输入
  $('btn-apply-bg').addEventListener('click', () => {
    const url = $('input-bg-url').value.trim();
    if (url) {
      appData.settings.bgCustom = url;
      saveData();
      applyBackground();
      showToast('背景已更新');closeModal('modal-bg-settings');
    } else {
      showToast('请输入图片 URL', 'warning');
    }
  });

  // 文件上传
  $('input-bg-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      appData.settings.bgCustom = ev.target.result;
      saveData();
      applyBackground();
      showToast('背景已更新');
      closeModal('modal-bg-settings');
    };
    reader.readAsDataURL(file);
  });

  // 恢复默认
  $('btn-reset-bg').addEventListener('click', () => {
    appData.settings.bgType = 'default';
    appData.settings.bgCustom = '';
    $('input-bg-url').value = '';
    saveData();
    applyBackground();
    showToast('已恢复默认背景');});
}

/* ============================================================
   区块结束：主题 & 背景管理
   ============================================================ */

/* ============================================================
   区块开始：页面路由 & 导航
   ============================================================ */

let currentPage = 'home';

function switchPage(page) {
  currentPage = page;
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`page-${page}`).classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

  // 页面进入时刷新
  if (page === 'home') refreshHome();
  if (page === 'calendar') refreshCalendar();
  if (page === 'pet') refreshPet();
  if (page === 'vocab') refreshVocab();
  if (page === 'stats') refreshStats();
}

function initNavigation() {
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });
}

/* ============================================================
   区块结束：页面路由 & 导航
   ============================================================ */

/* ============================================================
   区块开始：弹窗管理
   ============================================================ */

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function initModals() {
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

/* ============================================================
   区块结束：弹窗管理
   ============================================================ */

/* ============================================================
   区块开始：首页逻辑
   ============================================================ */

function refreshHome() {
  // 问候语
  const greeting = getGreeting();
  $('greeting-text').textContent = greeting.text;

  // 日期
  $('today-date').textContent = formatDateCN(new Date());

  // 今日课程
  const todayStr = formatDate(new Date());
  const todayCourses = getCoursesForDate(todayStr);

  if (todayCourses.length > 0) {
    $('home-course-count').textContent = `${todayCourses.length} 节课`;
    const now = new Date();
    const upcoming = todayCourses.find(c => {
      const [h, m] = c.startTime.split(':').map(Number);
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m) > now;
    });
    if (upcoming) {
      $('home-next-course').textContent = `下一节：${upcoming.title} ${upcoming.startTime}`;
      $('home-course-badge').style.display = 'inline-flex';
      $('home-course-badge-text').textContent = `${upcoming.startTime} · ${upcoming.location || '未设置地点'}`;
    } else {
      $('home-next-course').textContent = '今日课程已结束';
      $('home-course-badge').style.display = 'none';
    }
  } else {
    $('home-course-count').textContent = '暂无课程';
    $('home-next-course').textContent = '点击添加你的第一节课';
    $('home-course-badge').style.display = 'none';
  }

  // 待办
  const todayTodos = getTodosForDate(todayStr);
  const pendingTodos = todayTodos.filter(t => !t.done);
  $('home-todo-count').textContent = `${pendingTodos.length} 项待办`;
  $('home-todo-sub').textContent = pendingTodos.length > 0
    ? `最高优先：${pendingTodos.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))[0].text}`
    : '今天没有待办事项';

  // 纪念日
  const annivs = getAnniversariesForDate(todayStr);
  if (annivs.length > 0) {
    $('home-anniversary').textContent = `💖 ${annivs[0].name}`;
    $('home-anniversary-sub').textContent = '今天是纪念日！';
  } else {
    // 找最近的纪念日
    const nextAnniv = findNextAnniversary();
    if (nextAnniv) {
      $('home-anniversary').textContent = nextAnniv.name;
      $('home-anniversary-sub').textContent = `还有 ${nextAnniv.daysLeft} 天`;
    } else {
      $('home-anniversary').textContent = '无纪念日';
      $('home-anniversary-sub').textContent = '添加你的第一个纪念日';
    }
  }

  // 单词统计
  const mastered = appData.vocab.filter(w => w.level >= 6).length;
  $('home-vocab-count').textContent = mastered;

  // 本周课时
  const weekDates = getWeekDates(new Date());
  let weekCourseCount = 0;
  let weekHours = 0;
  weekDates.forEach(d => {
    const cs = getCoursesForDate(formatDate(d));
    weekCourseCount += cs.length;
    cs.forEach(c => {
      const [sh, sm] = c.startTime.split(':').map(Number);
      const [eh, em] = c.endTime.split(':').map(Number);
      weekHours += (eh * 60 + em - sh * 60 - sm) / 60;
    });
  });
  $('home-week-hours').textContent = `${weekHours.toFixed(1)}h`;
  $('home-week-hours').nextElementSibling.textContent = `共 ${weekCourseCount} 节课`;

  // 宠物状态
  if (appData.pets.length > 0) {
    const pet = appData.pets[0];
    $('home-pet-name').textContent = pet.name;
    $('home-pet-stats').style.display = 'flex';
    const state = getPetState(pet.id);
    $('home-hunger-bar').style.width = state.hunger + '%';
    $('home-hunger-val').textContent = Math.round(state.hunger);
    $('home-happy-bar').style.width = state.happy + '%';
    $('home-happy-val').textContent = Math.round(state.happy);
    $('home-clean-bar').style.width = state.clean + '%';
    $('home-clean-val').textContent = Math.round(state.clean);
    $('home-pet-mood').textContent = state.hunger< 30 ? '饿了！' : state.happy < 30 ? '无聊...' : '心情不错♪';
  }
}

function findNextAnniversary() {
  if (appData.anniversaries.length === 0) return null;
  const today = new Date();
  let nearest = null;
  let minDays = Infinity;

  appData.anniversaries.forEach(a => {
    const ad = new Date(a.date);
    let next = new Date(today.getFullYear(), ad.getMonth(), ad.getDate());
    if (next < today) {
      next = new Date(today.getFullYear() + 1, ad.getMonth(), ad.getDate());
    }
    const diff = Math.ceil((next - today) /86400000);
    if (diff < minDays) {
      minDays = diff;
      nearest = { name: a.name, daysLeft: diff };
    }
  });
  return nearest;
}

/* ============================================================
   区块结束：首页逻辑
   ============================================================ */

/*============================================================
   区块开始：日历核心
   ============================================================ */

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedDate = formatDate(new Date());
let currentView = 'month';

// 批量模式状态
let batchMode = false;
let batchSelected = new Set(); // 存储选中的课程 ID

function refreshCalendar() {
  $('calendar-month-label').textContent = `${calendarYear}年${calendarMonth + 1}月`;
  if (currentView === 'month') renderMonthView();
  else if (currentView === 'week') renderWeekView();
  else renderDayView();
  renderDayCourses();
  updateBatchCount();
}

function renderMonthView() {
  const grid = $('cal-grid');
  grid.innerHTML = '';
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const todayStr = formatDate(new Date());

  // 上月填充
  const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
  const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
  const prevDays = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevDays - i;
    const dateStr = formatDate(new Date(prevYear, prevMonth, day));
    grid.appendChild(createDayCell(day, dateStr, true));
  }

  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(calendarYear, calendarMonth, d));
    grid.appendChild(createDayCell(d, dateStr, false, dateStr === todayStr));
  }

  // 下月填充
  const totalCells = grid.children.length;
  const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
  const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
  const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = formatDate(new Date(nextYear, nextMonth, d));
    grid.appendChild(createDayCell(d, dateStr, true));
  }
}

function createDayCell(day, dateStr, isOther, isToday = false) {
  const cell = document.createElement('div');
  cell.className = 'cal-day';
  if (isOther) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');
  if (dateStr === selectedDate) cell.classList.add('selected');

  const courses = getCoursesForDate(dateStr);
  const todos = getTodosForDate(dateStr);
  const annivs = getAnniversariesForDate(dateStr);

  let dotsHTML = '';
  if (courses.length > 0 || todos.length > 0 || annivs.length > 0) {
    dotsHTML = '<div class="cal-day-dots">';
    if (courses.length > 0) dotsHTML += `<span class="cal-dot course-dot" title="${courses.length}节课"></span>`;
    if (todos.length > 0) dotsHTML += '<span class="cal-dot todo-dot"></span>';
    if (annivs.length > 0) dotsHTML += '<span class="cal-dot anniv-dot"></span>';
    dotsHTML += '</div>';
  }

  cell.innerHTML = `<span class="cal-day-num">${day}</span>${dotsHTML}`;
  cell.addEventListener('click', () => {
    selectedDate = dateStr;
    refreshCalendar();
  });
  return cell;
}

function renderWeekView() {
  const weekDates = getWeekDates(new Date(selectedDate));
  const todayStr = formatDate(new Date());
  const header = $('week-header');
  const body = $('week-body');

  const weekdayNames = ['一', '二', '三', '四', '五', '六', '日'];
  header.innerHTML = weekDates.map((d, i) => {
    const ds = formatDate(d);
    const isToday = ds === todayStr;
    const isSelected = ds === selectedDate;
    return `<div class="week-day-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${ds}">
      <span class="week-day-name">${weekdayNames[i]}</span>
      <span class="week-day-num">${d.getDate()}</span>
    </div>`;
  }).join('');

  header.querySelectorAll('.week-day-header').forEach(el => {
    el.addEventListener('click', () => {
      selectedDate = el.dataset.date;
      refreshCalendar();
    });
  });

  // 时间轴
  body.innerHTML = '';
  const hours = [];
  for (let h = 7; h <= 22; h++) hours.push(h);

  const timeGrid = document.createElement('div');
  timeGrid.className = 'week-time-grid';

  hours.forEach(h => {
    const row = document.createElement('div');
    row.className = 'week-time-row';
    row.innerHTML = `<div class="week-time-label">${String(h).padStart(2, '0')}:00</div>
      <div class="week-time-cells">${weekDates.map(d => {
        const ds = formatDate(d);
        return `<div class="week-time-cell" data-date="${ds}" data-hour="${h}"></div>`;
      }).join('')}</div>`;
    timeGrid.appendChild(row);
  });

  body.appendChild(timeGrid);

  // 渲染课程块
  weekDates.forEach(d => {
    const ds = formatDate(d);
    const courses = getCoursesForDate(ds);
    courses.forEach(course => {
      const [sh, sm] = course.startTime.split(':').map(Number);
      const [eh, em] = course.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      const topOffset = ((startMin - 420) / 60) * 52; // 7:00 = 0, 52px per hour
      const height = ((endMin - startMin) / 60) * 52;

      const dayIndex = weekDates.findIndex(wd => formatDate(wd) === ds);
      const block = document.createElement('div');
      block.className = `week-course-block color-${course.color || 'blue'}`;
      block.style.top = topOffset + 'px';
      block.style.height = Math.max(height, 20) + 'px';
      block.style.left = `calc(${(dayIndex / 7) * 100}% +50px + ${dayIndex * 1}px)`;
      block.style.width = `calc(${100 / 7}% - 4px)`;
      block.innerHTML = `<span class="week-course-title">${course.title}</span>`;
      block.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = ds;
        refreshCalendar();
      });
      body.querySelector('.week-time-grid').appendChild(block);
    });
  });
}

function renderDayView() {
  const d = new Date(selectedDate);
  $('day-header').innerHTML = `<div class="day-view-date">${formatDateCN(d)}</div>`;

  const timeline = $('day-timeline');
  timeline.innerHTML = '';

  for (let h = 7; h <= 22; h++) {
    const row = document.createElement('div');
    row.className = 'day-time-row';
    row.innerHTML = `<div class="day-time-label">${String(h).padStart(2, '0')}:00</div><div class="day-time-slot" data-hour="${h}"></div>`;
    row.querySelector('.day-time-slot').addEventListener('click', () => {
      $('input-course-start').value = `${String(h).padStart(2, '0')}:00`;
      $('input-course-end').value = `${String(h + 1).padStart(2, '0')}:40`;
      openModal('modal-add-course');
    });
    timeline.appendChild(row);
  }

  // 渲染课程
  const courses = getCoursesForDate(selectedDate);
  courses.forEach(course => {
    const [sh, sm] = course.startTime.split(':').map(Number);
    const [eh, em] = course.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const topOffset = ((startMin - 420) / 60) * 60;
    const height = ((endMin - startMin) / 60) * 60;

    const block = document.createElement('div');
    block.className = `day-course-block color-${course.color || 'blue'}`;
    block.style.top = topOffset + 'px';
    block.style.height = Math.max(height, 24) + 'px';
    block.innerHTML = `
      <div class="day-course-title">${course.title}</div>
      <div class="day-course-time">${course.startTime} - ${course.endTime}</div>
      ${course.location ? `<div class="day-course-loc">📍 ${course.location}</div>` : ''}
    `;
    block.addEventListener('click', (e) => {
      e.stopPropagation();
      showCourseDetail(course);
    });
    timeline.appendChild(block);
  });
}

function renderDayCourses() {
  const list = $('day-courses-list');
  const courses = getCoursesForDate(selectedDate);
  const todos = getTodosForDate(selectedDate);
  const annivs = getAnniversariesForDate(selectedDate);

  const d = new Date(selectedDate);
  $('selected-date-label').textContent = `${d.getMonth() + 1}月${d.getDate()}日`;

  if (courses.length === 0 && todos.length === 0 && annivs.length === 0) {
    list.innerHTML = '<div class="empty-state"><span>📭</span><p>这一天还没有安排</p></div>';
    return;
  }

  let html = '';

  // 纪念日
  annivs.forEach(a => {
    html += `<div class="course-item anniv-item glass">
      <div class="course-item-color" style="background:linear-gradient(135deg,#f472b6,#ec4899)"></div>
      <div class="course-item-body">
        <div class="course-item-title">💖 ${a.name}</div>
        <div class="course-item-sub">纪念日</div>
      </div>
    </div>`;
  });

    // 待办
  todos.forEach(t => {
    const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    const priorityLabel  = { high: '高', medium: '中', low: '低' };
    const isEvent = /^\[[\d:]+/.test(t.text);
    const subText = isEvent ? '日程事件' : ('优先级：' + (priorityLabel[t.priority] || '中'));
    const checkIcon = t.done
      ? '<svg viewBox="0 0 12 12" fill="none" width="12" height="12"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '';

    html += '<div class="course-item todo-item glass ' + (t.done ? 'done' : '') + '" data-id="' + t.id + '">'
          +   '<div class="course-item-color" style="background:' + (priorityColors[t.priority] || '#f59e0b') + '"></div>'
          +   '<label class="todo-check-label" onclick="toggleTodo(\'' + t.id + '\')">'
          +     '<span class="todo-checkbox ' + (t.done ? 'checked' : '') + '" aria-hidden="true">' + checkIcon + '</span>'
          +   '</label>'
          +   '<div class="course-item-body" onclick="toggleTodo(\'' + t.id + '\')" style="cursor:pointer">'
          +     '<div class="course-item-title ' + (t.done ? 'line-through' : '') + '">' + t.text + '</div>'
          +     '<div class="course-item-sub">' + subText + '</div>'
          +   '</div>'
          +   '<button class="course-action-btn" onclick="deleteTodo(\'' + t.id + '\')" aria-label="删除">🗑️</button>'
          + '</div>';
  });

/*============================================================
   区块结束：日历核心
   ============================================================ */


/* ============================================================
   区块开始：日历视图切换 & 导航
   ============================================================ */

function initCalendar() {
  // 视图切换
  $$('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      $$('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');$$('.cal-view').forEach(v => v.classList.remove('active'));
      $(`${currentView}-view`).classList.add('active');
      refreshCalendar();
    });
  });

  // 月导航
  $('btn-cal-prev').addEventListener('click', () => {
    if (currentView === 'month') {
      calendarMonth--;
      if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - (currentView === 'week' ? 7 : 1));
      selectedDate = formatDate(d);calendarYear = d.getFullYear();
      calendarMonth = d.getMonth();
    }
    refreshCalendar();
  });

  $('btn-cal-next').addEventListener('click', () => {
    if (currentView === 'month') {
      calendarMonth++;
      if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + (currentView === 'week' ? 7 : 1));
      selectedDate = formatDate(d);
      calendarYear = d.getFullYear();
      calendarMonth = d.getMonth();
    }
    refreshCalendar();
  });

  $('btn-cal-today').addEventListener('click', () => {
    const now = new Date();
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth();
    selectedDate = formatDate(now);
    refreshCalendar();
  });

  // 添加课程按钮
  $('btn-add-course').addEventListener('click', () => openModal('modal-add-course'));

  // AI导入按钮
  $('btn-ai-import').addEventListener('click', () => openModal('modal-ai-import'));

  // 重复设置联动
  $('input-course-repeat').addEventListener('change', (e) => {
    $('repeat-weeks-group').style.display = e.target.value !== 'none' ? 'block' : 'none';
  });

  // 颜色选择器
  $$('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      $$('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // 保存课程
  $('btn-save-course').addEventListener('click', saveCourse);

  // 自动检测设备设置默认视图
  if (window.innerWidth < 768) {
    currentView = 'day';
    $$('.view-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.view-btn[data-view="day"]').classList.add('active');
    $$('.cal-view').forEach(v => v.classList.remove('active'));
    $('day-view').classList.add('active');
  }
}

/* ============================================================
   区块结束：日历视图切换 & 导航
   ============================================================ */

/* ============================================================
   区块开始：课程 CRUD
   ============================================================ */

let editingCourseId = null;

//----冲突检测 ----
function checkTimeConflict(date, startTime, endTime, excludeId = null) {
  const courses = getCoursesForDate(date);
  const conflicts = [];
  const [s1h, s1m] = startTime.split(':').map(Number);
  const [e1h, e1m] = endTime.split(':').map(Number);
  const start1 = s1h * 60 + s1m;
  const end1 = e1h * 60 + e1m;

  courses.forEach(c => {
    if (c.id === excludeId) return;
    const [s2h, s2m] = c.startTime.split(':').map(Number);
    const [e2h, e2m] = c.endTime.split(':').map(Number);
    const start2 = s2h * 60 + s2m;
    const end2 = e2h * 60 + e2m;

    // 时间段重叠判断
    if (start1 < end2 && end1 > start2) {
      conflicts.push(c);
    }
  });
  return conflicts;
}

//检查单个课程是否与同日其他课程冲突
function checkSingleConflict(course) {
  return checkTimeConflict(course.date, course.startTime, course.endTime, course.id).length > 0;
}

// 冲突回调
let conflictResolveCallback = null;

function showConflictWarning(newCourse, conflicts, onForce) {
  const list = $('conflict-list');
  list.innerHTML = `
    <div class="conflict-new-course glass">
      <strong>新课程：</strong>${newCourse.title} ${newCourse.startTime}-${newCourse.endTime}</div>
    <div class="conflict-separator">与以下课程冲突：</div>
    ${conflicts.map(c => `
      <div class="conflict-item glass">
        <div class="conflict-item-color color-bg-${c.color || 'blue'}"></div>
        <div>
          <strong>${c.title}</strong>
          <div class="text-secondary">${c.startTime} - ${c.endTime}${c.location ? ' · ' + c.location : ''}</div>
        </div>
      </div>
    `).join('')}
  `;
  conflictResolveCallback = onForce;
  openModal('modal-conflict');
}

function saveCourse() {
  const title = $('input-course-title').value.trim();
  const startTime = $('input-course-start').value;
  const endTime = $('input-course-end').value;
  const location = $('input-course-location').value.trim();
  const color = document.querySelector('.color-dot.active')?.dataset.color || 'blue';
  const repeat = $('input-course-repeat').value;
  const repeatWeeks = parseInt($('input-repeat-weeks').value) || 16;

  // 人员
  const peopleRaw = $('input-course-people').value.trim();
  const people = peopleRaw ? peopleRaw.split(/[,，]/).map(p => p.trim()).filter(Boolean) : [];

  // 课程待办
  const todosRaw = $('input-course-todos').value.trim();
  const courseTodos = todosRaw
    ? todosRaw.split('\n').map(t => t.trim()).filter(Boolean).map(text => ({ text, done: false }))
    : [];

  if (!title) { showToast('请输入课程名称', 'warning'); return; }
  if (!startTime || !endTime) { showToast('请设置时间', 'warning'); return; }
  if (startTime >= endTime) { showToast('结束时间必须晚于开始时间', 'warning'); return; }

  const doSave = () => {
    if (editingCourseId) {
      // 编辑模式
      const idx = appData.courses.findIndex(c => c.id === editingCourseId);
      if (idx !== -1) {
        appData.courses[idx] = {
          ...appData.courses[idx],
          title, startTime, endTime, location, color, people, courseTodos
        };}
      editingCourseId = null;
      showToast('课程已更新');
    } else {
      // 新增
      const dates = [selectedDate];
      if (repeat !== 'none') {
        const step = repeat === 'biweekly' ? 14 : 7;
        const base = new Date(selectedDate);
        for (let w = 1; w < repeatWeeks; w++) {
          const next = new Date(base);
          next.setDate(next.getDate() + step * w);
          dates.push(formatDate(next));
        }
      }

      const repeatGroupId = dates.length > 1 ? generateId() : null;
      dates.forEach(date => {
        appData.courses.push({
          id: generateId(),
          title, date, startTime, endTime, location, color,
          people: [...people],
          courseTodos: courseTodos.map(t => ({ ...t })),
          repeatGroup: repeatGroupId
        });
      });

      showToast(`已添加 ${dates.length} 节课程`);
    }

    saveData();
    closeModal('modal-add-course');
    resetCourseForm();
    refreshCalendar();
    refreshHome();
  };

  // 冲突检测
  const targetDate = editingCourseId
    ? appData.courses.find(c => c.id === editingCourseId)?.date || selectedDate
    : selectedDate;
  const conflicts = checkTimeConflict(targetDate, startTime, endTime, editingCourseId);

  if (conflicts.length > 0) {
    showConflictWarning({ title, startTime, endTime }, conflicts, doSave);
  } else {
    doSave();
  }
}

function editCourse(id) {
  const course = appData.courses.find(c => c.id === id);
  if (!course) return;
  editingCourseId = id;
  $('input-course-title').value = course.title;
  $('input-course-start').value = course.startTime;
  $('input-course-end').value = course.endTime;
  $('input-course-location').value = course.location || '';
  $('input-course-people').value = (course.people || []).join(', ');
  $('input-course-todos').value = (course.courseTodos || []).map(t => t.text).join('\n');$$('.color-dot').forEach(d => d.classList.toggle('active', d.dataset.color === course.color));
  $('input-course-repeat').value = 'none';
  $('repeat-weeks-group').style.display = 'none';
  openModal('modal-add-course');
}

function deleteCourse(id) {
  if (!confirm('确定删除这节课程？')) return;
  appData.courses = appData.courses.filter(c => c.id !== id);
  saveData();
  refreshCalendar();
  refreshHome();
  showToast('课程已删除');
}

function showCourseDetail(course) {
  showCourseDetailPanel(course.id);
}

function resetCourseForm() {
  $('input-course-title').value = '';
  $('input-course-start').value = '08:00';
  $('input-course-end').value = '09:40';
  $('input-course-location').value = '';
  $('input-course-people').value = '';
  $('input-course-todos').value = '';
  $('input-course-repeat').value = 'none';
  $('repeat-weeks-group').style.display = 'none';
  $$('.color-dot').forEach(d => d.classList.remove('active'));
  document.querySelector('.color-dot[data-color="blue"]').classList.add('active');
  editingCourseId = null;
}

// ---- 复制课程 ----
let copyingCourseId = null;
let pickDateMode = null; // 'copy' | 'move' | 'batch-move' | 'batch-copy'
let pickDateTargets = [];

function copyCourse(id) {
  copyingCourseId = id;
  pickDateMode = 'copy';
  pickDateTargets = [];
  $('pick-date-title').textContent = '📋 复制课程到...';
  $('input-pick-date').value = '';
  $('pick-date-tags').innerHTML = '';
  $('pick-date-multi-section').style.display = 'block';
  openModal('modal-pick-date');
}

function initPickDateModal() {
  // 添加日期按钮
  $('btn-pick-date-add').addEventListener('click', () => {
    const date = $('input-pick-date').value;
    if (!date) { showToast('请选择日期', 'warning'); return; }
    if (pickDateTargets.includes(date)) { showToast('该日期已添加', 'info'); return; }
    pickDateTargets.push(date);
    renderPickDateTags();
    $('input-pick-date').value = '';});

  // 确认按钮
  $('btn-pick-date-confirm').addEventListener('click', () => {
    // 如果没有通过多选添加，取单个日期
    if (pickDateTargets.length === 0) {
      const date = $('input-pick-date').value;
      if (!date) { showToast('请选择目标日期', 'warning'); return; }
      pickDateTargets = [date];
    }

    if (pickDateMode === 'copy' && copyingCourseId) {
      executeCopyCourse(copyingCourseId, pickDateTargets);
    } else if (pickDateMode === 'batch-move') {
      executeBatchMove(pickDateTargets[0]);
    } else if (pickDateMode === 'batch-copy') {
      executeBatchCopy(pickDateTargets);
    }

    closeModal('modal-pick-date');
    pickDateTargets = [];
  });

  // 冲突弹窗按钮
  $('btn-conflict-cancel').addEventListener('click', () => {
    conflictResolveCallback = null;
    closeModal('modal-conflict');
  });

  $('btn-conflict-force').addEventListener('click', () => {
    if (conflictResolveCallback) {
      conflictResolveCallback();
      conflictResolveCallback = null;
    }
    closeModal('modal-conflict');
  });
}

function renderPickDateTags() {
  const container = $('pick-date-tags');
  container.innerHTML = pickDateTargets.map((d, i) => {
    const dd = new Date(d);
    return `<span class="pick-date-tag">${dd.getMonth()+1}/${dd.getDate()} <button onclick="removePickDate(${i})">✕</button></span>`;
  }).join('');
}

function removePickDate(index) {
  pickDateTargets.splice(index, 1);
  renderPickDateTags();
}

function executeCopyCourse(courseId, targetDates) {
  const source = appData.courses.find(c => c.id === courseId);
  if (!source) return;

  let conflictDates = [];
  targetDates.forEach(date => {
    const conflicts = checkTimeConflict(date, source.startTime, source.endTime);
    if (conflicts.length > 0) conflictDates.push(date);
  });

  const doCopy = () => {
    targetDates.forEach(date => {
      appData.courses.push({
        id: generateId(),
        title: source.title,
        date: date,
        startTime: source.startTime,
        endTime: source.endTime,
        location: source.location,
        color: source.color,
        people: [...(source.people || [])],
        courseTodos: (source.courseTodos || []).map(t => ({ text: t.text, done: false })),
        repeatGroup: null
      });
    });
    saveData();
    refreshCalendar();
    refreshHome();
    showToast(`已复制到 ${targetDates.length} 个日期`);
  };

  if (conflictDates.length > 0) {
    showConflictWarning(
      { title: source.title, startTime: source.startTime, endTime: source.endTime },
      conflictDates.flatMap(d => checkTimeConflict(d, source.startTime, source.endTime)),
      doCopy
    );
  } else {
    doCopy();
  }
}

/* ============================================================
   区块结束：课程 CRUD
   ============================================================ */
/* ============================================================
   区块开始：批量操作系统
   ============================================================ */

function initBatchOps() {
  $('btn-batch-mode').addEventListener('click', () => {
    batchMode = !batchMode;
    batchSelected.clear();
    $('btn-batch-mode').classList.toggle('active', batchMode);
    $('batch-toolbar').style.display = batchMode ? 'flex' : 'none';
    refreshCalendar();
  });

  $('btn-batch-cancel').addEventListener('click', exitBatchMode);

  $('btn-batch-delete').addEventListener('click', () => {
    if (batchSelected.size === 0) { showToast('请先选择课程', 'warning'); return; }
    if (!confirm(`确定删除选中的 ${batchSelected.size} 节课程？`)) return;
    appData.courses = appData.courses.filter(c => !batchSelected.has(c.id));
    saveData();
    showToast(`已删除 ${batchSelected.size} 节课程`);
    exitBatchMode();
    refreshCalendar();
    refreshHome();
  });

  $('btn-batch-move').addEventListener('click', () => {
    if (batchSelected.size === 0) { showToast('请先选择课程', 'warning'); return; }
    pickDateMode = 'batch-move';
    pickDateTargets = [];
    $('pick-date-title').textContent = `📅 移动 ${batchSelected.size} 节课程到...`;
    $('input-pick-date').value = '';
    $('pick-date-tags').innerHTML = '';
    $('pick-date-multi-section').style.display = 'none';
    openModal('modal-pick-date');
  });

  $('btn-batch-copy').addEventListener('click', () => {
    if (batchSelected.size === 0) { showToast('请先选择课程', 'warning'); return; }
    pickDateMode = 'batch-copy';
    pickDateTargets = [];
    $('pick-date-title').textContent = `📋 复制 ${batchSelected.size} 节课程到...`;
    $('input-pick-date').value = '';
    $('pick-date-tags').innerHTML = '';
    $('pick-date-multi-section').style.display = 'block';
    openModal('modal-pick-date');
  });
}

function toggleBatchSelect(id, checked) {
  if (checked) {
    batchSelected.add(id);
  } else {
    batchSelected.delete(id);
  }updateBatchCount();
}

function updateBatchCount() {
  if (!batchMode) return;
  $('batch-count').textContent = `已选 ${batchSelected.size} 项`;
}

function exitBatchMode() {
  batchMode = false;
  batchSelected.clear();
  $('btn-batch-mode').classList.remove('active');
  $('batch-toolbar').style.display = 'none';
  refreshCalendar();
}

function executeBatchMove(targetDate) {
  if (!targetDate || batchSelected.size === 0) return;

  // 检测冲突
  let allConflicts = [];
  batchSelected.forEach(id => {
    const course = appData.courses.find(c => c.id === id);
    if (course) {
      const conflicts = checkTimeConflict(targetDate, course.startTime, course.endTime);
      allConflicts.push(...conflicts.filter(c => !batchSelected.has(c.id)));
    }
  });

  const doMove = () => {
    batchSelected.forEach(id => {
      const course = appData.courses.find(c => c.id === id);
      if (course) course.date = targetDate;
    });
    saveData();
    showToast(`已移动 ${batchSelected.size} 节课程`);
    exitBatchMode();
    refreshCalendar();
    refreshHome();
  };

  // 去重冲突
  const uniqueConflicts = [...new Map(allConflicts.map(c => [c.id, c])).values()];
  if (uniqueConflicts.length > 0) {
    showConflictWarning(
      { title: `${batchSelected.size} 节课程`, startTime: '多个时段', endTime: '' },
      uniqueConflicts,
      doMove
    );
  } else {
    doMove();
  }
}

function executeBatchCopy(targetDates) {
  if (targetDates.length === 0 || batchSelected.size === 0) return;

  const doCopy = () => {
    let count = 0;
    batchSelected.forEach(id => {
      const source = appData.courses.find(c => c.id === id);
      if (!source) return;
      targetDates.forEach(date => {
        appData.courses.push({
          id: generateId(),
          title: source.title,
          date: date,
          startTime: source.startTime,
          endTime: source.endTime,
          location: source.location,
          color: source.color,
          people: [...(source.people || [])],
          courseTodos: (source.courseTodos || []).map(t => ({ text: t.text, done: false })),
          repeatGroup: null
        });
        count++;
      });
    });
    saveData();
    showToast(`已复制 ${count} 节课程`);
    exitBatchMode();
    refreshCalendar();
    refreshHome();
  };

  doCopy();
}

/* ============================================================
   区块结束：批量操作系统
   ============================================================ */


/* ============================================================
   区块开始：AI 导入课程
   ============================================================ */

let parsedCourses = [];

function initAIImport() {
  // Tab 切换
  $$('.ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.ai-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $$('.ai-tab-content').forEach(c => c.classList.remove('active'));
      $(`aitab-${tab.dataset.aitab}`).classList.add('active');
    });
  });

  // 解析按钮
    $('btn-ai-parse').addEventListener('click', async () => {
    const activeTab = document.querySelector('.ai-tab.active').dataset.aitab;
    if (activeTab === 'paste') {
      // 自动判断：包含 COURSE| 或 EVENT| 就用正则解析，否则用 JSON 解析
      const raw = $('input-paste-json').value.trim();
      if (/^(COURSE|EVENT)\|/im.test(raw)) {
        parsePlainText();
      } else {
        parsePastedJSON();
      }
    } else {
      await parseWithAI();
    }
  });


  // 确认导入
  $('btn-ai-confirm').addEventListener('click', () => {
    const toImport = parsedCourses.filter(c => !c._skip);
    if (toImport.length === 0) { showToast('没有选中要导入的内容', 'warning'); return; }

    let courseCount = 0;
    let eventCount = 0;

    toImport.forEach(c => {
      if (c.type === 'event') {
        // 日程事件 → 导入为 Todo（带时间信息）
        appData.todos.push({
          id: generateId(),
          text: c.startTime ? `[${c.startTime}${c.endTime ? '-' + c.endTime : ''}] ${c.title}${c.location ? ' · ' + c.location : ''}` : c.title,
          priority: 'medium',
          date: c.date,
          done: false
        });
        eventCount++;
      } else {
        // 课程 → 导入为 Course
        appData.courses.push({
          id: generateId(),
          title: c.title,
          date: c.date,
          startTime: c.startTime,
          endTime: c.endTime || c.startTime, // 没有结束时间时用开始时间兜底
          location: c.location || '',
          color: c.color || 'blue',
          people: c.people || [],
          courseTodos: []
        });
        courseCount++;
      }
    });

    saveData();

    const parts = [];
    if (courseCount > 0) parts.push(`${courseCount} 节课程`);
    if (eventCount > 0) parts.push(`${eventCount} 个日程`);
    showToast(`成功导入 ${parts.join('、')}`);

    parsedCourses = [];
    closeModal('modal-ai-import');
    refreshCalendar();
    refreshHome();
    $('ai-preview').style.display = 'none';
    $('btn-ai-confirm').style.display = 'none';
    $('btn-ai-parse').style.display = 'inline-flex';
  });
}

function parsePastedJSON() {
  const raw = $('input-paste-json').value.trim();
  if (!raw) { showToast('请粘贴 JSON 数据', 'warning'); return; }

  try {
    let jsonStr = raw;
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];

    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('不是数组');

    // 兼容课程和日程两种格式
    parsedCourses = data.filter(c => c.title && c.date).map(c => ({
      ...c,
      type: c.type || (c.startTime && c.endTime ? 'course' : 'event')
    }));
    if (parsedCourses.length === 0) throw new Error('没有有效数据');

    showPreview();
    showToast(`解析成功，共 ${parsedCourses.length} 条`);
  } catch (e) {
    showToast('JSON 解析失败：' + e.message, 'error');
  }
}
function parsePlainText() {
  const raw = $('input-paste-json').value.trim();
  if (!raw) { showToast('请粘贴格式化文本', 'warning'); return; }

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];

  const courseReg = /^COURSE\|([^|]+)\|(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2})\|(\d{2}:\d{2})\|([^|]*)\|(blue|green|purple|coral|amber)$/i;
  const eventReg  = /^EVENT\|([^|]+)\|(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2})?\|(\d{2}:\d{2})?\|([^|]*)$/i;

  lines.forEach(line => {
    let m;
    if ((m = line.match(courseReg))) {
      results.push({
        type: 'course',
        title: m[1].trim(),
        date: m[2],
        startTime: m[3],
        endTime: m[4],
        location: m[5].trim(),
        color: m[6].toLowerCase()
      });
    } else if ((m = line.match(eventReg))) {
      results.push({
        type: 'event',
        title: m[1].trim(),
        date: m[2],
        startTime: m[3] || '',
        endTime: m[4] || '',
        location: m[5] ? m[5].trim() : ''
      });
    }
  });

  if (results.length === 0) {
    showToast('未识别到有效内容，请检查格式', 'warning');
    return;
  }

  parsedCourses = results;
  showPreview();
  const courseN = results.filter(r => r.type === 'course').length;
  const eventN  = results.filter(r => r.type === 'event').length;
  const parts = [];
  if (courseN > 0) parts.push(`${courseN} 节课程`);
  if (eventN > 0)  parts.push(`${eventN} 个日程`);
  showToast(`解析成功：${parts.join('、')}`);
}

async function parseWithAI() {
  const text = $('input-ai-text').value.trim();
  if (!text) { showToast('请粘贴日程文本', 'warning'); return; }

  const { apiBase, apiKey, apiModel } = appData.settings;
  if (!apiBase || !apiKey) {
    showToast('请先在设置中配置 API', 'warning');
    return;
  }

  $('ai-status').style.display = 'flex';
  $('btn-ai-parse').disabled = true;

  try {
    const today = formatDate(new Date());
    const response = await fetch(`${apiBase.replace(/\/+$/, '')}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个日程解析助手。今天的日期是 ${today}。
请将用户提供的文本解析为 JSON 数组，同时支持两种类型：

1. 课程（type: "course"）：有固定时间段的重复性课程
   字段：title, date(YYYY-MM-DD), startTime(HH:MM), endTime(HH:MM), location(可为空), color(blue/green/purple/coral/amber), type:"course"

2. 日程事件（type: "event"）：一次性的事件、约会、提醒等
   字段：title, date(YYYY-MM-DD), startTime(HH:MM，可为空), endTime(HH:MM，可为空), location(可为空), type:"event"

判断规则：
- 含"课"、"上课"、"讲座"、"实验"等关键词，或有明确教室地点 → course
- 其余事件（约会、会议、提醒、活动等）→ event
- 如果文本中有相对日期（如"明天"、"下周五"），请根据今天日期 ${today} 推算出具体日期
- 只输出 JSON 数组，不要有任何其他文字`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('AI 返回内容中未找到 JSON 数组');

    const parsed = JSON.parse(match[0]);
    parsedCourses = parsed
      .filter(c => c.title && c.date)
      .map(c => ({
        ...c,
        type: c.type || (c.startTime && c.endTime ? 'course' : 'event')
      }));

    if (parsedCourses.length === 0) throw new Error('没有解析到有效内容');

    showPreview();
    const courseN = parsedCourses.filter(c => c.type === 'course').length;
    const eventN = parsedCourses.filter(c => c.type === 'event').length;
    const parts = [];
    if (courseN > 0) parts.push(`${courseN} 节课程`);
    if (eventN > 0) parts.push(`${eventN} 个日程`);
    showToast(`AI 解析成功：${parts.join('、')}`);
  } catch (e) {
    showToast('AI 解析失败：' + e.message, 'error');
  } finally {
    $('ai-status').style.display = 'none';
    $('btn-ai-parse').disabled = false;
  }
}

function showPreview() {
  const list = $('ai-preview-list');
  list.innerHTML = parsedCourses.map((c, i) => {
    const isCourse = c.type === 'course';
    const conflicts = isCourse ? checkTimeConflict(c.date, c.startTime, c.endTime) : [];
    const hasConflict = conflicts.length > 0;

    const typeTag = isCourse
      ? `<span class="ai-type-tag ai-type-course">📚 课程</span>`
      : `<span class="ai-type-tag ai-type-event">📌 日程</span>`;

    const timeStr = c.startTime
      ? `${c.startTime}${c.endTime ? ' - ' + c.endTime : ''}`
      : '全天';

    return `<div class="ai-preview-item glass ${hasConflict ? 'ai-preview-conflict' : ''}">
      <label class="batch-checkbox" style="margin-right:8px">
        <input type="checkbox" checked data-preview-index="${i}" onchange="togglePreviewItem(${i}, this.checked)">
        <span class="batch-checkmark"></span>
      </label>
      <div class="ai-preview-color color-bg-${c.color || (isCourse ? 'blue' : 'amber')}"></div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <strong>${c.title}</strong>
          ${typeTag}
          ${hasConflict ? '<span class="conflict-badge">⚠️冲突</span>' : ''}
        </div>
        <div class="ai-preview-detail">${c.date} · ${timeStr}${c.location ? ' · ' + c.location : ''}</div>
        ${hasConflict ? `<div class="conflict-detail-text">与 ${conflicts.map(cc => cc.title).join('、')} 时间重叠</div>` : ''}
      </div>
    </div>`;
  }).join('');

  $('ai-preview').style.display = 'block';
  $('btn-ai-confirm').style.display = 'inline-flex';
  $('btn-ai-parse').style.display = 'none';

  // 更新确认按钮文案
  const courseN = parsedCourses.filter(c => c.type === 'course' && !c._skip).length;
  const eventN = parsedCourses.filter(c => c.type === 'event' && !c._skip).length;
  updateConfirmBtnText();
}

function togglePreviewItem(index, checked) {
  if (!checked) {
    parsedCourses[index]._skip = true;
  } else {
    delete parsedCourses[index]._skip;
  }
  updateConfirmBtnText();
}

function updateConfirmBtnText() {
  const courseN = parsedCourses.filter(c => c.type === 'course' && !c._skip).length;
  const eventN = parsedCourses.filter(c => c.type === 'event' && !c._skip).length;
  const parts = [];
  if (courseN > 0) parts.push(`${courseN} 节课`);
  if (eventN > 0) parts.push(`${eventN} 个日程`);
  $('btn-ai-confirm').textContent = parts.length > 0 ? `导入 ${parts.join(' + ')}` : '导入';
}

/* ============================================================
   区块结束：AI 导入课程
   ============================================================ */


/* ============================================================
   区块开始：Todo CRUD
   ============================================================ */

function initTodo() {
  // 在日历页面添加 Todo 按钮（动态）
  const addBtnWrap = $('btn-add-course').parentElement;
  if (!document.getElementById('btn-add-todo-inline')) {
    const todoBtn = document.createElement('button');
    todoBtn.className = 'btn btn-secondary btn-sm';
    todoBtn.id = 'btn-add-todo-inline';
    todoBtn.textContent = '+ 待办';
    todoBtn.style.marginLeft = '8px';
    todoBtn.addEventListener('click', () => {
      $('input-todo-date').value = selectedDate;
      openModal('modal-add-todo');
    });
    addBtnWrap.appendChild(todoBtn);

    const annivBtn = document.createElement('button');
    annivBtn.className = 'btn btn-secondary btn-sm';
    annivBtn.id = 'btn-add-anniv-inline';
    annivBtn.textContent = '+ 纪念日';
    annivBtn.style.marginLeft = '8px';
    annivBtn.addEventListener('click', () => {
      $('input-anniv-date').value = selectedDate;
      openModal('modal-add-anniversary');
    });
    addBtnWrap.appendChild(annivBtn);
  }

  // 保存 Todo
  $('btn-save-todo').addEventListener('click', () => {
    const text = $('input-todo-text').value.trim();
    const priority = $('input-todo-priority').value;
    const date = $('input-todo-date').value;
    if (!text) { showToast('请输入待办内容', 'warning'); return; }

    appData.todos.push({
      id: generateId(),
      text, priority,
      date: date || formatDate(new Date()),
      done: false
    });
    saveData();
    closeModal('modal-add-todo');
    $('input-todo-text').value = '';
    refreshCalendar();
    refreshHome();
    showToast('待办已添加');
  });

  // 保存纪念日
  $('btn-save-anniversary').addEventListener('click', () => {
    const name = $('input-anniv-name').value.trim();
    const date = $('input-anniv-date').value;
    const remind = parseInt($('input-anniv-remind').value) || 3;
    if (!name || !date) { showToast('请填写名称和日期', 'warning'); return; }

    appData.anniversaries.push({
      id: generateId(),
      name, date, remind
    });
    saveData();
    closeModal('modal-add-anniversary');
    $('input-anniv-name').value = '';
    refreshCalendar();
    refreshHome();
    showToast('纪念日已添加');
  });
}

function toggleTodo(id) {
  const todo = appData.todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    saveData();
    refreshCalendar();
    refreshHome();}
}

function deleteTodo(id) {
  appData.todos = appData.todos.filter(t => t.id !== id);
  saveData();
  refreshCalendar();
  refreshHome();
  showToast('待办已删除');
}

/* ============================================================
   区块结束：Todo CRUD
   ============================================================ */
/* ============================================================
   区块开始：宠物管理
   ============================================================ */

let currentPetIndex = 0;

// ── 性格配置表（预设） ────────────────────────────────────────
const PERSONALITY_CONFIG = {
  lively: {
    label: '活泼', emoji: '🐶',
    idlePhrases:   ['主人主人！陪我玩嘛！🎾', '今天天气真好！出去溜溜？🌞', '我超级开心的！！！💕', '快来摸摸我！🐾'],
    hungryPhrases: ['主人！我饿了！快给我吃的！🍖', '肚子咕咕叫了！！！', '食物！食物！食物！🍗'],
    sadPhrases:    ['呜呜…好无聊啊…', '主人不陪我玩，好难过😢', '我需要玩耍！！'],
    dirtyPhrases:  ['我好脏脏！帮我洗洗嘛！🛁', '毛毛乱了！梳一梳！'],
    systemPrompt:  '你是一只活泼开朗的宠物，性格热情，爱撒娇，说话喜欢用感叹号和颜文字，充满活力。用第一人称"我"说话，简短可爱，回复50字以内。'
  },
  lazy: {
    label: '慵懒', emoji: '🐱',
    idlePhrases:   ['…zZZ…', '好困…再睡一会儿…', '别吵…我在想事情…', '嗯…今天也是慵懒的一天…'],
    hungryPhrases: ['…饿了…', '食物…放这里就行…不用叫我…', '懒得动…但是好饿…'],
    sadPhrases:    ['无聊…但懒得说…', '…随便吧…', '心情不好…别烦我…'],
    dirtyPhrases:  ['脏了…但懒得动…', '…帮我梳一下吧…'],
    systemPrompt:  '你是一只慵懒的宠物，说话慢悠悠，经常用省略号，偶尔傲娇，不爱多说话，但偶尔会说出很走心的话。用第一人称"我"说话，简短，回复50字以内。'
  },
  tsundere: {
    label: '傲娇', emoji: '🦊',
    idlePhrases:   ['哼！才不是在等你呢！', '…不是因为喜欢你才待在这里的！', '你回来了啊…才没有在等你！', '哼，今天心情还不错，跟你没关系！'],
    hungryPhrases: ['哼！才不是因为饿了才叫你的！', '…给我吃的…不是求你，只是通知你！', '肚子有点响…跟你没关系！'],
    sadPhrases:    ['才没有无聊！只是…只是有点想你而已！', '哼！不是因为想玩才找你的！'],
    dirtyPhrases:  ['才不是想让你摸！只是毛乱了而已！', '哼…帮我梳一下…不是因为喜欢！'],
    systemPrompt:  '你是一只傲娇的宠物，嘴硬心软，经常说"才不是""哼"，不承认自己喜欢主人，但行动上很依赖。用第一人称"我"说话，简短，带傲娇语气，回复50字以内。'
  },
  clingy: {
    label: '粘人', emoji: '🐰',
    idlePhrases:   ['主人！我在这里！看我看我！💕', '不要离开我！我要一直陪着你！', '主人你去哪里了？我好想你！🥺', '抱抱！我要抱抱！'],
    hungryPhrases: ['主人主人！我饿了！快来喂我！🥺', '不吃饭我会消失的！快来！', '饿饿…主人在哪里…'],
    sadPhrases:    ['主人不陪我…我好孤单…🥺', '呜呜…不要不理我…', '我需要你！'],
    dirtyPhrases:  ['主人帮我梳毛！我要变漂亮！', '脏了！主人快来！'],
    systemPrompt:  '你是一只超级粘人的宠物，极度依赖主人，说话充满撒娇和依赖感，经常用"主人"称呼，喜欢用🥺💕等表情。用第一人称"我"说话，简短可爱，回复50字以内。'
  },
  cool: {
    label: '冷静', emoji: '🐺',
    idlePhrases:   ['一切都好。', '今天也平静。', '我在这里。', '有什么需要吗？'],
    hungryPhrases: ['需要补充能量了。', '该进食了。', '饿了。'],
    sadPhrases:    ['需要活动一下。', '有些无聊。', '陪我待一会儿吧。'],
    dirtyPhrases:  ['需要清洁了。', '帮我整理一下。'],
    systemPrompt:  '你是一只冷静沉稳的宠物，话不多，但每句都很走心，不用感叹号，语气平静，偶尔说出很有深度的话。用第一人称"我"说话，简短克制，回复50字以内。'
  },
  foodie: {
    label: '吃货', emoji: '🐹',
    idlePhrases:   ['主人，下一顿吃什么？🍗', '我在想…晚饭吃什么好呢…', '刚才那个味道好香！是什么？', '吃饱了好幸福！🍖'],
    hungryPhrases: ['饿！！！快给我吃的！！！🍖🍗🍖', '肚子在抗议了！食物！食物！', '我要吃！！！现在！！！'],
    sadPhrases:    ['没有好吃的，好难过…', '心情不好，需要零食治愈…', '给我吃点好的嘛…'],
    dirtyPhrases:  ['吃完要梳毛，好吧…', '帮我清理一下，然后给我吃的！'],
    systemPrompt:  '你是一只超级爱吃的宠物，满脑子都是食物，说话经常提到吃东西，对食物极度热情，用食物来表达情感。用第一人称"我"说话，简短，充满对食物的热爱，回复50字以内。'
  }
};

// 获取当前宠物的有效性格配置（含自定义）
function getPersonalityConfig(pet) {
  if (pet.personality === 'custom' && pet.customPersonality) {
    const cp = pet.customPersonality;
    return {
      label:         cp.name   || '自定义',
      emoji:         cp.emoji  || '✨',
      idlePhrases:   cp.idlePhrases   || ['你好~'],
      hungryPhrases: cp.hungryPhrases || ['我饿了…'],
      sadPhrases:    ['好无聊…'],
      dirtyPhrases:  ['帮我梳梳毛…'],
      systemPrompt:  cp.prompt || '你是一只可爱的宠物，用第一人称"我"说话，简短，回复50字以内。'
    };
  }
  return PERSONALITY_CONFIG[pet.personality] || PERSONALITY_CONFIG.lively;
}

// ── 状态衰减 ──────────────────────────────────────────────────
function getPetState(petId) {
  if (!appData.petStates[petId]) {
    appData.petStates[petId] = { hunger: 80, happy: 65, clean: 90, lastUpdate: Date.now() };
    saveData();
  }
  const state = appData.petStates[petId];
  const elapsed = (Date.now() - state.lastUpdate) / 1000 / 60;
  const decay   = elapsed * 0.05;
  state.hunger  = Math.max(0, state.hunger - decay * 1.2);
  state.happy   = Math.max(0, state.happy  - decay * 0.8);
    state.clean   = Math.max(0, state.clean  - decay * 0.5);
  state.lastUpdate = Date.now();
  saveData();
  return state;
}

// ── 页面刷新 ──────────────────────────────────────────────────
function refreshPet() {
  if (appData.pets.length === 0) {
    $('pet-placeholder').style.display = 'flex';
    $('pet-content').style.display = 'none';
    return;
  }
  $('pet-placeholder').style.display = 'none';
  $('pet-content').style.display = 'block';

  // 宠物标签
  const tabs = $('pet-tabs');
  tabs.innerHTML = appData.pets.map((p, i) =>
    `<button class="pet-tab ${i === currentPetIndex ? 'active' : ''}" data-index="${i}">${p.name}</button>`
  ).join('');
  tabs.querySelectorAll('.pet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentPetIndex = parseInt(tab.dataset.index);
      // 关闭聊天区
      $('tama-chat-area').style.display = 'none';
      $('btn-tama-chat').classList.remove('active');
      refreshPet();
    });
  });

  const pet   = appData.pets[currentPetIndex];
  const state = getPetState(pet.id);

  renderTamagotchi(pet, state);
  renderPetInfo(pet);
  renderPetFeeding(pet);
  renderPetHealth(pet);
}

// ── 拓麻歌子渲染 ──────────────────────────────────────────────
function renderTamagotchi(pet, state) {
  const sprite = $('tama-sprite');
  const mood   = state.hunger < 30 ? 'hungry'
               : state.happy  < 30 ? 'sad'
               : state.clean  < 30 ? 'dirty'
               : 'happy';

  if (pet.avatar) {
    sprite.innerHTML = `<img src="${pet.avatar}" alt="${pet.name}" class="tama-img ${mood}">`;
  } else {
    sprite.innerHTML = `
      <div class="tama-default-sprite ${mood}">
        <div class="tama-body"></div>
        <div class="tama-eyes"><span></span><span></span></div>
        <div class="tama-mouth"></div>
        <div class="tama-cheeks"><span></span><span></span></div>
      </div>`;
  }

  // 性格标签
  const pConfig = getPersonalityConfig(pet);
  $('tama-personality-label').textContent = `${pConfig.emoji} ${pConfig.label}`;

  // 气泡（非聊天模式时显示）
  if ($('tama-chat-area').style.display === 'none') {
    updateTamaBubble(pet, state);
  }

  // 状态条
  const hv = Math.round(state.hunger);
  const av = Math.round(state.happy);
  const cv = Math.round(state.clean);

  $('tama-hunger').style.width = hv + '%';
  $('tama-happy').style.width  = av + '%';
  $('tama-clean').style.width  = cv + '%';

  $('tama-hunger').className = `tama-stat-fill hunger${hv < 30 ? ' low' : ''}`;
  $('tama-happy').className  = `tama-stat-fill happy${av  < 30 ? ' low' : ''}`;
  $('tama-clean').className  = `tama-stat-fill clean${cv  < 30 ? ' low' : ''}`;

  $('tama-hunger-val').textContent = hv;
  $('tama-happy-val').textContent  = av;
  $('tama-clean-val').textContent  = cv;
}

function updateTamaBubble(pet, state) {
  const pConfig = getPersonalityConfig(pet);
  let phrases;
  if      (state.hunger < 30) phrases = pConfig.hungryPhrases;
  else if (state.happy  < 30) phrases = pConfig.sadPhrases;
  else if (state.clean  < 30) phrases = pConfig.dirtyPhrases;
  else                        phrases = pConfig.idlePhrases;

  const text = phrases[Math.floor(Math.random() * phrases.length)];
  $('tama-bubble').style.display = 'block';
  typewriterBubble($('tama-bubble-text'), text);
}

// 打字机效果
function typewriterBubble(el, text, speed = 55) {
  el.textContent = '';
  const cursor = $('tama-bubble-cursor');
  if (cursor) cursor.style.display = 'inline';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      if (cursor) setTimeout(() => { cursor.style.display = 'none'; }, 800);
    }
  }, speed);
}

// 粒子特效
function spawnParticles(type) {
  const container = $('tama-particles');
  if (!container) return;
  const emojis = {
    feed:  ['🍖', '✨', '💛', '🍗'],
    play:  ['🎾', '⭐', '💫', '🎉'],
    clean: ['✨', '🧼', '💎', '🫧'],
    chat:  ['💬', '💕', '✨', '💭']
  };
  const pool = emojis[type] || ['✨'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('span');
    p.className = 'tama-particle';
    p.textContent = pool[Math.floor(Math.random() * pool.length)];
    p.style.cssText = `left:${30 + Math.random() * 40}%;animation-delay:${Math.random() * 0.4}s;font-size:${12 + Math.random() * 10}px`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

function animateTama(type) {
  const wrap = $('tama-sprite-wrap');
  if (!wrap) return;
  wrap.classList.remove('bounce', 'spin', 'shake');
  void wrap.offsetWidth;
  wrap.classList.add(type);
  setTimeout(() => wrap.classList.remove(type), 600);
}

// ── AI 对话 ───────────────────────────────────────────────────
async function sendTamaChat() {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;

  const input    = $('tama-chat-input');
  const userText = input.value.trim();
  if (!userText) return;

  const { apiBase, apiKey, apiModel } = appData.settings;
  if (!apiBase || !apiKey) {
    showToast('请先在设置中配置 AI 接口', 'warning');
    return;
  }

  input.value = '';
  appendChatMsg('user', userText);

  const state   = getPetState(pet.id);
  const pConfig = getPersonalityConfig(pet);

  const systemPrompt = `${pConfig.systemPrompt}
你的名字是"${pet.name}"，品种：${pet.breed || '未知'}，性别：${pet.gender === 'male' ? '公' : pet.gender === 'female' ? '母' : '未知'}。
当前状态 — 饱食度：${Math.round(state.hunger)}/100，心情：${Math.round(state.happy)}/100，清洁度：${Math.round(state.clean)}/100。
根据状态自然融入对话，不要用 markdown 格式。`;

  const loadingId = 'tama-msg-' + Date.now();
  appendChatMsg('pet', '…', loadingId);

  try {
    const res = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model:       apiModel || 'gpt-3.5-turbo',
        messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText }],
        temperature: 0.9,
        max_tokens:  120
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '…';

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      const textEl = loadingEl.querySelector('.tama-chat-text');
      if (textEl) typewriterBubble(textEl, reply, 35);
    }
    $('tama-bubble').style.display = 'block';
    typewriterBubble($('tama-bubble-text'), reply);
    spawnParticles('chat');
  } catch (e) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      const textEl = loadingEl.querySelector('.tama-chat-text');
      if (textEl) textEl.textContent = '呜…说不出话来了…';
    }
    showToast('AI 连接失败：' + e.message, 'error');
  }
}

function appendChatMsg(role, text, id) {
  const messages = $('tama-chat-messages');
  const pet      = appData.pets[currentPetIndex];
  const pConfig  = getPersonalityConfig(pet);
  const div      = document.createElement('div');
  div.className  = `tama-chat-msg ${role}`;
  if (id) div.id = id;
  div.innerHTML  = role === 'pet'
    ? `<span class="tama-chat-avatar">${pConfig.emoji}</span><span class="tama-chat-text">${text}</span>`
    : `<span class="tama-chat-text">${text}</span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ── 宠物信息渲染 ──────────────────────────────────────────────
function renderPetInfo(pet) {
  const section    = $('pet-info-section');
  const genderText = { male: '♂ 公', female: '♀ 母', unknown: '未知' };
  const age        = pet.birthday ? calculateAge(pet.birthday) : '未知';

  section.innerHTML = `
    <div class="section-title" style="display:flex;justify-content:space-between;align-items:center;padding:0 16px">
      <span>📋 基本信息</span>
      <button class="btn btn-secondary btn-sm" onclick="openEditPetModal()">✏️ 编辑</button>
    </div>
    <div class="pet-info-grid glass-card" style="margin:8px 16px 0;padding:16px 18px">
      <div class="pet-info-row"><span>品种</span><strong>${pet.breed || '未知'}</strong></div>
      <div class="pet-info-row"><span>性别</span><strong>${genderText[pet.gender] || '未知'}</strong></div>
      <div class="pet-info-row"><span>年龄</span><strong>${age}</strong></div>
      <div class="pet-info-row"><span>生日</span><strong>${pet.birthday || '未设置'}</strong></div>
      <div class="pet-info-row"><span>绝育</span><strong>${pet.neutered === 'yes' ? '✅ 已绝育' : '❌ 未绝育'}</strong></div>
      ${pet.chip ? `<div class="pet-info-row"><span>芯片号</span><strong>${pet.chip}</strong></div>` : ''}
    </div>`;
}

function calculateAge(birthday) {
  const birth  = new Date(birthday);
  const now    = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 1)  return '不足1个月';
  if (months < 12) return `${months} 个月`;
  const years = Math.floor(months / 12);
  const rem   = months % 12;
  return rem > 0 ? `${years} 岁 ${rem} 个月` : `${years} 岁`;
}

// ── 编辑宠物弹窗 ──────────────────────────────────────────────
function openEditPetModal() {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  $('edit-pet-name').value     = pet.name     || '';
  $('edit-pet-breed').value    = pet.breed    || '';
  $('edit-pet-gender').value   = pet.gender   || 'unknown';
  $('edit-pet-birthday').value = pet.birthday || '';
  $('edit-pet-neutered').value = pet.neutered || 'no';
  $('edit-pet-chip').value     = pet.chip     || '';
  $('edit-pet-avatar').value   = pet.avatar && !pet.avatar.startsWith('data:') ? pet.avatar : '';
  openModal('modal-edit-pet');
}

function saveEditPet() {
  const pet  = appData.pets[currentPetIndex];
  if (!pet) return;
  const name = $('edit-pet-name').value.trim();
  if (!name) { showToast('名字不能为空', 'warning'); return; }

  const doSave = (avatarVal) => {
    pet.name     = name;
    pet.breed    = $('edit-pet-breed').value.trim();
    pet.gender   = $('edit-pet-gender').value;
    pet.birthday = $('edit-pet-birthday').value;
    pet.neutered = $('edit-pet-neutered').value;
    pet.chip     = $('edit-pet-chip').value.trim();
    if (avatarVal !== null) pet.avatar = avatarVal;
    saveData();
    closeModal('modal-edit-pet');
    refreshPet();
    showToast(`${name} 的信息已更新 ✅`);
  };

  const fileInput = $('edit-pet-avatar-file');
  if (fileInput && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => doSave(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    const urlVal = $('edit-pet-avatar').value.trim();
    doSave(urlVal || pet.avatar);
  }
}

function deleteCurrentPet() {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  if (!confirm(`确定要删除「${pet.name}」吗？此操作不可撤销。`)) return;
  // 清理状态数据
  delete appData.petStates[pet.id];
  appData.pets.splice(currentPetIndex, 1);
  currentPetIndex = Math.max(0, currentPetIndex - 1);
  saveData();
  closeModal('modal-edit-pet');
  refreshPet();
  refreshHome();
  showToast('宠物已删除');
}

// ── 饮食渲染 ──────────────────────────────────────────────────
function renderPetFeeding(pet) {
  const section     = $('pet-feed-section');
  const todayStr    = formatDate(new Date());
  const todayFeeds  = (pet.feeds     || []).filter(f => f.date === todayStr);
  const todayWater  = (pet.waterLogs || []).filter(w => w.date === todayStr);
  const totalWater  = todayWater.reduce((s, w) => s + (w.ml || 0), 0);
  const waterTarget = 300; // ml 目标（可后续配置化）

  const meals     = ['早餐', '午餐', '晚餐', '零食'];
  const mealIcons = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '零食': '🍬' };

  section.innerHTML = `
    <div class="section-title" style="display:flex;justify-content:space-between;align-items:center;padding:0 16px">
      <span>🍽️ 今日饮食</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="openModal('modal-add-water')">💧 饮水</button>
        <button class="btn btn-primary btn-sm" onclick="openFeedModal()">+ 记录</button>
      </div>
    </div>
    <div class="feed-cards" style="padding:0 16px;margin-top:8px">
      ${meals.map(meal => {
        const records = todayFeeds.filter(f => f.meal === meal);
        const latest  = records[records.length - 1];
        return `
          <div class="feed-card glass ${latest ? 'fed' : ''}" onclick="openFeedModal('${meal}')">
            <span class="feed-icon">${mealIcons[meal]}</span>
            <div class="feed-card-body">
              <span class="feed-label">${meal}</span>
              <span class="feed-status">${latest
                ? `✅ ${latest.food || ''}${latest.amount ? ' · ' + latest.amount : ''}`
                : '未记录'}</span>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="water-tracker glass-card" style="margin:10px 16px 0">
      <div class="water-tracker-header">
        <span>💧 今日饮水</span>
        <span class="water-total">${totalWater} <small>/ ${waterTarget} ml</small></span>
      </div>
      <div class="water-bar-wrap">
        <div class="water-bar-fill" style="width:${Math.min(100, totalWater / waterTarget * 100)}%"></div>
      </div>
      <div class="water-logs">
        ${todayWater.length === 0
          ? '<span class="water-empty">今天还没有饮水记录</span>'
          : todayWater.map(w => `
              <span class="water-log-chip">
                ${w.time ? w.time + ' · ' : ''}${w.ml}ml
                <button class="water-log-del" onclick="deleteWaterLog('${w.id}')" aria-label="删除">×</button>
              </span>`).join('')}
      </div>
    </div>`;
}

function openFeedModal(meal) {
  if (meal) {
    $('feed-type-tabs').querySelectorAll('.seg-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.meal === meal);
    });
  }
  const now = new Date();
  $('input-feed-time').value   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  $('input-feed-food').value   = '';
  $('input-feed-amount').value = '';
  $('input-feed-note').value   = '';
  openModal('modal-add-feed');
}

function deleteWaterLog(id) {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  pet.waterLogs = (pet.waterLogs || []).filter(w => w.id !== id);
  saveData();
  renderPetFeeding(pet);
}

// ── 健康记录渲染 ──────────────────────────────────────────────
function renderPetHealth(pet) {
  const section  = $('pet-health-section');
  const weights  = pet.weights  || [];
  const vaccines = pet.vaccines || [];
  const today    = new Date();
  const lastWeight = weights.length > 0 ? weights[weights.length - 1] : null;

  const soon = vaccines.filter(v => {
    if (!v.nextDate) return false;
    const diff = (new Date(v.nextDate) - today) / 86400000;
    return diff >= 0 && diff <= 30;
  });

  const typeIcon = { '疫苗': '💉', '驱虫': '🐛', '体检': '🏥', '其他': '📋' };

  section.innerHTML = `
    <div class="section-title" style="display:flex;justify-content:space-between;align-items:center;padding:0 16px">
      <span>🏥 健康记录</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="openAddVaccineModal()">+ 疫苗/驱虫</button>
        <button class="btn btn-secondary btn-sm" onclick="addWeightRecord()">+ 体重</button>
      </div>
    </div>
    <div class="health-cards" style="padding:0 16px;margin-top:8px">
      <div class="health-card glass">
        <span class="health-icon">⚖️</span>
        <div>
          <div class="health-label">最新体重</div>
          <div class="health-value">${lastWeight ? lastWeight.value + ' kg' : '未记录'}</div>
          ${lastWeight ? `<div class="health-meta">${lastWeight.date}</div>` : ''}
        </div>
      </div>
      <div class="health-card glass">
        <span class="health-icon">💉</span>
        <div>
          <div class="health-label">健康记录</div>
          <div class="health-value">${vaccines.length} 条</div>
          ${soon.length > 0 ? `<div class="health-meta warn">⚠️ ${soon.length} 条即将到期</div>` : ''}
        </div>
      </div>
    </div>

    ${soon.length > 0 ? `
    <div class="vaccine-alert glass-card" style="margin:10px 16px 0">
      <div class="vaccine-alert-title">⚠️ 即将到期提醒</div>
      ${soon.map(v => `
        <div class="vaccine-alert-item">
          <span>${typeIcon[v.type] || '📋'} ${v.name}</span>
          <span class="vaccine-alert-date">${v.nextDate}</span>
        </div>`).join('')}
    </div>` : ''}

    <div class="vaccine-list" style="padding:0 16px;margin-top:10px">
      ${vaccines.length === 0
        ? `<div class="empty-hint">还没有健康记录，点击上方按钮添加</div>`
        : vaccines.slice().reverse().map(v => {
            const diff = v.nextDate ? (new Date(v.nextDate) - today) / 86400000 : Infinity;
            const expiring = diff >= 0 && diff <= 30;
            return `
              <div class="vaccine-item glass${expiring ? ' expiring' : ''}">
                <div class="vaccine-item-left">
                  <span class="vaccine-type-icon">${typeIcon[v.type] || '📋'}</span>
                  <div>
                    <div class="vaccine-name">${v.name}</div>
                    <div class="vaccine-meta">
                      ${v.date}${v.clinic ? ' · ' + v.clinic : ''}
                      ${v.note ? `<br><span class="vaccine-note">${v.note}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="vaccine-item-right">
                  ${v.nextDate ? `<span class="vaccine-next${expiring ? ' soon' : ''}">下次 ${v.nextDate}</span>` : ''}
                  <button class="icon-btn-sm" onclick="deleteVaccineRecord('${v.id}')" aria-label="删除">🗑️</button>
                </div>
              </div>`;
          }).join('')}
    </div>`;
}

function openAddVaccineModal() {
  $('input-vaccine-name').value   = '';
  $('input-vaccine-date').value   = formatDate(new Date());
  $('input-vaccine-next').value   = '';
  $('input-vaccine-clinic').value = '';
  $('input-vaccine-note').value   = '';
  $('vaccine-type-tabs').querySelectorAll('.seg-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === 0);
  });
  openModal('modal-add-vaccine');
}

function deleteVaccineRecord(id) {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  pet.vaccines = (pet.vaccines || []).filter(v => v.id !== id);
  saveData();
  renderPetHealth(pet);
  showToast('记录已删除');
}

function addWeightRecord() {
  const pet   = appData.pets[currentPetIndex];
  if (!pet) return;
  const value = prompt('输入体重（kg）：', '');
  if (!value || isNaN(value)) return;
  if (!pet.weights) pet.weights = [];
  pet.weights.push({ date: formatDate(new Date()), value: parseFloat(value) });
  saveData();
  renderPetHealth(pet);
  showToast('体重已记录 ⚖️');
}

// ── 初始化 ────────────────────────────────────────────────────
function initPet() {

  // 添加宠物
  $('btn-add-pet').addEventListener('click', () => openModal('modal-add-pet'));

  $('btn-save-pet').addEventListener('click', () => {
    const name = $('input-pet-name').value.trim();
    if (!name) { showToast('请输入宠物名字', 'warning'); return; }
    const pet = {
      id: generateId(), name,
      breed:       $('input-pet-breed').value.trim(),
      gender:      $('input-pet-gender').value,
      birthday:    $('input-pet-birthday').value,
      neutered:    $('input-pet-neutered').value,
      chip:        $('input-pet-chip').value.trim(),
      avatar:      $('input-pet-avatar').value.trim(),
      personality: 'lively',
      feeds: [], waterLogs: [], weights: [], vaccines: []
    };
    const fileInput = $('input-pet-avatar-file');
    if (fileInput && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        pet.avatar = e.target.result;
        appData.pets.push(pet);
        saveData();
        closeModal('modal-add-pet');
        refreshPet(); refreshHome();
        showToast(`${name} 已添加 🐾`);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      appData.pets.push(pet);
      saveData();
      closeModal('modal-add-pet');
      refreshPet(); refreshHome();
      showToast(`${name} 已添加 🐾`);
    }
  });

  // 编辑宠物
  $('btn-save-edit-pet').addEventListener('click', saveEditPet);
  $('btn-delete-pet').addEventListener('click', deleteCurrentPet);

  // 拓麻歌子互动
  $('btn-feed').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const state = getPetState(pet.id);
    state.hunger = Math.min(100, state.hunger + 25);
    saveData(); spawnParticles('feed'); animateTama('bounce');
    showToast('喂食成功！🍖'); refreshPet(); refreshHome();
  });

  $('btn-play').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const state = getPetState(pet.id);
    state.happy = Math.min(100, state.happy + 20);
    saveData(); spawnParticles('play'); animateTama('spin');
    showToast('玩耍中！🎾'); refreshPet(); refreshHome();
  });

  $('btn-clean').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const state = getPetState(pet.id);
    state.clean = Math.min(100, state.clean + 30);
    saveData(); spawnParticles('clean'); animateTama('shake');
    showToast('梳毛完成！✨'); refreshPet(); refreshHome();
  });

  // 聊天开关
  $('btn-tama-chat').addEventListener('click', () => {
    const chatArea = $('tama-chat-area');
    const isOpen   = chatArea.style.display !== 'none';
    chatArea.style.display = isOpen ? 'none' : 'flex';
    $('btn-tama-chat').classList.toggle('active', !isOpen);
    if (!isOpen) {
      $('tama-chat-messages').innerHTML = '';
      const pet = appData.pets[currentPetIndex];
      if (pet) {
        const pConfig = getPersonalityConfig(pet);
        const greeting = pConfig.idlePhrases[Math.floor(Math.random() * pConfig.idlePhrases.length)];
        setTimeout(() => appendChatMsg('pet', greeting), 300);
      }
    }
  });

  $('tama-chat-send').addEventListener('click', sendTamaChat);
  $('tama-chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTamaChat(); }
  });

  // 性格弹窗
  $('btn-change-personality').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    // 高亮当前性格
        $('personality-grid').querySelectorAll('.personality-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.personality === (pet.personality || 'lively'));
    });
    // 如果当前是自定义，展开面板并填入已有数据
    if (pet.personality === 'custom' && pet.customPersonality) {
      const cp = pet.customPersonality;
      $('input-custom-personality-name').value   = cp.name   || '';
      $('input-custom-personality-emoji').value  = cp.emoji  || '';
      $('input-custom-personality-prompt').value = cp.prompt || '';
      $('input-custom-idle-phrases').value        = (cp.idlePhrases   || []).join('\n');
      $('input-custom-hungry-phrases').value      = (cp.hungryPhrases || []).join('\n');
      $('custom-personality-panel').style.display = 'block';
    } else {
      $('custom-personality-panel').style.display = 'none';
    }
    openModal('modal-pet-personality');
  });

  // 性格卡片点击
  $('personality-grid').addEventListener('click', e => {
    const card = e.target.closest('.personality-card');
    if (!card) return;
    $('personality-grid').querySelectorAll('.personality-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    // 自定义卡片展开面板
    const isCustom = card.dataset.personality === 'custom';
    $('custom-personality-panel').style.display = isCustom ? 'block' : 'none';
  });

  // 保存性格
  $('btn-save-personality').addEventListener('click', () => {
    const selected = $('personality-grid').querySelector('.personality-card.selected');
    if (!selected) { showToast('请选择一个性格', 'warning'); return; }
    const pet = appData.pets[currentPetIndex]; if (!pet) return;

    const personalityType = selected.dataset.personality;

    if (personalityType === 'custom') {
      const name   = $('input-custom-personality-name').value.trim();
      const emoji  = $('input-custom-personality-emoji').value.trim();
      const prompt = $('input-custom-personality-prompt').value.trim();
      const idleRaw   = $('input-custom-idle-phrases').value.trim();
      const hungryRaw = $('input-custom-hungry-phrases').value.trim();

      if (!name)  { showToast('请填写性格名称', 'warning'); return; }
      if (!prompt){ showToast('请填写 AI 人设提示词', 'warning'); return; }

      const idlePhrases   = idleRaw.split('\n').map(s => s.trim()).filter(Boolean);
      const hungryPhrases = hungryRaw.split('\n').map(s => s.trim()).filter(Boolean);

      if (idlePhrases.length < 2) { showToast('闲聊台词至少填 2 句', 'warning'); return; }

      pet.personality       = 'custom';
      pet.customPersonality = { name, emoji: emoji || '✨', prompt, idlePhrases, hungryPhrases };
    } else {
      pet.personality       = personalityType;
      pet.customPersonality = null;
    }

    saveData();
    closeModal('modal-pet-personality');
    refreshPet();
    const pConfig = getPersonalityConfig(pet);
    showToast(`性格已设置为「${pConfig.label}」${pConfig.emoji}`);
  });

  // 饮食弹窗 - 餐次 Tab
  $('feed-type-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.seg-tab');
    if (!tab) return;
    $('feed-type-tabs').querySelectorAll('.seg-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });

  // 保存饮食记录
  $('btn-save-feed').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const activeTab = $('feed-type-tabs').querySelector('.seg-tab.active');
    const meal   = activeTab ? activeTab.dataset.meal : '午餐';
    const food   = $('input-feed-food').value.trim();
    const amount = $('input-feed-amount').value.trim();
    const time   = $('input-feed-time').value;
    const note   = $('input-feed-note').value.trim();

    if (!pet.feeds) pet.feeds = [];
    pet.feeds.push({ id: generateId(), date: formatDate(new Date()), meal, food, amount, time, note });
    saveData();
    closeModal('modal-add-feed');
    renderPetFeeding(pet);
    showToast(`${meal}已记录 🍽️`);
  });

  // 饮水弹窗 - 快捷按钮
  $('water-quick-btns').addEventListener('click', e => {
    const btn = e.target.closest('.water-quick-btn');
    if (!btn) return;
    $('input-water-ml').value = btn.dataset.ml;
    $('water-quick-btns').querySelectorAll('.water-quick-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // 打开饮水弹窗时预填时间
  document.getElementById('modal-add-water').addEventListener('click', e => {
    // 只在弹窗首次显示时预填（通过 openModal 触发）
  });

  // 保存饮水记录
  $('btn-save-water').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const ml  = parseInt($('input-water-ml').value);
    if (!ml || ml <= 0) { showToast('请输入有效的饮水量', 'warning'); return; }
    const time = $('input-water-time').value;
    if (!pet.waterLogs) pet.waterLogs = [];
    pet.waterLogs.push({ id: generateId(), date: formatDate(new Date()), ml, time });
    saveData();
    closeModal('modal-add-water');
    renderPetFeeding(pet);
    showToast(`已记录饮水 ${ml}ml 💧`);
  });

  // 疫苗类型 Tab
  $('vaccine-type-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.seg-tab');
    if (!tab) return;
    $('vaccine-type-tabs').querySelectorAll('.seg-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });

  // 保存疫苗/驱虫记录
  $('btn-save-vaccine').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex]; if (!pet) return;
    const activeTab = $('vaccine-type-tabs').querySelector('.seg-tab.active');
    const type   = activeTab ? activeTab.dataset.type : '疫苗';
    const name   = $('input-vaccine-name').value.trim();
    const date   = $('input-vaccine-date').value;
    const next   = $('input-vaccine-next').value;
    const clinic = $('input-vaccine-clinic').value.trim();
    const note   = $('input-vaccine-note').value.trim();

    if (!name) { showToast('请输入记录名称', 'warning'); return; }
    if (!date) { showToast('请选择日期', 'warning'); return; }

    if (!pet.vaccines) pet.vaccines = [];
    pet.vaccines.push({ id: generateId(), type, name, date, nextDate: next || null, clinic, note });
    saveData();
    closeModal('modal-add-vaccine');
    renderPetHealth(pet);
    showToast(`${type}记录已添加 💉`);
  });

  // 饮水弹窗打开时预填时间
  const _origOpen = window.openModal;
  window.openModal = function(id) {
    if (id === 'modal-add-water') {
      const now = new Date();
      $('input-water-time').value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      $('input-water-ml').value   = '';
      $('water-quick-btns').querySelectorAll('.water-quick-btn').forEach(b => b.classList.remove('active'));
    }
    _origOpen(id);
  };
}

function animateTama(type) {
  const wrap = $('tama-sprite-wrap');
  if (!wrap) return;
  wrap.classList.remove('bounce', 'spin', 'shake');
  void wrap.offsetWidth;
  wrap.classList.add(type);
  setTimeout(() => wrap.classList.remove(type), 600);
}

/* ============================================================
   区块结束：宠物管理
   ============================================================ */

/* ============================================================
   区块开始：背单词系统
   ============================================================ */

const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30]; // 天，level 0-5 对应下次复习间隔

// 复习队列状态（页面内存，不持久化）
let vocabReviewQueue = [];
let vocabReviewIndex = 0;
let vocabReviewFlipped = false;

// ── 工具：XSS 防护 ──
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 工具：根据 level 获取颜色 ──
function getVocabLevelColor(level) {
  if (level >= EBBINGHAUS_INTERVALS.length) return '#34d399';
  if (level >= 3) return '#fbbf24';
  return '#f87171';
}

// ── 工具：根据 level 获取徽章 ──
function getVocabBadge(level) {
  if (level >= EBBINGHAUS_INTERVALS.length) return { cls: 'badge-mastered',  text: '已掌握' };
  if (level > 0)                            return { cls: 'badge-reviewing', text: `Lv.${level}` };
  return                                           { cls: 'badge-learning',  text: '待学习' };
}

// ── 计算今日到期单词 ──
function getDueWords() {
  const todayStr = formatDate(new Date());
  return appData.vocab.filter(w => {
    if (w.level >= EBBINGHAUS_INTERVALS.length) return false;
    if (!w.lastReview) return true;
    const next = new Date(w.lastReview);
    next.setDate(next.getDate() + EBBINGHAUS_INTERVALS[w.level]);
    return formatDate(next) <= todayStr;
  });
}

// ── 主渲染入口 ──
function refreshVocab() {
  if (appData.vocab.length === 0) {
    $('vocab-placeholder').style.display = 'flex';
    $('vocab-content').style.display = 'none';
    return;
  }
  $('vocab-placeholder').style.display = 'none';
  $('vocab-content').style.display = 'block';

  const content = $('vocab-content');
  content.innerHTML = `<div class="vocab-wrap">
    ${renderVocabStats()}
    ${renderVocabReview()}
    ${renderVocabLibrary()}
  </div>`;

  bindVocabEvents();
}

// ── 统计卡 ──
function renderVocabStats() {
  const total     = appData.vocab.length;
  const mastered  = appData.vocab.filter(w => w.level >= EBBINGHAUS_INTERVALS.length).length;
  const reviewing = appData.vocab.filter(w => w.level > 0 && w.level < EBBINGHAUS_INTERVALS.length).length;
  const learning  = total - mastered - reviewing;
  const streak    = appData.vocabStats?.streak || 0;

  const pMastered  = total ? (mastered  / total * 100).toFixed(1) : 0;
  const pReviewing = total ? (reviewing / total * 100).toFixed(1) : 0;
  const pLearning  = total ? (learning  / total * 100).toFixed(1) : 0;

  return `
  <div class="glass-card vocab-stats-card">
    <div class="vocab-stats-row">
      <span class="vocab-stats-title">学习进度 · ${mastered}/${total} 已掌握</span>
      <span class="vocab-streak-badge">🔥 ${streak} 天</span>
    </div>
    <div class="vocab-bar-track">
      <div class="vocab-bar-seg mastered"  style="width:${pMastered}%"></div>
      <div class="vocab-bar-seg reviewing" style="width:${pReviewing}%"></div>
      <div class="vocab-bar-seg learning"  style="width:${pLearning}%"></div>
    </div>
    <div class="vocab-stats-legend">
      <span><i style="background:#34d399"></i>已掌握 ${mastered}</span>
      <span><i style="background:#fbbf24"></i>复习中 ${reviewing}</span>
      <span><i style="background:#94a3b8"></i>待学习 ${learning}</span>
    </div>
  </div>`;
}

// ── 今日复习区 ──
function renderVocabReview() {
  const due = getDueWords();

  // 今日全部完成（队列为空）
  if (due.length === 0 && vocabReviewQueue.length === 0) {
    return `
    <div class="glass-card vocab-done-card">
      <div class="vocab-done-icon">🎉</div>
      <div class="vocab-done-title">今日复习已完成！</div>
      <div class="vocab-done-sub">词库共 ${appData.vocab.length} 个单词，继续保持～</div>
    </div>`;
  }

  // 初始化队列（首次进入或队列已清空）
  if (vocabReviewQueue.length === 0) {
    vocabReviewQueue = [...due];
    vocabReviewIndex = 0;
    vocabReviewFlipped = false;
  }

  // 本轮已全部评分完毕
  if (vocabReviewIndex >= vocabReviewQueue.length) {
    return `
    <div class="glass-card vocab-done-card">
      <div class="vocab-done-icon">✅</div>
      <div class="vocab-done-title">本轮复习完成！</div>
      <div class="vocab-done-sub">共复习了 ${vocabReviewQueue.length} 个单词</div>
      <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="resetVocabReview()">再来一轮</button>
    </div>`;
  }

  const w = vocabReviewQueue[vocabReviewIndex];
  const levelColor = getVocabLevelColor(w.level);
  const total   = vocabReviewQueue.length;
  const current = vocabReviewIndex + 1;
  // 进度百分比（已完成的张数）
  const progress = ((current - 1) / total * 100).toFixed(0);

  return `
  <div>
    <div class="vocab-review-header">
      <span class="vocab-review-title">📝 今日复习</span>
      <span class="vocab-review-counter">${current} / ${total}</span>
    </div>

    <!-- 进度细条 -->
    <div style="height:3px;background:var(--border-color);border-radius:99px;margin-bottom:14px;overflow:hidden">
      <div style="height:100%;width:${progress}%;background:var(--accent);border-radius:99px;transition:width 0.4s ease"></div>
    </div>

    <!-- 3D 翻转卡片 -->
    <div class="vocab-flip-scene" id="vocab-flip-scene"
         onclick="flipVocabCard()"
         onkeydown="if(event.key==='Enter'||event.key===' ')flipVocabCard()"
         role="button" aria-label="点击翻转查看释义" tabindex="0">
      <div class="vocab-flip-card ${vocabReviewFlipped ? 'flipped' : ''}" id="vocab-flip-card">

        <!-- 正面：单词 -->
        <div class="vocab-flip-front">
          <div class="vocab-flip-level-dot" style="background:${levelColor}"></div>
          <div class="vocab-flip-hint">点击翻转查看释义</div>
          <div class="vocab-flip-word">${escapeHtml(w.word)}</div>
          ${w.phonetic ? `<div class="vocab-flip-phonetic">${escapeHtml(w.phonetic)}</div>` : ''}
        </div>

        <!-- 背面：释义 + 例句 -->
        <div class="vocab-flip-back">
          <div class="vocab-flip-level-dot" style="background:${levelColor}"></div>
          <div class="vocab-flip-hint">你记住了吗？</div>
          <div class="vocab-flip-meaning">${escapeHtml(w.meaning)}</div>
          ${w.example
            ? `<div class="vocab-flip-example">"${escapeHtml(w.example)}"</div>`
            : ''}
        </div>

      </div>
    </div>

    <!-- 评分按钮（翻转后才显示） -->
    <div class="vocab-grade-btns ${vocabReviewFlipped ? '' : 'hidden'}" id="vocab-grade-btns">
      <button class="vocab-grade-btn grade-hard"
              onclick="gradeWord('${w.id}', 'hard')" aria-label="不认识">
        <span class="grade-emoji">😕</span>不认识
      </button>
      <button class="vocab-grade-btn grade-ok"
              onclick="gradeWord('${w.id}', 'ok')" aria-label="模糊">
        <span class="grade-emoji">🤔</span>有点模糊
      </button>
      <button class="vocab-grade-btn grade-easy"
              onclick="gradeWord('${w.id}', 'easy')" aria-label="认识">
        <span class="grade-emoji">😊</span>认识
      </button>
    </div>
  </div>`;
}

// ── 词库列表 ──
function renderVocabLibrary(filter, query) {
  filter = filter || 'all';
  query  = query  || '';
  const total = appData.vocab.length;

  // 过滤
  let list = appData.vocab.filter(function(w) {
    if (filter === 'mastered')  return w.level >= EBBINGHAUS_INTERVALS.length;
    if (filter === 'reviewing') return w.level > 0 && w.level < EBBINGHAUS_INTERVALS.length;
    if (filter === 'learning')  return w.level === 0;
    return true;
  });

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(function(w) {
      return w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q);
    });
  }

  const cntAll       = total;
  const cntLearning  = appData.vocab.filter(function(w){ return w.level === 0; }).length;
  const cntReviewing = appData.vocab.filter(function(w){ return w.level > 0 && w.level < EBBINGHAUS_INTERVALS.length; }).length;
  const cntMastered  = appData.vocab.filter(function(w){ return w.level >= EBBINGHAUS_INTERVALS.length; }).length;

  const tabs = [
    { key: 'all',       label: '全部 '   + cntAll },
    { key: 'learning',  label: '待学习 ' + cntLearning },
    { key: 'reviewing', label: '复习中 ' + cntReviewing },
    { key: 'mastered',  label: '已掌握 ' + cntMastered },
  ];

  // 构建 tab HTML（避免嵌套模板字符串）
  const tabsHtml = tabs.map(function(t) {
    const activeClass = filter === t.key ? ' active' : '';
    return '<button class="vocab-filter-tab' + activeClass + '" data-filter="' + t.key + '" onclick="onVocabFilter(\'' + t.key + '\')">' + t.label + '</button>';
  }).join('');

  // 构建列表 HTML
  let listHtml;
  if (list.length === 0) {
    const emptyMsg = query ? ('🔍 没有找到"' + escapeHtml(query) + '"') : '这个分类暂无单词';
    listHtml = '<div class="vocab-empty-search">' + emptyMsg + '</div>';
  } else {
    listHtml = list.map(function(w) {
      const badge = getVocabBadge(w.level);
      const dot   = getVocabLevelColor(w.level);
      return '<div class="vocab-item glass">'
        + '<div class="vocab-level-dot" style="background:' + dot + '"></div>'
        + '<div class="vocab-item-body">'
        +   '<div class="vocab-item-word">'    + escapeHtml(w.word)    + '</div>'
        +   '<div class="vocab-item-meaning">' + escapeHtml(w.meaning) + '</div>'
        + '</div>'
        + '<span class="vocab-item-badge ' + badge.cls + '">' + badge.text + '</span>'
        + '<button class="vocab-item-del" onclick="deleteWord(\'' + w.id + '\')" aria-label="删除单词">🗑️</button>'
        + '</div>';
    }).join('');
  }

  return '<div>'
    + '<div class="vocab-library-header">'
    +   '<span class="vocab-library-title">📚 词库</span>'
    +   '<button class="btn btn-primary btn-sm" onclick="openModal(\'modal-add-word\')">+ 添加</button>'
    + '</div>'
    + '<div class="vocab-search-wrap">'
    +   '<span class="vocab-search-icon">🔍</span>'
    +   '<input class="vocab-search-input" id="vocab-search-input" placeholder="搜索单词或释义…" value="' + escapeHtml(query) + '" oninput="onVocabSearch(this.value)" autocomplete="off" />'
    + '</div>'
    + '<div class="vocab-filter-tabs" id="vocab-filter-tabs">' + tabsHtml + '</div>'
    + '<div id="vocab-list-container">' + listHtml + '</div>'
    + '</div>';
}


// ── 绑定事件（innerHTML 后调用）──
function bindVocabEvents() {
  // 搜索和过滤状态存在闭包变量里，通过全局函数更新
  window._vocabFilter = window._vocabFilter || 'all';
  window._vocabQuery  = window._vocabQuery  || '';
}

// ── 搜索回调 ──
function onVocabSearch(query) {
  window._vocabQuery = query;
  const container = document.getElementById('vocab-list-container');
  if (!container) return;
  // 只重渲染列表部分，不动复习卡片
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderVocabLibrary(window._vocabFilter || 'all', query);
  const newContainer = tempDiv.querySelector('#vocab-list-container');
  if (newContainer) container.innerHTML = newContainer.innerHTML;
  // 更新 tab 计数
  const tabsEl = document.getElementById('vocab-filter-tabs');
  const newTabs = tempDiv.querySelector('#vocab-filter-tabs');
  if (tabsEl && newTabs) tabsEl.innerHTML = newTabs.innerHTML;
}

// ── 过滤 Tab 回调 ──
function onVocabFilter(filter) {
  window._vocabFilter = filter;
  const query = window._vocabQuery || '';
  const container = document.getElementById('vocab-list-container');
  if (!container) return;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderVocabLibrary(filter, query);
  const newContainer = tempDiv.querySelector('#vocab-list-container');
  if (newContainer) container.innerHTML = newContainer.innerHTML;
  // 更新 tab active 状态
  document.querySelectorAll('.vocab-filter-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

// ── 翻转卡片 ──
function flipVocabCard() {
  if (vocabReviewFlipped) return; // 已翻转，不重复翻
  vocabReviewFlipped = true;
  const card = document.getElementById('vocab-flip-card');
  const btns = document.getElementById('vocab-grade-btns');
  if (card) card.classList.add('flipped');
  if (btns) btns.classList.remove('hidden');
}

// ── 重置本轮复习 ──
function resetVocabReview() {
  vocabReviewQueue = [];
  vocabReviewIndex = 0;
  vocabReviewFlipped = false;
  refreshVocab();
}

// ── 评分（三档）──
function gradeWord(id, grade) {
  const word = appData.vocab.find(w => w.id === id);
  if (!word) return;

  if (grade === 'easy') {
    // 认识：level +1，最高到 EBBINGHAUS_INTERVALS.length（已掌握）
    word.level = Math.min(word.level + 1, EBBINGHAUS_INTERVALS.length);
  } else if (grade === 'ok') {
    // 模糊：level 不变，但刷新 lastReview（按当前间隔重新计时）
    // level 不变
  } else {
    // 不认识：level 归零
    word.level = 0;
  }
  word.lastReview = formatDate(new Date());

  // 更新连续打卡
  const todayStr = formatDate(new Date());
  if (!appData.vocabStats) appData.vocabStats = { streak: 0, lastDate: null };
  if (appData.vocabStats.lastDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (appData.vocabStats.lastDate === formatDate(yesterday)) {
      appData.vocabStats.streak++;
    } else {
      appData.vocabStats.streak = 1;
    }
    appData.vocabStats.lastDate = todayStr;
  }

  saveData();

  // 推进队列，局部更新复习区（不重渲染整页）
  vocabReviewIndex++;
  vocabReviewFlipped = false;

  const toastMap = {
    easy: '太棒了！✨',
    ok:   '继续加油！💪',
    hard: '没关系，下次再来！🔄'
  };
  showToast(toastMap[grade], grade === 'easy' ? 'success' : 'info');

  // 局部刷新：只更新统计卡 + 复习区，保留词库搜索状态
  refreshVocabPartial();
}

// ── 局部刷新（保留词库搜索/过滤状态）──
function refreshVocabPartial() {
  const wrap = document.querySelector('.vocab-wrap');
  if (!wrap) { refreshVocab(); return; }

  // 更新统计卡
  const statsEl = wrap.children[0];
  if (statsEl) statsEl.outerHTML = renderVocabStats();

  // 更新复习区
  const reviewEl = wrap.children[1];
  if (reviewEl) reviewEl.outerHTML = renderVocabReview();

  // 统计卡已被替换，重新绑定（无需额外绑定，事件都是 inline onclick）
  refreshHome(); // 同步首页概览
}

// ── 删除单词 ──
function deleteWord(id) {
  if (!confirm('确定删除这个单词？')) return;
  appData.vocab = appData.vocab.filter(w => w.id !== id);
  // 如果删的是当前复习队列里的词，从队列中移除
  const qIdx = vocabReviewQueue.findIndex(w => w.id === id);
  if (qIdx !== -1) {
    vocabReviewQueue.splice(qIdx, 1);
    if (vocabReviewIndex > qIdx) vocabReviewIndex--;
    if (vocabReviewIndex >= vocabReviewQueue.length) vocabReviewIndex = vocabReviewQueue.length;
  }
  saveData();
  refreshVocab();
  showToast('单词已删除');
}

// ── 初始化 ──
function initVocab() {
  // 重置队列状态（切换页面时重置）
  vocabReviewQueue = [];
  vocabReviewIndex = 0;
  vocabReviewFlipped = false;
  window._vocabFilter = 'all';
  window._vocabQuery  = '';

  $('btn-add-word').addEventListener('click', () => openModal('modal-add-word'));
  $('btn-import-word').addEventListener('click', () => openModal('modal-import-word'));

  // 保存单词
  $('btn-save-word').addEventListener('click', () => {
    const word    = $('input-word').value.trim();
    const meaning = $('input-word-meaning').value.trim();
    const example = $('input-word-example').value.trim();
    if (!word || !meaning) { showToast('请填写单词和释义', 'warning'); return; }

    // 检查重复
    if (appData.vocab.some(w => w.word.toLowerCase() === word.toLowerCase())) {
      showToast('该单词已存在', 'warning'); return;
    }

    appData.vocab.push({
      id: generateId(),
      word, meaning, example,
      level: 0,
      lastReview: null,
      addedDate: formatDate(new Date())
    });
    saveData();
    closeModal('modal-add-word');
    $('input-word').value = '';
    $('input-word-meaning').value = '';
    $('input-word-example').value = '';
    refreshVocab();
    refreshHome();
    showToast('单词已添加 ✅');
  });

  // 批量导入：预览
  $('btn-preview-import').addEventListener('click', () => {
    const raw = $('input-import-words').value.trim();
    if (!raw) { showToast('请先粘贴内容', 'warning'); return; }

    const parsed = parseImportText(raw);
    renderImportPreview(parsed);
  });

  // 批量导入：确认
  $('btn-confirm-import').addEventListener('click', () => {
    const raw = $('input-import-words').value.trim();
    if (!raw) return;
    const parsed = parseImportText(raw);
    const valid  = parsed.filter(p => !p.error);
    if (valid.length === 0) { showToast('没有可导入的有效单词', 'warning'); return; }

    let added = 0, skipped = 0;
    valid.forEach(p => {
      if (appData.vocab.some(w => w.word.toLowerCase() === p.word.toLowerCase())) {
        skipped++; return;
      }
      appData.vocab.push({
        id: generateId(),
        word: p.word, meaning: p.meaning, example: p.example || '',
        level: 0, lastReview: null,
        addedDate: formatDate(new Date())
      });
      added++;
    });

    saveData();
    closeModal('modal-import-word');
    // 重置弹窗状态
    $('input-import-words').value = '';
    $('import-preview').style.display = 'none';
    $('btn-confirm-import').style.display = 'none';

    refreshVocab();
    refreshHome();
    showToast(`成功导入 ${added} 个单词${skipped ? `，跳过重复 ${skipped} 个` : ''} ✅`);
  });
}

// ── 解析导入文本 ──
function parseImportText(raw) {
  return raw.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        return { raw: line, error: '格式错误，需要至少：单词 | 释义' };
      }
      return {
        word:    parts[0],
        meaning: parts[1],
        example: parts[2] || '',
        raw:     line
      };
    });
}

// ── 渲染导入预览 ──
function renderImportPreview(parsed) {
  const previewEl = $('import-preview');
  const listEl    = $('import-preview-list');
  const countEl   = $('import-count');
  const confirmBtn= $('btn-confirm-import');

  const valid   = parsed.filter(p => !p.error);
  const invalid = parsed.filter(p =>  p.error);

  countEl.textContent = `共 ${parsed.length} 行，有效 ${valid.length} 个，错误 ${invalid.length} 个`;

  listEl.innerHTML = parsed.map(p => {
    if (p.error) {
      return `<div class="vocab-import-preview-item error">
        <span class="vocab-import-preview-word">⚠️</span>
        <span class="vocab-import-preview-meaning">${escapeHtml(p.raw)}</span>
        <span class="vocab-import-preview-err">${p.error}</span>
      </div>`;
    }
    const dup = appData.vocab.some(w => w.word.toLowerCase() === p.word.toLowerCase());
    return `<div class="vocab-import-preview-item ${dup ? 'error' : ''}">
      <span class="vocab-import-preview-word">${escapeHtml(p.word)}</span>
      <span class="vocab-import-preview-meaning">${escapeHtml(p.meaning)}${p.example ? ` · <em>${escapeHtml(p.example)}</em>` : ''}${dup ? ' <span style="color:#f87171">（重复）</span>' : ''}</span>
    </div>`;
  }).join('');

  previewEl.style.display = 'block';
  confirmBtn.style.display = valid.length > 0 ? 'inline-flex' : 'none';
}

/* ============================================================
   区块结束：背单词系统
   ============================================================ */


/* ============================================================
   区块开始：统计页面
   ============================================================ */

function refreshStats() {
  const content = $('stats-content');
  const weekDates = getWeekDates(new Date());
  const todayStr = formatDate(new Date());

  // 本周课程统计
  let weekCourses = [];
  let subjectMap = {};
  weekDates.forEach(d => {
    const cs = getCoursesForDate(formatDate(d));
    weekCourses.push(...cs);
    cs.forEach(c => {
      if (!subjectMap[c.title]) subjectMap[c.title] = 0;
      const [sh, sm] = c.startTime.split(':').map(Number);
      const [eh, em] = c.endTime.split(':').map(Number);
      subjectMap[c.title] += (eh * 60 + em - sh * 60 - sm) / 60;
    });
  });

  const maxHours = Math.max(...Object.values(subjectMap), 1);

  // 本月统计
  const monthStart = new Date(calendarYear, calendarMonth, 1);
  const monthEnd   = new Date(calendarYear, calendarMonth + 1, 0);
  let monthCourseCount = 0;
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    monthCourseCount += getCoursesForDate(formatDate(d)).length;
  }

  // 单词统计
  const total     = appData.vocab.length;
  const mastered  = appData.vocab.filter(w => w.level >= EBBINGHAUS_INTERVALS.length).length;
  const reviewing = appData.vocab.filter(w => w.level > 0 && w.level < EBBINGHAUS_INTERVALS.length).length;
  const learning  = total - mastered - reviewing;
  const streak    = appData.vocabStats?.streak || 0;
  const due       = total > 0
    ? appData.vocab.filter(w => {
        if (w.level >= EBBINGHAUS_INTERVALS.length) return false;
        if (!w.lastReview) return true;
        const next = new Date(w.lastReview);
        next.setDate(next.getDate() + EBBINGHAUS_INTERVALS[w.level]);
        return formatDate(next) <= todayStr;
      }).length
    : 0;

  const pMastered  = total ? (mastered  / total * 100).toFixed(1) : 0;
  const pReviewing = total ? (reviewing / total * 100).toFixed(1) : 0;
  const pLearning  = total ? (learning  / total * 100).toFixed(1) : 0;

  content.innerHTML = `
    <div style="padding:0 16px 100px">

      <!-- 周课时 -->
      <div class="glass-card" style="padding:20px;margin-bottom:16px">
        <div class="stats-card-title">📅 本周课时统计</div>
        <div class="stats-big-num">${weekCourses.length}<span class="stats-unit">节课</span></div>
        <div class="stats-bar-chart">
          ${Object.entries(subjectMap).map(([name, hours]) => `
            <div class="stats-bar-row">
              <span class="stats-bar-label">${name}</span>
              <div class="stats-bar-track">
                <div class="stats-bar-fill" style="width:${(hours / maxHours * 100)}%;background:var(--accent)"></div>
              </div>
              <span class="stats-bar-value">${hours.toFixed(1)}h</span>
            </div>
          `).join('')}
          ${Object.keys(subjectMap).length === 0
            ? '<div class="text-secondary" style="text-align:center;padding:20px">本周暂无课程</div>'
            : ''}
        </div>
      </div>

      <!-- 月概览 -->
      <div class="glass-card" style="padding:20px;margin-bottom:16px">
        <div class="stats-card-title">📊 本月概览</div>
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-item-value">${monthCourseCount}</div>
            <div class="stats-item-label">总课时</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value">${appData.todos.filter(t => t.done).length}</div>
            <div class="stats-item-label">已完成待办</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value">${appData.anniversaries.length}</div>
            <div class="stats-item-label">纪念日</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value">${appData.pets.length}</div>
            <div class="stats-item-label">宠物</div>
          </div>
        </div>
      </div>

      <!-- 单词学习进度 -->
      <div class="glass-card" style="padding:20px;margin-bottom:16px">

        <!-- 标题行 -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="stats-card-title" style="margin-bottom:0">📖 单词学习进度</div>
          <span class="vocab-streak-badge">🔥 ${streak} 天</span>
        </div>

        <!-- 四格数字概览 -->
        <div class="stats-grid" style="margin-bottom:16px">
          <div class="stats-item">
            <div class="stats-item-value" style="color:var(--text-primary)">${total}</div>
            <div class="stats-item-label">词库总量</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value" style="color:#34d399">${mastered}</div>
            <div class="stats-item-label">已掌握</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value" style="color:#fbbf24">${reviewing}</div>
            <div class="stats-item-label">复习中</div>
          </div>
          <div class="stats-item">
            <div class="stats-item-value" style="color:${due > 0 ? '#f87171' : 'var(--text-primary)'}">${due}</div>
            <div class="stats-item-label">今日待复习</div>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="vocab-bar-track" style="margin-bottom:10px">
          <div class="vocab-bar-seg mastered"  style="width:${pMastered}%"></div>
          <div class="vocab-bar-seg reviewing" style="width:${pReviewing}%"></div>
          <div class="vocab-bar-seg learning"  style="width:${pLearning}%"></div>
        </div>

        <!-- 图例 -->
        <div class="vocab-stats-legend">
          <span><i style="background:#34d399"></i>已掌握 ${mastered}</span>
          <span><i style="background:#fbbf24"></i>复习中 ${reviewing}</span>
          <span><i style="background:#94a3b8"></i>待学习 ${learning}</span>
        </div>

        <!-- 掌握率文字 -->
        ${total > 0 ? `
        <div style="margin-top:12px;font-size:12px;color:var(--text-tertiary);text-align:right">
          掌握率 ${pMastered}%
          ${due > 0
            ? `· <span style="color:#f87171;font-weight:600">今日有 ${due} 个单词待复习</span>`
            : `· <span style="color:#34d399;font-weight:600">今日复习已完成 ✅</span>`}
        </div>` : ''}

      </div>

    </div>
  `;
}

/* ============================================================
   区块结束：统计页面
   ============================================================ */


/* ============================================================
   区块开始：设置管理
   ============================================================ */

function initSettings() {
  $('btn-settings').addEventListener('click', () => {
    // 填充当前设置
    $('input-api-base').value = appData.settings.apiBase || '';
    $('input-api-key').value = appData.settings.apiKey || '';
    $('toggle-notification').checked = appData.settings.notifyEnabled;
    $('input-notify-minutes').value = appData.settings.notifyMinutes;
    $('toggle-pet-notification').checked = appData.settings.petNotifyEnabled;

    // 如果有已保存的模型，显示在下拉框
    if (appData.settings.apiModel) {
      const select = $('input-api-model');
      if (select.options.length <= 1) {
        const opt = document.createElement('option');
        opt.value = appData.settings.apiModel;
        opt.textContent = appData.settings.apiModel;
        opt.selected = true;
        select.appendChild(opt);
      }}

    openModal('modal-settings');
  });

  // 显示/隐藏 API Key
  $('btn-toggle-key').addEventListener('click', () => {
    const input = $('input-api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // 获取模型列表
  $('btn-fetch-models').addEventListener('click', fetchModels);

  // 保存设置
  $('btn-save-settings').addEventListener('click', () => {
    appData.settings.apiBase = $('input-api-base').value.trim();
    appData.settings.apiKey = $('input-api-key').value.trim();
    appData.settings.apiModel = $('input-api-model').value;
    appData.settings.notifyEnabled = $('toggle-notification').checked;
    appData.settings.notifyMinutes = parseInt($('input-notify-minutes').value) || 15;
    appData.settings.petNotifyEnabled = $('toggle-pet-notification').checked;
    saveData();
    closeModal('modal-settings');
    showToast('设置已保存');
  });

  // 数据导出
  $('btn-export-all').addEventListener('click', exportAllData);
  $('btn-export').addEventListener('click', exportAllData);

  // 数据导入
  $('btn-import-all').addEventListener('click', () => $('input-import-file').click());
  $('btn-import').addEventListener('click', () => $('input-import-file').click());$('input-import-file').addEventListener('change', importAllData);

  // ICS 导出
  $('btn-export-ics').addEventListener('click', exportICS);

  // 清除数据
  $('btn-clear-all').addEventListener('click', () => {
    if (!confirm('确定要清除所有数据？此操作不可恢复！')) return;
    if (!confirm('再次确认：真的要清除所有数据吗？')) return;
    localStorage.removeItem(APP_STORAGE_KEY);
    appData = defaultData();
    saveData();
    location.reload();
  });
}

async function fetchModels() {
  const base = $('input-api-base').value.trim();
  const key = $('input-api-key').value.trim();
  if (!base) { showToast('请先填写 API 地址', 'warning'); return; }

  const btn = $('btn-fetch-models');
  btn.disabled = true;
  btn.textContent = '获取中...';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = `Bearer ${key}`;

    const res = await fetch(`${base.replace(/\/+$/, '')}/v1/models`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const models = data.data || data.models || [];

    const select = $('input-api-model');
    select.innerHTML = '';

    if (models.length === 0) {
      select.innerHTML = '<option value="">未找到模型</option>';
      showToast('未找到可用模型', 'warning');} else {
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id || m.name || m;
        opt.textContent = m.id || m.name || m;
        if (opt.value === appData.settings.apiModel) opt.selected = true;
        select.appendChild(opt);
      });showToast(`找到 ${models.length} 个模型`);
    }
  } catch (e) {
    showToast('获取模型失败：' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '获取模型';
  }
}

/* ============================================================
   区块结束：设置管理
   ============================================================ */

/* ============================================================
   区块开始：数据导入导出
   ============================================================ */

function exportAllData() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petly_backup_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据已导出');
}

function importAllData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.courses && !data.pets && !data.vocab) {
        throw new Error('无效的备份文件');
      }
      appData = { ...defaultData(), ...data, settings: { ...defaultData().settings, ...(data.settings || {}) } };
      saveData();
      showToast('数据导入成功，即将刷新');
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      showToast('导入失败：' + err.message, 'error');
    }
  };
  reader.readAsText(file);e.target.value = '';
}

function exportICS() {
  if (appData.courses.length === 0) {
    showToast('没有课程可导出', 'warning');
    return;
  }

  letics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Petly//CN\r\nCALSCALE:GREGORIAN\r\n';

  appData.courses.forEach(c => {
    const dateClean = c.date.replace(/-/g, '');
    const startClean = c.startTime.replace(':', '') + '00';
    const endClean = c.endTime.replace(':', '') + '00';
    ics += `BEGIN:VEVENT\r\n`;
    ics += `DTSTART:${dateClean}T${startClean}\r\n`;
    ics += `DTEND:${dateClean}T${endClean}\r\n`;
    ics += `SUMMARY:${c.title}\r\n`;
    if (c.location) ics += `LOCATION:${c.location}\r\n`;
    ics += `UID:${c.id}@petly\r\n`;
    ics += `END:VEVENT\r\n`;
  });

  ics += 'END:VCALENDAR\r\n';

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petly_courses_${formatDate(new Date())}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('ICS 文件已导出');
}

/* ============================================================
   区块结束：数据导入导出
   ============================================================ */

/* ============================================================
   区块开始：通知系统
   ============================================================ */

function initNotifications() {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    // 延迟请求权限
    setTimeout(() => {
      Notification.requestPermission();
    }, 5000);
  }

  // 每分钟检查课前通知
  setInterval(checkCourseNotifications, 60000);
  // 每 5 分钟检查宠物状态
  setInterval(checkPetNotifications, 300000);
}

function checkCourseNotifications() {
  if (!appData.settings.notifyEnabled) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const todayStr = formatDate(now);
  const courses = getCoursesForDate(todayStr);
  const minutesBefore = appData.settings.notifyMinutes || 15;

  courses.forEach(c => {
    const [h, m] = c.startTime.split(':').map(Number);
    const courseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diff = (courseTime - now) / 1000 / 60;

    if (diff >0 && diff <= minutesBefore && diff > minutesBefore - 1) {
      new Notification(`📚 ${c.title}`, {
        body: `${c.startTime} - ${c.endTime}${c.location ? ' · ' + c.location : ''}\n还有 ${Math.round(diff)} 分钟上课`,
        icon: '📅',
        tag: `course-${c.id}`
      });
    }
  });
}

function checkPetNotifications() {
  if (!appData.settings.petNotifyEnabled) return;
  if (Notification.permission !== 'granted') return;

  appData.pets.forEach(pet => {
    const state = getPetState(pet.id);
    if (state.hunger < 30) {
      new Notification(`🐾 ${pet.name}饿了！`, {
        body: '快来喂食吧~',
        tag: `pet-hunger-${pet.id}`
      });
    }
    if (state.happy < 20) {
      new Notification(`🐾 ${pet.name} 不开心`, {
        body: '来陪它玩一会儿吧~',
        tag: `pet-happy-${pet.id}`
      });
    }
  });
}

/* ============================================================
   区块结束：通知系统
   ============================================================ */

/* ============================================================
   区块开始：Service Worker 注册
   ============================================================ */

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.log('SW registration failed:', err);
    });
  }
}

/* ============================================================
   区块结束：Service Worker 注册
   ============================================================ */

/* ============================================================
   区块开始：应用初始化
   ============================================================ */

function init() {
  // 应用主题
  applyTheme(appData.settings.theme);
  applyBackground();

  // 初始化各模块
  initNavigation();
  initModals();
  initCalendar();
  initAIImport();
  initTodo();
  initPet();
  initVocab();
  initSettings();
  initBgSettings();
  initNotifications();
  initServiceWorker();
  initBatchOps();
  initPickDateModal();


  // 主题切换按钮
  $('btn-theme').addEventListener('click', toggleTheme);
  // 背景设置按钮
  $('btn-bg').addEventListener('click', () => openModal('modal-bg-settings'));

  // 刷新首页
  refreshHome();

  // 默认日期
  $('input-todo-date').value = formatDate(new Date());
  $('input-anniv-date').value = formatDate(new Date());
}

// DOM Ready
document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   区块结束：应用初始化
   ============================================================ */