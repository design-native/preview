


class OAuthVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'init';
        this.timeInState = 0;
        this.points = {
            circleA: [],
            circleB: [],
            circleC: [] // Add circle C points
        };
        this.activeLines = new Set();
        this.lines = [];
        this.color = '#333';
        this.glowColor = 'rgba(0, 193,132, 0.2)';
        this.maxPoints = 100;
        this.currentMaxPoints = 0;
        this.pointGrowthRate = 0.5;
        
        this.animation = {
            inProgress: false,
            startTime: 0,
            duration: 1000,
            startPosA: null,
            startPosB: null,
            targetPosA: null,
            targetPosB: null
        };
        
        // lineAnimationState 수정 (생성자 내부)
        this.lineAnimationState = {
            startTime: 0,
            duration: 1500,             // 비교집합 선 기본 duration
            intersectionDuration: 10000, // 교집합 선 duration
            fadeOutDuration: 500,
            interval: 3000,
            lastCreateTime: 0,
            activePoints: {
                A: null,
                B: null
            }
        };

        // 잔상 효과 설정
        this.trailEffect = {
            length: 0.1,  // 잔상 길이 단축 (전체 거리의 10%)
            opacity: 0.5  // 잔상 투명도
        };

        // 고정된 점들을 저장할 배열 추가
        this.fixedPoints = {
            circleA: [],
            circleB: [],
            circleC: [] // Add circle C fixed points
        };


        // 색상 팔레트 추가
        this.colors = {
            default: { r: 0, g: 193, b: 132, a: 0.1 },
            final: [
                { r: 0, g: 193, b: 132 , a: 0.1 }     // 연한 보라
            ]
        };

        
        // 시나리오 관리를 위한 속성 추가
        this.scenario = {
            currentStep: 'init', // init, waiting, step1, step2
            stepStartTime: 0,
            isFirstLoad: true
        };

        // 시나리오 타이밍 설정 (밀리초 단위)
        this.timing = {
            
            //waitingState: 500,   // 대기 상태 유지
            //step1Duration: 0, // 1단계 유지

            step1Transition: 400000, // 1단계 교집합 전환
            step2Duration: 200000000, // 2단계 유지
            step2Transition: 30000 // 2단계 교집합 전환
        };

        // Add text rendering configuration
        this.textConfig = {
            font: '12px Times New Roman',
            color: 'rgba(40, 40, 40, 0)',
            fadeInDuration: 1000,
            fadeStartTime: null
        };


        // 이미지 로드 및 관리를 위한 속성 추가
        this.images = {
            oauth: new Image(),
            perceptron: new Image(),
            oauthC: new Image(),  // C 원용 OAuth3 이미지 추가
            loaded: false
        };
        
        this.images.oauth.src = 'https://oauth3.io/common/resources/OE-brand_logo_OAuth3_6.png';
        this.images.perceptron.src = 'https://oauth3.io/common/resources/OE-brand_logo_PerceptronSync_5.png';
        this.images.oauthC.src = 'https://oauth3.io/common/resources/OE-brand_logo_OAuth3_6.png';  // C 원용 이미지 경로
        
        // 이미지 로드 완료 체크 수정
        Promise.all([
            new Promise(resolve => this.images.oauth.onload = resolve),
            new Promise(resolve => this.images.perceptron.onload = resolve),
            new Promise(resolve => this.images.oauthC.onload = resolve)
        ]).then(() => {
            this.images.loaded = true;
        });
        // 상태 텍스트 설정
        this.statusText = {
            dots: '.',
            dotsTimer: 0,
            dotsInterval: 500,
            fadeOpacity: 0,
            fadeTarget: 0
        };


        // 자동 시나리오 시작
        this.startScenario();
        this.resize();
        this.setupEventListeners();
        this.init();

        // 초기 고정 점 생성
        this.initializeFixedPoints();


        
    // Add labels definition before setupLabelEvents
    this.labels = [
        { id: 'n2', text: 'Net-Zero School', nodeNumber: 2, top: true, distance: 70 },  // 더 높게
        { id: 'n16', text: 'GXCE', nodeNumber: 16, top: true, distance: 100 },          // 기본 높이
        { id: 'n8', text: 'Net-Zero HEROES', nodeNumber: 8, bottom: true, distance: 60 }, // 기본 높이
        { id: 'n10', text: 'Net-Zero Wallet', nodeNumber: 10, bottom: true, distance: 90 } // 더 낮게
    ];
    
    this.hoveredLabel = null;
    this.setupLabelEvents();
    }



// Add new methods
setupLabelEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 1. 레이블 호버 체크
        this.hoveredLabel = this.labels.find(label => {
            const point = this.getNodePosition(label.nodeNumber);
            if (!point) return false;

            // 텍스트 크기 측정을 위한 설정
            this.ctx.font = '14px Times New Roman';
            const textWidth = this.ctx.measureText(label.text).width;
            const textHeight = 14; // 폰트 크기와 동일하게 설정
            const padding = { x: 10, y: 6 };

            // 라벨 박스의 실제 위치 계산
            const boxWidth = textWidth + (padding.x * 2);
            const boxHeight = textHeight + (padding.y * 2);
            const boxX = point.x - boxWidth/2;
            const boxY = label.top ? 
                point.y - label.distance - boxHeight + 20: 
                point.y + label.distance - boxHeight + 20;

            // 연결선 영역도 포함
            const lineGap = 35;
            const lineStartY = label.top ? boxY + boxHeight : boxY;
            const lineEndY = label.top ? 
                point.y - lineGap : 
                point.y + lineGap;
            
            // 박스 영역 체크
            const isInBox = mouseX >= boxX && 
                          mouseX <= boxX + boxWidth && 
                          mouseY >= boxY && 
                          mouseY <= boxY + boxHeight;

            // 연결선 영역 체크 (선 주변 약간의 여유 영역 포함)
            const lineHitboxWidth = 10; // 선 주변 클릭 가능 영역
            const isOnLine = mouseX >= point.x - lineHitboxWidth/2 && 
                           mouseX <= point.x + lineHitboxWidth/2 && 
                           mouseY >= Math.min(lineStartY, lineEndY) && 
                           mouseY <= Math.max(lineStartY, lineEndY);

            return isInBox || isOnLine;
        });

        // 2. 원 영역 호버 체크
        if (!this.hoveredLabel) {
            const distanceA = Math.hypot(mouseX - this.circleA.x, mouseY - this.circleA.y);
            const distanceB = Math.hypot(mouseX - this.circleB.x, mouseY - this.circleB.y);
            const distanceC = Math.hypot(mouseX - this.circleC.x, mouseY - this.circleC.y);

            if (distanceA <= this.circleRadius || 
                distanceB <= this.circleRadius || 
                distanceC <= this.circleRadius) {
                this.hoveredLabel = { id: 'gesia' };
            }
        }

        // 3. data-intro 속성 업데이트
        if (this.hoveredLabel !== this.prevHoveredLabel) {
            this.prevHoveredLabel = this.hoveredLabel;
            if (this.hoveredLabel) {
                document.body.setAttribute('data-intro', this.hoveredLabel.id);
            } else {
                document.body.setAttribute('data-intro', 'gesia');
            }
        }
    });
}

// Update drawLabels method to use the class property
drawLabels() {
   if (!this.labels) return;

   this.ctx.font = '14px Times New Roman';
   this.ctx.textAlign = 'center';
   this.ctx.textBaseline = 'middle';
   
   this.labels.forEach(label => {
       const point = this.getNodePosition(label.nodeNumber);
       if (!point) return;
       
       const textWidth = this.ctx.measureText(label.text).width;
       const padding = { x: 10, y: 6 };
       
       // 박스 위치 계산
       const boxX = point.x - textWidth/2 - padding.x;
       const boxY = label.top ? 
            point.y - label.distance - padding.y : 
            point.y + label.distance - padding.y;

       const boxWidth = textWidth + padding.x * 2;
       const boxHeight = 14 + padding.y * 2;
       
       // N2 등의 텍스트가 가려지지 않도록 선 분리
       const lineGap = 35; // 텍스트와 선 사이 간격
       const lineStartY = label.top ? boxY + boxHeight : boxY;
       let  lineEndY = label.top ? point.y : point.y;

       // N8, N10의 경우 아래로 lineGap만큼 이동
       if (label.id === 'n8' || label.id === 'n10') {
           lineEndY += lineGap;
       } else {
           lineEndY -= lineGap;
       }

       
       // 외곽선 그리기
        this.ctx.strokeStyle = this.hoveredLabel?.id === label.id ? 
        'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, .5)';
       this.ctx.lineWidth = 1.5;
       this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

       // 연결선 그리기
       this.ctx.beginPath();
       this.ctx.moveTo(point.x, lineStartY);
       this.ctx.lineTo(point.x, lineEndY);
       this.ctx.stroke();
       
       // 텍스트 그리기
       this.ctx.fillStyle = this.hoveredLabel?.id === label.id ? 
        'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, .5)';
       this.ctx.fillText(label.text, point.x, label.top ? boxY + boxHeight/2 : boxY + boxHeight/2);
   });
}

getNodePosition(nodeNumber) {
    const point = this.fixedPoints.circleB.find(p => p.number === nodeNumber);
    if (!point) return null;
    
    return {
        x: this.circleB.x + this.circleRadius * Math.cos(point.angle),
        y: this.circleB.y + this.circleRadius * Math.sin(point.angle)
    };
}

// drawStatusText 메서드 수정
drawStatusText() {
    const ratio = this.getIntersectionRatio();
    const percentage = Math.round(ratio * 100);
    const currentTime = performance.now();
    const circleDiameter = this.circleRadius * 2;
    const isDeviceType = document.body.classList.contains('type-device');
    
    // 디바이스 타입에 따른 폰트 크기 설정
    const mainFontSize = isDeviceType ? '10px' : '14px';
    const percentageFontSize = isDeviceType ? '14px' : '20px';
    const evolutionFontSize = isDeviceType ? '12px' : '16px';

    // 10~70% 상태에서만 진행 중 텍스트 표시
    if (ratio > 0.1 && ratio < 0.99) {
        if (currentTime - this.statusText.dotsTimer > this.statusText.dotsInterval) {
            this.statusText.dots = this.statusText.dots.length >= 3 ? '.' : this.statusText.dots + '.';
            this.statusText.dotsTimer = currentTime;
        }

        this.statusText.fadeTarget = 1;
    } else {
        this.statusText.fadeTarget = 0;
    }
    
    this.statusText.fadeOpacity += (this.statusText.fadeTarget - this.statusText.fadeOpacity) * 0.1;

    // 100% 상태 텍스트
    if (ratio >= 0.35 && ratio < 0.99 ) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = `rgba(40, 40, 40, ${this.statusText.fadeOpacity})`;
        
        this.ctx.font = `${mainFontSize} Times New Roman`;
        const baseY = this.circleA.y * 1.8;
        
        // 진행 텍스트와 ... 사이를 단일 스페이스로 설정
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Rollup syncing in progress${this.statusText.dots}`, 
            this.canvas.width/2, 
            baseY);
        
        this.ctx.font = `${percentageFontSize} Times New Roman`;
        this.ctx.fillText(`${percentage}%`,
            this.canvas.width/2,
            baseY + 25);
    } else if (ratio >= 0.99) {
        this.ctx.fillStyle = `rgba(40, 40, 40, 1)`;
        this.ctx.textAlign = 'center';
        
        const spacing = 25;
        const baseY = this.circleA.y + circleDiameter * 0.17;
        
        this.ctx.font = `${mainFontSize} Times New Roman`;
        this.ctx.fillText('Rollup sync completed.',
            this.canvas.width/2,
            baseY);
            
        this.ctx.font = `${percentageFontSize} Times New Roman`;
        this.ctx.fillText('100%',
            this.canvas.width/2,
            baseY + spacing - 1);
            
        // evolution 텍스트도 동일하게 단일 스페이스 적용
        this.ctx.font = `${evolutionFontSize} Times New Roman`;
        this.ctx.fillText(`Preparing for evolution${this.statusText.dots}`,
            this.canvas.width/2,
            baseY + spacing * 2 - 10);
    } else {
        if (this.statusText.fadeOpacity > 0.01) {
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = `rgba(40, 40, 40, ${this.statusText.fadeOpacity})`;
            
            this.ctx.font = `${mainFontSize} Times New Roman`;

            const baseY = this.circleA.y * 1.8;
            
            // 진행 텍스트와 ... 사이를 단일 스페이스로 설정
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Rollup syncing in progress${this.statusText.dots}`, 
                this.canvas.width/2, 
                baseY);
            
            this.ctx.font = `${percentageFontSize} Times New Roman`;
            this.ctx.fillText(`${percentage}%`,
                this.canvas.width/2,
                baseY + 25);
        }
    }
}
drawImages() {
   const ratio = this.getIntersectionRatio();
   this.ctx.textAlign = 'center';
   this.ctx.textBaseline = 'middle';
   this.ctx.fillStyle = 'rgba(40, 40, 40, 1)';

   const transitionThreshold = 0.75;
   
   const minTextSpacing = this.circleRadius * 0.5; // Adjust this value as needed

   if (ratio >= transitionThreshold) {
       const transition = (ratio - transitionThreshold) / (1 - transitionThreshold);
       const easing = this.easeInOutQuad(transition);
       
       const centerX = this.canvas.width / 2;
       const centerY = this.circleA.y;
       const minSpacing = this.circleRadius * 0.15;
       const spacing = Math.max(minSpacing, this.circleRadius * 0.3 * (1 - easing));

       const co2X = Math.min(centerX - spacing, centerX - minTextSpacing);
       const zeroX = centerX;
       const cocX = Math.max(centerX + spacing, centerX + minTextSpacing);

       this.ctx.font = 'bold 32px Times New Roman';       
       this.ctx.fillText('CO2', co2X, centerY - 10);
       this.ctx.font = 'bold 40px Times New Roman';  
       this.ctx.fillText('0', zeroX, centerY - 10);
       this.ctx.font = 'bold 32px Times New Roman';
       this.ctx.fillText('COC', cocX, centerY - 10);

       this.ctx.font = '14px Times New Roman';
       this.ctx.fillText('Carbon Emission', co2X, centerY + 15);
       this.ctx.fillText('Net-Zero', zeroX, centerY + 15);
       this.ctx.fillText('Carbon Offset', cocX, centerY + 15);
   } else {
       this.ctx.font = 'bold 32px Times New Roman';
       this.ctx.fillText('CO2', this.circleA.x, this.circleA.y - 10);
       this.ctx.font = 'bold 40px Times New Roman';
       this.ctx.fillText('0', this.circleB.x, this.circleB.y - 10);
       this.ctx.font = 'bold 32px Times New Roman';
       this.ctx.fillText('COC', this.circleC.x, this.circleC.y - 10);

       this.ctx.font = '14px Times New Roman';  
       this.ctx.fillText('Carbon Emission', this.circleA.x, this.circleA.y + 15);
       this.ctx.fillText('Net-Zero', this.circleB.x, this.circleB.y + 15);
       this.ctx.fillText('Carbon Offset', this.circleC.x, this.circleC.y + 15);
   }
}
// 이징 함수 추가
easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// 선형 보간 함수 추가
lerp(start, end, t) {
   return start + (end - start) * t;
}

    // 랜덤하게 활성화할 점들 선택
selectRandomActivePoints() {
    // 각 원의 비교집합 점들 찾기
    const nonIntersectionPoints = {
        A: this.fixedPoints.circleA.filter(point => 
            !this.isPointInIntersection(this.calculateFixedPointPosition(point, this.circleA))),
        B: this.fixedPoints.circleB.filter(point => 
            !this.isPointInIntersection(this.calculateFixedPointPosition(point, this.circleB))),
        C: this.fixedPoints.circleC.filter(point => 
            !this.isPointInIntersection(this.calculateFixedPointPosition(point, this.circleC)))
    };

    // 각 원에서 하나씩 랜덤 선택
    this.lineAnimationState.activePoints = {
        A: nonIntersectionPoints.A.length > 0 ? 
            nonIntersectionPoints.A[Math.floor(Math.random() * nonIntersectionPoints.A.length)] : null,
        B: nonIntersectionPoints.B.length > 0 ? 
            nonIntersectionPoints.B[Math.floor(Math.random() * nonIntersectionPoints.B.length)] : null,
        C: nonIntersectionPoints.C.length > 0 ? 
            nonIntersectionPoints.C[Math.floor(Math.random() * nonIntersectionPoints.C.length)] : null
    };
}


    // 고정된 점들 초기화
    initializeFixedPoints() {
        const angleStep = (Math.PI * 2) / 16;

        // Existing A and B circle points initialization remains the same
        ['A', 'B', 'C'].forEach(circleName => {
            const points = [];
            for (let i = 0; i < 16; i++) {
                const angle = -i * angleStep - Math.PI/2;
                points.push({
                    angle: angle,
                    circle: circleName,
                    number: i + 1,
                    opacity: 1
                });
            }
            this.fixedPoints[`circle${circleName}`] = points;
        });
    }
// drawPointText 함수 수정
drawPointText() {
    const ratio = this.getIntersectionRatio();
    const currentTime = performance.now();

    // 페이드 효과 설정
    if (ratio >= 0.99 && this.textConfig.fadeStartTime === null) {
        this.textConfig.fadeStartTime = currentTime;
    } else if (ratio < 0.99) {
        this.textConfig.fadeStartTime = null;
    }

    const fadeProgress = this.textConfig.fadeStartTime ? 
        Math.min((currentTime - this.textConfig.fadeStartTime) / this.textConfig.fadeInDuration, 1) : 1;

    this.ctx.font = '11px Times New Roman';
        
    // 두 원의 점들에 대해 텍스트 그리기
    [
        { points: this.fixedPoints.circleA, circle: this.circleA, prefix: 'N' },
        { points: this.fixedPoints.circleB, circle: this.circleB, prefix: 'N' },
        { points: this.fixedPoints.circleC, circle: this.circleC, prefix: 'N' }
    ].forEach(({ points, circle, prefix }) => {
        points.forEach(point => {
            const pos = this.calculateFixedPointPosition(point, circle);
            
            // 각도 정규화 (0 ~ 2π)
            let angle = point.angle;
            while (angle < 0) angle += 2 * Math.PI;
            
            // 기본 텍스트 오프셋
            let textOffset = this.circleRadius * 0.05;
            
            // 특정 점들에 대한 추가 조정
            const specificAdjustments = {
                3: { offsetMultiplier: 0.08, extraX: -10, extraY: 10 },   // N3
                7: { offsetMultiplier: 0.08, extraX: -10, extraY: -10 },   // N7
                11: { offsetMultiplier: 0.08, extraX: 5, extraY: -2 },   // N1
                15: { offsetMultiplier: 0.08, extraX: 10, extraY: 10 }    // N15
            };
            
            // 특정 점에 대한 조정 적용
            if (specificAdjustments[point.number]) {
                const adjustment = specificAdjustments[point.number];
                textOffset = this.circleRadius * adjustment.offsetMultiplier;
            }

            // 각도에 따른 텍스트 위치 계산
            let textX = pos.x + Math.cos(angle) * textOffset;
            let textY = pos.y + Math.sin(angle) * textOffset;
            
            // 특정 점들에 대한 추가 오프셋 적용
            if (specificAdjustments[point.number]) {
                textX += specificAdjustments[point.number].extraX;
                textY += specificAdjustments[point.number].extraY;
            }
            
            // 텍스트 방향 조정을 위한 각도 계산
            const textAngle = (angle + Math.PI * 2) % (Math.PI * 2);
            
            // 각도에 따른 텍스트 정렬 조정
            if (textAngle <= Math.PI * 0.25 || textAngle > Math.PI * 1.75) {
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'middle';
            } else if (textAngle > Math.PI * 0.25 && textAngle <= Math.PI * 0.75) {
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
            } else if (textAngle > Math.PI * 0.75 && textAngle <= Math.PI * 1.25) {
                this.ctx.textAlign = 'right';
                this.ctx.textBaseline = 'middle';
            } else {
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
            }

            // 기본 미세 조정 오프셋
            let additionalOffsetX = 0;
            let additionalOffsetY = 0;
            const offsetAmount = 3;

            if (textAngle <= Math.PI * 0.25 || textAngle > Math.PI * 1.75) {
                additionalOffsetX = offsetAmount;
            } else if (textAngle > Math.PI * 0.25 && textAngle <= Math.PI * 0.75) {
                additionalOffsetY = offsetAmount;
            } else if (textAngle > Math.PI * 0.75 && textAngle <= Math.PI * 1.25) {
                additionalOffsetX = -offsetAmount;
            } else {
                additionalOffsetY = -offsetAmount;
            }

            // ratio에 따른 텍스트 및 투명도 설정
            if (ratio >= 0.99) {
                // 새로운 텍스트 페이드 인 (A원에서만)
                if ( point.circle === 'A') {
                    this.ctx.fillStyle = `rgba(40, 40, 40, ${fadeProgress})`;
                    const text = `L1(N${point.number}) : L2(N${point.number}) : L3(N${point.number})`;
                    this.ctx.fillText(text, textX + additionalOffsetX, textY + additionalOffsetY);
                }
            } else {
                // 진행 상태 - 번호만 표시
                this.ctx.fillStyle = 'rgba(40, 40, 40, 1)';
                const text = `${prefix}${point.number}`;
                this.ctx.fillText(text, textX + additionalOffsetX, textY + additionalOffsetY);
            }
        });
    });
}

    // 고정 점의 현재 위치 계산
    calculateFixedPointPosition(point, circle) {
        return {
            x: circle.x + circle.radius * Math.cos(point.angle),
            y: circle.y + circle.radius * Math.sin(point.angle),
            circle: point.circle,
            opacity: point.opacity
        };
    }

    // isPointInIntersection 메서드 수정
    isPointInIntersection(point) {
        // point.circle이 어느 원에 속하는지에 따라 다른 원들과의 교집합 체크
        switch(point.circle) {
            case 'A':
                // A원의 점이 B원이나 C원과 겹치는지 확인
                return this.isPointInCircle(point, this.circleB) || this.isPointInCircle(point, this.circleC);
            case 'B':
                // B원의 점이 A원이나 C원과 겹치는지 확인
                return this.isPointInCircle(point, this.circleA) || this.isPointInCircle(point, this.circleC);
            case 'C':
                // C원의 점이 A원이나 B원과 겹치는지 확인
                return this.isPointInCircle(point, this.circleA) || this.isPointInCircle(point, this.circleB);
            default:
                return false;
        }
    }

    // 색상 블렌딩 함수
    blendColors(color1, color2, ratio) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * ratio),
            g: Math.round(color1.g + (color2.g - color1.g) * ratio),
            b: Math.round(color1.b + (color2.b - color1.b) * ratio)
        };
    }
    // RGBA 문자열 변환 함수
    getRGBAString(color, alpha) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }


// 시나리오 시작
startScenario() {
    this.scenarioCurrentStep = 'init';
    this.scenarioStepStartTime = performance.now();
}

// 시나리오 업데이트
updateScenario() {
    const now = performance.now();
    const elapsedInStep = now - this.scenarioStepStartTime;

    switch(this.scenarioCurrentStep) {
        case 'init':
            if (elapsedInStep >= 500) { // 3초 대기
                this.setState('waiting');
                this.scenarioCurrentStep = 'waiting';
                this.scenarioStepStartTime = now;
            }
            break;

        case 'waiting':
            if (elapsedInStep >= 5000) { // 3초 대기
                this.setState('step1');
                this.scenarioCurrentStep = 'step1';
                this.scenarioStepStartTime = now;
            }
            break;

        case 'step1':
            if (elapsedInStep >= 1000) { // 3초 진행
                this.setState('step2');
                this.scenarioCurrentStep = 'step2';
                this.scenarioStepStartTime = now;
            }
            break;

        case 'step2':
            const intersectionRatio = this.getIntersectionRatio();
            break;

    }
}
   

    easeOutQuint(x) {
        return 1 - Math.pow(1 - x, 5);
    }


    calculateTargetDistance(state) {
        switch(state) {
            case 'init':
                return this.circleRadius * 2;  // 기존 2.0에서 축소
            case 'waiting':
                return this.circleRadius * 2;  // 기존 2.0에서 축소
            case 'step1':
                return this.circleRadius * 1.4;  // 기존 1.6에서 축소
            case 'step2':
                return this.circleRadius * 0;
            default:
                return this.circleRadius * 2;  // 기존 2.05에서 축소
        }
    }

resize() {
    const browserHeight = window.innerHeight;
    const aspectRatio = 13/9;

    const minWidth = 700; // 최소 너비 설정
    const minheight = 600; // 최소 너비 설정

    if (window.innerWidth < 800) {
        this.canvas.height = Math.max(window.innerWidth / aspectRatio, minheight )
    }else {
        this.canvas.height = Math.min(Math.max(window.innerWidth / aspectRatio, minheight ), browserHeight *0.6);  // 브라우저 높이의 80%

    }
    const maxRadius = Math.min(
        window.innerWidth * 0.3,  // 높이의 25%로 제한 (기존 35%)
        this.canvas.height * 0.25    // 너비의 15%로 제한 (기존 25%)
    );

    // 원의 크기를 더 작게 조정
    // 원 3개가 모두 들어갈 수 있도록 여유 공간 확보
    this.canvas.width = Math.max(minWidth, maxRadius * 3.5 * 2 );;
    


    this.circleRadius = maxRadius;
    this.initCirclePositions();
}
    initCirclePositions() {
        const spacing = this.calculateTargetDistance(this.state);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // B원을 중앙에 고정
        this.circleB = {
            x: centerX,
            y: centerY,
            radius: this.circleRadius
        };
        
        // A원은 B원 기준으로 왼쪽에 위치
        this.circleA = {
            x: centerX - spacing,
            y: centerY,
            radius: this.circleRadius
        };
        
        // C원은 B원 기준으로 오른쪽에 위치
        this.circleC = {
            x: centerX + spacing,
            y: centerY,
            radius: this.circleRadius
        };
    }

    init() {
        this.initCirclePositions();
        this.animate();
    }

    setupEventListeners() {
        document.getElementById('waitingBtn').addEventListener('click', () => {
            this.setState('waiting');
        });

        document.getElementById('step1Btn').addEventListener('click', () => {
            this.setState('step1');
        });

        document.getElementById('step2Btn').addEventListener('click', () => {
            this.setState('step2');
        });
    }

    // setState 메서드도 수정
setState(newState) {
    const prevState = this.state;
    this.state = newState;

    this.animation.duration = (() => {
        switch(newState) {
            case 'step1': return this.timing.step1Transition;
            case 'step2': return this.timing.step2Transition;
            default: return 1000;
        }
    })();

    this.timeInState = 0;
    this.currentMaxPoints = 0;

    const centerX = this.canvas.width / 2;
    const targetDistance = this.calculateTargetDistance(newState);

    // 애니메이션 시작 위치 저장
    this.animation.startPosA = { x: this.circleA.x, y: this.circleA.y };
    this.animation.startPosB = { x: this.circleB.x, y: this.circleB.y };
    this.animation.startPosC = { x: this.circleC.x, y: this.circleC.y };

    if (newState === 'step2') {
        // step2에서는 모든 원이 B원 위치로 이동
        this.animation.targetPosA = {
            x: centerX,
            y: this.canvas.height / 2
        };
        this.animation.targetPosB = {
            x: centerX,
            y: this.canvas.height / 2
        };
        this.animation.targetPosC = {
            x: centerX,
            y: this.canvas.height / 2
        };
    } else {
        // 다른 상태에서는 B원 중심으로 좌우에 배치
        this.animation.targetPosA = {
            x: centerX - targetDistance,
            y: this.canvas.height / 2
        };
        this.animation.targetPosB = {
            x: centerX,
            y: this.canvas.height / 2
        };
        this.animation.targetPosC = {
            x: centerX + targetDistance,
            y: this.canvas.height / 2
        };
    }

    this.animation.inProgress = true;
    this.animation.startTime = performance.now();
    this.animation.prevState = prevState;
}


    // updateCirclePositions 메서드 수정
    updateCirclePositions(currentTime) {
        if (!this.animation.inProgress) return;

        const elapsed = currentTime - this.animation.startTime;
        const progress = Math.min(elapsed / this.animation.duration, 1);
        const easing = this.easeOutQuint(progress);

        // Update positions for all circles
        this.circleA.x = this.animation.startPosA.x + (this.animation.targetPosA.x - this.animation.startPosA.x) * easing;
        this.circleA.y = this.animation.startPosA.y + (this.animation.targetPosA.y - this.animation.startPosA.y) * easing;
        
        this.circleB.x = this.animation.startPosB.x + (this.animation.targetPosB.x - this.animation.startPosB.x) * easing;
        this.circleB.y = this.animation.startPosB.y + (this.animation.targetPosB.y - this.animation.startPosB.y) * easing;
        
        this.circleC.x = this.animation.startPosC.x + (this.animation.targetPosC.x - this.animation.startPosC.x) * easing;
        this.circleC.y = this.animation.startPosC.y + (this.animation.targetPosC.y - this.animation.startPosC.y) * easing;

        if (progress >= 1) {
            this.animation.inProgress = false;
        }
    }


    getDistance() {
        return Math.hypot(
            this.circleB.x - this.circleA.x,
            this.circleB.y - this.circleA.y
        );
    }


    getIntersectionRatio() {
        const distance = this.getDistance();
        const maxDistance = this.circleRadius * 2;
        
        if (distance >= maxDistance) return 0;
        if (distance <= 0) return 1;
        
        return 1 - (distance / maxDistance);
    }

    adjustPointToCircle(point, circle) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        const currentRadius = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        return {
            x: circle.x + circle.radius * Math.cos(angle),
            y: circle.y + circle.radius * Math.sin(angle),
            circle: point.circle,
            opacity: point.opacity
        };
    }



    // drawCircle 함수 단순화
    drawCircle(x, y, radius) {
         this.ctx.strokeStyle = 'rgba(40, 40, 40, 1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

drawIntersection() {
    // A∩B 교집합 그리기
    this.drawIntersectionArea(this.circleA, this.circleB);
    // B∩C 교집합 그리기
    this.drawIntersectionArea(this.circleB, this.circleC);
}

// 교집합 영역 그리기 함수 추가
drawIntersectionArea(circle1, circle2) {
    const d = Math.hypot(circle2.x - circle1.x, circle2.y - circle1.y);
    if (d >= this.circleRadius * 2 || d <= 0) return;

    const a = (this.circleRadius * this.circleRadius - this.circleRadius * this.circleRadius + d * d) / (2 * d);
    const h = Math.sqrt(this.circleRadius * this.circleRadius - a * a);

    const px = circle1.x + a * (circle2.x - circle1.x) / d;
    const py = circle1.y + a * (circle2.y - circle1.y) / d;

    const intersectionPoints = [
        {
            x: px + h * (circle2.y - circle1.y) / d,
            y: py - h * (circle2.x - circle1.x) / d
        },
        {
            x: px - h * (circle2.y - circle1.y) / d,
            y: py + h * (circle2.x - circle1.x) / d
        }
    ];


    this.ctx.fillStyle = 'rgba(0, 193, 132, 0.1)';;
    this.ctx.beginPath();
    this.ctx.moveTo(intersectionPoints[0].x, intersectionPoints[0].y);

    let angle1 = Math.atan2(intersectionPoints[0].y - circle1.y, intersectionPoints[0].x - circle1.x);
    let angle2 = Math.atan2(intersectionPoints[1].y - circle1.y, intersectionPoints[1].x - circle1.x);
    if (angle2 < angle1) angle2 += 2 * Math.PI;
    this.ctx.arc(circle1.x, circle1.y, this.circleRadius, angle1, angle2);

    let angle3 = Math.atan2(intersectionPoints[1].y - circle2.y, intersectionPoints[1].x - circle2.x);
    let angle4 = Math.atan2(intersectionPoints[0].y - circle2.y, intersectionPoints[0].x - circle2.x);
    if (angle4 < angle3) angle4 += 2 * Math.PI;
    this.ctx.arc(circle2.x, circle2.y, this.circleRadius, angle3, angle4);


    this.ctx.closePath();
    this.ctx.fill();
}

    // drawPoint 함수 단순화
    drawPoint(point) {
        const color = `rgba(40, 40, 40, ${point.opacity})`;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }




    // drawLine 메서드 수정
    drawLine(line) {
        const isValidCoordinate = (x, y) => {
            return Number.isFinite(x) && Number.isFinite(y) && !isNaN(x) && !isNaN(y);
        };

        // 현재 이동 중인 점의 위치 계산
        const currentX = line.currentStart.x + (line.currentEnd.x - line.currentStart.x) * line.progress;
        const currentY = line.currentStart.y + (line.currentEnd.y - line.currentStart.y) * line.progress;

        if (!isValidCoordinate(currentX, currentY) || 
            !isValidCoordinate(line.currentStart.x, line.currentStart.y)) {
            return;
        }

        // 선 그리기
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(40, 40, 40, ${line.opacity})`; // 투명도 적용
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(line.currentStart.x, line.currentStart.y);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();

        // if (line.isIntersection) {
        //     // 교집합 선에 대한 발광 효과 추가
        //     this.ctx.shadowBlur = 15;
        //     this.ctx.shadowColor = `rgba(40, 40, 40, ${line.opacity})`;
        //     this.ctx.stroke();
        //     this.ctx.shadowBlur = 0;
        // } else {
        //     this.ctx.stroke();
        // }
    }



    // 라인 생성 헬퍼 함수 수정
    createLine(startPoint, endPoint) {
        // startPoint와 endPoint는 이미 계산된 위치와 원의 정보를 포함
        // 시작점의 각도 계산
        const startAngle = Math.atan2(
            startPoint.y - (startPoint.circle === 'A' ? this.circleA.y : this.circleB.y),
            startPoint.x - (startPoint.circle === 'A' ? this.circleA.x : this.circleB.x)
        );
        
        // 끝점의 각도 계산
        const endAngle = Math.atan2(
            endPoint.y - (endPoint.circle === 'A' ? this.circleA.y : this.circleB.y),
            endPoint.x - (endPoint.circle === 'A' ? this.circleA.x : this.circleB.x)
        );

        // 기본 애니메이션 시간을 2초(2000ms)로 설정
        const speed = 1 / 120; // 60fps 기준으로 2초

        return {
            start: {
                x: startPoint.x,
                y: startPoint.y,
                circle: startPoint.circle,
                angle: startAngle
            },
            end: {
                x: endPoint.x,
                y: endPoint.y,
                circle: endPoint.circle,
                angle: endAngle
            },
            progress: 0,
            opacity: 1,
            speed: speed,
            fadeStart: 0.8
        };
    }



// 현재 원 가져오기를 더 명확하게 수정
getCurrentCircle(circle) {
    switch(circle) {
        case 'A':
            return this.circleA;
        case 'B':
            return this.circleB;
        case 'C':
            return this.circleC;
        default:
            console.error('Invalid circle identifier:', circle);
            return null;
    }
}



// createLines 메서드 수정
createLines(state) {
    const lines = [];
    const intersectionRatio = this.getIntersectionRatio();

    if (state !== 'waiting' && state !== 'init') {
        // 3중 교집합 여부 확인
        const hasTripleIntersection = this.hasTripleIntersection();

        if (hasTripleIntersection) {
            // 3중 교집합 점들만 처리
            this.processTripleIntersectionLines(lines);
        } else {
            // A∩B 교집합 처리
            this.processIntersectionLines('A', 'B', lines);
            // B∩C 교집합 처리
            this.processIntersectionLines('B', 'C', lines);
        }
    }

    // 비교집합 영역의 랜덤 선 생성
    if (intersectionRatio < 0.99) {
        ['A', 'B', 'C'].forEach(circle => {
            const currentCircle = this.getCurrentCircle(circle);
            if (!currentCircle) return;

            const nonIntersectionPoints = this.fixedPoints[`circle${circle}`].filter(point => {
                const pos = {
                    x: currentCircle.x + currentCircle.radius * Math.cos(point.angle),
                    y: currentCircle.y + currentCircle.radius * Math.sin(point.angle),
                    circle: circle
                };
                return !this.isPointInIntersection(pos);
            });

            if (nonIntersectionPoints.length > 0) {
                const startPoint = nonIntersectionPoints[Math.floor(Math.random() * nonIntersectionPoints.length)];
                
                this.fixedPoints[`circle${circle}`].forEach(endPoint => {
                    if (startPoint !== endPoint) {
                        lines.push({
                            start: {
                                angle: startPoint.angle,
                                circle: circle
                            },
                            end: {
                                angle: endPoint.angle,
                                circle: endPoint.circle
                            },
                            progress: 0,
                            opacity: 1 - (intersectionRatio * 0.95),
                            isIntersection: false,
                            fadeOutProgress: 0
                        });
                    }
                });
            }
        });
    }

    return lines;
}

// 교집합 영역 처리 메서드
// processIntersectionLines 메서드 수정
processIntersectionLines(circle1, circle2, lines) {
    const circle1Obj = this.getCurrentCircle(circle1);
    const circle2Obj = this.getCurrentCircle(circle2);
    
    // 각 원의 교집합 점 찾기
    const intersectionPointsC1 = this.fixedPoints[`circle${circle1}`].filter(point => {
        const pos = this.calculateFixedPointPosition(point, circle1Obj);
        return this.isPointInSingleCircle(pos, circle2Obj);
    });

    const intersectionPointsC2 = this.fixedPoints[`circle${circle2}`].filter(point => {
        const pos = this.calculateFixedPointPosition(point, circle2Obj);
        return this.isPointInSingleCircle(pos, circle1Obj);
    });

    // circle1의 교집합 점들에서 선 생성
    intersectionPointsC1.forEach(startPoint => {
        // 같은 원의 모든 점들과 연결
        this.fixedPoints[`circle${circle1}`].forEach(endPoint => {
            if (startPoint !== endPoint) {
                lines.push(this.createIntersectionLine(startPoint, endPoint, circle1, circle1));
            }
        });
    });

    // circle2의 교집합 점들에서 선 생성
    intersectionPointsC2.forEach(startPoint => {
        // 같은 원의 모든 점들과 연결
        this.fixedPoints[`circle${circle2}`].forEach(endPoint => {
            if (startPoint !== endPoint) {
                lines.push(this.createIntersectionLine(startPoint, endPoint, circle2, circle2));
            }
        });
    });
}

// 교집합 선 생성 헬퍼 함수
createIntersectionLine(startPoint, endPoint, startCircle, endCircle) {
    return {
        start: {
            angle: startPoint.angle,
            circle: startCircle
        },
        end: {
            angle: endPoint.angle,
            circle: endCircle
        },
        progress: 0,
        opacity: 1,
        isIntersection: true,
        fadeOutProgress: 0
    };
}

processTripleIntersectionLines(lines) {
    const tripleIntersectionPoints = this.getTripleIntersectionPoints();
    const intersectionRatio = this.getIntersectionRatio();
    
    // 100% 교집합 상태 체크
    const isComplete = intersectionRatio >= 0.99;
    
    if (isComplete) {
        // 100% 상태일 때는 A 원의 모든 점에서 선 생성
        this.fixedPoints.circleA.forEach(startPoint => {
            this.fixedPoints.circleA.forEach(endPoint => {
                if (startPoint.angle !== endPoint.angle) {
                    lines.push({
                        start: {
                            angle: startPoint.angle,
                            circle: 'A'
                        },
                        end: {
                            angle: endPoint.angle,
                            circle: 'A'
                        },
                        progress: Math.random() * 0.2,
                        opacity: 1,
                        isIntersection: true,
                        fadeOutProgress: 0,
                        duration: this.lineAnimationState.intersectionDuration
                    });
                }
            });
        });
    } else {
        // 100% 미만일 때는 기존 로직 유지
        tripleIntersectionPoints.forEach(startPoint => {
            ['A', 'B', 'C'].forEach(targetCircle => {
                this.fixedPoints[`circle${targetCircle}`].forEach(endPoint => {
                    if (!(startPoint.circle === targetCircle && startPoint.angle === endPoint.angle)) {
                        lines.push(this.createTripleIntersectionLine(startPoint, endPoint, targetCircle));
                    }
                });
            });
        });
    }
}

// 삼중 교집합 선 생성을 위한 헬퍼 함수
createTripleIntersectionLine(startPoint, endPoint, targetCircle) {
    return {
        start: {
            angle: startPoint.angle,
            circle: startPoint.circle
        },
        end: {
            angle: endPoint.angle,
            circle: targetCircle
        },
        progress: Math.random() * 0.2,
        opacity: 1,
        isIntersection: true,
        fadeOutProgress: 0,
        duration: this.lineAnimationState.intersectionDuration
    };
}

// 3중 교집합 여부 확인
hasTripleIntersection() {
    return this.getTripleIntersectionPoints().length > 0;
}


// getTripleIntersectionPoints 메서드도 개선
getTripleIntersectionPoints() {
    const points = [];
    
    ['A', 'B', 'C'].forEach(circleName => {
        const currentCircle = this.getCurrentCircle(circleName);
        
        this.fixedPoints[`circle${circleName}`].forEach(point => {
            const pos = {
                x: currentCircle.x + currentCircle.radius * Math.cos(point.angle),
                y: currentCircle.y + currentCircle.radius * Math.sin(point.angle)
            };
            
            // 다른 두 원 모두와의 교집합 체크
            const otherCircles = ['A', 'B', 'C'].filter(name => name !== circleName);
            const isInTripleIntersection = otherCircles.every(otherName => {
                const otherCircle = this.getCurrentCircle(otherName);
                return this.isPointInSingleCircle(pos, otherCircle);
            });
            
            if (isInTripleIntersection) {
                points.push({
                    angle: point.angle,
                    circle: circleName,
                    x: pos.x,
                    y: pos.y
                });
            }
        });
    });

    // 디버깅 로그
    return points;
}

// 점이 특정 원 하나에만 있는지 확인
isPointInSingleCircle(point, targetCircle) {
    const dx = point.x - targetCircle.x;
    const dy = point.y - targetCircle.y;
    return Math.sqrt(dx * dx + dy * dy) <= targetCircle.radius;
}

// isPointInAllCircles 메서드 수정
isPointInAllCircles(point) {
    const otherCircles = ['A', 'B', 'C'].filter(name => name !== point.circle)
        .map(name => this.getCurrentCircle(name));
    
    return otherCircles.every(circle => this.isPointInSingleCircle(point, circle));
}

// B와 C 원 사이의 교점을 계산하는 새로운 메서드
getIntersectionPointsBC() {
    const d = Math.hypot(this.circleB.x - this.circleC.x, this.circleB.y - this.circleC.y);
    if (d >= this.circleRadius * 2 || d <= 0) return null;

    const a = (this.circleRadius * this.circleRadius - this.circleRadius * this.circleRadius + d * d) / (2 * d);
    const h = Math.sqrt(this.circleRadius * this.circleRadius - a * a);

    const px = this.circleB.x + a * (this.circleC.x - this.circleB.x) / d;
    const py = this.circleB.y + a * (this.circleC.y - this.circleB.y) / d;

    return [
        {
            x: px + h * (this.circleC.y - this.circleB.y) / d,
            y: py - h * (this.circleC.x - this.circleB.x) / d
        },
        {
            x: px - h * (this.circleC.y - this.circleB.y) / d,
            y: py + h * (this.circleC.x - this.circleB.x) / d
        }
    ];
}

// 한 점이 특정 원 안에 있는지 확인하는 헬퍼 메서드
isPointInCircle(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
}
// updateLines 메서드 수정
updateLines(state) {
    const currentTime = performance.now();

    // 계속해서 새로운 라인 세트 생성
    if (this.lines.length === 0 || currentTime - this.lineAnimationState.lastCreateTime >= this.lineAnimationState.interval) {
        this.selectRandomActivePoints();
        this.lines = this.createLines(state);
        this.lineAnimationState.lastCreateTime = currentTime;
        this.lineAnimationState.startTime = currentTime;
    }

    if (this.lines.length > 0) {
        const elapsed = currentTime - this.lineAnimationState.startTime;
        
        this.lines.forEach(line => {
            let duration;
            let progress;
            
            // 교집합과 비교집합 선의 duration을 다르게 적용
            duration = line.isIntersection ? 
                this.lineAnimationState.intersectionDuration + (elapsed * 0.1) : 
                this.lineAnimationState.duration;
    
            if (!line.isIntersection) {
                const speed = 0.7;
                progress = Math.min((elapsed / speed) / duration, 1);
            } else {
                progress = Math.min(elapsed / duration, 1);
            }

            // 여기를 수정: getCurrentCircle 메서드 사용
            const startCircle = this.getCurrentCircle(line.start.circle);
            const endCircle = this.getCurrentCircle(line.end.circle);

            if (startCircle && endCircle) {  // null 체크 추가
                line.currentStart = {
                    x: startCircle.x + startCircle.radius * Math.cos(line.start.angle),
                    y: startCircle.y + startCircle.radius * Math.sin(line.start.angle)
                };
                
                line.currentEnd = {
                    x: endCircle.x + endCircle.radius * Math.cos(line.end.angle),
                    y: endCircle.y + endCircle.radius * Math.sin(line.end.angle)
                };

                line.progress = progress;

                // 비교집합 선의 투명도 처리
                if (!line.isIntersection) {
                    if (progress >= 1) {
                        line.opacity = 0;
                    }
                } else {
                    // 교집합 선의 투명도 처리
                    if (progress >= 0.02 && progress < 0.1) {
                        line.opacity = (0.1 - progress) * 10;
                    } else if (progress >= 0.1) {
                        line.opacity = 0;
                    } else {
                        line.opacity = 1;
                    }
                }
            }
        });

        // 투명도가 0 이하면 라인 제거
        this.lines = this.lines.filter(line => line.opacity > 0);
    }
}

    update() {
        this.updateScenario();
        this.timeInState += 1/60;

        if (this.animation.inProgress) {
            this.updateCirclePositions(performance.now());
        }

        // waiting 또는 step1 또는 step2 상태에서 라인 애니메이션 실행
        if (this.state === 'waiting' || this.state === 'step1' || this.state === 'step2') {
            this.updateLines(this.state);
        }
    }



    // Modify draw function to include text rendering
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        
        if ((this.state === 'step1' || this.state === 'step2') && 
            this.getDistance() < this.circleRadius * 2) {
            this.drawIntersection();
        }
        
        // Draw all circles
        this.drawCircle(this.circleA.x, this.circleA.y, this.circleRadius);
        this.drawCircle(this.circleB.x, this.circleB.y, this.circleRadius);
        this.drawCircle(this.circleC.x, this.circleC.y, this.circleRadius);
        
        // Draw points for all circles
        ['A', 'B', 'C'].forEach(circleName => {
            this.fixedPoints[`circle${circleName}`].forEach(point => {
                const currentCircle = circleName === 'A' ? this.circleA :
                                    circleName === 'B' ? this.circleB : this.circleC;
                const pos = this.calculateFixedPointPosition(point, currentCircle);
                this.drawPoint(pos);
            });
        });
        
        this.drawPointText();
        
        if (this.lines.length > 0) {
            this.lines.forEach(line => {
                this.drawLine(line);
            });
        }

        this.drawImages();
        this.drawStatusText();
        // labels가 정의되어 있을 때만 drawLabels 호출
        if (this.labels) {
            this.drawLabels();
        }

    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
new OAuthVisualizer();
});

