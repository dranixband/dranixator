# Dranix Website — Техническое и функциональное описание

## Концепция
Интерактивная PCB-плата (печатная плата), где пользователи строят связи между "чипами" (песнями), проходя мини-игры. Каждая нода = одна точка на пути. Когда путь достигает заблокированного чипа — он разблокируется и становится новой точкой для строительства.

## Стек
- React 19 + TypeScript + Vite 8 + Rolldown
- Tailwind CSS v4
- lottie-web (анимированные реакции)
- @locator/babel-jsx + @locator/runtime — LocatorJS (клик на элемент → открытие в редакторе, только dev)
- **Backend**: отдельный репозиторий `dranixator_back` (Fastify + Socket.IO, TypeScript) — realtime синхронизация путей/нод, чата, реакций, claims. In-memory state + debounced JSON snapshot на диск
- **Dual-mode sync**: клиент обновляет локальный state оптимистично (сразу, до ответа сервера) и только потом сверяется с сервером через broadcast. Если backend недоступен — доска работает как single player полностью на локальном state, без деградации функциональности

---

## Структура файлов

| Файл/Папка | Назначение |
|------|-----------|
| `src/components/Board.tsx` | Главный компонент: сетка, чипы, SVG-провода, ноды, pan/zoom, реакции, вся логика |
| `src/components/achievements/` | Система достижений: `AchievementsButton`, `AchievementsPanel`, `AchievementCard`, `AchievementPopover`, `AchievementToast(er)`, `CircuitMap`, `RankBadge`, `badgeArt.tsx`, `tokens.ts` |
| `src/achievements/` | Логика достижений: `catalog.ts` (32 ачивки), `engine.ts` (reduce/apply событий), `ranks.ts` (лестница рангов), `types.ts`, `bus.ts` (`track()` — глобальная шина событий), `storage.ts` (localStorage), `AchievementsProvider.tsx`, `achievementsContext.ts` |
| `src/components/livechat/` | Живой чат: `LiveChat`, `ChatWindow`, `ChatHeader`, `MessageList/Item`, `MessageInput`, `EmojiPicker`, `RegistrationModal`, `AvatarBuilder`, `Avatar`, `theme.ts`, `types.ts` |
| `src/hooks/useChat.ts` | Синхронизация сообщений чата через сокет: оптимистичное добавление + reconcile по id через `chat:new`/`chat:history` |
| `src/hooks/useOnlineCount.ts` | Счётчик пользователей онлайн (`online:update` от сервера) |
| `src/hooks/useClaims.ts` | "Кто сейчас строит из какого чипа" — сервер как источник истины, race resolved сервером |
| `src/hooks/useReactions.ts` | Реакции на чипах синхронизируются через сокет (`reactions:update` / `reaction:set`), оптимистичный апдейт |
| `src/hooks/useEscapeToClose.ts` | Общий "modal stack" — Escape/клик-вне закрывает только самый верхний (most-nested) открытый модал |
| `src/hooks/useChatProfile.ts` | Профиль чата (nickname + avatar) в localStorage |
| `src/lib/clientId.ts` | Стабильный per-browser id (localStorage, `crypto.randomUUID()`) — используется для реакций/claims |
| `src/services/socket.ts` | Socket.IO клиент, `VITE_SOCKET_URL` (`.env` / `.env.example`) |
| `src/components/AudioPlayerBar/` | Аудиоплеер внизу экрана: play/pause, seek, volume, SubmitHub CTA, streaming иконки |
| `src/components/AudioPlayerBar/StreamingIcons.tsx` | SVG иконки Spotify / Apple / YouTube Music |
| `src/components/PlayerControls/SeekBar.tsx` | Переиспользуемый прогресс-бар: hover-кружок, таймкод, preview fill, mouse+touch scrubbing |
| `src/components/PlayerControls/VolumeSlider.tsx` | Переиспользуемый слайдер громкости: mute-toggle, mouse+touch drag |
| `src/components/PlayerControls/TimeDisplay.tsx` | Переиспользуемый таймкод `0:00 / 3:35` в жёлтом цвете |
| `src/components/DevTools/` | Dev-панель: Skip reviews, Saboteur, Connect all chips |
| `src/components/ReviewPopup.tsx` | Попап для создания ноды (маршрутизация к мини-играм) |
| `src/components/ChipGallery/` | Галерея чипа — вкладки AUDIO / PHOTO_LOG / VIDEO_FEED |
| `src/components/EmojiRiddle.tsx` | Угадай трек по 3 эмодзи |
| `src/components/SlidingPuzzle.tsx` | Слайдинг-пазл 3×3 с обложкой альбома |
| `src/components/MemoryGame.tsx` | Найди пары карточек (4×2) |
| `src/components/WireTrace.tsx` | Соедини точки по порядку без пересечений |
| `src/components/WordScramble.tsx` | Собери слова из текста песни в правильном порядке |
| `src/components/PixelCanvas.tsx` | Пиксельарт редактор 48×48 (отключён) |
| `src/components/RhythmTap.tsx` | Ритм-тап игра (отключена) |
| `src/constants/songs.ts` | Список песен (SongLabel type — source of truth) |
| `src/constants/submithubLinks.ts` | SubmitHub landing ссылки по песням (добавлять по мере выхода на стримингах) |
| `src/constants/gallery.ts` | Данные галереи — demo, photos: PhotoEntry[], videos, samples[] |
| `src/constants/riddles.ts` | Эмодзи-загадки |
| `src/constants/lyrics.ts` | Тексты песен |
| `src/constants/wordScrambles.ts` | Фразы для Word Scramble + таймкоды аудио |
| `src/index.css` | PCB-стили фона, анимации (chip-unlock, popup-enter, node-hover, node-destroy-*, wire-destroy-flash, player-listen-link flicker) |
| `src/lib/audioCache.ts` | Кеш Audio объектов — preloadAudio / getCachedAudio |
| `public/lottie/` | JSON-анимации для реакций |
| `public/samples/` | Локальный заглушка sample.mp3 (fallback для пэдов) |

---

## Ключевые параметры

| Параметр | Значение | Почему |
|----------|----------|--------|
| `GRID` | 40px | Шаг сетки, все ноды на пересечениях |
| `CHIP_SIZE` | 160px (4 клетки) | Edge = 80px = 2×GRID, идеально по сетке |
| Сетка чипов | 480×480px | 12 шагов между чипами, делится на 40 ровно |
| Направления | 8 (↑ ↗ → ↘ ↓ ↙ ← ↖) | Диагонали + кардинальные |
| Chip zone | ±2 клетки | Заблокировано всё кроме 8 anchor-точек |

---

## Расположение чипов (9 штук, квадратная сетка)

```
Song 2 (-480,-480)    Song 6 (0,-480)    Song 3 (480,-480)
Song 8 (-480,0)       Song 1 (0,0)       Song 9 (480,0)
Song 4 (-480,480)     Song 7 (0,480)     Song 5 (480,480)
```

---

## Типы данных

```typescript
type NodeType = "prompt" | "rhythm" | "drawing" | "riddle" | "puzzle" | "memory" | "wire" | "wordScramble";

// Активные: riddle, puzzle, memory, wire, wordScramble
// Отключённые: prompt, rhythm, drawing

type Review = PromptReview | RhythmReview | DrawingReview | RiddleReview
            | PuzzleReview | MemoryReview | WireReview | WordScrambleReview;

RiddleReview       { type: "riddle";       name: string; correct: boolean }
PuzzleReview       { type: "puzzle";       name: string; moves: number }
MemoryReview       { type: "memory";       name: string; flips: number }
WireReview         { type: "wire";         name: string; lines: number }
WordScrambleReview { type: "wordScramble"; name: string; attempts: number }

PathData {
  sourceChipId: number
  nodes: {x, y}[]
  color: WireColor        // yellow | cyan | red | magenta | green | orange
  reachedChipId?: number
  reviews: (Review | null)[]  // null = нода разрушена саботёром, можно заново заполнить
}

// Галерея
PhotoEntry { src: string; title: string; date: string }

SongGallery {
  demo?: string
  instrumental?: string
  photos: PhotoEntry[]    // было string[], теперь с title и date
  videos: string[]
  description?: string
  samples?: { label: string; src: string }[]
}
```

> Backend хранит `PathData` с дополнительным полем `id` (генерируется сервером, `crypto.randomUUID()`, если не пришёл от клиента) — фронтенд его не использует и не отправляет, полагается на порядок массива при полной замене состояния.

---

## Типы нод (мини-игры)

Тип ноды определяется позицией на сетке (паттерн по `(gx + gy) % 5`). Пользователь не выбирает тип — он задан координатами.

### Активные (5 типов)

- **Riddle** — угадай трек по 3 эмодзи (выбор из 5 вариантов)
- **Puzzle** — слайдинг-пазл 3×3 с обложкой альбома (150 перемешиваний)
- **Memory** — найди 4 пары карточек (лимит переворотов зависит от сложности)
- **Wire Trace** — соедини пронумерованные точки без пересечений (количество точек зависит от сложности)
- **Word Scramble** — собери перемешанные слова из текста песни в правильном порядке

### Word Scramble — детали
- Фиксированные пронумерованные слоты — можно заполнять в любом порядке
- Клик на слово в пуле → выделение, клик на слот → размещение
- Drag-and-drop между слотами (swap) и из пула в слот
- Клик на занятый слот → возврат слова в пул
- Лимит попыток: Easy = 5, Expert = 1
- После неудачной попытки: правильные слова подсвечиваются зелёным, неправильные — красным
- При успехе: воспроизведение фрагмента песни через глобальный плеер с fade-in/out (0.5 сек)
- Во время воспроизведения фрагмента плеер заблокирован (нельзя пауза/закрыть)
- После фрагмента громкость восстанавливается, плеер разблокируется

### Отключённые
- **Prompt** — текстовый ответ на вопрос
- **Rhythm** — тап по ритму
- **Drawing** — пиксельарт

Ghost-ноды показывают иконку типа (?!, пазл, карточки, кривая, Aa).

---

## Система сложности

Сложность определяется расстоянием ноды от чипа-источника (7 уровней):

| Расстояние | Уровень | Название |
|------------|---------|----------|
| 0-1 клетки | 0 | Easy |
| 1-2 | 1 | Easy+ |
| 2-3 | 2 | Medium |
| 3-4 | 3 | Medium+ |
| 4-6 | 4 | Hard |
| 6-8 | 5 | Hard+ |
| 8+ | 6 | Expert |

### Влияние на игры
- **Wire Trace**: 4 → 10 точек
- **Memory**: 22 → 10 макс. переворотов
- **Word Scramble**: 5 → 1 попытка

---

## Медиа хранилище

Все медиафайлы на **Supabase Storage** (free tier, без карты):
- **Аудио (песни)**: `https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/songs/`
- **Аудио (семплы)**: `https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/audio/samples/{song}/`
- **Изображения (пазлы)**: `https://pkghqnvdanjpuipjeain.supabase.co/storage/v1/object/public/images/puzzles/`

Локальные папки `public/songs/` и `public/puzzleImages/` удалены из репозитория.

---

## Аудиоплеер (AudioPlayerBar)

- Фиксированный внизу экрана, 50% ширины десктоп / `calc(100vw - 32px)` мобайл, полупрозрачный с backdrop-blur
- Play/Pause, прогресс-бар с перемоткой, регулятор громкости, кнопка закрытия
- **SeekBar**: hover-кружок на текущей позиции, preview fill, таймкод на курсоре, mouse scrubbing + touch scrubbing
- **VolumeSlider**: mute/unmute по клику на иконку (запоминает предыдущую громкость), mouse + touch drag
- **Мобайл**: 2 ряда — [▶ название / listen link × ] / [время · · громкость]
- **SubmitHub CTA**: `// listen on streaming ↗` + иконки Spotify / Apple / YouTube Music с анимацией broken-lamp (мигает как сломанная лампочка)
- Ссылки на SubmitHub лендинги в `src/constants/submithubLinks.ts` — появляется только если ссылка есть
- Все 9 песен подключены через Supabase CDN
- Preload: Board.tsx загружает все треки на маунт через `preloadAudio()`, `useAudioPlayer` переиспользует кешированные Audio объекты через `getCachedAudio()` — повторных сетевых запросов нет
- Проигрывание фрагментов при успехе в Word Scramble (fade-in/out 0.5 сек, авто-пауза)
- Блокировка контролов плеера во время фрагмента

---

## Реакции на чипах

- Lottie-анимации под каждым разблокированным чипом
- Набор: like, honka, nails, poop, pepeglasses, pepeHug, pepeMusic
- Одна реакция на чип от пользователя (переключение между реакциями)
- Анимация проигрывается при установке реакции
- Счётчик отображается рядом с иконкой
- Синхронизируются через backend (`useReactions`, `reactions:update`/`reaction:set`) — видно реакции других пользователей в реальном времени, идентификация по `clientId` (localStorage)

---

## Live Chat

- Плавающее окно чата (`LiveChat` → `ChatWindow`), draggable + resizable (`useDraggable`, `useResizable`), схлопывается в иконку, адаптируется под мобильную клавиатуру (`useVisualViewport`)
- **Профиль**: nickname + аватар (сгенерированный по seed или загрученное фото до 2MB) — `RegistrationModal` + `AvatarBuilder`, хранится в localStorage (`useChatProfile`). Первый визит → авто-Anonymous со случайным аватаром
- **Сообщения**: реальный realtime через Socket.IO (`useChat`) — оптимистичная отправка, reconcile по id через серверный echo (`chat:new`), история подгружается через `chat:history` при подключении
- Счётчик "online" (`useOnlineCount`) — сколько клиентов подключено к серверу
- Ранг пользователя (см. «Достижения») отображается бейджем рядом с ником в сообщении (`RankBadge`, кроме Civilian — ранг 0 бейдж не показывает)
- Emoji picker, лимит частоты отправки (`useSendThrottle`)
- Трекает события ачивок: `callsign_set` (задан ник), `chat_message` (+ есть ли эмодзи)

---

## Достижения (Achievements)

Полноценная система ачивок, работает полностью на клиенте (не зависит от backend).

- **32 ачивки** в 11 категориях: firstSteps, mastery, volume, paths, sabotage, repair, perfection, social, collection, time, absurd
- 4 тира: bronze / silver / gold / platinum, каждый даёт очки Ω (10/25/50/100 по умолчанию, можно переопределить в `catalog.ts`)
- **Ранги** (`ranks.ts`) — лестница из 8 званий по накопленным Ω: Civilian → Recruit → Private → Signalman → Sapper → Sergeant → Veteran → Commander, плюс секретный ранг **Legend** (все чипы + все ачивки разблокированы)
- **Событийная модель**: `track()` (`src/achievements/bus.ts`) — глобальная шина, вызывается из игровой логики (`Board.tsx`, `LiveChat.tsx`) при событиях (`node_solved`, `path_completed`, `chip_unlocked`, `node_sabotaged`, `node_refilled`, `chat_message`, `panel_opened`, `callsign_set`). `AchievementsProvider` подписывается, прогоняет через `engine.ts` (reduce статистики → apply условий разблокировки), персистит в localStorage (`storage.ts`)
- **UI**:
  - `AchievementsButton` — кнопка входа (левый нижний угол), показывает счётчик разблокировано/всего
  - `AchievementsPanel` — модалка: карта прогресса по категориям (`CircuitMap`, "печатная плата" с dashed-связями), фильтры all/unlocked/locked, секции по категориям, прогресс-бар и Ω/ранг в шапке
  - `AchievementPopover` — деталка одной ачивки (иконка, тир, описание, дата разблокировки)
  - `AchievementToaster`/`AchievementToast` — очередь тостов при новой разблокировке (правый верхний угол, авто-dismiss 5s, клик открывает панель)
  - `badgeArt.tsx` — чистый SVG "IC-chip" бейдж на ачивку; locked → grayscale + 🔒, hidden & locked → `???`
- **Иерархия модалок**: `useEscapeToClose` — общий стек открытых модалок; Escape (или клик вне) закрывает только самый верхний (most-nested), не всю цепочку разом. Используется в `AchievementPopover` и `AchievementsPanel`

---

## Backend / Realtime sync (dranixator_back)

Отдельный репозиторий, соседний с фронтендом: `../dranixator_back`.

- **Стек**: Fastify (HTTP + `/health`) + Socket.IO (WebSocket), TypeScript, in-memory state с debounced JSON snapshot на диск (`DATA_DIR`, переживает restart процесса, но не полноценная БД)
- **События**: `path:create`/`path:update`/`paths:update` (пути на доске), `chat:message`/`chat:history`/`chat:new`, `reaction:set`/`reactions:update`, `claim:acquire`/`claim:release`/`claims:update`, `online:update`
- Сервер — источник истины при множественных клиентах: получив мутацию, валидирует, применяет и broadcast'ит (`io.emit`, включая отправителя) актуальное полное состояние
- **Локальный dev**: `npm run dev` в `dranixator_back` (порт 3001), фронтенд коннектится через `VITE_SOCKET_URL` (`.env`, см. `.env.example`; по умолчанию `http://localhost:3001`, в проде — Railway)
- **Single player fallback**: если backend недоступен, каждая мутация (`Board.tsx`: создание/расширение/refill/sabotage пути) применяется к локальному `paths` state оптимистично, до/независимо от `socket.emit`. Раньше `setPaths` вызывался только внутри слушателя `paths:update`, из-за чего без backend новые ноды не появлялись на доске — теперь это единственный источник истины при отсутствии сервера, и просто быстрый local-first апдейт при его наличии
- Claims/reactions/chat полностью зависят от backend — без него claims всегда пустые (никто никого не блокирует), чат не работает, реакции не синхронизируются между вкладками

---

## Взаимодействие (User Flow)

1. **Клик на разблокированный чип** → начать строить путь
2. Появляются **ghost-ноды** (до 8 направлений, пульсируют, показывают тип)
3. **Клик на ghost** → открывается попап мини-игры (тип определён координатами)
4. **Прохождение мини-игры** → нода создаётся, новые ghost-ноды появляются
5. Если нода попала на **anchor заблокированного чипа** → чип разблокируется (flash-анимация)
6. Разблокированный чип можно кликнуть и строить из него новые пути
7. **Клик на существующую ноду** → просмотр содержимого (ReviewViewer)
8. **Клик на разрушенную ноду** (пустая, пунктирный кружок) → открывается попап для повторного заполнения
9. **Hover на ноде** → появляется светящееся кольцо
10. **Play на чипе** → аудиоплеер внизу экрана
11. **Реакция на чипе** → Lottie-анимация, счётчик

### Ограничения ghost-нод
- Нельзя идти в обратном направлении (противоположное предыдущему шагу)
- Нельзя на занятую клетку
- Нельзя внутрь chip zone (±2 клетки), кроме 8 anchor-точек
- Нельзя возвращаться к anchor-точкам чипа-источника
- Anchor-точки: середины сторон + углы чипа (на расстоянии 80px от центра)

---

## Визуальный стиль

- **Фон**: чёрный (#000) с золотой CSS-сеткой (rgba(249,206,15,0.12))
- **Сетка**: CSS linear-gradient, линии 40×40px
- **Чипы**: текстура микросхемы, логотип DRANIX, золотая обводка при unlock
- **Провода**: SVG polyline + feGaussianBlur glow filter (6 цветов)
- **Активный сегмент пути**: цветное свечение + анимация energy flow (animated stroke-dashoffset)
- **Мёртвый сегмент** (после разрушенной ноды): opacity 0.08, без анимации, без glow
- **Ноды**: SVG-круги с иконками типа; разрушенные — пунктирный кружок с `+`
- **Pan/Zoom**: drag для перемещения; wheel-событие с `ctrlKey` (браузеры так репортят pinch на трекпаде) — зум к курсору; wheel без `ctrlKey` (двухпальцевый скролл на трекпаде или обычное колесо мыши) — pan по `deltaX`/`deltaY`, как в Figma/Miro; pinch-zoom на тачскринах через `touchstart`/`touchmove`
- **Intro**: анимация открытия дверей + zoom-in

---

## Галерея чипа (ChipGallery)

Открывается по кнопке ◈ на чипе. Размер: `min(96vw, 1080px)` × `min(94vh, 820px)`.

**Кнопка закрытия**: Desktop — `× DISCONNECT`, Mobile — `× ESC`. Всегда жёлтая, без hover-эффекта.

**Кнопка ◈ на чипе**:
- Медленно вращает иконку ◈ (9s linear infinite) — привлекает внимание без hover
- Граница кнопки пульсирует жёлтым (3s ease-in-out infinite)
- На hover (только десктоп, `@media (hover: hover)`): border/glow из `.play-btn:hover` накладываются поверх
- Tooltip `// CHIP_DATA` над кнопкой при hover (только десктоп, `@media (hover: hover)`, CSS `::after`, monospace, fade 0.15s)

**Вкладки**: `// AUDIO`, `// PHOTO_LOG`, `// VIDEO_FEED`

Неактивные вкладки мерцают (double-flicker, 6s цикл, сдвинуты по фазе) — подсказывают что можно переключиться. На hover анимация останавливается.

**AUDIO вкладка**:
- Плеер: [▶] + DEMO_RECORDING + SeekBar + время + VolumeSlider — всё в одну строку (десктоп) / время и громкость на второй строке (мобайл)
- SeekBar и VolumeSlider переиспользованы из `src/components/PlayerControls/` (те же компоненты что в AudioPlayerBar)
- Инструментал: одна тонкая строка `INSTRUMENTAL · filename · [⬇ DL]` без лишних отступов
- CSS 3D анимация "DRANIX" (rotateY)
- **SAMPLER_PADS**: 8 MIDI-пэдов (150×150px desktop, 75×75px mobile), 4 колонки
  - Ширина секции равна ширине сетки пэдов, а не всему контейнеру
  - Подпись-инструкция под заголовком меняется в зависимости от режима

**Обычный режим**:
  - Клик по пэду → воспроизведение
  - Клик по играющему пэду → стоп (пауза + сброс в начало)
  - Клик по остановленному → воспроизведение с начала
  - `onPointerDown` + `e.preventDefault()` — единый обработчик для мыши и тача (заменил `onMouseDown` + `onTouchStart`, устранён двойной вызов на мобильных)

**Loop режим** (кнопка `↺ LOOP ON/OFF` над пэдами):
  - Клик по пэду → добавляет в луп (Web Audio API, `AudioBufferSourceNode`, `loop=true`)
  - Новый пэд стартует со смещением `elapsed % buffer.duration` — попадает в фазу текущего лупа, не прерывая остальные
  - Первый пэд фиксирует точку отсчёта `loopStartTimeRef`
  - Клик по активному пэду → только этот пэд останавливается, остальные продолжают
  - Прогресс анимируется через `requestAnimationFrame`
  - Toggle OFF → все петли останавливаются
  - Аудио-буферы декодируются один раз и кешируются в `audioBuffersRef`
  - Looping-пэды визуально: ярче граница, `↺` иконка в углу, другой цвет заливки прогресса

**PHOTO_LOG вкладка**:
- Сетка фотографий типа `PhotoEntry { src, title, date }`
- Каждый тайл: изображение + градиентный оверлей снизу с названием и датой
- Клик → лайтбокс:
  - Показывает полное изображение, название, дату, счётчик (1/5)
  - Кнопки ‹ / › по краям — переключение фото
  - Цикличная навигация (после последнего → первое)
  - Клавиатура: ←/→ навигация, Escape — закрыть
  - Клик вне фото — закрыть
- Пусто → `// NO_PHOTO_LOG`

**VIDEO_FEED вкладка**: iframe-эмбеды. Пусто → `// NO_SIGNAL`.

**Данные семплов** — в `src/constants/gallery.ts`, поле `samples: { label, src }[]`.
Сейчас заполнено только для `de(A)d ins(I)de` (8 семплов). Для `de(A)d ins(I)de` есть 5 тестовых фото.

---

## Режим Саботёр (Dev)

Галочка **Saboteur** в Dev Tools (красный акцент).

**Модалка ноды (ReviewViewer)** всегда имеет кнопку `×` в правом верхнем углу карточки.

При включённом саботёре:
- Путь **не** подключён к чипу → кнопка `⚡ DESTROY NODE`
- Путь **подключён** к чипу → надпись `// completed path cannot be destroyed`

**Процесс уничтожения:**
1. Модалка закрывается мгновенно
2. 520ms анимация (CSS + SVG):
   - Провод от чипа до ноды мигает красным 3 раза (`wire-destroy-flash`)
   - Кольцо-shockwave расширяется ×4.5 и гаснет + второй ripple с задержкой
   - Ядро ноды вспыхивает ×1.9 и схлопывается в 0
   - 8 искр стреляют в 8 направлений и гаснут (SVG `<animate>`)
3. `reviews[nodeIdx]` = `null` — нода становится пустой

**Пустая нода:**
- Визуально: пунктирный кружок + `+`
- Кликабельна → открывает ReviewPopup для повторного заполнения
- Путь и соседние ноды остаются нетронутыми

**Разрыв в PathSVG:**
- `breakIdx` = первый `null` в `reviews`
- До разрыва: цветное свечение + energy flow animation
- После разрыва: провод opacity 0.08, ноды opacity 0.25, анимации нет

---

## Dev Tools

Вынесен в `src/components/DevTools/`. Фиксированная панель: десктоп — левый верхний угол; мобайл — левый нижний, поднимается выше когда открыт аудиоплеер (`bottom-35` vs `bottom-4`).

- **Skip reviews** — пропускает мини-игры при создании нод (ставит заглушку-ревью)
- **Saboteur** — режим уничтожения нод (см. выше)
- **Connect all chips** — заменяет все пути на 8 моковых путей от чипа 1 к каждому из 8 остальных (4 прямых + 4 диагональных), по 5 нод на путь, все чипы сразу разблокируются

---

## Git / Deploy
- Frontend remote: `git@github-personal:dranixband/dranixator.git`
- Backend: отдельный репозиторий `dranixator_back` (соседняя папка, `../dranixator_back`), деплой на Railway (`dranixatorback-production.up.railway.app`)
- Локальный git config репо: `user.name = dranixband`, `user.email = dranixband@gmail.com`
- Глобальный git config (корпоративный): `michael.shiryakov@getmoss.com`
- Деплой фронтенда на GitHub Pages под аккаунтом `dranixband`
- `.env.example` во фронтенде: `VITE_SOCKET_URL` — локально `http://localhost:3001`, в проде — Railway URL

---

## Что реализовано
- [x] Pannable/zoomable доска с touch support
- [x] 9 чипов в квадратной сетке
- [x] Динамическое строительство путей (8 направлений)
- [x] Система unlock: путь доходит до чипа → разблокировка
- [x] 5 активных мини-игр: riddle, puzzle, memory, wire, wordScramble
- [x] Шахматная карта типов нод по координатам (% 5)
- [x] Word Scramble: слоты, drag-and-drop, лимит попыток, подсветка, фрагмент аудио
- [x] Аудиоплеер (play/pause, seek+scrubbing, volume+mute) — Supabase CDN
- [x] SeekBar: hover-кружок, preview fill, таймкод, mouse+touch scrubbing — переиспользуется в обоих плеерах
- [x] VolumeSlider: mute toggle, mouse+touch drag — переиспользуется в обоих плеерах
- [x] SubmitHub CTA в плеере: `// listen on streaming ↗` + Spotify/Apple/YouTube иконки, broken-lamp анимация
- [x] Audio preload кеш — без повторных запросов при нажатии play
- [x] Галерея чипа с вкладками AUDIO / PHOTO_LOG / VIDEO_FEED
- [x] PHOTO_LOG: сетка фото с title/date, лайтбокс с навигацией (стрелки, клавиатура, цикл)
- [x] SAMPLER_PADS — обычный режим + Loop режим (Web Audio API, phase-sync, RAF)
- [x] Проигрывание фрагментов с fade-in/out и блокировкой плеера
- [x] Lottie-реакции на чипах (7 реакций, одна на чип)
- [x] PCB-стилистика
- [x] Анимации (chip unlock, popup entrance, ghost pulsing, energy flow, intro doors)
- [x] Режим Саботёр: уничтожение нод с анимацией (wire flash + shockwave + sparks), повторное заполнение
- [x] Анимация разрыва провода: активный/мёртвый сегменты, тусклые ноды после разрыва
- [x] Система сложности (7 уровней, distance-based)
- [x] Все медиафайлы на Supabase (изображения + аудио)
- [x] Dev Tools вынесен в отдельный компонент, адаптируется под мобайл при открытом плеере
- [x] AudioPlayerBar, DevTools, ChipGallery — вынесены в отдельные компоненты/папки
- [x] Hover-эффекты (play-btn, gallery tooltip) только на десктопе (`@media (hover: hover)`)
- [x] LocatorJS интеграция (dev only): клик на элемент → открытие в редакторе
- [x] Backend (`dranixator_back`): Fastify + Socket.IO, in-memory state + JSON snapshot на диск
- [x] Realtime синхронизация путей/нод между клиентами, с single-player fallback если backend недоступен (оптимистичный local-first апдейт)
- [x] Live-чат: realtime сообщения, online-счётчик, профиль (ник + аватар), rank-бейджи в сообщениях
- [x] Реакции на чипах синхронизированы между клиентами через backend
- [x] Claims — блокировка одновременной постройки из одного чипа двумя пользователями
- [x] Система достижений: 32 ачивки / 11 категорий / 4 тира / 8 рангов + Legend, circuit-map прогресса, тосты, попап, панель
- [x] Иерархия модалок (Escape/клик-вне закрывает только самый верхний открытый модал)
- [x] Pan/zoom на трекпаде различает pinch (`ctrlKey`) и двухпальцевый pan (Figma-style)

## Что НЕ сделано
- [ ] Персистентная БД (Postgres/Prisma) — сейчас только in-memory + JSON snapshot на диск, не переживает multi-instance scaling
- [ ] User authentication
- [ ] SEO + link preview meta
- [ ] Семплы для 8 из 9 песен (только dead заполнен)
- [ ] Реальные фото/видео/инструменталы в галерее (только 5 тестовых фото для dead)
- [ ] Puzzle images для 4 песен (rising, effes, pizda, doshik)
- [ ] Ещё больше мини-игр (quiz, reaction time, Simon Says)
- [ ] Presence-система (курсоры других пользователей) — есть только online-счётчик и claims, без визуализации курсоров
