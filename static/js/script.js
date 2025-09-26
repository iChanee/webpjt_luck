// static/js/script.js

// DOM 요소들
const elements = {
    fortuneForm: document.getElementById('fortuneForm'),
    generateBtn: document.getElementById('generateBtn'),
    loading: document.getElementById('loading'),
    resultSection: document.getElementById('resultSection'),
    fortuneResult: document.getElementById('fortuneResult'),
    timestamp: document.getElementById('timestamp'),
    status: document.getElementById('status'),
    fortuneTypes: document.getElementById('fortuneTypes')
};

// 전역 상태
let state = {
    selectedFortuneTypes: [],
    isLoading: false
};

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 애플리케이션 초기화 시작');
    await loadFortuneTypes();
    setupEventListeners();
    updateButtonState();
    console.log('✅ 초기화 완료');
});

// 운세 타입 로드
async function loadFortuneTypes() {
    try {
        console.log('📋 운세 타입 로드 중...');
        const response = await fetch('/api/fortune-types');
        const data = await response.json();
        
        if (!elements.fortuneTypes) {
            console.error('❌ fortuneTypes 요소를 찾을 수 없음');
            return;
        }
        
        elements.fortuneTypes.innerHTML = '';
        
        data.fortune_types.forEach(type => {
            const div = document.createElement('div');
            div.className = 'fortune-type';
            div.dataset.type = type.key;
            div.innerHTML = `
                <div class="icon">${type.icon}</div>
                <div>${type.name}</div>
            `;
            div.addEventListener('click', handleFortuneTypeClick);
            elements.fortuneTypes.appendChild(div);
        });
        
        console.log('✅ 운세 타입 로드 완료');
    } catch (error) {
        console.error('❌ 운세 타입 로드 실패:', error);
        createDefaultFortuneTypes();
    }
}

// 기본 운세 타입 생성 (폴백)
function createDefaultFortuneTypes() {
    const defaultTypes = [
        { key: 'today', name: '오늘의 운세', icon: '☀️' },
        { key: 'week', name: '이번 주 운세', icon: '📅' },
        { key: 'month', name: '이번 달 운세', icon: '🌙' },
        { key: 'love', name: '연애운', icon: '💕' },
        { key: 'money', name: '금전운', icon: '💰' },
        { key: 'health', name: '건강운', icon: '🏥' }
    ];
    
    if (!elements.fortuneTypes) return;
    
    elements.fortuneTypes.innerHTML = '';
    
    defaultTypes.forEach(type => {
        const div = document.createElement('div');
        div.className = 'fortune-type';
        div.dataset.type = type.key;
        div.innerHTML = `
            <div class="icon">${type.icon}</div>
            <div>${type.name}</div>
        `;
        div.addEventListener('click', handleFortuneTypeClick);
        elements.fortuneTypes.appendChild(div);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 제출
    if (elements.fortuneForm) {
        elements.fortuneForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('❌ fortuneForm 요소를 찾을 수 없음');
    }
    
    // 입력 필드 변경 (띠 필드 추가)
    const inputFields = ['birthYear', 'birthMonth', 'birthDay', 'gender', 'zodiac'];
    inputFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateButtonState);
        } else {
            console.warn(`⚠️ ${fieldId} 요소를 찾을 수 없음`);
        }
    });
}

// 운세 타입 클릭 처리
function handleFortuneTypeClick(event) {
    const fortuneType = event.currentTarget.dataset.type;
    const element = event.currentTarget;
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        state.selectedFortuneTypes = state.selectedFortuneTypes.filter(t => t !== fortuneType);
    } else {
        element.classList.add('selected');
        state.selectedFortuneTypes.push(fortuneType);
    }
    
    updateButtonState();
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (state.isLoading) return;
    
    await generateFortune();
}

// 버튼 상태 업데이트 (띠 필드 추가)
function updateButtonState() {
    const birthYear = document.getElementById('birthYear')?.value;
    const birthMonth = document.getElementById('birthMonth')?.value;
    const birthDay = document.getElementById('birthDay')?.value;
    const gender = document.getElementById('gender')?.value;
    const zodiac = document.getElementById('zodiac')?.value;
    
    const hasBirthDate = birthYear && birthMonth && birthDay;
    const hasGender = gender;
    const hasZodiac = zodiac;
    const hasFortuneType = state.selectedFortuneTypes.length > 0;
    
    const isValid = hasBirthDate && hasGender && hasZodiac && hasFortuneType;
    
    if (elements.generateBtn) {
        elements.generateBtn.disabled = !isValid || state.isLoading;
    }
}

// 사용자 입력 수집 (띠 필드 추가)
function collectFormData() {
    const birthYear = document.getElementById('birthYear')?.value;
    const birthMonth = document.getElementById('birthMonth')?.value;
    const birthDay = document.getElementById('birthDay')?.value;
    const gender = document.getElementById('gender')?.value;
    const zodiac = document.getElementById('zodiac')?.value;
    const name = document.getElementById('name')?.value?.trim();
    const concern = document.getElementById('concern')?.value?.trim();
    
    return {
        birth_date: `${birthYear}년 ${birthMonth}월 ${birthDay}일`,
        gender: gender,
        zodiac: zodiac,
        name: name || null,
        concern: concern || null,
        fortune_types: state.selectedFortuneTypes
    };
}

// 로딩 상태 설정
function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    
    if (elements.generateBtn) {
        elements.generateBtn.disabled = isLoading;
    }
    
    if (elements.loading) {
        elements.loading.classList.toggle('show', isLoading);
    }
    
    // 로딩 시작할 때만 결과 섹션 숨기기
    if (isLoading) {
        if (elements.resultSection) {
            elements.resultSection.classList.remove('show');
        }
        console.log('🔄 로딩 시작 - 결과 섹션 숨김');
    } else {
        console.log('⏹️ 로딩 종료 - 결과 섹션 유지');
    }
    
    if (!isLoading) {
        updateButtonState();
    }
}

// 운세 생성 API 호출
async function callFortuneAPI(formData) {
    console.log('📡 API 호출 데이터:', formData);
    
    const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    // 응답을 텍스트로 먼저 받아서 확인
    const responseText = await response.text();
    console.log('📨 서버 응답:', responseText);
    
    // JSON 파싱
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (jsonError) {
        console.error('❌ JSON 파싱 오류:', jsonError);
        throw new Error('서버에서 올바르지 않은 응답을 받았습니다.');
    }
    
    if (!response.ok) {
        console.error('❌ API 에러:', data);
        throw new Error(data.detail || `서버 오류 (${response.status})`);
    }
    
    return data;
}

// 성공 결과 표시 (마크다운 제거 기능 포함)
function displaySuccess(data) {
    console.log('✨ displaySuccess 함수 호출됨');
    console.log('📦 전체 데이터:', data);
    console.log('📝 운세 내용:', data.fortune);
    console.log('🎯 결과 요소:', elements.fortuneResult);
    
    // 운세 내용이 있는지 확인
    if (!data.fortune) {
        console.error('❌ 운세 데이터가 비어있음!');
        if (elements.fortuneResult) {
            elements.fortuneResult.textContent = '운세 데이터를 불러올 수 없습니다.';
        }
    } else {
        console.log('✅ 운세 내용을 DOM에 설정 중...');
        if (elements.fortuneResult) {
            // 마크다운 문법 제거
            let cleanText = data.fortune
                .replace(/\*\*(.*?)\*\*/g, '$1')  // **굵은글씨** 제거
                .replace(/###\s*/g, '')           // ### 제목 제거
                .replace(/\*\s*/g, '• ')          // * 를 • 로 변경
                .replace(/^\s*-\s*/gm, '• ');     // - 를 • 로 변경
            
            elements.fortuneResult.textContent = cleanText;
        }
        console.log('✅ DOM에 설정 완료');
    }
    
    // 타임스탬프 표시
    if (elements.timestamp && data.timestamp) {
        const date = new Date(data.timestamp);
        elements.timestamp.textContent = `생성 시간: ${date.toLocaleString('ko-KR')}`;
        console.log('📅 타임스탬프 설정 완료');
    }
    
    // 결과 섹션 표시
    console.log('🖼️ 결과 섹션 표시 중...');
    if (elements.resultSection) {
        elements.resultSection.classList.add('show');
        console.log('🖼️ 결과 섹션 클래스 추가됨:', elements.resultSection.classList);
    }
    
    // 성공 메시지
    showStatus('✨ 운세가 성공적으로 생성되었습니다!', 'success');
    
    // 강제로 화면에 표시되는지 확인
    setTimeout(() => {
        console.log('⏰ 3초 후 결과 확인:');
        if (elements.resultSection) {
            console.log('- 결과 섹션 표시 여부:', elements.resultSection.style.display);
            console.log('- 결과 섹션 클래스:', elements.resultSection.className);
        }
        if (elements.fortuneResult) {
            console.log('- 운세 텍스트:', elements.fortuneResult.textContent.substring(0, 50) + '...');
        }
        
        // 결과로 스크롤
        if (elements.resultSection) {
            elements.resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, 300);
}

// 운세 생성 메인 함수
async function generateFortune() {
    try {
        console.log('🔮 운세 생성 시작');
        
        // 로딩 시작
        setLoadingState(true);
        clearStatus();
        
        // 폼 데이터 수집
        const formData = collectFormData();
        console.log('📋 수집된 데이터:', formData);
        
        // 클라이언트 검증
        const validationError = validateFormData(formData);
        if (validationError) {
            throw new Error(validationError);
        }
        
        // API 호출
        const data = await callFortuneAPI(formData);
        
        // 성공 처리
        displaySuccess(data);
        
        console.log('✅ 운세 생성 완료');
        
    } catch (error) {
        console.error('❌ 운세 생성 오류:', error);
        const errorMessage = getErrorMessage(error);
        showStatus(`❌ ${errorMessage}`, 'error');
    } finally {
        setLoadingState(false);
    }
}

// 폼 데이터 검증 (띠 검증 추가)
function validateFormData(formData) {
    if (!formData.birth_date) {
        return '생년월일을 입력해주세요.';
    }
    
    if (!formData.gender) {
        return '성별을 선택해주세요.';
    }
    
    if (!formData.zodiac) {
        return '띠를 선택해주세요.';
    }
    
    if (!formData.fortune_types || formData.fortune_types.length === 0) {
        return '운세 종류를 하나 이상 선택해주세요.';
    }
    
    return null;
}

// 에러 메시지 정리
function getErrorMessage(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('authentication') || message.includes('unauthorized')) {
        return 'API 키가 잘못되었습니다. 서버 설정을 확인해주세요.';
    } else if (message.includes('rate limit') || message.includes('quota') || message.includes('429')) {
        return 'API 사용량을 초과했습니다. OpenAI 계정의 크레딧을 확인해주세요.';
    } else if (message.includes('network') || message.includes('fetch')) {
        return '네트워크 연결을 확인해주세요.';
    } else if (message.includes('server') || message.includes('500')) {
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    
    return error.message;
}

// 상태 메시지 표시
function showStatus(message, type = 'info') {
    if (!elements.status) return;
    
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;
    elements.status.style.display = 'block';
    
    // 성공 메시지는 3초 후 자동 숨김
    if (type === 'success') {
        setTimeout(() => {
            elements.status.style.display = 'none';
        }, 3000);
    }
}

// 상태 메시지 지우기
function clearStatus() {
    if (!elements.status) return;
    
    elements.status.textContent = '';
    elements.status.className = 'status';
    elements.status.style.display = 'none';
}

// 디버그 정보
console.log(`
🔮 AI 사주 운세 서비스
- 상태 확인: state
- 폼 리셋: resetForm()
- 강제 운세 생성: generateFortune()
- 강제 결과 표시: forceShowResult()
- DOM 요소 확인: checkDOM()
`);

// 폼 리셋 함수
function resetForm() {
    if (elements.fortuneForm) {
        elements.fortuneForm.reset();
    }
    state.selectedFortuneTypes = [];
    document.querySelectorAll('.fortune-type').forEach(type => {
        type.classList.remove('selected');
    });
    if (elements.resultSection) {
        elements.resultSection.classList.remove('show');
    }
    clearStatus();
    updateButtonState();
    console.log('🔄 폼이 리셋되었습니다.');
}

// 강제로 결과 표시 (디버깅용)
function forceShowResult() {
    const testData = {
        success: true,
        fortune: "🌟 테스트 운세입니다! 오늘은 좋은 일이 생길 거예요!",
        timestamp: new Date().toISOString(),
        user_info: { name: "테스트", zodiac: "용" }
    };
    
    console.log('🧪 테스트 데이터로 강제 표시');
    displaySuccess(testData);
}

// DOM 요소들 상태 확인 (디버깅용)
function checkDOM() {
    console.log('🔍 DOM 요소 상태 확인:');
    Object.keys(elements).forEach(key => {
        const element = elements[key];
        console.log(`- ${key}:`, element ? '✅ 존재' : '❌ 없음', element);
    });
    
    console.log('📋 현재 상태:', state);
}