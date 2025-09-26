# main.py
from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from openai import OpenAI
import uvicorn
import os

# 설정 - 여기에 본인의 API 키를 입력하세요
OPENAI_API_KEY = ""

# FastAPI 앱 생성
app = FastAPI(
    title="🔮 AI 사주 운세 서비스",
    description="OpenAI API를 활용한 AI 기반 사주 운세 웹 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# ===== 데이터 모델 (띠 필드 포함) =====
class FortuneRequest(BaseModel):
    birth_date: str = Field(..., description="생년월일")
    gender: str = Field(..., description="성별")
    zodiac: str = Field(..., description="띠")
    name: Optional[str] = Field(None, max_length=50, description="이름")
    concern: Optional[str] = Field(None, max_length=500, description="고민사항")
    fortune_types: List[str] = Field(..., min_items=1, max_items=6, description="운세 타입들")

class FortuneResponse(BaseModel):
    success: bool
    fortune: str
    timestamp: datetime
    user_info: dict

# ===== API 엔드포인트 =====
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """메인 페이지"""
    try:
        with open("static/index.html", "r", encoding="utf-8") as file:
            html_content = file.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html><head><title>🔮 AI 사주 운세</title></head>
        <body>
            <h1>🔮 AI 사주 운세 서비스</h1>
            <p>static/index.html 파일을 생성해주세요.</p>
            <p><a href="/docs">API 문서</a></p>
        </body></html>
        """)

@app.post("/api/fortune", response_model=FortuneResponse)
async def generate_fortune(request: FortuneRequest):
    """AI 운세 생성"""
    try:
        print(f"✅ 운세 생성 요청 - 사용자: {request.name or '익명'}, 띠: {request.zodiac}띠")
        
        # 서버에 설정된 API 키 확인
        if not OPENAI_API_KEY:
            print("❌ API 키가 설정되지 않음")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="서버에 OpenAI API 키가 설정되지 않았습니다."
            )
        
        # 운세 타입 매핑
        fortune_type_names = {
            "today": "오늘의 종합운세",
            "week": "이번 주 운세", 
            "month": "이번 달 운세",
            "love": "연애운",
            "money": "금전운",
            "health": "건강운"
        }
        
        # 선택된 운세 타입 변환
        selected_types = []
        for ft in request.fortune_types:
            type_name = fortune_type_names.get(ft, ft)
            selected_types.append(type_name)
        
        selected_types_str = ", ".join(selected_types)
        print(f"📋 선택된 운세: {selected_types_str}")
        
        # 운세별 가이드
        fortune_guides = {
            "오늘의 종합운세": "하루 전체적인 에너지, 주의사항, 행운의 시간대, 추천 활동",
            "이번 주 운세": "일주일간의 전체적 흐름, 각 요일별 포인트, 주간 목표 달성 가능성",
            "이번 달 운세": "한 달간의 큰 흐름, 상순/중순/하순별 변화, 월간 계획 조언",
            "연애운": "현재 연인관계 또는 솔로의 만남 가능성, 고백/프로포즈 타이밍, 이성에게 어필하는 방법",
            "금전운": "수입 증가 가능성, 투자/저축 조언, 지출 주의사항, 부업 기회, 금전 관리법",
            "건강운": "몸의 컨디션, 주의해야 할 신체 부위, 운동 추천, 음식 조언, 스트레스 관리법"
        }
        
        # 가이드 텍스트 생성
        guide_text = ""
        for type_name in selected_types:
            if type_name in fortune_guides:
                guide_text += f"\n- {type_name}: {fortune_guides[type_name]}"
        
        # 프롬프트 생성
        prompt = f"""당신은 전문 사주 명리학자입니다. 다음 정보를 바탕으로 운세를 봐주세요:

📋 기본 정보:
- 생년월일: {request.birth_date}
- 성별: {request.gender}
- 띠: {request.zodiac}띠
- 이름: {request.name or "고객님"}

🔮 요청하는 운세: {selected_types_str}"""

        if request.concern:
            prompt += f"\n\n💭 현재 고민: {request.concern}"

        prompt += f"""

📌 각 운세별 포함 내용:{guide_text}

다음 조건으로 운세를 봐주세요:
1. 선택된 운세 종류에만 집중하고, 다른 영역은 언급하지 마세요
2. {request.zodiac}띠의 특성을 반영한 구체적이고 실용적인 조언을 제공하세요
3. 일반적인 내용보다는 개인에게 특화된 조언을 해주세요
4. 긍정적이되 현실적인 톤으로 작성해주세요
5. 전체적으로 400-500자 내외로 작성해주세요
6. 마크다운 문법(**, ###, -)을 사용하지 말고 일반 텍스트로만 작성해주세요
7. 굵은 글씨나 제목 형식 없이 자연스러운 문장으로 작성해주세요

이모지를 적절히 사용해서 보기 좋게 만들어주세요."""

        print("🚀 OpenAI API 호출 시작...")
        
        # OpenAI 클라이언트 생성 및 호출
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 친근하고 지혜로운 사주 전문가입니다. 전통적인 사주 이론과 십이지 띠의 특성을 현대적이고 긍정적인 방식으로 해석해주세요."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        fortune_text = response.choices[0].message.content
        print("✨ OpenAI API 호출 완료!")
        print(f"📝 운세 내용 (첫 50자): {fortune_text[:50]}...")
        
        # 응답 데이터 생성
        user_info = {
            "birth_date": request.birth_date,
            "gender": request.gender,
            "zodiac": request.zodiac,
            "name": request.name or "고객님",
            "fortune_types": request.fortune_types
        }
        
        return FortuneResponse(
            success=True,
            fortune=fortune_text,
            timestamp=datetime.now(),
            user_info=user_info
        )
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ 오류 발생: {error_message}")
        
        # 구체적인 오류 타입별 처리
        if "authentication" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="OpenAI API 키 인증에 실패했습니다."
            )
        elif "rate limit" in error_message.lower() or "quota" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API 사용량을 초과했습니다. OpenAI 계정을 확인해주세요."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"서버 내부 오류: {error_message}"
            )

@app.get("/api/fortune-types")
async def get_fortune_types():
    """운세 타입 목록"""
    return {
        "fortune_types": [
            {"key": "today", "name": "오늘의 운세", "icon": "☀️"},
            {"key": "week", "name": "이번 주 운세", "icon": "📅"},
            {"key": "month", "name": "이번 달 운세", "icon": "🌙"},
            {"key": "love", "name": "연애운", "icon": "💕"},
            {"key": "money", "name": "금전운", "icon": "💰"},
            {"key": "health", "name": "건강운", "icon": "🏥"}
        ]
    }

@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "message": "AI 사주 운세 서비스 정상 작동 중",
        "timestamp": datetime.now().isoformat(),
        "api_key_configured": bool(OPENAI_API_KEY)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)