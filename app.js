/* ============================================================
   区块开始：全局状态管理
   ============================================================ */
const AppState = {
  currentPage: 'home',
  theme: 'light',
  bgType: 'gradient-1',
  bgCustom: '',
  courses: [],
  anniversaries: [],
  todos: [],
  calendarView: 'month',
  calendarDate: new Date(),
  selectedDate: null,
};

const STORAGE_KEYS = {
  THEME: 'app_theme',
  BG_TYPE: 'app_bg_type',
  BG_CUSTOM: 'app_bg_custom',
  COURSES: 'app_courses',
  ANNIVERSARIES: 'app_anniversaries',
  TODOS: 'app_todos',
  DEEPSEEK_KEY: 'app_deepseek_key',
};

const GRADIENTS = {
  'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'gradient-6': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
};

const COURSE_COLORS = {
  blue: { main: '#3b82f6', bg: 'var(--course-blue-bg)', text: '#3b82f6' },
  green: { main: '#22c55e', bg: 'var(--course-green-bg)', text: '#22c55e' },
  purple: { main: '#a855f7', bg: 'var(--course-purple-bg)', text: '#a855f7' },
  coral: { main: '#f97316', bg: 'var(--course-coral-bg)', text: '#f97316' },
  amber: { main: '#f59e0b', bg: 'var(--course-amber-bg)', text: '#f59e0b' },
  pink: { main: '#ec4899', bg: 'var(--course-pink-bg)', text: '#ec4899' },
};
/* ============================================================
   区块结束：全局状态管理
   ============================================================ */

/* ============================================================
   区块开始：工具函数
   ============================================================ */
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  const parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了 🌙';
  if (h < 9) return '早上好 ☀️';
  if (h < 12) return '上午好 🌤️';
  if (h < 14) return '中午好 🌞';
  if (h < 18) return '下午好 🍵';
  if (h < 22) return '晚上好 🌆';
  return '夜深了 🌙';
}

function getMotivation() {
  const msgs = [
    '今天也要加油哦',
    '每一天都是新的开始',
    '你比想象中更优秀',
    '保持微笑，好运自来',
    '认真生活，温柔对待自己',
    '今日事，今日毕',
    '做最好的自己 ✨',
    '一步一个脚印 🐾',
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function formatChineseDate(date) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekdays[date.getDay()]}`;
}

function showToast(message, type = 'info') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function daysBetween(d1, d2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((d2 - d1) / oneDay);
}
/* ============================================================
   区块结束：工具函数
   ============================================================ */

/* ============================================================
   区块开始：主题系统
   ============================================================ */
function initTheme() {
  const saved = loadFromStorage(STORAGE_KEYS.THEME, 'light');
  setTheme(saved);
}

function setTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveToStorage(STORAGE_KEYS.THEME, theme);

  const sunIcon = $('#theme-icon-sun');
  const moonIcon = $('#theme-icon-moon');
  const lightBtn = $('#theme-light-btn');
  const darkBtn = $('#theme-dark-btn');

  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
    lightBtn.classList.remove('active');
    darkBtn.classList.add('active');
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
  }
}

function toggleTheme() {
  setTheme(AppState.theme === 'dark' ? 'light' : 'dark');
}
/* ============================================================
   区块结束：主题系统
   ============================================================ */

/* ============================================================
   区块开始：背景系统
   ============================================================ */
function initBackground() {
  const bgType = loadFromStorage(STORAGE_KEYS.BG_TYPE, 'gradient-1');
  const bgCustom = loadFromStorage(STORAGE_KEYS.BG_CUSTOM, '');
  setBackground(bgType, bgCustom);
}

function setBackground(type, custom) {
  AppState.bgType = type;
  AppState.bgCustom = custom || '';
  saveToStorage(STORAGE_KEYS.BG_TYPE, type);
  saveToStorage(STORAGE_KEYS.BG_CUSTOM, custom || '');

  const bgLayer = $('#bg-layer');

  if (type === 'custom-url' || type === 'custom-file') {
    bgLayer.style.background = 'none';
    bgLayer.style.backgroundImage = `url(${custom})`;
    bgLayer.style.backgroundSize = 'cover';
    bgLayer.style.backgroundPosition = 'center';} else if (GRADIENTS[type]) {
    bgLayer.style.backgroundImage = 'none';
    bgLayer.style.background = GRADIENTS[type];
  }

  /* 更新预设按钮状态 */
  $$('.bg-preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === type);
  });
}

function clearBackground() {
  setBackground('gradient-1', '');$('#bg-url-input').value = '';
  showToast('已恢复默认背景', 'success');
}
/* ============================================================
   区块结束：背景系统
   ============================================================ */

/* ============================================================
   区块开始：页面导航
   ============================================================ */
function initNavigation() {
  $$('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      navigateTo(tab.dataset.page);
    });
  });
}

function navigateTo(page) {
  AppState.currentPage = page;

  /* 更新 Tab 状态 */
  $$('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === page);
  });

  /* 切换页面 */
  $$('.page').forEach(p => {
    p.classList.remove('active');
  });
  const target = $(`#page-${page}`);
  if (target) target.classList.add('active');

  /* 更新标题 */
  const titles = {
    home: '主页',
    calendar: '日历',
    pets: '宠物',
    words: '单词',
    settings: '设置',
  };
  $('#page-title').textContent = titles[page] || '主页';

  /* 刷新对应页面数据 */
  if (page === 'home') refreshHome();
  if (page === 'calendar') refreshCalendar();
}
/* ============================================================
   区块结束：页面导航
   ============================================================ */

/* ============================================================
   区块开始：主页逻辑
   ============================================================ */
function refreshHome() {
  /* 问候语 */
  $('#greeting-text').textContent = getGreeting();
  $('#welcome-title').textContent = getMotivation();
  $('#welcome-date').textContent = formatChineseDate(new Date());

  /* 今日课程统计 */
  const today = formatDate(new Date());
  const todayCourses = AppState.courses.filter(c => c.date === today);
  todayCourses.sort((a, b) => a.startTime.localeCompare(b.startTime));
  $('#ov-schedule-count').textContent = todayCourses.length;

  if (todayCourses.length > 0) {
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const next = todayCourses.find(c => c.startTime > currentTime);
    $('#ov-schedule-next').textContent = next ? `下节：${next.title} ${next.startTime}` : '今日课程已结束';
  } else {
    $('#ov-schedule-next').textContent = '暂无课程';
  }

  /* 待办统计 */
  const todayTodos = AppState.todos.filter(t => t.date === today && !t.done);
  $('#ov-todo-count').textContent = todayTodos.length;
  $('#ov-todo-sub').textContent = todayTodos.length > 0 ? `${todayTodos.length} 项待完成` : '暂无待办';

  /* 渲染今日课程列表 */
  renderHomeCourseList(todayCourses);

  /* 渲染纪念日 */
  renderHomeAnniversaries();
}

function renderHomeCourseList(courses) {
  const container = $('#home-course-list');
  if (courses.length === 0) {
    container.innerHTML = '<div class="empty-hint">今天没有课程，好好休息 🌿</div>';
    return;
  }

  container.innerHTML = courses.map(c => {
    const color = COURSE_COLORS[c.color] || COURSE_COLORS.blue;
    return `
      <div class="course-item" data-id="${c.id}">
        <div class="course-color-bar" style="background:${color.main}"></div>
        <div class="course-info">
          <div class="course-name">${escapeHtml(c.title)}</div>
          <div class="course-meta">
            <span>🕐 ${c.startTime} - ${c.endTime}</span>
            ${c.location ? `<span>📍 ${escapeHtml(c.location)}</span>` : ''}
          </div>
        </div>
        <div class="course-actions">
          <button class="course-action-btn edit-btn" data-id="${c.id}" aria-label="编辑">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="course-action-btn delete-btn" data-id="${c.id}" aria-label="删除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  /* 绑定编辑/删除事件 */
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCourseModal(btn.dataset.id);
    });
  });container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteCourse(btn.dataset.id);
    });
  });
}

function renderHomeAnniversaries() {
  const container = $('#home-anniversary-list');
  if (AppState.anniversaries.length === 0) {
    container.innerHTML = '<div class="empty-hint">还没有纪念日 💝</div>';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const withCountdown = AppState.anniversaries.map(a => {
    const annDate = parseDate(a.date);
    const nextOccurrence = new Date(today.getFullYear(), annDate.getMonth(), annDate.getDate());
    if (nextOccurrence < today) {
      nextOccurrence.setFullYear(nextOccurrence.getFullYear() + 1);
    }
    const days = daysBetween(today, nextOccurrence);
    return { ...a, daysLeft: days };
  });

  withCountdown.sort((a, b) => a.daysLeft - b.daysLeft);

  container.innerHTML = withCountdown.map(a => `
    <div class="anniversary-item" data-id="${a.id}">
      <div class="anniversary-emoji">${a.emoji || '💝'}</div>
      <div class="anniversary-info">
        <div class="anniversary-name">${escapeHtml(a.name)}</div>
        <div class="anniversary-countdown">${a.date}</div>
      </div>
      <div style="text-align:center;flex-shrink:0">
        <div class="anniversary-days">${a.daysLeft === 0 ? '🎉' : a.daysLeft}</div><div class="anniversary-days-label">${a.daysLeft === 0 ? '就是今天！' : '天后'}</div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
/* ============================================================
   区块结束：主页逻辑
   ============================================================ */

/* ============================================================
   区块开始：日历核心逻辑
   ============================================================ */
function initCalendar() {
  /* 视图切换 */
  $$('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      AppState.calendarView = tab.dataset.view;
      refreshCalendar();
    });
  });

  /* 前后翻页 */
  $('#cal-prev').addEventListener('click', () => {
    calendarNavigate(-1);
  });
  $('#cal-next').addEventListener('click', () => {
    calendarNavigate(1);
  });

  /* 回到今天 */
  $('#cal-today').addEventListener('click', () => {
    AppState.calendarDate = new Date();
    AppState.selectedDate = formatDate(new Date());
    refreshCalendar();
  });
}

function calendarNavigate(dir) {
  const d = AppState.calendarDate;
  if (AppState.calendarView === 'month') {
    d.setMonth(d.getMonth() + dir);
  } else if (AppState.calendarView === 'week') {
    d.setDate(d.getDate() + dir * 7);
  } else {
    d.setDate(d.getDate() + dir);
  }
  refreshCalendar();
}

function refreshCalendar() {
  const view = AppState.calendarView;

  $('#cal-month-view').classList.toggle('hidden', view !== 'month');
  $('#cal-week-view').classList.toggle('hidden', view !== 'week');
  $('#cal-day-view').classList.toggle('hidden', view !== 'day');

  if (view === 'month') renderMonthView();
  else if (view === 'week') renderWeekView();
  else renderDayView();
}

/* ---- 月视图 ---- */
function renderMonthView() {
  const d = AppState.calendarDate;
  const year = d.getFullYear();
  const month = d.getMonth();
  const today = new Date();

  $('#cal-title').textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrev = getDaysInMonth(year, month - 1);

  const grid = $('#cal-month-grid');
  grid.innerHTML = '';

  /* 上月尾部 */
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const dateStr = formatDate(new Date(year, month - 1, day));
    grid.appendChild(createCalCell(day, dateStr, true, today));
  }

  /* 本月 */
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDate(new Date(year, month, i));
    grid.appendChild(createCalCell(i, dateStr, false, today));
  }

  /* 下月头部 */
  const totalCells = grid.children.length;
  const remaining = (Math.ceil(totalCells / 7) * 7) - totalCells;
  for (let i = 1; i <= remaining; i++) {
    const dateStr = formatDate(new Date(year, month + 1, i));
    grid.appendChild(createCalCell(i, dateStr, true, today));
  }

  /* 显示选中日期的详情 */
  if (AppState.selectedDate) {
    showDayDetail(AppState.selectedDate);
  }
}

function createCalCell(day, dateStr, isOtherMonth, today) {
  const cell = document.createElement('div');
  cell.className = 'cal-cell';
  if (isOtherMonth) cell.classList.add('other-month');
  if (isSameDay(parseDate(dateStr), today)) cell.classList.add('today');
  if (AppState.selectedDate === dateStr) cell.classList.add('selected');

  const dayNum = document.createElement('div');
  dayNum.className = 'cal-day-num';
  dayNum.textContent = day;
  cell.appendChild(dayNum);

  /* 课程点*/
  const dayCourses = AppState.courses.filter(c => c.date === dateStr);
  if (dayCourses.length > 0) {
    const dots = document.createElement('div');
    dots.className = 'cal-cell-dots';
    const shown = dayCourses.slice(0, 3);
    shown.forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'cal-dot';
      const color = COURSE_COLORS[c.color] || COURSE_COLORS.blue;
      dot.style.background = color.main;
      dots.appendChild(dot);
    });
    cell.appendChild(dots);
  }

  /*纪念日爱心 */
  const hasAnniversary = AppState.anniversaries.some(a => {
    const ad = parseDate(a.date);
    const cd = parseDate(dateStr);
    return ad.getMonth() === cd.getMonth() && ad.getDate() === cd.getDate();
  });
  if (hasAnniversary) {
    const heart = document.createElement('div');
    heart.className = 'cal-heart';
    heart.textContent = '❤️';
    cell.appendChild(heart);
  }

  cell.addEventListener('click', () => {$$('.cal-cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
    AppState.selectedDate = dateStr;
    showDayDetail(dateStr);
  });

  return cell;
}

function showDayDetail(dateStr) {
  const detail = $('#cal-day-detail');
  detail.style.display = 'block';

  const d = parseDate(dateStr);
  $('#cal-detail-date').textContent = `${d.getMonth() + 1}月${d.getDate()}日`;

  const courses = AppState.courses.filter(c => c.date === dateStr);
  courses.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const list = $('#cal-detail-list');
  if (courses.length === 0) {
    list.innerHTML = '<div class="empty-hint" style="padding:16px">这一天没有课程</div>';} else {
    list.innerHTML = courses.map(c => {
      const color = COURSE_COLORS[c.color] || COURSE_COLORS.blue;
      return `
        <div class="course-item" data-id="${c.id}">
          <div class="course-color-bar" style="background:${color.main}"></div>
          <div class="course-info">
            <div class="course-name">${escapeHtml(c.title)}</div>
            <div class="course-meta">
              <span>🕐 ${c.startTime} - ${c.endTime}</span>
              ${c.location ? `<span>📍 ${escapeHtml(c.location)}</span>` : ''}
            </div>
          </div>
          <div class="course-actions">
            <button class="course-action-btn edit-btn" data-id="${c.id}" aria-label="编辑">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="course-action-btn delete-btn" data-id="${c.id}" aria-label="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCourseModal(btn.dataset.id);
      });
    });
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteCourse(btn.dataset.id);
      });
    });
  }
}

/* ---- 周视图 ---- */
function renderWeekView() {
  const weekStart = getWeekStart(AppState.calendarDate);
  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  /* 标题 */
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  $('#cal-title').textContent = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;

  /* 头部 */
  const header = $('#week-header');
  header.innerHTML = '<div style="width:48px;flex-shrink:0"></div>';
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const isToday = isSameDay(d, today);
    header.innerHTML += `
      <div class="week-header-cell ${isToday ? 'today' : ''}">
        <div>${weekdays[d.getDay()]}</div>
        <div style="font-size:16px;font-weight:600">${d.getDate()}</div>
      </div>
    `;
  }

  /* 时间列*/
  const timeCol = $('#week-time-col');
  timeCol.innerHTML = '';
  for (let h = 6; h <= 22; h++) {
    const label = document.createElement('div');
    label.className = 'time-slot-label';
    label.textContent = `${String(h).padStart(2, '0')}:00`;
    timeCol.appendChild(label);
  }

  /* 事件列 */
  const eventsCol = $('#week-events-col');
  eventsCol.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);
    const dayCol = document.createElement('div');
    dayCol.className = 'week-day-col';

    /* 时间网格线 */
    for (let h = 6; h <= 22; h++) {
      const line = document.createElement('div');
      line.className = 'time-grid-line';
      line.style.top = `${(h - 6) * 48}px`;
      dayCol.appendChild(line);
    }

    /* 课程块 */
    const courses = AppState.courses.filter(c => c.date === dateStr);
    courses.forEach(c => {
      const block = createEventBlock(c,6);
      dayCol.appendChild(block);
    });

    /* 点击空白添加 */
    dayCol.addEventListener('click', (e) => {
      if (e.target === dayCol || e.target.classList.contains('time-grid-line')) {
        openCourseModal(null, dateStr);
      }
    });

    eventsCol.appendChild(dayCol);
  }
}

/* ---- 日视图 ---- */
function renderDayView() {
  const d = AppState.calendarDate;
  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = formatDate(d);

  $('#cal-title').textContent = `${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;

  /* 时间列 */
  const timeCol = $('#day-time-col');
  timeCol.innerHTML = '';
  for (let h = 6; h <= 22; h++) {
    const label = document.createElement('div');
    label.className = 'time-slot-label';
    label.textContent = `${String(h).padStart(2, '0')}:00`;
    timeCol.appendChild(label);
  }

  /* 事件列 */
  const eventsCol = $('#day-events-col');
  eventsCol.innerHTML = '';

  /* 时间网格线 */
  for (let h = 6; h <= 22; h++) {
    const line = document.createElement('div');
    line.className = 'time-grid-line';
    line.style.top = `${(h - 6) * 48}px`;
    eventsCol.appendChild(line);
  }

  /* 课程块 */
  const courses = AppState.courses.filter(c => c.date === dateStr);
  courses.forEach(c => {
    const block = createEventBlock(c, 6);
    eventsCol.appendChild(block);
  });

  /* 点击空白添加 */
  eventsCol.addEventListener('click', (e) => {
    if (e.target === eventsCol || e.target.classList.contains('time-grid-line')) {
      openCourseModal(null, dateStr);
    }
  });
}

function createEventBlock(course, startHour) {
  const color = COURSE_COLORS[course.color] || COURSE_COLORS.blue;
  const startParts = course.startTime.split(':');
  const endParts = course.endTime.split(':');
  const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  const topPx = ((startMin - startHour * 60) / 60) * 48;
  const heightPx = ((endMin - startMin) / 60) * 48;

  const block = document.createElement('div');
  block.className = 'cal-event-block';
  block.style.top = `${Math.max(0, topPx)}px`;
  block.style.height = `${Math.max(20, heightPx)}px`;
  block.style.background = color.bg;
  block.style.borderLeft = `3px solid ${color.main}`;
  block.style.color = color.text;

  block.innerHTML = `
    <div class="event-title">${escapeHtml(course.title)}</div>
    <div class="event-time">${course.startTime} - ${course.endTime}</div>
  `;

  block.addEventListener('click', (e) => {
    e.stopPropagation();
    openCourseModal(course.id);
  });

  return block;
}
/* ============================================================区块结束：日历核心逻辑
   ============================================================ */

/* ============================================================
   区块开始：课程增删改
   ============================================================ */
function initCourseModal() {
  /* 打开弹窗 */
  $('#home-add-course-btn').addEventListener('click', () => openCourseModal(null));
  $('#cal-add-course-btn').addEventListener('click', () => openCourseModal(null, AppState.selectedDate));

  /* 关闭弹窗 */
  $('#course-modal-close').addEventListener('click', closeCourseModal);
  $('#course-modal-cancel').addEventListener('click', closeCourseModal);
  $('#course-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCourseModal();
  });

  /* 颜色选择 */
  $$('#course-color-picker .color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      $$('#course-color-picker .color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  /* 重复选项 */
  $('#course-repeat').addEventListener('change', (e) => {
    $('#course-repeat-end-group').style.display = e.target.value !== 'none' ? 'block' : 'none';
  });

  /* 保存 */
  $('#course-modal-save').addEventListener('click', saveCourse);
}

function openCourseModal(editId, defaultDate) {
  const modal = $('#course-modal-overlay');
  const isEdit = !!editId;

  $('#course-modal-title').textContent = isEdit ? '编辑课程' : '添加课程';
  $('#course-edit-id').value = editId || '';

  if (isEdit) {
    const course = AppState.courses.find(c => c.id === editId);
    if (!course) return;
    $('#course-title').value = course.title;
    $('#course-date').value = course.date;
    $('#course-start').value = course.startTime;
    $('#course-end').value = course.endTime;
    $('#course-location').value = course.location || '';
    $('#course-repeat').value = course.repeat || 'none';$$('#course-color-picker .color-dot').forEach(d => {
      d.classList.toggle('active', d.dataset.color === course.color);
    });} else {
    $('#course-title').value = '';
    $('#course-date').value = defaultDate || formatDate(new Date());
    $('#course-start').value = '08:00';
    $('#course-end').value = '09:40';
    $('#course-location').value = '';
    $('#course-repeat').value = 'none';
    $('#course-repeat-end-group').style.display = 'none';

    $$('#course-color-picker .color-dot').forEach(d => {
      d.classList.toggle('active', d.dataset.color === 'blue');
    });
  }

  modal.style.display = 'flex';
  setTimeout(() => $('#course-title').focus(), 100);
}

function closeCourseModal() {
  $('#course-modal-overlay').style.display = 'none';
}

function saveCourse() {
  const title = $('#course-title').value.trim();
  const date = $('#course-date').value;
  const startTime = $('#course-start').value;
  const endTime = $('#course-end').value;
  const location = $('#course-location').value.trim();
  const repeat = $('#course-repeat').value;
  const repeatEnd = $('#course-repeat-end').value;
  const color = $('#course-color-picker .color-dot.active')?.dataset.color || 'blue';
  const editId = $('#course-edit-id').value;

  /* 校验 */
  if (!title) { showToast('请输入课程名称', 'warning'); return; }
  if (!date) { showToast('请选择日期', 'warning'); return; }
  if (!startTime || !endTime) { showToast('请选择时间', 'warning'); return; }
  if (startTime >= endTime) { showToast('结束时间必须晚于开始时间', 'warning'); return; }

  if (editId) {
    /* 编辑 */
    const idx = AppState.courses.findIndex(c => c.id === editId);
    if (idx !== -1) {
      AppState.courses[idx] = { ...AppState.courses[idx], title, date, startTime, endTime, location, color, repeat };
      showToast('课程已更新', 'success');
    }
  } else {
    /* 新增（含重复） */
    const dates = [date];
    if (repeat !== 'none' && repeatEnd) {
      const interval = repeat === 'weekly' ? 7 : 14;
      let current = parseDate(date);
      const end = parseDate(repeatEnd);
      while (true) {
        current = new Date(current);
        current.setDate(current.getDate() + interval);
        if (current > end) break;
        dates.push(formatDate(current));
      }
    }

    dates.forEach(d => {
      AppState.courses.push({
        id: generateId(),
        title,
        date: d,
        startTime,
        endTime,
        location,
        color,
        repeat:'none',});
    });

    showToast(`已添加 ${dates.length} 节课程`, 'success');
  }

  saveToStorage(STORAGE_KEYS.COURSES, AppState.courses);
  closeCourseModal();refreshHome();
  refreshCalendar();
}

function confirmDeleteCourse(id) {
  showConfirm('确定要删除这节课程吗？', () => {
    AppState.courses = AppState.courses.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.COURSES, AppState.courses);
    showToast('课程已删除', 'success');
    refreshHome();
    refreshCalendar();
  });
}
/* ============================================================
   区块结束：课程增删改
   ============================================================ */

/* ============================================================
   区块开始：纪念日增删
   ============================================================ */
function initAnniversaryModal() {
  $('#home-add-anniversary-btn').addEventListener('click', () => openAnniversaryModal());

  $('#anniversary-modal-close').addEventListener('click', closeAnniversaryModal);
  $('#anniversary-modal-cancel').addEventListener('click', closeAnniversaryModal);
  $('#anniversary-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAnniversaryModal();
  });

  $$('#anniversary-emoji-picker .emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#anniversary-emoji-picker .emoji-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('#anniversary-modal-save').addEventListener('click', saveAnniversary);
}

function openAnniversaryModal(editId) {
  const modal = $('#anniversary-modal-overlay');
  const isEdit = !!editId;

  $('#anniversary-modal-title').textContent = isEdit ? '编辑纪念日' : '添加纪念日';
  $('#anniversary-edit-id').value = editId || '';

  if (isEdit) {
    const ann = AppState.anniversaries.find(a => a.id === editId);
    if (!ann) return;
    $('#anniversary-name').value = ann.name;
    $('#anniversary-date').value = ann.date;
    $('#anniversary-remind').value = ann.remind ||3;
    $$('#anniversary-emoji-picker .emoji-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.emoji === ann.emoji);
    });
  } else {
    $('#anniversary-name').value = '';
    $('#anniversary-date').value = '';
    $('#anniversary-remind').value = 3;
    $$('#anniversary-emoji-picker .emoji-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.emoji === '💝');
    });
  }

  modal.style.display = 'flex';
  setTimeout(() => $('#anniversary-name').focus(), 100);
}

function closeAnniversaryModal() {
  $('#anniversary-modal-overlay').style.display = 'none';
}

function saveAnniversary() {
  const name = $('#anniversary-name').value.trim();
  const date = $('#anniversary-date').value;
  const remind = parseInt($('#anniversary-remind').value) || 3;
  const emoji = $('#anniversary-emoji-picker .emoji-btn.active')?.dataset.emoji || '💝';
  const editId = $('#anniversary-edit-id').value;

  if (!name) { showToast('请输入纪念日名称', 'warning'); return; }
  if (!date) { showToast('请选择日期', 'warning'); return; }

  if (editId) {
    const idx = AppState.anniversaries.findIndex(a => a.id === editId);
    if (idx !== -1) {
      AppState.anniversaries[idx] = { ...AppState.anniversaries[idx], name, date, remind, emoji };
      showToast('纪念日已更新', 'success');
    }
  } else {
    AppState.anniversaries.push({ id: generateId(), name, date, remind, emoji });
    showToast('纪念日已添加', 'success');
  }

  saveToStorage(STORAGE_KEYS.ANNIVERSARIES, AppState.anniversaries);
  closeAnniversaryModal();
  refreshHome();
  refreshCalendar();
}
/* ============================================================
   区块结束：纪念日增删
   ============================================================ */

/* ============================================================
   区块开始：确认弹窗
   ============================================================ */
let confirmCallback = null;

function showConfirm(text, onConfirm, icon) {
  $('#confirm-text').textContent = text;
  $('#confirm-icon').textContent = icon || '⚠️';
  confirmCallback = onConfirm;
  $('#confirm-modal-overlay').style.display = 'flex';
}

function initConfirmModal() {
  $('#confirm-cancel').addEventListener('click', () => {
    $('#confirm-modal-overlay').style.display = 'none';
    confirmCallback = null;
  });
  $('#confirm-ok').addEventListener('click', () => {
    $('#confirm-modal-overlay').style.display = 'none';
    if (confirmCallback) confirmCallback();confirmCallback = null;
  });$('#confirm-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      $('#confirm-modal-overlay').style.display = 'none';
      confirmCallback = null;
    }
  });
}
/* ============================================================
   区块结束：确认弹窗
   ============================================================ */

/* ============================================================
   区块开始：DeepSeek 导入
   ============================================================ */
function initImportModal() {
  /* 日历页面需要一个导入入口，这里先绑定到顶栏通知按钮旁 */
  /* 后续阶段会加专门入口，目前先用设置页触发 */

  $('#import-modal-close').addEventListener('click', closeImportModal);
  $('#import-modal-cancel').addEventListener('click', closeImportModal);
  $('#import-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeImportModal();
  });

  $('#import-parse-btn').addEventListener('click', parseImportJSON);
  $('#import-ai-btn').addEventListener('click', parseImportAI);
  $('#import-clear-preview').addEventListener('click', clearImportPreview);
  $('#import-modal-confirm').addEventListener('click', confirmImport);
}

let importParsedCourses = [];

function openImportModal() {
  $('#import-modal-overlay').style.display = 'flex';
  $('#import-text').value = '';
  clearImportPreview();
}

function closeImportModal() {
  $('#import-modal-overlay').style.display = 'none';
}

function parseImportJSON() {
  const text = $('#import-text').value.trim();
  if (!text) { showToast('请粘贴内容', 'warning'); return; }

  try {
    /*尝试提取 JSON 数组 */
    let jsonStr = text;
    const match = text.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];

    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('不是数组');

    importParsedCourses = data.map(item => ({
      id: generateId(),
      title: item.title || '未命名课程',
      date: item.date || formatDate(new Date()),
      startTime: item.startTime || '08:00',
      endTime: item.endTime || '09:40',
      location: item.location || '',
      color: item.color || 'blue',
      repeat: 'none',
    }));

    renderImportPreview();
    showToast(`解析成功，共 ${importParsedCourses.length} 条`, 'success');
  } catch (e) {
    showToast('JSON 解析失败，请检查格式', 'error');
  }
}

async function parseImportAI() {
  const text = $('#import-text').value.trim();
  if (!text) { showToast('请粘贴内容', 'warning'); return; }

  const apiKey = loadFromStorage(STORAGE_KEYS.DEEPSEEK_KEY, '');
  if (!apiKey) {
    showToast('请先在设置中填写 DeepSeek API Key', 'warning');
    return;
  }

  showToast('正在调用 AI 解析…', 'info');

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个课程表解析助手。请将用户提供的课程信息整理为JSON 数组格式输出，不要有任何其他文字。格式：[{"title":"课程名","date":"2025-09-01","startTime":"08:00","endTime":"09:40","location":"教室","color":"blue"}]。color 只能是：blue/green/purple/coral/amber。'
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    $('#import-text').value = content;
    parseImportJSON();
  } catch (e) {
    showToast('AI 解析失败：' + e.message, 'error');
  }
}

function renderImportPreview() {
  const preview = $('#import-preview');
  const list = $('#import-list');
  const count = $('#import-count');

  preview.style.display = 'block';
  count.textContent = importParsedCourses.length;
  $('#import-modal-confirm').disabled = importParsedCourses.length === 0;

  list.innerHTML = importParsedCourses.map(c => {
    const color = COURSE_COLORS[c.color] || COURSE_COLORS.blue;
    return `
      <div class="import-item">
        <div class="import-item-color" style="background:${color.main}"></div>
        <span>${escapeHtml(c.title)}</span>
        <span style="color:var(--text-tertiary);margin-left:auto">${c.date} ${c.startTime}-${c.endTime}</span>
      </div>
    `;
  }).join('');
}

function clearImportPreview() {
  importParsedCourses = [];
  $('#import-preview').style.display = 'none';
  $('#import-modal-confirm').disabled = true;
}

function confirmImport() {
  if (importParsedCourses.length === 0) return;

  AppState.courses.push(...importParsedCourses);
  saveToStorage(STORAGE_KEYS.COURSES, AppState.courses);
  showToast(`成功导入 ${importParsedCourses.length} 节课程`, 'success');
  closeImportModal();
  refreshHome();
  refreshCalendar();
}
/* ============================================================
   区块结束：DeepSeek 导入
   ============================================================ */

/* ============================================================
   区块开始：设置页面逻辑
   ============================================================ */
function initSettings() {
  /* 主题切换 */
  $('#theme-toggle-btn').addEventListener('click', toggleTheme);
  $('#theme-light-btn').addEventListener('click', () => setTheme('light'));
  $('#theme-dark-btn').addEventListener('click', () => setTheme('dark'));

  /* 背景预设 */
  $$('.bg-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setBackground(btn.dataset.bg, '');
    });
  });

  /* 背景 URL */
  $('#bg-url-apply-btn').addEventListener('click', () => {
    const url = $('#bg-url-input').value.trim();
    if (!url) { showToast('请输入图片 URL', 'warning'); return; }
    setBackground('custom-url', url);
    showToast('背景已更新', 'success');
  });

  /* 背景上传 */
  $('#bg-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBackground('custom-file', reader.result);
      showToast('背景已更新', 'success');
    };
    reader.readAsDataURL(file);
  });

  /* 清除背景 */
  $('#bg-clear-btn').addEventListener('click', clearBackground);

  /* 通知权限 */
  $('#notif-request-btn').addEventListener('click', async () => {
    if (!('Notification' in window)) {
      showToast('您的浏览器不支持通知', 'error');
      return;
    }
    const perm = await Notification.requestPermission();
    updateNotifStatus(perm);
    if (perm === 'granted') {
      showToast('通知已开启', 'success');
    } else {
      showToast('通知权限被拒绝', 'warning');
    }
  });

  updateNotifStatus(Notification?.permission);

  /* DeepSeek Key */
  const savedKey = loadFromStorage(STORAGE_KEYS.DEEPSEEK_KEY, '');
  if (savedKey) $('#deepseek-key-input').value = savedKey;

  $('#deepseek-key-save-btn').addEventListener('click', () => {
    const key = $('#deepseek-key-input').value.trim();
    saveToStorage(STORAGE_KEYS.DEEPSEEK_KEY, key);
    showToast(key ? 'API Key 已保存' : 'API Key 已清除', 'success');
  });

  /* 数据导出 */
  $('#export-btn').addEventListener('click', exportData);

  /* 数据导入 */
  $('#import-file-input').addEventListener('change', importData);
}

function updateNotifStatus(perm) {
  const badge = $('#notif-status-badge');
  if (perm === 'granted') {
    badge.textContent = '已开启';
    badge.style.background = 'var(--success-light)';
    badge.style.color = 'var(--success)';
  } else if (perm === 'denied') {
    badge.textContent = '已拒绝';
    badge.style.background = 'var(--danger-light)';
    badge.style.color = 'var(--danger)';
  } else {
    badge.textContent = '未开启';
  }
}

function exportData() {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    courses: AppState.courses,
    anniversaries: AppState.anniversaries,
    todos: AppState.todos,
    theme: AppState.theme,
    bgType: AppState.bgType,};

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-world-backup-${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据已导出', 'success');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.courses) {
        AppState.courses = data.courses;
        saveToStorage(STORAGE_KEYS.COURSES, data.courses);
      }
      if (data.anniversaries) {
        AppState.anniversaries = data.anniversaries;
        saveToStorage(STORAGE_KEYS.ANNIVERSARIES, data.anniversaries);
      }
      if (data.todos) {
        AppState.todos = data.todos;
        saveToStorage(STORAGE_KEYS.TODOS, data.todos);
      }
      if (data.theme) setTheme(data.theme);

      refreshHome();
      refreshCalendar();
      showToast('数据已恢复', 'success');
    } catch (err) {
      showToast('文件格式错误', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
/* ============================================================
   区块结束：设置页面逻辑
   ============================================================ */

/* ============================================================
   区块开始：概览卡片点击跳转
   ============================================================ */
function initOverviewCards() {
  $('#ov-schedule').addEventListener('click', () => navigateTo('calendar'));
  $('#ov-todo').addEventListener('click', () => navigateTo('calendar'));
  $('#ov-pet').addEventListener('click', () => navigateTo('pets'));
  $('#ov-words').addEventListener('click', () => navigateTo('words'));
}
/* ============================================================
   区块结束：概览卡片点击跳转
   ============================================================ */

/* ============================================================
   区块开始：应用初始化
   ============================================================ */
function initApp() {
  /* 加载存储数据 */
  AppState.courses = loadFromStorage(STORAGE_KEYS.COURSES, []);
  AppState.anniversaries = loadFromStorage(STORAGE_KEYS.ANNIVERSARIES, []);
  AppState.todos = loadFromStorage(STORAGE_KEYS.TODOS, []);
  AppState.selectedDate = formatDate(new Date());

  /* 初始化各模块 */
  initTheme();
  initBackground();
  initNavigation();
  initCalendar();
  initCourseModal();
  initAnniversaryModal();
  initConfirmModal();
  initImportModal();
  initSettings();
  initOverviewCards();

  /* 刷新主页 */
  refreshHome();

  console.log('🐾 我的小世界 v1.0.0 已启动');
}

/* DOM 加载完成后启动 */
document.addEventListener('DOMContentLoaded', initApp);
/* ============================================================
   区块结束：应用初始化
   ============================================================ */
