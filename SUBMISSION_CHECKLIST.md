# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `https://github.com/jafanlim/signal-lab`
- **Ветка**: `main`
- **Время работы** (приблизительно): `~3` часа

---

## Запуск

```bash
# Команда запуска:
git clone https://github.com/jafanlim/signal-lab && cd signal-lab
cp .env.example .env
# Заполнить SENTRY_DSN реальным DSN из sentry.io
docker compose up -d postgres prometheus loki grafana
cd backend && npm install && npx prisma migrate deploy && npm run start:dev &
cd ../frontend && npm install && npm run dev

# Команда проверки:
curl http://localhost:4000/api/health
# → { "status": "ok", "timestamp": "..." }

# Команда остановки:
docker compose down
# Полный сброс: docker compose down -v
```

**Предусловия**:
- Docker Desktop 4+
- Node.js 20+ (проверено на v25.6.1)
- Реальный Sentry DSN — создать проект на sentry.io (бесплатно), скопировать DSN в `.env`
- Примечание: backend запускается на хосте (не внутри Docker) для скорости итераций

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ☑ | `frontend/app/` — layout.tsx, page.tsx, App Router структура |
| shadcn/ui | ☑ | `frontend/components/ui/` — Button, Card, Select, Badge, Table |
| Tailwind CSS | ☑ | `frontend/app/page.tsx`, все компоненты — grid, spacing, colors |
| TanStack Query | ☑ | `frontend/components/run-history.tsx` — useQuery, 5s refetchInterval; `run-scenario-form.tsx` — useMutation |
| React Hook Form | ☑ | `frontend/components/run-scenario-form.tsx` — useForm + zodResolver + handleSubmit |
| NestJS | ☑ | `backend/src/` — modules, controllers, services, DI, decorators |
| PostgreSQL | ☑ | Docker Compose postgres:16-alpine, port 5432 |
| Prisma | ☑ | `backend/prisma/schema.prisma` — ScenarioRun model, cuid IDs, metadata Json |
| Sentry | ☑ | `backend/src/main.ts` — Sentry.init(); `scenario.service.ts` — captureException на system_error |
| Prometheus | ☑ | `backend/src/metrics/metrics.service.ts` — 3 метрики: scenarios_total, duration_seconds, http_requests_total |
| Grafana | ☑ | `infra/grafana/dashboards/signal-lab.json` — provisioned, 6 панелей + 2 alert rules |
| Loki | ☑ | `backend/src/logger/loki-logger.service.ts` — winston-loki, labels: `{ app: 'signal-lab' }` |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | Запустить любой сценарий из UI, затем: `curl -s http://localhost:4000/metrics \| grep signal_lab` | `signal_lab_scenarios_total`, `signal_lab_scenario_run_duration_seconds`, `signal_lab_http_requests_total` — все с правильными labels |
| Grafana dashboard | Запустить 3+ сценариев каждого типа, подождать 5–10с, открыть http://localhost:3001 → Dashboards → Signal Lab → Signal Lab Overview | 6 панелей с live данными; Alerting → 2 alert rules (High error rate >30%, Slow request p95 >3s) |
| Loki log | Запустить любой сценарий из UI | Grafana → Explore → Loki datasource → `{app="signal-lab"}` → JSON записи с полями scenarioType, status, durationMs |
| Sentry exception | UI → выбрать "System error — triggers Sentry" → Run | Sentry project → Issues → "Simulated system failure — captured by Sentry" с полным stack trace |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `add-scenario.md` | Пошаговая инструкция добавления нового типа сценария: обновить enum в DTO, handler в ScenarioService со всеми 4 сигналами, опция в форму. ScenarioType — TypeScript enum, не Prisma migration |
| 2 | `add-metric.md` | Добавить prom-client метрику: Counter/Gauge/Histogram в MetricsService, зарегистрировать в private Registry, добавить панель в Grafana dashboard JSON |
| 3 | `add-log.md` | Добавить структурированный лог через LokiLoggerService (не console.log), обязательные поля scenarioId/scenarioType/status/durationMs, проверить в Grafana Loki panel |
| 4 | `orchestrator.md` | Multi-phase PRD executor: 7 фаз, fast/default model маркировка, context.json + .execution/ для resume, review loop до 3 попыток, финальный отчёт |

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `/new-scenario` | Scaffold нового сценария end-to-end: backend handler + frontend form option + чеклист проверки observability |
| 2 | `/check-obs` | Проходит чеклист из 6 проверок: /metrics, Prometheus counter, Sentry exception, Grafana panels, Loki logs, .cursor/ структура |
| 3 | `/add-endpoint` | Scaffold нового NestJS endpoint с полной observability: DTO, service method, controller, Prometheus counter, structured log |
| 4 | `/run-migration` | Безопасно запускает Prisma migration: format → migrate dev → generate → validate |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `pre-commit.sh` | TypeScript typecheck backend + frontend перед каждым коммитом. Поймал реальную проблему с `import type { Response }` во время разработки |
| 2 | `post-save-prisma.sh` | Автоматически `prisma format` при сохранении schema.prisma. Поддерживает schema читаемой, предотвращает diff-шум |

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `00-project-context.mdc` | alwaysApply: true — стек, структура файлов, 5 типов сценариев, non-negotiable правила |
| 2 | `01-backend-nestjs.mdc` | NestJS + Prisma conventions, DI patterns, TypeScript strict, observability-контракт |
| 3 | `02-frontend-nextjs.mdc` | App Router conventions, TanStack Query для server state, RHF для форм, Tailwind only |
| 4 | `03-observability.mdc` | signal_lab_ metric prefix, {app="signal-lab"} Loki label, когда вызывать Sentry |
| 5 | `04-error-handling.mdc` | NestJS exceptions на backend, onError на frontend, правила для 400/500 |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | Prisma | Корректный синтаксис schema, команды миграций — предотвращает галлюцинации Prisma v7 API |
| 2 | NestJS | DI patterns, синтаксис декораторов — предотвращает неверную регистрацию providers |
| 3 | Next.js App Router | Различает server/client компоненты, корректное `use client`, конвенции App Router |
| 4 | Tailwind CSS | Предотвращает придуманные class names, корректные responsive и dark mode варианты |
| 5 | Docker | Multi-stage Dockerfile, healthcheck в compose, volume mount patterns |
| 6 | Prometheus / Grafana | PromQL синтаксис и Grafana dashboard JSON schema — предотвращает невалидные panel configs |

**Что закрыли custom skills, чего нет в marketplace:**
Custom skills покрывают Signal Lab-специфичные workflows: `add-scenario` атомарно подключает все 4 observability-сигнала (ни один marketplace skill не знает наш signal contract); `add-metric` добавляет counter И обновляет Grafana dashboard JSON в одном действии; `add-log` enforces структурированный JSON-формат с обязательными полями, специфичными для этого проекта.

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/orchestrator.md`
- **Путь к context file** (пример): `context.json` (repo root) · `.execution/<timestamp>/context.json` (при запуске через orchestrator)
- **Сколько фаз**: 7 (PRD Analysis → Codebase Scan → Planning → Decomposition → Implementation → Review → Report)
- **Какие задачи для fast model**: rename файлы, seed data, boilerplate YAML configs, заполнение checklist rows, scaffold DTOs, simple UI компоненты, review readonly passes
- **Поддерживает resume**: да — читает `context.json`, пропускает `completedTasks[]`, продолжает с `currentPhase`

---

## Скриншоты / видео

- [x] UI приложения — `docs/screenshots/ui.png`
- [x] Grafana dashboard с данными — `docs/screenshots/grafana.png`
- [x] Loki logs — `docs/screenshots/loki.png`
- [x] Sentry error — `docs/screenshots/sentry.png`

---

## Что не успел и что сделал бы первым при +4 часах

1. **Playwright E2E suite** — автоматизировать полный verification walkthrough: `npm run test:e2e` запускает все 12 проверок в CI без ручных шагов
2. **Demo seed script** — `prisma db seed` для предзаполнения исторических запусков всех типов сценариев, чтобы dashboard выглядел информативно при первом открытии
3. **Full Docker dev mode** — `ts-node-dev` watch внутри backend контейнера с volume mount, чтобы `docker compose up -d` запускал всё включая hot reload, без хостовых процессов

---

## Вопросы для защиты (подготовься)

1. **Почему именно такая декомпозиция skills?**
   Каждый skill = одно повторяемое действие разработчика. Гранулярные skills лучше помещаются в контекстное окно чем один мега-skill. Чёткий "When to Use" предотвращает мисфайры. После new chat test нашли 3 пробела в `add-scenario.md` и исправили — теперь тест проходит.

2. **Какие задачи подходят для малой модели и почему?**
   Fast (Haiku): rename, seed data, boilerplate configs, .env файлы, заполнение чеклиста, review readonly — детерминированные трансформы, ноль архитектурных решений. Default (Sonnet): NestJS service logic, Prometheus wiring, Grafana JSON, написание skills — требуют reasoning о структуре системы.

3. **Какие marketplace skills подключил, а какие заменил custom — и почему?**
   Marketplace покрывает известные API. Custom покрывает Signal Lab-специфичные workflows: добавление сценария с атомарной подводкой всех 4 сигналов, добавление метрики + обновление Grafana в одном действии — этого нет ни в одном marketplace skill.

4. **Какие hooks реально снижают ошибки в повседневной работе?**
   Pre-commit typecheck поймал реальную проблему с `import type { Response }` во время разработки. Post-save prisma format поддерживает schema читаемой, предотвращает случайные diff-шумы.

5. **Как orchestrator экономит контекст по сравнению с одним большим промптом?**
   Один большой промпт деградирует на поздних задачах. Orchestrator разбивает работу на атомарные фазы. `context.json` хранит состояние — новая сессия продолжает без повторного объяснения. Fast задачи в Haiku (дёшево + быстро). Каждая фаза имеет сфокусированный контекст.
