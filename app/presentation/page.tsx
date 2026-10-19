import type { Metadata } from "next";
import { Deck, type Slide } from "@/components/Deck";
import { LiveFrame } from "@/components/LiveFrame";
import { COMPETENCIES, LEVEL_MIN, LEVEL_NAMES, SOURCES } from "@/lib/config";

export const metadata: Metadata = { title: "Презентация — Трекер компетенций" };

const Item = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div className="rule-t fill row" style={{ gridTemplateColumns: "6cqw 1fr", alignItems: "center" }}>
    <div className="big" style={{ fontSize: "3.6cqw" }}>{n}</div>
    <div><div className="d t4">{title}</div><p className="tx" style={{ marginTop: ".5cqw" }}>{children}</p></div>
  </div>
);

export default async function Presentation({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  const { base = "" } = await searchParams;
  const L = (path: string) => `${base}${path}`;

  const slides: Slide[] = [
    {
      id: "title",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.35fr 1fr", gap: "5cqw" }}>
          <div className="col" style={{ justifyContent: "center" }}>
            <p className="tx" style={{ marginBottom: "2cqw" }}>Акселератор «Окно в рынок для стартапа» · запрос Фонда Югры</p>
            <h1 className="d t1">Трекер компетенций</h1>
            <p className="lead" style={{ marginTop: "2.4cqw", maxWidth: "46cqw" }}>
              Система трекинга мягких и профессиональных компетенций студентов на основе цифрового следа.
            </p>
            <p className="foot" style={{ marginTop: "3cqw", maxWidth: "46cqw" }}>Разработка прототипа выполнена внешним разработчиком по приглашению Д. Хвостовой.</p>
          </div>
          <div className="col rule-l" style={{ paddingLeft: "3.5cqw" }}>
            {[[String(COMPETENCIES.length), "компетенций в профиле"], [String(LEVEL_NAMES.length), "уровней роста"], [String(SOURCES.length), "источников цифрового следа"]].map(([v, t], k) => (
              <div key={t} className={`fill col ${k ? "rule-t" : ""}`} style={{ justifyContent: "center" }}>
                <div className="big" style={{ fontSize: "8.5cqw" }}>{v}</div>
                <div className="tx">{t}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "problem",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.15fr", gap: "6cqw" }}>
          <div className="col" style={{ justifyContent: "center" }}>
            <h2 className="d t2">Компетенции студента не видны ни ему, ни вузу</h2>
            <p className="tx" style={{ marginTop: "2.4cqw" }}>Следы активности уже есть: учёба, мероприятия, проекты, кейсы, курсы. Но они разрознены и не складываются в понятный профиль.</p>
          </div>
          <div className="col">
            <Item n="01" title="Портфолио вручную">Студент сам собирает грамоты и сертификаты. Данные неполные и устаревают.</Item>
            <Item n="02" title="Оценка разовая">Диагностики проходят время от времени. Непонятно, растёт ли студент в течение учёбы.</Item>
            <Item n="03" title="Нет сводной картины">Вуз и регион не видят, у каких групп и по каким компетенциям есть просадки.</Item>
          </div>
        </div>
      ),
    },
    {
      id: "idea",
      node: (
        <div className="col fill">
          <h2 className="d t2" style={{ maxWidth: "74cqw" }}>Профиль, который собирается сам из цифрового следа студента</h2>
          <div className="fill" />
          <div className="row" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "2.4cqw" }}>
            {[["Автоматически", "Данные приходят из систем вуза и платформ, а не вводятся вручную."],
              ["Измеримо", "8 компетенций, для каждой уровни от 1 до 5 с понятными порогами."],
              ["Непрерывно", "Динамика роста с первого курса вместо разовой диагностики."],
              ["Мотивирует", "Серии, достижения, лиги групп и карточка для соцсетей."]].map(([h, t]) => (
              <div key={h} className="rule-t" style={{ paddingTop: "1.4cqw" }}>
                <div className="d t4">{h}</div>
                <p className="tx" style={{ marginTop: ".8cqw" }}>{t}</p>
              </div>
            ))}
          </div>
          <div className="fill" />
          <p className="lead" style={{ maxWidth: "70cqw" }}>Студент видит, куда расти. Куратор видит, кому нужна помощь. Регион получает данные о кадровом потенциале.</p>
        </div>
      ),
    },
    {
      id: "how",
      node: (
        <div className="col fill">
          <h2 className="d t2">От цифрового следа к профилю</h2>
          <div className="fill" />
          <div className="row" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "2.4cqw" }}>
            {[["1", "Источники", "Данные из систем вуза и внешних платформ."],
              ["2", "Правила", "Активность даёт баллы в одну или несколько компетенций по весам."],
              ["3", "Профиль", "Баллы копятся по 8 компетенциям, по порогам определяется уровень."],
              ["4", "Аналитика", "Радар, динамика, сравнение с группой, панель куратора, алерты."]].map(([n, h, t]) => (
              <div key={n} style={{ position: "relative", paddingTop: "2.2cqw" }} className="rule-t">
                <span style={{ position: "absolute", top: "-.5cqw", left: 0, width: "1cqw", height: "1cqw", background: "var(--accent)" }} />
                <div className="big" style={{ fontSize: "5.5cqw" }}>{n}</div>
                <div className="d t4" style={{ marginTop: "1cqw" }}>{h}</div>
                <p className="tx" style={{ marginTop: ".6cqw" }}>{t}</p>
              </div>
            ))}
          </div>
          <div className="fill" />
          <div className="row rule-t" style={{ gridTemplateColumns: "1fr 1.4fr", gap: "4cqw", paddingTop: "1.6cqw" }}>
            <div><div className="foot" style={{ marginBottom: ".5cqw" }}>Источники</div><p className="tx"><b>{SOURCES.join(" · ")}</b></p></div>
            <div><div className="foot" style={{ marginBottom: ".5cqw" }}>Компетенции</div><p className="tx"><b>{COMPETENCIES.map((c) => c.name).join(" · ")}</b></p></div>
          </div>
        </div>
      ),
    },
    {
      id: "levels",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.7fr", gap: "5cqw" }}>
          <div className="col" style={{ justifyContent: "center" }}>
            <h2 className="d t2">Пять уровней по накопленным баллам</h2>
            <p className="tx" style={{ marginTop: "2cqw" }}>Пороги и веса настраиваются под методику вуза и заказчика. В прототипе заданы ориентировочные значения.</p>
          </div>
          <div className="row fill" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "1.2cqw", alignItems: "end" }}>
            {LEVEL_NAMES.map((n, k) => (
              <div key={n} className="col" style={{ height: `${22 + k * 17}%`, background: k === 4 ? "var(--accent)" : "var(--card)", border: "1px solid var(--line)", padding: "1.3cqw", justifyContent: "space-between", color: k === 4 ? "var(--on-accent)" : "var(--ink)" }}>
                <div className="d t3" style={{ opacity: .9 }}>{k + 1}</div>
                <div><div className="d t4" style={{ fontSize: "2.1cqw" }}>{n}</div><div style={{ fontSize: "1.45cqw", opacity: .75, marginTop: ".3cqw" }}>от {LEVEL_MIN[k]}</div></div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "home",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.9fr", gap: "4cqw", alignItems: "center" }}>
          <div className="col">
            <h2 className="d t3">Студенты по направлениям</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Карточки по направлениям подготовки", "Мгновенный поиск, фильтр и сортировка", "Теплокарта: студенты и 8 компетенций", "Доска статусов: кому нужна поддержка"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/")} target="_blank">Открыть вживую</a></div>
          </div>
          <LiveFrame src="/?v=dir" w={1440} h={1000} printW={713} />
        </div>
      ),
    },
    {
      id: "demo-student",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.9fr", gap: "4cqw", alignItems: "center" }}>
          <div className="col">
            <h2 className="d t3">Профиль студента</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Радар компетенций и сравнение с группой", "Уровень и прогресс по каждой компетенции", "Динамика за год и карта активности", "Цели, история опросов, рекомендации активностей"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/student/3")} target="_blank">Открыть вживую</a></div>
          </div>
          <LiveFrame src="/student/3" w={1440} h={1110} printW={713} />
        </div>
      ),
    },
    {
      id: "demo-curator",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.9fr 1fr", gap: "4cqw", alignItems: "center" }}>
          <LiveFrame src="/curator" w={1440} h={1000} printW={713} />
          <div className="col">
            <h2 className="d t3">Панель куратора</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Сводка по группам и слабым компетенциям", "Лига групп по приросту за месяц", "Самооценка против цифрового следа", "Очередь подтверждений и импорт из CSV"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/curator")} target="_blank">Открыть вживую</a></div>
          </div>
        </div>
      ),
    },
    {
      id: "demo-survey",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.9fr", gap: "4cqw", alignItems: "center" }}>
          <div className="col">
            <h2 className="d t3">Опрос самооценки</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["16 вопросов за 3 минуты, без «правильных» ответов", "Вопросы о поведении и частоте действий, а не тест на эрудицию", "Результат сверяется с цифровым следом", "Завышение подтверждается примером и куратором"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/test")} target="_blank">Пройти опрос</a></div>
          </div>
          <LiveFrame src="/test/result/demo" w={1440} h={1000} printW={713} />
        </div>
      ),
    },
    {
      id: "passport",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.9fr 1fr", gap: "4cqw", alignItems: "center" }}>
          <LiveFrame src="/passport/3" w={1440} h={650} printW={713} />
          <div className="col">
            <h2 className="d t3">Паспорт компетенций</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Одна страница для работодателя: радар и уровни", "QR-код и страница проверки подлинности", "Отметки о подтверждённых компетенциях", "Печать и сохранение в PDF"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/passport/3")} target="_blank">Открыть паспорт</a></div>
          </div>
        </div>
      ),
    },
    {
      id: "game",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "6cqw", alignItems: "center" }}>
          <div className="col fill" style={{ justifyContent: "center" }}>
            <h2 className="d t2">Игровые механики вместо анкет</h2>
            <div className="row" style={{ gridTemplateColumns: "1fr 1fr", gap: "0 3cqw", marginTop: "2.6cqw" }}>
              {[["Серии", "Недели активности подряд не дают пропадать."], ["Достижения", "Награда за рост конкретной компетенции, а не за участие."],
                ["Лиги групп", "Соревнование групп по приросту за месяц."], ["Алерты", "Предупреждение, если компетенция давно не развивалась."]].map(([h, t]) => (
                <div key={h} className="rule-t" style={{ padding: "1.2cqw 0 1.6cqw" }}>
                  <div className="d t4">{h}</div><p className="tx" style={{ marginTop: ".5cqw" }}>{t}</p>
                </div>
              ))}
            </div>
            <div><a className="cta" href={L("/share/3")} target="_blank">Пример карточки</a></div>
          </div>
          <div style={{ justifySelf: "center", width: "82%" }}><LiveFrame src="/share/3" w={560} h={800} printW={348} /></div>
        </div>
      ),
    },
    {
      id: "trust",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.9fr", gap: "4cqw", alignItems: "center" }}>
          <div className="col">
            <h2 className="d t3">Доверие и прозрачность</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Центр согласий: студент сам отключает источник данных", "Методика открыта: формулы, пороги, веса источников", "Паспорт компетенций с QR-проверкой подлинности", "Выгрузка всех своих данных в один клик"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/consent?student=3")} target="_blank">Открыть центр согласий</a></div>
          </div>
          <LiveFrame src="/consent?student=3" w={1440} h={1000} printW={713} />
        </div>
      ),
    },
    {
      id: "roi",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.9fr 1fr", gap: "4cqw", alignItems: "center" }}>
          <LiveFrame src="/roi" w={1440} h={1000} printW={713} />
          <div className="col">
            <h2 className="d t3">Окупаемость</h2>
            <div className="col" style={{ margin: "2cqw 0" }}>
              {["Калькулятор для заказчика: часы, ставка, масштаб", "Срок окупаемости и безубыточность по числу студентов", "Сценарии: пилот, вуз, регион", "Допущения заменяются данными заказчика"].map((t) => (
                <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>
              ))}
            </div>
            <div><a className="cta" href={L("/roi")} target="_blank">Открыть калькулятор</a></div>
          </div>
        </div>
      ),
    },
    {
      id: "value",
      node: (
        <div className="col fill">
          <h2 className="d t2">Кому и что это даёт</h2>
          <div className="fill" />
          <div className="row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[["Студенту", ["Понятная картина сильных сторон", "Цели по уровням", "Готовый профиль для работодателя"]],
              ["Вузу и куратору", ["Данные вместо впечатлений", "Ранние сигналы о просадках", "Сравнение групп и потоков"]],
              ["Региону и работодателям", ["Аналитика кадрового потенциала", "Верифицируемые профили", "Основа целевой подготовки"]]].map(([h, items], k) => (
              <div key={h as string} className={k ? "rule-l" : ""} style={{ padding: k ? "0 0 0 2.4cqw" : "0 2.4cqw 0 0" }}>
                <div className="d t3">{h as string}</div>
                <div className="col" style={{ marginTop: "1.8cqw" }}>
                  {(items as string[]).map((t) => <p key={t} className="tx rule-t" style={{ padding: "1cqw 0" }}>{t}</p>)}
                </div>
              </div>
            ))}
          </div>
          <div className="fill" />
        </div>
      ),
    },
    {
      id: "analogs",
      node: (
        <div className="col fill">
          <h2 className="d t3" style={{ marginBottom: "2.2cqw" }}>Чем отличаемся от существующих решений</h2>
          <table className="t">
            <thead><tr><th>Решение</th><th>Чего не хватает</th><th>Что делаем мы</th></tr></thead>
            <tbody>
              <tr><td>Скиллфолио</td><td>Оценка тестами и анкетами; сбор цифрового следа на сайте не заявлен</td><td>Профиль строится по реальной активности, опрос лишь сверка</td></tr>
              <tr><td>hh.ru</td><td>Профиль заполняется вручную под поиск работы, нет динамики</td><td>Профиль собирается с 1 курса, виден рост</td></tr>
              <tr><td>Добро.рф</td><td>Фиксирует только волонтёрство</td><td>Учёба, внеучебка, проекты и кейсы в одном профиле</td></tr>
              <tr><td>Leader-ID</td><td>История мероприятий, нет шкал по компетенциям</td><td>Каждая компетенция измерима и имеет уровни</td></tr>
              <tr><td>Портфолио вузов</td><td>«Папка файлов» с ручной загрузкой, нет единой шкалы</td><td>Автосбор и единая шкала уровней</td></tr>
              <tr><td>Центры компетенций РСВ</td><td>Диагностика разовая, нет непрерывного трекинга</td><td>Профиль обновляется по мере активности</td></tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "roadmap",
      node: (
        <div className="col fill">
          <h2 className="d t2">От прототипа к пилоту и масштабу</h2>
          <div className="fill" />
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: ".5cqw", borderTop: "1px solid var(--line)" }} />
            <div className="row" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "3cqw", position: "relative" }}>
              {[["Сейчас", "Прототип", ["Профиль студента и панель куратора", "Демонстрационные данные", "Импорт CSV"]],
                ["Пилот", "В одном вузе", ["Подключение ЭИОС и Leader-ID", "Согласие на обработку данных", "Калибровка методики с экспертами"]],
                ["Масштаб", "Регион", ["Другие вузы и колледжи", "Доступ работодателей", "Региональная аналитика"]]].map(([a, b, items], k) => (
                <div key={a as string}>
                  <div style={{ width: "1.1cqw", height: "1.1cqw", background: k === 0 ? "var(--accent)" : "var(--bg)", border: "2px solid var(--accent)" }} />
                  <div className="foot" style={{ marginTop: "1.6cqw" }}>{a as string}</div>
                  <div className="d t3" style={{ marginTop: ".3cqw" }}>{b as string}</div>
                  <div className="col" style={{ marginTop: "1.4cqw" }}>
                    {(items as string[]).map((t) => <p key={t} className="tx rule-t" style={{ padding: ".9cqw 0" }}>{t}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fill" />
        </div>
      ),
    },
    {
      id: "ask",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1fr 1.5fr", gap: "6cqw" }}>
          <div className="col" style={{ justifyContent: "center" }}>
            <h2 className="d t2">Что нужно уточнить для пилота</h2>
            <p className="tx" style={{ marginTop: "2cqw" }}>В прототипе данные демонстрационные. Подключение реальных источников станет первым этапом пилота.</p>
          </div>
          <div className="col">
            <Item n="01" title="Данные">К каким источникам вуз и Фонд готовы дать доступ? Что именно можно собирать?</Item>
            <Item n="02" title="Согласие">Нужно ли согласие студентов и что делать при отказе?</Item>
            <Item n="03" title="Методика">Как проверять самооценку: якорные кейсы, экспертные оценки?</Item>
            <Item n="04" title="Успех пилота">Сроки, масштаб и критерии, по которым пилот считается успешным.</Item>
          </div>
        </div>
      ),
    },
    {
      id: "end",
      node: (
        <div className="row fill" style={{ gridTemplateColumns: "1.3fr 1fr", gap: "6cqw" }}>
          <div className="col" style={{ justifyContent: "center" }}>
            <h1 className="d t1">Спасибо.</h1>
            <p className="lead" style={{ marginTop: "2cqw" }}>Посмотрим прототип вживую.</p>
          </div>
          <div className="col rule-l" style={{ paddingLeft: "3.5cqw", justifyContent: "center" }}>
            {[["Главная", "/"], ["Профиль студента", "/student/3"], ["Панель куратора", "/curator"]].map(([t, p], k) => (
              <a key={t} href={L(p)} target="_blank" className={`d t3 ${k ? "rule-t" : ""}`} style={{ padding: "1.6cqw 0", display: "flex", justifyContent: "space-between" }}>
                <span>{t}</span><span className="acc">↗</span>
              </a>
            ))}
            <div className="foot" style={{ marginTop: "2cqw" }}>Команда №36 · ЮГУ<br />Разработка прототипа выполнена внешним разработчиком по приглашению Д. Хвостовой.</div>
          </div>
        </div>
      ),
    },
  ];

  return <Deck slides={slides} />;
}
