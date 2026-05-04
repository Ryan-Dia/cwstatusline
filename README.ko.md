# festatusline

[English](./README.md) | **한국어**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node ≥18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![i18n](https://img.shields.io/badge/i18n-ko%20%7C%20en%20%7C%20zh-orange)](./README.md)

> Claude Code 상태바(statusline) 도구. 다국어(ko/en/zh), 5종 테마, 7종 프리셋, 22개 위젯, Codex CLI 통합을 지원합니다.

[ccstatusline](https://github.com/sirmalloc/ccstatusline) 을 참고한 파생 버전입니다.

---

## ✨ 주요 특징

- **다국어 지원** — 한국어·영어·중국어를 `FESTATUSLINE_LOCALE` 또는 `$LANG` 으로 자동 감지
- **5종 테마 내장** — default, dracula, nord, gruvbox, tokyo-night
- **22개 위젯** — Claude 사용량, Codex CLI, Git 정보, 피크 시간, 세션 비용, 캐시 통계
- **한국 개발자 친화** — KST 기준 피크 시간대(22:00–04:00), Sonnet 주간 사용량 트래커
- **Codex CLI 통합** — `~/.codex` 파싱으로 GPT 요청 수·레이트 리밋·모델 표시
- **7종 프리셋 + 인터랙티브 TUI** — 수 초 만에 제로 설정 완료
- **Node ≥18 전용** — Bun API 미사용

---

## 🚀 빠른 시작

```bash
# Claude Code 에 자동 등록 (~/.claude/settings.json 에 statusLine 필드 작성)
npx festatusline install

# 인터랙티브 TUI 설정 화면
npx festatusline

# 최초 셋업 위저드 (언어 + 프리셋 선택)
npx festatusline setup

# 데이터 경로 진단
npx festatusline doctor
```

`install` 실행 후에는 Claude Code 프롬프트마다 상태바가 자동으로 표시됩니다.  
경로가 바뀌었을 때는 `install --force` 로 덮어쓸 수 있습니다.

**`~/.claude/settings.json` 에 기록되는 내용:**

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /path/to/dist/cli.js",
    "refreshIntervalMs": 60000
  }
}
```

---

## 🎨 데모

```
Daily   │ Ctx ■■□□□□□□□□  23% (47K/200K)   │ 5h ■■■□□□□□□□  29% (2h 14m)
7days   │ All ■■□□□□□□□□  25% (6d 10h)
gpt-5.5 │ 5h  ■□□□□□□□□□   0% (reset)      │ 7d  ■□□□□□□□□□  10% (1d 1h)
        (spacer)
⚡74%  │ ⏱ 1h 0m │ $0.0042
Sonnet 4.6 │ 🟢 Off-Peak (8h 6m) │ 📁 festatusline(main)
```

> 직접 재현: `npm run build && cat test/data/sample-stdin.json | node dist/cli.js`

실제 출력에는 트루컬러 ANSI 색상이 적용됩니다. 활성 프리셋과 로케일에 따라 결과가 달라집니다.

---

## ⚙️ 설정

설정 파일 경로: `~/.config/festatusline/settings.json` (`$XDG_CONFIG_HOME` 환경변수 적용)

```jsonc
{
  "lines": [
    [{ "id": "dailyUsage" }, { "id": "context" }, { "id": "rateLimit" }],
    [{ "id": "weeklyUsage" }, { "id": "weeklyRateLimit" }],
    [{ "id": "model" }, { "id": "claudePeak" }, { "id": "gitRepo" }]
  ],
  "theme": "default",
  "locale": "ko",
  "weeklyAnchorDay": null,
  "separator": " │ "
}
```

`lines` 는 행(row) 배열 — 각 행이 독립된 stdout 줄로 출력됩니다.  
위젯 항목에 `"color": "#hexcode"` 를 추가하면 색상을 개별 오버라이드할 수 있습니다.

직접 파일을 편집하거나 `npx festatusline` 으로 TUI 화면에서 변경할 수 있습니다.

---

## 🧩 위젯

### Claude (15개)

| id | 출력 예시 | 설명 |
|---|---|---|
| `model` | `Sonnet 4.6` / `Sonnet 4.6 [high]` | 현재 모델명(축약). 노력 레벨이 보통이 아니면 괄호로 표시. |
| `context` | `Ctx ■■□□□□□□□□  23% (47K/200K)` | 컨텍스트 창 바 + 비율 + 토큰 수 |
| `rateLimit` | `5h ■■■□□□□□□□  29% (2h 14m)` | 5시간 레이트 리밋 바 + 리셋까지 남은 시간 |
| `weeklyRateLimit` | `All ■■□□□□□□□□  25% (6d 10h)` | 7일 전체 모델 레이트 리밋 + 리셋까지 남은 시간 |
| `peakTime` | `22:00–05:00` | 최근 14일 기준 피크 사용 시간대 (jsonl 이력 분석) |
| `dailyUsage` | `Daily  ` | 오늘 사용량용 레이블 (다른 위젯과 함께 배치) |
| `dailyReset` | `↺ 04:32` | 자정 기준 일간 리셋까지 카운트다운 |
| `weeklyUsage` | `7days  ` | 주간 사용량용 레이블 |
| `weeklyReset` | `↺ 2d 3h` | 주간 리셋 앵커까지 카운트다운 |
| `sonnetWeeklyUsage` | `S:42K` / `S:1.3M` | 이번 주 Sonnet 모델 누적 토큰 수 |
| `sonnetWeeklyReset` | `S↺ 2d 3h` | Sonnet 주간 리셋까지 카운트다운 |
| `claudePeak` | `🔴 Peak (1h 30m)` / `🟢 Off-Peak (8h 6m)` | KST 22:00–04:00 피크 창 (UTC 13:00–19:00) |
| `sessionCost` | `$0.0042` / `$1.23` | 세션 비용 (USD) |
| `cacheHit` | `⚡74%` | 캐시 히트율 (cache_read / 총 입력 토큰) |
| `cacheTtl` | `⏱ 1h 0m` | 캐시 TTL 잔여 시간 (ephemeral → 1h, 나머지 → 5m) |

### Codex (4개)

| id | 출력 예시 | 설명 |
|---|---|---|
| `gptUsage` | `GPT:12req` | 오늘 Codex CLI 요청 수 (`~/.codex/history.jsonl` 기반) |
| `codexModel` | `gpt-5.5` | Codex 모델명 (`~/.codex/config.toml`, 앞 7자) |
| `codexRateLimit` | `5h ■□□□□□□□□□  0% (reset)` | Codex 5시간 레이트 리밋 (최근 세션 기반) |
| `codexWeeklyRateLimit` | `7d ■□□□□□□□□□  10% (1d 1h)` | Codex 7일 레이트 리밋 |

> `~/.codex` 디렉터리가 없으면 Codex 위젯은 자동으로 숨겨집니다.

### Git (2개)

| id | 출력 예시 | 설명 |
|---|---|---|
| `gitBranch` | `main` | 현재 작업 디렉터리의 브랜치 |
| `gitRepo` | `📁 festatusline(main)` | 리포지토리 이름 + 브랜치 합산 표시 |

### 레이아웃 (1개)

| id | 출력 예시 | 설명 |
|---|---|---|
| `spacer` | ` ` | 공백 하나 — `lines` 배열에서 행 간 시각적 여백으로 활용 |

---

## 🎨 테마

| 테마 | 강조색 | 비고 |
|---|---|---|
| `default` | `#89b4fa` | Catppuccin 계열, 구분자 `│` |
| `dracula` | `#bd93f9` | Dracula 팔레트 |
| `nord` | `#88c0d0` | Arctic Nord 계열 |
| `gruvbox` | `#83a598` | Gruvbox 따뜻한 색조 |
| `tokyo-night` | `#7aa2f7` | Tokyo Night 다크 테마 |

TUI 에서 테마를 바꾸거나 settings.json 의 `"theme"` 필드를 직접 수정할 수 있습니다.

---

## 📦 프리셋

| 프리셋 | 라인 수 | 주요 구성 |
|---|---|---|
| `minimal` | 3 | `dailyUsage` + `context` + `rateLimit` / `weeklyUsage` + `weeklyRateLimit` / `model` + `claudePeak` |
| `lite` | 3 | minimal 과 동일, 3번째 줄에 `gitRepo` 추가 |
| `plus` | 5 | `spacer` 행 + `cacheHit`, `cacheTtl`, `sessionCost` 추가 |
| `pro` | 6 | plus 와 동일, Codex 레이트 리밋 행(`codexModel`, `codexRateLimit`, `codexWeeklyRateLimit`) 추가 |
| `full` | 1 | 모든 Claude 위젯 한 줄 표시 |
| `korean-dev` | 1 | full 과 동일 + `locale: ko` 자동 적용 |
| `multi-cli` | 1 | `model` + `dailyUsage` + `gptUsage` — Claude와 Codex를 한눈에 |

TUI 의 `프리셋 선택` 메뉴 또는 `npx festatusline setup` 으로 적용할 수 있습니다.

---

## 🌏 다국어

지원 로케일: `ko`(한국어), `en`(영어), `zh`(중국어)

**감지 우선순위:**

1. `FESTATUSLINE_LOCALE` 환경변수 (`ko` | `en` | `zh`)
2. `$LANG` 접두 — `ko*` → 한국어, `zh*` → 중국어
3. 설정 파일의 `locale` 필드
4. 최종 폴백: `en`

`FESTATUSLINE_LOCALE` 는 설정 파일보다 항상 우선합니다.

---

## 🔧 환경변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `FESTATUSLINE_LOCALE` | — | 로케일 강제 지정 (`ko` / `en` / `zh`) |
| `CLAUDE_CONFIG_DIR` | `~/.claude` | Claude 데이터 디렉터리 위치 변경 |
| `CODEX_CONFIG_DIR` | `~/.codex` | Codex 데이터 디렉터리 위치 변경 |
| `XDG_CONFIG_HOME` | `~/.config` | 설정 파일 기준 경로 |
| `XDG_CACHE_HOME` | `~/.cache` | 캐시 파일 기준 경로 |
| `LANG` | — | 시스템 로케일 — 자동 감지 폴백 |

---

## 🛠 개발

```bash
npm run build       # dist/ 로 번들
npm run dev         # Watch 모드
npm test            # vitest 단위 테스트
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (Airbnb)
npm run format      # Prettier
```

**런타임에 읽는 데이터 소스:**

- `~/.claude/projects/**/*.jsonl` — 토큰 사용 이력 (mtime 캐시 적용)
- `~/.codex/` — Codex 세션 이력, 설정, 레이트 리밋
- stdin — Claude Code JSON 페이로드 (모델, 컨텍스트, 레이트 리밋, 비용, 작업 디렉터리)

---

## 라이선스

MIT © 2026 [Cheol Won](https://github.com/ryan-dia)

[ccstatusline](https://github.com/sirmalloc/ccstatusline) (sirmalloc) 에서 영감을 받았습니다.
