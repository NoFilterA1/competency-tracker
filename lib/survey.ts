import { COMPETENCIES } from "./config";

export type Opt = { text: string; v: number };
export type Question = { id: string; comp: string; kind: "scenario" | "count" | "freq"; text: string; options: Opt[] };

const COUNT: Opt[] = [{ text: "Ни разу", v: 1 }, { text: "1 раз", v: 2 }, { text: "2–3 раза", v: 3 }, { text: "4 и больше", v: 4 }];
const FREQ: Opt[] = [{ text: "Почти никогда", v: 1 }, { text: "Иногда", v: 2 }, { text: "Часто", v: 3 }, { text: "Почти всегда", v: 4 }];

// scenario options are deliberately not ordered by quality
export const QUESTIONS: Question[] = [
  { id: "com-s", comp: "communication", kind: "scenario", text: "Нужно за 5 минут рассказать группе о результатах проекта. Что вы делаете?", options: [
    { text: "Читаю заранее написанный текст с листа", v: 2 },
    { text: "Строю выступление: главная мысль, 2–3 довода, вывод. Репетирую и готовлю ответы на вопросы", v: 4 },
    { text: "Стараюсь передать выступление другому", v: 1 },
    { text: "Делаю слайды и рассказываю по ним, на вопросы отвечаю по ходу", v: 3 } ] },
  { id: "com-c", comp: "communication", kind: "count", text: "Сколько раз за семестр вы выступали перед аудиторией: доклад, защита, мероприятие?", options: COUNT },

  { id: "cri-s", comp: "critical", kind: "scenario", text: "В статье сказано: «80% студентов нашли работу после курса». Как вы поступите?", options: [
    { text: "Поищу ещё одну статью, где то же самое написано", v: 3 },
    { text: "Приму как факт", v: 1 },
    { text: "Проверю источник, выборку и с чем сравнивают этот результат", v: 4 },
    { text: "Спрошу, что думают знакомые", v: 2 } ] },
  { id: "cri-f", comp: "critical", kind: "freq", text: "Как часто вы проверяете информацию по нескольким источникам, прежде чем использовать её в работе?", options: FREQ },

  { id: "tea-s", comp: "teamwork", kind: "scenario", text: "В проекте двое спорят, кто что делает. Что вы предпримете?", options: [
    { text: "Попрошу руководителя решить за всех", v: 3 },
    { text: "Встану на сторону того, с кем лучше общаюсь", v: 1 },
    { text: "Предложу разделить задачи по сильным сторонам и записать в общий список", v: 4 },
    { text: "Постараюсь не вмешиваться", v: 2 } ] },
  { id: "tea-c", comp: "teamwork", kind: "count", text: "Сколько командных проектов вы довели до результата за последний год?", options: COUNT },

  { id: "lea-s", comp: "leadership", kind: "scenario", text: "Команде не хватает человека, который двигает работу вперёд. Как вы поступите?", options: [
    { text: "Буду делать только свою часть", v: 1 },
    { text: "Помогу тому, кто уже координирует", v: 3 },
    { text: "Предложу стать координатором: распределю задачи и сроки, согласую с командой", v: 4 },
    { text: "Подожду, пока кого-то назначат", v: 2 } ] },
  { id: "lea-f", comp: "leadership", kind: "freq", text: "Как часто вы берёте на себя организацию: мероприятия, группы, проекта?", options: FREQ },

  { id: "dig-s", comp: "digital", kind: "scenario", text: "Нужно быстро обработать таблицу на 500 строк. Что вы делаете?", options: [
    { text: "Откладываю на потом", v: 1 },
    { text: "Применяю формулы, сводные таблицы или скрипт, затем проверяю результат на выборке", v: 4 },
    { text: "Обрабатываю вручную, но по плану", v: 3 },
    { text: "Прошу кого-то сделать за меня", v: 2 } ] },
  { id: "dig-f", comp: "digital", kind: "freq", text: "Как часто вы используете цифровые инструменты: таблицы, трекеры задач, облако, ИИ-помощников, для учёбы и проектов?", options: FREQ },

  { id: "pro-s", comp: "project", kind: "scenario", text: "Идея проекта пока расплывчата. С чего вы начнёте?", options: [
    { text: "Начну делать и буду уточнять по ходу", v: 3 },
    { text: "Дождусь, что скажет руководитель", v: 1 },
    { text: "Найду готовые примеры и воспроизведу их", v: 2 },
    { text: "Сформулирую цель, аудиторию и результат, проверю идею на 2–3 людях", v: 4 } ] },
  { id: "pro-c", comp: "project", kind: "count", text: "Сколько собственных проектов, инициатив или кейсов вы довели до результата за год?", options: COUNT },

  { id: "sel-s", comp: "selfdev", kind: "scenario", text: "Вы заметили, что не хватает навыка, нужного для будущей работы. Что вы сделаете?", options: [
    { text: "Составлю план: курс или практика, срок и способ проверить прогресс", v: 4 },
    { text: "Надеюсь, что подтянется в процессе учёбы", v: 2 },
    { text: "Не считаю это важным", v: 1 },
    { text: "Запишусь на курс, когда появится время", v: 3 } ] },
  { id: "sel-c", comp: "selfdev", kind: "count", text: "Сколько курсов, интенсивов или самостоятельных программ вы завершили за год?", options: COUNT },

  { id: "prf-s", comp: "prof", kind: "scenario", text: "Вам дали задачу по специальности, с которой вы не сталкивались. Что вы делаете?", options: [
    { text: "Ищу готовое решение и использую его", v: 3 },
    { text: "Отказываюсь", v: 1 },
    { text: "Разбираю по шагам в профильных источниках, делаю по образцу, проверяю у практика или преподавателя", v: 4 },
    { text: "Прошу выполнить за меня", v: 2 } ] },
  { id: "prf-f", comp: "prof", kind: "freq", text: "Как часто вы применяете знания специальности на практике: кейсы, практика, стажировка?", options: FREQ },
];

export const TOTAL = QUESTIONS.length;

export type CompScore = { key: string; name: string; short: string; pct: number; level: number; float: number; answered: number };

export function levelFromPct(pct: number) { return pct < 20 ? 1 : pct < 40 ? 2 : pct < 60 ? 3 : pct < 80 ? 4 : 5; }

/** answers[i] = chosen option value (1..4) for QUESTIONS[i], 0 if not answered yet */
export function scoreAnswers(answers: number[]): CompScore[] {
  return COMPETENCIES.map((c) => {
    const vals = QUESTIONS.map((q, i) => (q.comp === c.key && answers[i] > 0 ? answers[i] : 0)).filter((v) => v > 0);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
    const pct = vals.length ? ((avg - 1) / 3) * 100 : 0;
    return { key: c.key, name: c.name, short: c.short, pct, level: vals.length ? levelFromPct(pct) : 0, float: (pct / 100) * 5, answered: vals.length };
  });
}

export const ADVICE: Record<string, { title: string; text: string }> = {
  communication: { title: "Публичные выступления", text: "Возьмите 5-минутный доклад на семинаре или мероприятии Leader-ID и попросите обратную связь по структуре." },
  critical: { title: "Проверка источников", text: "Перед каждой работой сверяйте ключевые факты минимум по двум независимым источникам и записывайте вывод." },
  teamwork: { title: "Командные проекты", text: "Присоединитесь к командному проекту в Projects 2035 или кейс-чемпионате и зафиксируйте свою роль." },
  leadership: { title: "Организация", text: "Организуйте небольшое событие или возьмите роль координатора в проекте. Достаточно 4–5 человек." },
  digital: { title: "Цифровые инструменты", text: "Освойте таблицы с формулами и один трекер задач. Курс на Stepik занимает 2–3 вечера." },
  project: { title: "Проектный подход", text: "Опишите идею в формате «цель, аудитория, результат» и проверьте её на 2–3 людях до начала работы." },
  selfdev: { title: "Обучение", text: "Выберите один курс и завершите его. Планируйте время заранее, а не ждите свободного окна." },
  prof: { title: "Практика по специальности", text: "Возьмите отраслевой кейс или практику и приложите результат в портфолио." },
};

export const DEMO_ANSWERS = [4, 3, 3, 3, 2, 3, 3, 2, 3, 3, 4, 3, 2, 2, 3, 3];
