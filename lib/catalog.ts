/* Demo catalogue of activities. In a pilot this comes from Leader-ID, Projects 2035 and the university. */
export type CatItem = { id: string; title: string; source: string; comp: string; inDays: number; points: number; kind: string; place: string };

export const CATALOG: CatItem[] = [
  { id: "c1", title: "Форум «Территория смыслов»: секция выступлений", source: "Leader-ID", comp: "communication", inDays: 9, points: 30, kind: "Мероприятие", place: "Онлайн" },
  { id: "c2", title: "Школа публичных выступлений, 3 занятия", source: "ЭИОС", comp: "communication", inDays: 14, points: 35, kind: "Курс", place: "ЮГУ, ауд. 2/227" },
  { id: "c3", title: "Курс «Логика и аргументация»", source: "Онлайн-курсы", comp: "critical", inDays: 3, points: 30, kind: "Курс", place: "Stepik" },
  { id: "c4", title: "Кейс-чемпионат: аналитика данных", source: "Кейс-чемпионаты", comp: "critical", inDays: 21, points: 40, kind: "Кейс", place: "ЮГУ" },
  { id: "c5", title: "Командный проект акселератора", source: "Projects 2035", comp: "teamwork", inDays: 5, points: 35, kind: "Проект", place: "Онлайн" },
  { id: "c6", title: "Волонтёрская смена на региональном фестивале", source: "Добро.рф", comp: "teamwork", inDays: 12, points: 25, kind: "Волонтёрство", place: "Ханты-Мансийск" },
  { id: "c7", title: "Организация студенческого мероприятия", source: "Leader-ID", comp: "leadership", inDays: 17, points: 40, kind: "Организация", place: "ЮГУ" },
  { id: "c8", title: "Школа лидеров: координатор проекта", source: "Projects 2035", comp: "leadership", inDays: 8, points: 35, kind: "Роль в проекте", place: "Онлайн" },
  { id: "c9", title: "Таблицы и анализ данных: практикум", source: "Онлайн-курсы", comp: "digital", inDays: 2, points: 30, kind: "Курс", place: "Stepik" },
  { id: "c10", title: "Цифровой практикум: трекеры задач и облако", source: "ЭИОС", comp: "digital", inDays: 10, points: 25, kind: "Практикум", place: "ЮГУ" },
  { id: "c11", title: "Проектная сессия: от идеи к паспорту проекта", source: "Projects 2035", comp: "project", inDays: 6, points: 40, kind: "Сессия", place: "Онлайн" },
  { id: "c12", title: "Кейс-чемпионат «Окно в рынок»", source: "Кейс-чемпионаты", comp: "project", inDays: 24, points: 45, kind: "Кейс", place: "ЮГУ" },
  { id: "c13", title: "Курс по тайм-менеджменту", source: "Онлайн-курсы", comp: "selfdev", inDays: 4, points: 25, kind: "Курс", place: "Stepik" },
  { id: "c14", title: "Образовательный интенсив Leader-ID", source: "Leader-ID", comp: "selfdev", inDays: 19, points: 35, kind: "Интенсив", place: "Онлайн" },
  { id: "c15", title: "Отраслевой кейс по специальности", source: "Кейс-чемпионаты", comp: "prof", inDays: 11, points: 40, kind: "Кейс", place: "ЮГУ" },
  { id: "c16", title: "Профильная практика на предприятии региона", source: "ЭИОС", comp: "prof", inDays: 28, points: 45, kind: "Практика", place: "Югра" },
];

export const dateIn = (days: number) => new Date(Date.now() + days * 864e5).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
