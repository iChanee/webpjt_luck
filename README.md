# 🔮 AI 사주 운세 서비스

OpenAI API를 활용한 AI 기반 사주 운세 웹 애플리케이션입니다. 사용자의 생년월일, 성별, 이름을 입력받아 다양한 운세를 제공합니다.

## 📋 프로젝트 개요

- **프로젝트명**: AI 사주 운세 서비스 (WebLuck)
- **목적**: 전통적인 사주 명리학과 AI 기술을 결합하여 현대적인 운세 서비스 제공
- **기술 스택**: FastAPI + OpenAI GPT-4 + HTML/CSS/JavaScript
- **개발 언어**: Python 3.8+

## 🚀 주요 기능

### 🔮 운세 종류

- **오늘의 운세**: 하루 전체적인 에너지와 주의사항
- **이번 주 운세**: 일주일간의 전체적 흐름
- **이번 달 운세**: 한 달간의 큰 흐름과 변화
- **연애운**: 연인관계 또는 솔로의 만남 가능성
- **금전운**: 수입 증가 가능성과 투자 조언
- **건강운**: 몸의 컨디션과 건강 관리법

### 🎯 핵심 특징

- **띠 자동 계산**: 생년월일로 십이지 띠 자동 산출
- **개인화된 운세**: 사용자별 맞춤형 조언 제공
- **다중 운세 선택**: 최대 6가지 운세 동시 선택 가능
- **고민 상담**: 개인적인 고민사항 입력 및 관련 조언
- **반응형 디자인**: 모바일/데스크톱 환경 최적화

## 🏗️ 아키텍처 구조

```
┌─────────────────────────────────┐
│        � 사용자 브라우저        │
│    (HTML + CSS + JavaScript)    │
└──────────────┬──────────────────┘
               │ HTTP Request/Response
               ▼
┌─────────────────────────────────┐
│       🚀 FastAPI 서버           │
│    • 입력 검증 (Pydantic)      │
│    • 띠 계산 로직              │
│    • API 엔드포인트            │
└──────────────┬──────────────────┘
               │ API Call
               ▼
┌─────────────────────────────────┐
│      🧠 OpenAI GPT-4            │
│    • 운세 생성 AI              │
│    • 개인화된 조언             │
└─────────────────────────────────┘
```

### � 간단한 데이터 흐름

```
사용자 입력 → FastAPI 검증 → 띠 계산 → AI 생성 → 결과 반환
```

## 🔧 기술 스택

### Backend

- **FastAPI**: 고성능 Python 웹 프레임워크
- **OpenAI API**: GPT-4o-mini 모델 활용
- **Pydantic**: 데이터 검증 및 모델링
- **Uvicorn**: ASGI 서버

### Frontend

- **HTML5**: 시멘틱 마크업
- **CSS3**: 그라데이션, 백드롭 필터, 애니메이션
- **Vanilla JavaScript**: DOM 조작 및 API 통신

## 📁 디렉터리 구조

```
webluck/
│
├── main.py                 # FastAPI 메인 애플리케이션
├── requirements.txt        # 의존성 패키지 목록
├── README.md              # 프로젝트 문서
│
├── static/                # 정적 파일 디렉터리
│   ├── index.html         # 메인 페이지
│   ├── css/
│   │   └── style.css      # 스타일시트 (신비로운 테마)
│   └── js/
│       └── script.js      # 프론트엔드 로직
│
└── __pycache__/          # Python 캐시 파일
```

## 🔄 데이터 플로우

### 1. 사용자 입력

```
사용자 → [생년월일, 성별, 이름, 운세종류, 고민사항] → 프론트엔드
```

### 2. 데이터 검증

```
프론트엔드 → FortuneRequest 모델 → Pydantic 검증 → FastAPI
```

### 3. 띠 계산 로직

```python
def get_zodiac(birth_date_str):
    year = int(birth_date_str[:4])
    zodiacs = ["쥐", "소", "호랑이", "토끼", "용", "뱀",
              "말", "양", "원숭이", "닭", "개", "돼지"]
    idx = (year - 4) % 12
    return zodiacs[idx]
```

### 4. AI 프롬프트 생성

```
사용자 정보 + 띠 정보 + 운세 타입 → 구조화된 프롬프트 → OpenAI API
```

### 5. 운세 응답

```
AI 생성 운세 → FortuneResponse 모델 → JSON → 프론트엔드 렌더링
```

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/iChanee/webpjt_luck.git
cd webluck
```

### 2. 가상환경 생성 (권장)

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. 의존성 설치

```bash
pip install -r requirements.txt
```

### 4. OpenAI API 키 설정

`main.py` 파일에서 API 키를 설정하세요:

```python
OPENAI_API_KEY = "your-openai-api-key-here"
```

### 5. 서버 실행

```bash
python main.py
```

또는

```bash
uvicorn main:app --reload --port 5000
```

### 6. 애플리케이션 접속

- 메인 페이지: http://localhost:5000
- API 문서: http://localhost:5000/docs
- 서버 상태: http://localhost:5000/health

## 🔗 API 엔드포인트

### 메인 엔드포인트

| Method | Endpoint             | 설명           |
| ------ | -------------------- | -------------- |
| GET    | `/`                  | 메인 페이지    |
| POST   | `/api/fortune`       | 운세 생성      |
| GET    | `/api/fortune-types` | 운세 타입 목록 |
| GET    | `/health`            | 서버 상태 확인 |

### 운세 생성 API

**POST** `/api/fortune`

**Request Body:**

```json
{
  "birth_date": "1990-01-01",
  "gender": "male",
  "name": "홍길동",
  "concern": "취업이 고민입니다",
  "fortune_types": ["today", "love", "money"]
}
```

**Response:**

```json
{
  "success": true,
  "fortune": "오늘의 종합운세: 1990년 말띠인 홍길동님의 오늘은...",
  "timestamp": "2024-01-01T12:00:00",
  "user_info": {
    "birth_date": "1990-01-01",
    "gender": "male",
    "zodiac": "말",
    "name": "홍길동",
    "fortune_types": ["today", "love", "money"]
  }
}
```

## 🎨 UI/UX 특징

### 디자인 테마

- **신비로운 밤하늘**
- **별빛 효과( CSS 애니메이션으로)**
- **글래스모피즘(백드롭 블러 효과)**
- **반응형 디자인**
