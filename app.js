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
  // 预设点击$$('.bg-preset-item').forEach(item => {
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

/* ============================================================
   区块开始：日历核心
   ============================================================ */

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedDate = formatDate(new Date());
let currentView = 'month';

function refreshCalendar() {
  $('calendar-month-label').textContent = `${calendarYear}年${calendarMonth + 1}月`;
  if (currentView === 'month') renderMonthView();
  else if (currentView === 'week') renderWeekView();
  else renderDayView();
  renderDayCourses();
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

  // 课程
  courses.forEach(c => {
    html += `<div class="course-item glass" data-id="${c.id}">
      <div class="course-item-color color-bg-${c.color || 'blue'}"></div>
      <div class="course-item-body">
        <div class="course-item-title">${c.title}</div>
        <div class="course-item-sub">${c.startTime} - ${c.endTime}${c.location ? ' · ' + c.location : ''}</div>
      </div>
      <div class="course-item-actions">
        <button class="course-action-btn" onclick="editCourse('${c.id}')" aria-label="编辑">✏️</button>
        <button class="course-action-btn" onclick="deleteCourse('${c.id}')" aria-label="删除">🗑️</button>
      </div>
    </div>`;
  });

  // 待办
  todos.forEach(t => {
    const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    html += `<div class="course-item todo-item glass ${t.done ? 'done' : ''}" data-id="${t.id}">
      <div class="course-item-color" style="background:${priorityColors[t.priority]}"></div>
      <div class="course-item-body" onclick="toggleTodo('${t.id}')">
        <div class="course-item-title ${t.done ? 'line-through' : ''}">${t.done ? '✅' : '⬜'} ${t.text}</div>
        <div class="course-item-sub">优先级：${{ high: '高', medium: '中', low: '低' }[t.priority]}</div>
      </div><button class="course-action-btn" onclick="deleteTodo('${t.id}')" aria-label="删除">🗑️</button>
    </div>`;
  });

  list.innerHTML = html;
}

/* ============================================================
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

function saveCourse() {
  const title = $('input-course-title').value.trim();
  const startTime = $('input-course-start').value;
  const endTime = $('input-course-end').value;
  const location = $('input-course-location').value.trim();
  const color = document.querySelector('.color-dot.active')?.dataset.color || 'blue';
  const repeat = $('input-course-repeat').value;
  const repeatWeeks = parseInt($('input-repeat-weeks').value) || 16;

  if (!title) { showToast('请输入课程名称', 'warning'); return; }
  if (!startTime || !endTime) { showToast('请设置时间', 'warning'); return; }
  if (startTime >= endTime) { showToast('结束时间必须晚于开始时间', 'warning'); return; }

  if (editingCourseId) {
    // 编辑模式
    const idx = appData.courses.findIndex(c => c.id === editingCourseId);
    if (idx !== -1) {
      appData.courses[idx] = { ...appData.courses[idx], title, startTime, endTime, location, color };}
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

    dates.forEach(date => {
      appData.courses.push({
        id: generateId(),
        title, date, startTime, endTime, location, color,
        repeatGroup: dates.length > 1 ? generateId() : null
      });
    });

    showToast(`已添加 ${dates.length} 节课程`);
  }

  saveData();
  closeModal('modal-add-course');
  resetCourseForm();
  refreshCalendar();
  refreshHome();
}

function editCourse(id) {
  const course = appData.courses.find(c => c.id === id);
  if (!course) return;
  editingCourseId = id;
  $('input-course-title').value = course.title;
  $('input-course-start').value = course.startTime;
  $('input-course-end').value = course.endTime;
  $('input-course-location').value = course.location || '';
  $$('.color-dot').forEach(d => d.classList.toggle('active', d.dataset.color === course.color));
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
  // 简单弹出编辑
  editCourse(course.id);
}

function resetCourseForm() {
  $('input-course-title').value = '';
  $('input-course-start').value = '08:00';
  $('input-course-end').value = '09:40';
  $('input-course-location').value = '';
  $('input-course-repeat').value = 'none';
  $('repeat-weeks-group').style.display = 'none';
  $$('.color-dot').forEach(d => d.classList.remove('active'));
  document.querySelector('.color-dot[data-color="blue"]').classList.add('active');
  editingCourseId = null;
}

/* ============================================================
   区块结束：课程 CRUD
   ============================================================ */

/* ============================================================
   区块开始：AI 导入课程
   ============================================================ */

let parsedCourses = [];

function initAIImport() {
  // Tab切换
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
      parsePastedJSON();
    } else {
      await parseWithAI();
    }
  });

  // 确认导入
  $('btn-ai-confirm').addEventListener('click', () => {
    if (parsedCourses.length === 0) return;
    parsedCourses.forEach(c => {
      appData.courses.push({
        id: generateId(),
        title: c.title,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        location: c.location || '',
        color: c.color || 'blue'
      });
    });
    saveData();
    showToast(`成功导入 ${parsedCourses.length} 节课程`);
    parsedCourses = [];
    closeModal('modal-ai-import');
    refreshCalendar();
    refreshHome();
    $('ai-preview').style.display = 'none';
    $('btn-ai-confirm').style.display = 'none';$('btn-ai-parse').style.display = 'inline-flex';
  });
}

function parsePastedJSON() {
  const raw = $('input-paste-json').value.trim();
  if (!raw) { showToast('请粘贴 JSON 数据', 'warning'); return; }

  try {
    //尝试提取 JSON 数组
    let jsonStr = raw;
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];

    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('不是数组');

    parsedCourses = data.filter(c => c.title && c.date && c.startTime && c.endTime);
    if (parsedCourses.length === 0) throw new Error('没有有效课程');

    showPreview();
    showToast(`解析成功，共 ${parsedCourses.length} 节课程`);
  } catch (e) {
    showToast('JSON 解析失败：' + e.message, 'error');
  }
}

async function parseWithAI() {
  const text = $('input-ai-text').value.trim();
  if (!text) { showToast('请粘贴课程文本', 'warning'); return; }

  const { apiBase, apiKey, apiModel } = appData.settings;
  if (!apiBase || !apiKey) {
    showToast('请先在设置中配置 API', 'warning');
    return;
  }

  $('ai-status').style.display = 'flex';
  $('btn-ai-parse').disabled = true;

  try {
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
            content: `你是一个课程表解析助手。请将用户提供的课程安排文本解析为 JSON 数组格式。
每个课程对象包含：title(课程名), date(YYYY-MM-DD), startTime(HH:MM), endTime(HH:MM), location(教室,可为空), color(blue/green/purple/coral/amber之一)。
只输出 JSON 数组，不要有任何其他文字。`
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

    parsedCourses = JSON.parse(match[0]).filter(c => c.title && c.date && c.startTime && c.endTime);
    if (parsedCourses.length === 0) throw new Error('没有解析到有效课程');

    showPreview();
    showToast(`AI 解析成功，共 ${parsedCourses.length} 节课程`);
  } catch (e) {
    showToast('AI 解析失败：' + e.message, 'error');
  } finally {
    $('ai-status').style.display = 'none';
    $('btn-ai-parse').disabled = false;
  }
}

function showPreview() {
  const list = $('ai-preview-list');
  list.innerHTML = parsedCourses.map(c =>
    `<div class="ai-preview-item glass">
      <div class="ai-preview-color color-bg-${c.color || 'blue'}"></div>
      <div>
        <strong>${c.title}</strong>
        <div class="ai-preview-detail">${c.date} · ${c.startTime}-${c.endTime}${c.location ? ' · ' + c.location : ''}</div>
      </div>
    </div>`
  ).join('');
  $('ai-preview').style.display = 'block';
  $('btn-ai-confirm').style.display = 'inline-flex';
  $('btn-ai-parse').style.display = 'none';
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

function getPetState(petId) {
  if (!appData.petStates[petId]) {
    appData.petStates[petId] = {
      hunger: 80,
      happy: 65,
      clean: 90,
      lastUpdate: Date.now()
    };
    saveData();
  }

  const state = appData.petStates[petId];
  // 计算时间衰减
  const elapsed = (Date.now() - state.lastUpdate) / 1000 / 60; // 分钟
  const decay = elapsed * 0.05; // 每分钟衰减 0.05

  state.hunger = Math.max(0, state.hunger - decay * 1.2);
  state.happy = Math.max(0, state.happy - decay * 0.8);
  state.clean = Math.max(0, state.clean - decay * 0.5);
  state.lastUpdate = Date.now();
  saveData();

  return state;
}

function refreshPet() {
  if (appData.pets.length === 0) {
    $('pet-placeholder').style.display = 'flex';
    $('pet-content').style.display = 'none';
    return;
  }

  $('pet-placeholder').style.display = 'none';
  $('pet-content').style.display = 'block';

  //渲染宠物标签
  const tabs = $('pet-tabs');
  tabs.innerHTML = appData.pets.map((p, i) =>
    `<button class="pet-tab ${i === currentPetIndex ? 'active' : ''}" data-index="${i}">${p.name}</button>`
  ).join('');
  tabs.querySelectorAll('.pet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentPetIndex = parseInt(tab.dataset.index);
      refreshPet();
    });
  });

  const pet = appData.pets[currentPetIndex];
  const state = getPetState(pet.id);

  //拓麻歌子
  renderTamagotchi(pet, state);

  // 宠物信息
  renderPetInfo(pet);

  // 饮食记录
  renderPetFeeding(pet);

  // 健康记录
  renderPetHealth(pet);
}

function renderTamagotchi(pet, state) {
  // 形象
  const sprite = $('tama-sprite');
  if (pet.avatar) {
    sprite.innerHTML = `<img src="${pet.avatar}" alt="${pet.name}" class="tama-img">`;
  } else {
    // CSS 动画默认形象
    const mood = state.hunger < 30 ? 'hungry' : state.happy < 30 ? 'sad' : 'happy';
    sprite.innerHTML = `<div class="tama-default-sprite ${mood}">
      <div class="tama-body"></div>
      <div class="tama-eyes"><span></span><span></span></div>
      <div class="tama-mouth"></div>
    </div>`;
  }

  // 气泡
  const bubble = $('tama-bubble');
  const bubbleText = $('tama-bubble-text');
  if (state.hunger < 30) {
    bubble.style.display = 'block';
    bubbleText.textContent = '妈妈我饿了~🍖';
  } else if (state.happy < 30) {
    bubble.style.display = 'block';
    bubbleText.textContent = '陪我玩嘛~🎾';
  } else if (state.clean < 30) {
    bubble.style.display = 'block';
    bubbleText.textContent = '我想洗澡~🧼';
  } else {
    bubble.style.display = 'none';
  }

  // 状态条
  $('tama-hunger').style.width = state.hunger + '%';
  $('tama-happy').style.width = state.happy + '%';
  $('tama-clean').style.width = state.clean + '%';
}

function renderPetInfo(pet) {
  const section = $('pet-info-section');
  const genderText = { male: '♂公', female: '♀ 母', unknown: '未知' };
  const age = pet.birthday ? calculateAge(pet.birthday) : '未知';

  section.innerHTML = `
    <div class="section-title">📋 基本信息</div>
    <div class="pet-info-grid glass-card" style="margin:0 24px;padding:18px 20px">
      <div class="pet-info-row"><span>品种</span><strong>${pet.breed || '未知'}</strong></div>
      <div class="pet-info-row"><span>性别</span><strong>${genderText[pet.gender] || '未知'}</strong></div>
      <div class="pet-info-row"><span>年龄</span><strong>${age}</strong></div>
      <div class="pet-info-row"><span>生日</span><strong>${pet.birthday || '未设置'}</strong></div>
      <div class="pet-info-row"><span>绝育</span><strong>${pet.neutered === 'yes' ? '已绝育' : '未绝育'}</strong></div>
      ${pet.chip ? `<div class="pet-info-row"><span>芯片号</span><strong>${pet.chip}</strong></div>` : ''}
    </div>
  `;
}

function calculateAge(birthday) {
  const birth = new Date(birthday);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (months < 12) return `${months} 个月`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}岁 ${rem} 个月` : `${years} 岁`;
}

function renderPetFeeding(pet) {
  const section = $('pet-feed-section');
  const todayStr = formatDate(new Date());
  const todayFeeds = (pet.feeds || []).filter(f => f.date === todayStr);

  section.innerHTML = `
    <div class="section-title" style="display:flex;justify-content:space-between;align-items:center">
      <span>🍽️ 今日饮食</span>
      <button class="btn btn-primary btn-sm" onclick="addFeedRecord()">+ 记录</button>
    </div>
    <div class="feed-cards" style="padding:0 24px">
      ${['早餐', '午餐', '晚餐'].map(meal => {
        const record = todayFeeds.find(f => f.meal === meal);
        return `<div class="feed-card glass ${record ? 'fed' : ''}" onclick="addFeedRecord('${meal}')">
          <span class="feed-icon">${meal === '早餐' ? '🌅' : meal === '午餐' ? '☀️' : '🌙'}</span>
          <span class="feed-label">${meal}</span>
          <span class="feed-status">${record ? '✅ ' + (record.amount || '') : '未记录'}</span>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderPetHealth(pet) {
  const section = $('pet-health-section');
  const weights = pet.weights || [];
  const lastWeight = weights.length > 0 ? weights[weights.length - 1] : null;

  section.innerHTML = `
    <div class="section-title" style="display:flex;justify-content:space-between;align-items:center">
      <span>🏥 健康记录</span>
      <button class="btn btn-secondary btn-sm" onclick="addWeightRecord()">+ 体重</button>
    </div>
    <div class="health-cards" style="padding:0 24px">
      <div class="health-card glass">
        <span class="health-icon">⚖️</span>
        <div>
          <div class="health-label">最新体重</div>
          <div class="health-value">${lastWeight ? lastWeight.value + ' kg' : '未记录'}</div>
        </div>
      </div>
      <div class="health-card glass" onclick="showVaccineRecords()">
        <span class="health-icon">💉</span>
        <div>
          <div class="health-label">疫苗/驱虫</div>
          <div class="health-value">${(pet.vaccines || []).length} 条记录</div>
        </div>
      </div>
    </div>
  `;
}

function initPet() {
  // 保存宠物
  $('btn-save-pet').addEventListener('click', () => {
    const name = $('input-pet-name').value.trim();
    if (!name) { showToast('请输入宠物名字', 'warning'); return; }

    const pet = {
      id: generateId(),
      name,
      breed: $('input-pet-breed').value.trim(),
      gender: $('input-pet-gender').value,
      birthday: $('input-pet-birthday').value,
      neutered: $('input-pet-neutered').value,
      chip: $('input-pet-chip').value.trim(),
      avatar: $('input-pet-avatar').value.trim(),
      feeds: [],
      weights: [],
      vaccines: []
    };

    // 处理文件上传
    const fileInput = $('input-pet-avatar-file');
    if (fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        pet.avatar = e.target.result;
        appData.pets.push(pet);
        saveData();
        closeModal('modal-add-pet');
        refreshPet();
        refreshHome();
        showToast(`${name} 已添加`);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      appData.pets.push(pet);
      saveData();
      closeModal('modal-add-pet');
      refreshPet();
      refreshHome();
      showToast(`${name} 已添加`);
    }
  });

  // 拓麻歌子互动
  $('btn-feed').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex];
    if (!pet) return;
    const state = getPetState(pet.id);
    state.hunger = Math.min(100, state.hunger + 25);
    saveData();
    showToast('喂食成功！🍖');
    refreshPet();
    refreshHome();
    animateButton('btn-feed');
  });

  $('btn-play').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex];
    if (!pet) return;
    const state = getPetState(pet.id);
    state.happy = Math.min(100, state.happy + 20);
    saveData();
    showToast('玩耍中！🎾');
    refreshPet();
    refreshHome();
    animateButton('btn-play');
  });

  $('btn-clean').addEventListener('click', () => {
    const pet = appData.pets[currentPetIndex];
    if (!pet) return;
    const state = getPetState(pet.id);
    state.clean = Math.min(100, state.clean + 30);
    saveData();
    showToast('梳毛完成！✨');
    refreshPet();
    refreshHome();
    animateButton('btn-clean');
  });

  $('btn-add-pet').addEventListener('click', () => openModal('modal-add-pet'));
}

function animateButton(id) {
  const btn = $(id);
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 500);
}

function addFeedRecord(meal) {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  const mealName = meal || prompt('选择餐次（早餐/午餐/晚餐）：', '午餐');
  if (!mealName) return;
  const amount = prompt('食量备注（可选）：', '');

  if (!pet.feeds) pet.feeds = [];
  pet.feeds.push({
    id: generateId(),
    date: formatDate(new Date()),
    meal: mealName,
    amount: amount || '',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  });
  saveData();
  refreshPet();
  showToast('饮食已记录');
}

function addWeightRecord() {
  const pet = appData.pets[currentPetIndex];
  if (!pet) return;
  const value = prompt('输入体重（kg）：', '');
  if (!value || isNaN(value)) return;

  if (!pet.weights) pet.weights = [];
  pet.weights.push({
    date: formatDate(new Date()),
    value: parseFloat(value)
  });
  saveData();
  refreshPet();
  showToast('体重已记录');
}

function showVaccineRecords() {
  showToast('疫苗记录功能开发中', 'info');
}

/* ============================================================
   区块结束：宠物管理
   ============================================================ */

/* ============================================================
   区块开始：背单词系统
   ============================================================ */

const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30]; // 天

function refreshVocab() {
  if (appData.vocab.length === 0) {
    $('vocab-placeholder').style.display = 'flex';
    $('vocab-content').style.display = 'none';
    return;
  }

  $('vocab-placeholder').style.display = 'none';
  $('vocab-content').style.display = 'block';

  const todayStr = formatDate(new Date());
  const dueWords = appData.vocab.filter(w => {
    if (w.level >= EBBINGHAUS_INTERVALS.length) return false;
    if (!w.lastReview) return true;
    const nextDate = new Date(w.lastReview);
    nextDate.setDate(nextDate.getDate() + EBBINGHAUS_INTERVALS[w.level]);
    return formatDate(nextDate) <= todayStr;
  });

  const mastered = appData.vocab.filter(w => w.level >= EBBINGHAUS_INTERVALS.length).length;
  const reviewing = appData.vocab.filter(w => w.level >0 && w.level < EBBINGHAUS_INTERVALS.length).length;
  const newWords = appData.vocab.filter(w => w.level === 0).length;

  const content = $('vocab-content');
  content.innerHTML = `
    <div style="padding:0 24px">
      <!-- 进度条 -->
      <div class="vocab-progress glass-card" style="padding:18px 20px;margin-bottom:16px">
        <div class="vocab-progress-header">
          <span>学习进度</span>
          <span class="text-accent font-bold">${mastered}/${appData.vocab.length}</span>
        </div>
        <div class="vocab-progress-bar">
          <div class="vocab-bar-fill mastered" style="width:${(mastered / appData.vocab.length * 100)}%"></div>
          <div class="vocab-bar-fill reviewing" style="width:${(reviewing / appData.vocab.length * 100)}%"></div></div>
        <div class="vocab-progress-legend">
          <span><i style="background:#34d399"></i>已掌握 ${mastered}</span>
          <span><i style="background:#fbbf24"></i>复习中 ${reviewing}</span>
          <span><i style="background:#94a3b8"></i>待学习 ${newWords}</span>
        </div>
        <div class="vocab-streak">🔥 连续打卡 ${appData.vocabStats.streak} 天</div>
      </div>

      <!-- 今日复习 -->
      ${dueWords.length > 0 ? `
        <div class="section-title">📝 今日复习 (${dueWords.length})</div>
        <div class="vocab-review-card glass-card" id="vocab-review-card" style="padding:24px;margin-bottom:16px;text-align:center">
          <div class="vocab-word" id="vocab-current-word">${dueWords[0].word}</div>
          <div class="vocab-meaning hidden" id="vocab-current-meaning">${dueWords[0].meaning}</div>
          ${dueWords[0].example ? `<div class="vocab-example hidden" id="vocab-current-example">${dueWords[0].example}</div>` : ''}
          <div class="vocab-review-actions" id="vocab-review-actions">
            <button class="btn btn-secondary" id="btn-show-meaning">显示释义</button>
          </div>
          <div class="vocab-review-actions hidden" id="vocab-grade-actions">
            <button class="btn btn-secondary" onclick="gradeWord('${dueWords[0].id}', false)">😕 不认识</button>
            <button class="btn btn-primary" onclick="gradeWord('${dueWords[0].id}', true)">😊 认识</button>
          </div>
        </div>
      ` : '<div class="empty-state glass-card" style="padding:32px;text-align:center"><span style="font-size:32px">🎉</span><p>今日复习已完成！</p></div>'}

      <!-- 词库列表 -->
      <div class="section-title" style="display:flex;justify-content:space-between;align-items:center">
        <span>📚 词库 (${appData.vocab.length})</span>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-add-word')">+ 添加</button>
      </div>
      <div class="vocab-list">
        ${appData.vocab.map(w => `
          <div class="vocab-item glass">
            <div class="vocab-item-body">
              <div class="vocab-item-word">${w.word}</div>
              <div class="vocab-item-meaning">${w.meaning}</div></div>
            <div class="vocab-item-level">Lv.${w.level}</div>
            <button class="course-action-btn" onclick="deleteWord('${w.id}')" aria-label="删除">🗑️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  //绑定显示释义按钮
  const showBtn = document.getElementById('btn-show-meaning');
  if (showBtn) {
    showBtn.addEventListener('click', () => {
      document.getElementById('vocab-current-meaning')?.classList.remove('hidden');
      document.getElementById('vocab-current-example')?.classList.remove('hidden');
      document.getElementById('vocab-review-actions')?.classList.add('hidden');
      document.getElementById('vocab-grade-actions')?.classList.remove('hidden');
    });
  }
}

function initVocab() {
  $('btn-add-word').addEventListener('click', () => openModal('modal-add-word'));

  $('btn-save-word').addEventListener('click', () => {
    const word = $('input-word').value.trim();
    const meaning = $('input-word-meaning').value.trim();
    const example = $('input-word-example').value.trim();
    if (!word || !meaning) { showToast('请填写单词和释义', 'warning'); return; }

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
    showToast('单词已添加');
  });
}

function gradeWord(id, known) {
  const word = appData.vocab.find(w => w.id === id);
  if (!word) return;

  if (known) {
    word.level = Math.min(word.level + 1, EBBINGHAUS_INTERVALS.length);
  } else {
    word.level = 0;
  }
  word.lastReview = formatDate(new Date());

  // 更新打卡
  const todayStr = formatDate(new Date());
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
  refreshVocab();
  refreshHome();
  showToast(known ? '太棒了！✨' : '没关系，继续加油！💪');
}

function deleteWord(id) {
  if (!confirm('确定删除这个单词？')) return;
  appData.vocab = appData.vocab.filter(w => w.id !== id);
  saveData();
  refreshVocab();
  showToast('单词已删除');
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
  const monthEnd = new Date(calendarYear, calendarMonth + 1, 0);
  let monthCourseCount = 0;
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    monthCourseCount += getCoursesForDate(formatDate(d)).length;
  }

  // 单词统计
  const mastered = appData.vocab.filter(w => w.level >= EBBINGHAUS_INTERVALS.length).length;
  const reviewing = appData.vocab.filter(w => w.level > 0 && w.level < EBBINGHAUS_INTERVALS.length).length;
  const newWords = appData.vocab.filter(w => w.level === 0).length;

  content.innerHTML = `
    <div style="padding:0 24px">
      <!-- 周课时-->
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
          ${Object.keys(subjectMap).length === 0 ? '<div class="text-secondary" style="text-align:center;padding:20px">本周暂无课程</div>' : ''}
        </div>
      </div>

      <!-- 月统计 -->
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

      <!-- 单词进度 -->
      <div class="glass-card" style="padding:20px;margin-bottom:16px">
        <div class="stats-card-title">📖 单词学习进度</div>
        <div class="vocab-progress-bar" style="margin:12px 0">
          <div class="vocab-bar-fill mastered" style="width:${appData.vocab.length ? (mastered / appData.vocab.length * 100) : 0}%"></div>
          <div class="vocab-bar-fill reviewing" style="width:${appData.vocab.length ? (reviewing / appData.vocab.length * 100) : 0}%"></div>
        </div>
        <div class="vocab-progress-legend">
          <span><i style="background:#34d399"></i>已掌握 ${mastered}</span>
          <span><i style="background:#fbbf24"></i>复习中 ${reviewing}</span>
          <span><i style="background:#94a3b8"></i>待学习 ${newWords}</span>
        </div>
        <div class="vocab-streak" style="margin-top:8px">🔥 连续打卡 ${appData.vocabStats.streak} 天</div>
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
