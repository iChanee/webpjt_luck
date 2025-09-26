# 실행 방법

아래 명령어로 서버를 실행할 수 있습니다.

```bash
uvicorn main:app --reload --port 5000
```

- `main`: FastAPI 앱이 정의된 파이썬 파일명 (`main.py` 등)
- `app`: FastAPI 인스턴스 변수명
- `--reload`: 코드 변경 시 자동으로 서버 재시작 (개발 환경에서 사용)
