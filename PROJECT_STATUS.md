# Dranix Website — Техническое и функциональное описание

## Концепция
Интерактивная PCB-плата (печатная плата), где пользователи строят связи между "чипами" (песнями), проходя мини-игры. Каждая нода = одна точка на пути. Когда путь достигает заблокированного чипа — он разблокируется и становится новой точкой для строительства.

## Стек
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- lottie-web (анимированные реакции)
- Клиентский state (без бэкенда)

---

## Структура файлов

| Файл | Назначение |
|------|-----------|
| `src/components/Board.tsx` | Главный компонент: сетка, чипы, SVG-провода, ноды, pan/zoom, аудиоплеер, реакции, вся логика |
| `src/components/ReviewPopup.tsx` | Попап для создания ноды (маршрутизация к мини-играм) |
| `src/components/ChipGallery.tsx` | Галерея чипа — вкладки AUDIO / PHOTO_LOG / VIDEO_FEED |
| `src/components/EmojiRiddle.tsx` | Угадай трек по 3 эмодзи |
| `src/components/SlidingPuzzle.tsx` | Слайдинг-пазл 3×3 с обложкой альбома |
| `src/components/MemoryGame.tsx` | Найди пары карточек (4×2) |
| `src/components/WireTrace.tsx` | Соедини точки по порядку без пересечений |
| `src/components/WordScramble.tsx` | Собери слова из текста песни в правильном порядке |
| `src/components/PixelCanvas.tsx` | Пиксельарт редактор 48×48 (отключён) |
| `src/components/RhythmTap.tsx` | Ритм-тап игра (отключена) |
| `src/constants/songs.ts` | Список песен (SongLabel type — source of truth) |
| `src/constants/gallery.ts` | Данные галереи — demo, photos: PhotoEntry[], videos, samples[] |
| `src/constants/riddles.ts` | Эмодзи-загадки |
| `src/constants/lyrics.ts` | Тексты песен |
| `src/constants/wordScrambles.ts` | Фразы для Word Scramble + таймкоды аудио |
| `src/index.css` | PCB-стили фона, анимации (chip-unlock, popup-enter, node-hover, node-destroy-*, wire-destroy-flash) |
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

## Аудиоплеер

- Встроенный плеер в нижней части экрана (фиксированный, 30% ширины, полупрозрачный с backdrop-blur)
- Play/Pause, прогресс-бар с перемоткой, регулятор громкости
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
- **Pan/Zoom**: drag для перемещения, scroll для зума к курсору, pinch-zoom на мобильных
- **Intro**: анимация открытия дверей + zoom-in

---

## Галерея чипа (ChipGallery)

Открывается по кнопке ◈ на чипе. Размер: `min(96vw, 1080px)` × `min(94vh, 820px)`.

**Кнопка закрытия**: Desktop — `× DISCONNECT`, Mobile — `× ESC`. Всегда жёлтая, без hover-эффекта.

**Вкладки**: `// AUDIO`, `// PHOTO_LOG`, `// VIDEO_FEED`

**AUDIO вкладка**:
- Плеер: компактная одна строка — [▶] слева, по центру лейбл DEMO_RECORDING + прогресс-бар (4px), справа время и громкость
- Инструментал: одна тонкая строка `INSTRUMENTAL · filename · [⬇ DL]` без лишних отступов
- CSS 3D анимация "DRANIX" (rotateY)
- **SAMPLER_PADS**: 8 MIDI-пэдов (150×150px desktop, 75×75px mobile), 4 колонки
  - Ширина секции равна ширине сетки пэдов, а не всему контейнеру
  - Подпись-инструкция под заголовком меняется в зависимости от режима

**Обычный режим**:
  - Клик по пэду → воспроизведение
  - Клик по играющему пэду → стоп (пауза + сброс в начало)
  - Клик по остановленному → воспроизведение с начала
  - `onTouchStart` + `e.preventDefault()` для мобильного мультитача

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

Фиксированная панель в левом верхнем углу. Содержит:

- **Skip reviews** — пропускает мини-игры при создании нод (ставит заглушку-ревью)
- **Saboteur** — режим уничтожения нод (см. выше)
- **Connect all chips** — заменяет все пути на 8 моковых путей от чипа 1 к каждому из 8 остальных (4 прямых + 4 диагональных), по 5 нод на путь, все чипы сразу разблокируются

---

## Git / Deploy
- Remote: `git@github-personal:dranixband/dranixator.git`
- Локальный git config репо: `user.name = dranixband`, `user.email = dranixband@gmail.com`
- Глобальный git config (корпоративный): `michael.shiryakov@getmoss.com`
- Деплой на GitHub Pages под аккаунтом `dranixband`

---

## Что реализовано
- [x] Pannable/zoomable доска с touch support
- [x] 9 чипов в квадратной сетке
- [x] Динамическое строительство путей (8 направлений)
- [x] Система unlock: путь доходит до чипа → разблокировка
- [x] 5 активных мини-игр: riddle, puzzle, memory, wire, wordScramble
- [x] Шахматная карта типов нод по координатам (% 5)
- [x] Word Scramble: слоты, drag-and-drop, лимит попыток, подсветка, фрагмент аудио
- [x] Встроенный аудиоплеер (play/pause, seek, volume) — Supabase CDN
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
- [x] Dev Tools: Skip reviews, Saboteur, Connect all chips

## Что НЕ сделано
- [ ] Бэкенд, БД, персистенция данных
- [ ] User authentication
- [ ] Совместная работа (shared state между пользователями)
- [ ] SEO + link preview meta
- [ ] Семплы для 8 из 9 песен (только dead заполнен)
- [ ] Реальные фото/видео/инструменталы в галерее (только 5 тестовых фото для dead)
- [ ] Puzzle images для 4 песен (rising, effes, pizda, doshik)
- [ ] Ещё больше мини-игр (quiz, reaction time, Simon Says)
