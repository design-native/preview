class ChainRollupVisualizer {


    /**
     * ===================================================================
     *                    Triple Chain RollupVisualizer
     * ===================================================================
     * CO2(Carbon Emission), Net-Zero, COC(Carbon Offset) 체인 간의
     * 동기화 과정과 합의 형성을 시각적으로 표현하는 클래스
     * 
     * [주요 기능]
     * - 3개 체인 간 동기화 상태 표시
     * - 노드 간 합의 라인 애니메이션
     * - 이중/삼중 교차 영역 시각화
     * - 동기화 진행 상태 표시
     * - 체인별 레이블 및 상호작용
     * 
     * ===================================================================
     *                              Function Map
     * ===================================================================
     * 
     * 1️⃣ 초기화 및 설정 (Core Setup)
     * -----------------------------------
     * constructor()            → 클래스 생성 및 초기 상태/레이블 설정
     * init()                  → 캔버스 초기화 및 애니메이션 시작
     * resize()                → 3개 체인 배치를 위한 캔버스 크기 조정
     * setupEventListeners()   → 버튼 이벤트 핸들러 설정
     * setupLabelEvents()      → 레이블 호버/인터랙션 이벤트 설정
     * initChainPositions()    → 3개 체인의 초기 위치 설정
     * initializeFixedNodes()  → 각 체인의 고정 노드 초기화
     * 
     * 2️⃣ 상태 관리 (State Management)
     * -----------------------------------
     * setState()              → 체인 간 거리/위치 상태 전환 및 애니메이션 설정
     * startScenario()        → 시나리오 초기화 및 시작
     * updateScenario()       → 시나리오 진행 상태 업데이트
     * calculateTargetDistance() → 상태별 체인 간 목표 거리 계산
     * 
     * 3️⃣ 애니메이션 처리 (Animation)
     * -----------------------------------
     * animate()              → requestAnimationFrame 기반 메인 루프
     * update()               → 시나리오/체인/합의 상태 업데이트
     * updateChainPositions() → 3개 체인의 위치 및 이징 업데이트
     * updateConsensuses()    → 합의 라인 생성 및 애니메이션 업데이트
     * 
     * 4️⃣ 렌더링 (Rendering)
     * -----------------------------------
     * draw()                 → 전체 요소 렌더링 제어
     * ├─ drawChain()         → 체인 원형 테두리 렌더링
     * ├─ drawNode()          → 체인별 노드 렌더링
     * ├─ drawNodeLabel()     → 노드 번호/레이블 렌더링
     * ├─ drawIntersection()  → 체인 간 교차 영역 렌더링
     * ├─ drawIntersectionArea() → 두 체인 간 교차 영역 계산 및 렌더링
     * ├─ drawConsensus()     → 노드 간 합의 라인 렌더링
     * ├─ drawStatusText()    → 진행 상태 텍스트 렌더링
     * ├─ drawImages()        → 체인 레이블 텍스트 렌더링
     * └─ drawLabels()        → 상호작용 가능한 레이블 렌더링
     * 
     * 5️⃣ 교차 영역 계산 (Intersection Calculations)
     * -----------------------------------
     * getDistance()          → 체인 간 현재 거리 계산
     * getIntersectionRatio() → 교차 영역 비율 계산
     * getIntersectionNodesBC() → B와 C 체인 간 교차점 계산
     * isNodeInChain()        → 노드의 특정 체인 영역 내 포함 여부
     * hasTripleIntersection() → 3중 교차 상태 확인
     * getTripleIntersectionNodes() → 3중 교차점 좌표 계산
     * isNodeInIntersection() → 노드의 교차 영역 포함 여부
     * isNodeInSingleChain()  → 노드의 단일 체인 내 포함 여부
     * isNodeInAllChains()    → 노드의 전체 체인 포함 여부
     * 
     * 6️⃣ 합의 라인 처리 (Consensus Management)
     * -----------------------------------
     * createConsensuses()    → 현재 상태의 전체 합의 라인 생성
     * processIntersectionConsensuses() → 교차 영역 합의 라인 처리
     * processTripleIntersectionConsensuses() → 3중 교차 합의 라인 처리
     * createIntersectionConsensus() → 교차 영역 합의 라인 생성
     * createTripleIntersectionConsensus() → 3중 교차 합의 라인 생성
     * selectRandomActiveNodes() → 비교집합 영역의 활성 노드 선택
     * 
     * 7️⃣ 유틸리티 (Utilities)
     * -----------------------------------
     * calculateFixedNodePosition() → 체인상의 노드 위치 계산
     * blendColors()         → 색상 값 블렌딩 계산
     * getRGBAString()       → RGB 색상을 RGBA 문자열로 변환
     * getCurrentChain()      → 체인 식별자로 체인 객체 반환
     * getNodePosition()      → 노드 번호로 위치 계산
     * adjustNodeToChain()    → 노드 위치를 체인 반경에 맞게 조정
     * lerp()                → 선형 보간 계산
     * easeOutQuint()        → Quint 이징 효과
     * easeInOutQuad()       → Quad 이징 효과
     * 
     * ===================================================================
     *                               States
     * ===================================================================
     * 'init'      → 초기 상태: 체인들이 최대 거리로 분리된 상태
     * 'waiting'   → 대기 상태: 기본 애니메이션 동작 상태
     * 'step1'     → 1단계: 체인 간 접근 및 부분 동기화 상태
     * 'step2'     → 2단계: 체인 간 완전 동기화 상태
     * 
     * ===================================================================
     *                           Animation Sequence
     * ===================================================================
     * 1. 초기화 → 3개 체인 및 노드 초기 위치 설정
     * 2. 대기 상태 → 각 체인 내부의 합의 라인 애니메이션
     * 3. 1단계 → 체인 간 접근 및 교차 영역 형성
     * 4. 2단계 → 완전 동기화 및 3중 합의 네트워크 형성
     */






    /**
     * 클래스 초기화 및 기본 설정
     * - 캔버스 및 컨텍스트 초기화
     * - 상태 및 노드 데이터 초기화
     * - 애니메이션 설정 초기화
     * - 레이블 및 이벤트 설정
     */
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'init';
        this.timeInState = 0;
        this.nodes = {
            chainA: [],
            chainB: [],
            chainC: [] // Add chain C nodes
        };
        this.activeConsensuses = new Set();
        this.Consensuses = [];
        this.color = '#333';
        this.glowColor = 'rgba(0, 193,132, 0.2)';
        this.maxNodes = 100;
        this.currentMaxNodes = 0;
        this.nodeGrowthRate = 0.5;
        
        this.animation = {
            inProgress: false,
            startTime: 0,
            duration: 1000,
            startPosA: null,
            startPosB: null,
            targetPosA: null,
            targetPosB: null
        };
        
        this.ConsensusAnimationState = {
            startTime: 0,
            duration: 1500,             // 비교집합 선 기본 duration
            intersectionDuration: 10000, // 교집합 선 duration
            fadeOutDuration: 500,
            interval: 3000,
            lastCreateTime: 0,
            activeNodes: {
                A: null,
                B: null
            }
        };

        // 잔상 효과 설정
        this.trailEffect = {
            length: 0.1,  // 잔상 길이 단축 (전체 거리의 10%)
            opacity: 0.5  // 잔상 투명도
        };

        // 고정된 노드들을 저장할 배열 추가
        this.fixedNodes = {
            chainA: [],
            chainB: [],
            chainC: [] // Add chain C fixed nodes
        };


        // 색상 팔레트 추가
        this.colors = {
            default: { r: 0, g: 193, b: 132, a: 0.1 },
            final: [
                { r: 0, g: 193, b: 132 , a: 0.1 }     // 연한 녹색
            ]
        };

        
        // 시나리오 관리를 위한 속성 추가
        this.scenario = {
            currentStep: 'init', // init, waiting, step1, step2
            stepStartTime: 0,
        };

        // 시나리오 타이밍 설정 (밀리초 단위)
        this.timing = {
            

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


        // 상태 텍스트 설정
        this.statusText = {
            nodes: '.',
            nodesTimer: 0,
            nodesInterval: 500,
            fadeOpacity: 0,
            fadeTarget: 0
        };


        // 자동 시나리오 시작
        this.startScenario();
        this.resize();
        this.setupEventListeners();
        this.init();

        // 초기 고정 노드 생성
        this.initializeFixedNodes();


        
    // Add labels definition before setupLabelEvents
    this.labels = [
        { id: 'n2', text: 'Net-Zero School', nodeNumber: 2, top: true, distance: 75 },  // 더 높게
        { id: 'n16', text: 'GXCE', nodeNumber: 16, top: true, distance: 105 },          // 기본 높이
        { id: 'n8', text: 'Net-Zero HEROES', nodeNumber: 8, bottom: true, distance: 50 }, // 기본 높이
        { id: 'n10', text: 'Net-Zero Wallet', nodeNumber: 10, bottom: true, distance: 80 } // 더 낮게
    ];
    
    this.hoveredLabel = null;
    this.setupLabelEvents();
    }

    /**
     * 캔버스 초기화 및 애니메이션 시작
     * - 초기 체인 위치 설정
     * - 애니메이션 루프 시작
     */
    init() {
        this.initChainPositions();
        this.animate();
    }


     /**
     * 캔버스 크기 조정
     * - 브라우저 크기에 responsive하게 대응
     * - 최소 크기 제한 적용
     * - 체인 반지름 자동 계산
     */
    resize() {
        const browserHeight = window.innerHeight;
        const aspectRatio = 14/9;

        const minWidth = 700; // 최소 너비 설정
        const minheight = 650; // 최소 너비 설정

        if (window.innerWidth < 800) {
            this.canvas.height = Math.max(window.innerWidth / aspectRatio, minheight )
        }else {
            this.canvas.height = Math.min(Math.max(window.innerWidth / aspectRatio, minheight ), browserHeight *0.58);  // 브라우저 높이의 80%

        }
        const maxRadius = Math.min(
            window.innerWidth * 0.28,  // 높이의 25%로 제한 (기존 35%)
            this.canvas.height * 0.22    // 너비의 15%로 제한 (기존 25%)
        );

        // 원의 크기를 더 작게 조정
        // 원 3개가 모두 들어갈 수 있도록 여유 공간 확보
        this.canvas.width = Math.max(minWidth, maxRadius * 3.5 * 2 );;
        


        this.chainRadius = maxRadius;
        this.initChainPositions();
    }


    /**
     * 버튼 이벤트 핸들러 설정
     * - waiting, step1, step2 상태 전환 버튼 설정
     */
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
    
    
    /**
     * 레이블 이벤트 핸들러 설정
     * - 마우스 움직임 감지
     * - 호버 상태 체크 및 업데이트
     * - 데이터 속성 업데이트
     */
    setupLabelEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 1. 레이블 호버 체크
            this.hoveredLabel = this.labels.find(label => {
                const node = this.getNodePosition(label.nodeNumber);
                if (!node) return false;

                // 텍스트 크기 측정을 위한 설정
                this.ctx.font = '14px Times New Roman';
                const textWidth = this.ctx.measureText(label.text).width;
                const textHeight = 14; // 폰트 크기와 동일하게 설정
                const padding = { x: 10, y: 6 };

                // 라벨 박스의 실제 위치 계산
                const boxWidth = textWidth + (padding.x * 2);
                const boxHeight = textHeight + (padding.y * 2);
                const boxX = node.x - boxWidth/2;
                const boxY = label.top ? 
                    node.y - label.distance - boxHeight + 20: 
                    node.y + label.distance - boxHeight + 20;

                // 연결선 영역도 포함
                const consensusGap = 35;
                const consensusStartY = label.top ? boxY + boxHeight : boxY;
                const consensusEndY = label.top ? 
                    node.y - consensusGap : 
                    node.y + consensusGap;
                
                // 박스 영역 체크
                const isInBox = mouseX >= boxX && 
                            mouseX <= boxX + boxWidth && 
                            mouseY >= boxY && 
                            mouseY <= boxY + boxHeight;

                // 연결선 영역 체크 (선 주변 약간의 여유 영역 포함)
                const consensusHitboxWidth = 10; // 선 주변 클릭 가능 영역
                const isOnConsensus = mouseX >= node.x - consensusHitboxWidth/2 && 
                            mouseX <= node.x + consensusHitboxWidth/2 && 
                            mouseY >= Math.min(consensusStartY, consensusEndY) && 
                            mouseY <= Math.max(consensusStartY, consensusEndY);

                return isInBox || isOnConsensus;
            });

            // 2. 원 영역 호버 체크
            if (!this.hoveredLabel) {
                const distanceA = Math.hypot(mouseX - this.chainA.x, mouseY - this.chainA.y);
                const distanceB = Math.hypot(mouseX - this.chainB.x, mouseY - this.chainB.y);
                const distanceC = Math.hypot(mouseX - this.chainC.x, mouseY - this.chainC.y);

                if (distanceA <= this.chainRadius || 
                    distanceB <= this.chainRadius || 
                    distanceC <= this.chainRadius) {
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

    
    /**
     * 체인 초기 위치 설정
     * - 중앙 기준 체인 위치 계산
     * - 상태별 간격 적용
     * @param {string} state - 현재 상태
     */
    initChainPositions() {
        const spacing = this.calculateTargetDistance(this.state);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2.2;
        
        // B원을 중앙에 고정
        this.chainB = {
            x: centerX,
            y: centerY,
            radius: this.chainRadius
        };
        
        // A원은 B원 기준으로 왼쪽에 위치
        this.chainA = {
            x: centerX - spacing,
            y: centerY,
            radius: this.chainRadius
        };
        
        // C원은 B원 기준으로 오른쪽에 위치
        this.chainC = {
            x: centerX + spacing,
            y: centerY,
            radius: this.chainRadius
        };
    }


    /**
     * 고정 노드 초기화
     * - 각 체인별 16개 고정 노드 생성
     * - 노드 각도 및 속성 설정
     */
    initializeFixedNodes() {
        const angleStep = (Math.PI * 2) / 16;

        // Existing A and B chain nodes initialization remains the same
        ['A', 'B', 'C'].forEach(chainName => {
            const nodes = [];
            for (let i = 0; i < 16; i++) {
                const angle = -i * angleStep - Math.PI/2;
                nodes.push({
                    angle: angle,
                    chain: chainName,
                    number: i + 1,
                    opacity: 1
                });
            }
            this.fixedNodes[`chain${chainName}`] = nodes;
        });
    }












    // State Management 함수들
    /**
     * 상태 변경 및 관련 속성 업데이트
     * @param {string} newState - 새로운 상태값
     * - 애니메이션 속성 업데이트
     * - 체인 위치 재계산
     */
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
        this.currentMaxNodes = 0;

        const centerX = this.canvas.width / 2;
        const targetDistance = this.calculateTargetDistance(newState);

        // 애니메이션 시작 위치 저장
        this.animation.startPosA = { x: this.chainA.x, y: this.chainA.y };
        this.animation.startPosB = { x: this.chainB.x, y: this.chainB.y };
        this.animation.startPosC = { x: this.chainC.x, y: this.chainC.y };

        if (newState === 'step2') {
            // step2에서는 모든 원이 B원 위치로 이동
            this.animation.targetPosA = {
                x: centerX,
                y: this.canvas.height / 2.2
            };
            this.animation.targetPosB = {
                x: centerX,
                y: this.canvas.height / 2.2
            };
            this.animation.targetPosC = {
                x: centerX,
                y: this.canvas.height / 2.2
            };
        } else {
            // 다른 상태에서는 B원 중심으로 좌우에 배치
            this.animation.targetPosA = {
                x: centerX - targetDistance,
                y: this.canvas.height / 2.2
            };
            this.animation.targetPosB = {
                x: centerX,
                y: this.canvas.height / 2.2
            };
            this.animation.targetPosC = {
                x: centerX + targetDistance,
                y: this.canvas.height / 2.2
            };
        }

        this.animation.inProgress = true;
        this.animation.startTime = performance.now();
        this.animation.prevState = prevState;
    }


    /**
     * 시나리오 시작
     * - 초기 상태 설정
     * - 시작 시간 기록
     */
    startScenario() {
        this.scenarioCurrentStep = 'init';
        this.scenarioStepStartTime = performance.now();
    }

    
    /**
     * 시나리오 상태 업데이트
     * - 경과 시간 체크
     * - 단계별 상태 전환
     * - 교차 비율 모니터링
     */
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
    

    /**
     * 상태별 체인 간 목표 거리 계산
     * @param {string} state - 현재 상태
     * @returns {number} - 계산된 목표 거리
     */
    calculateTargetDistance(state) {
        switch(state) {
            case 'init':
                return this.chainRadius * 2;  // 기존 2.0에서 축소
            case 'waiting':
                return this.chainRadius * 2;  // 기존 2.0에서 축소
            case 'step1':
                return this.chainRadius * 1.4;  // 기존 1.6에서 축소
            case 'step2':
                return this.chainRadius * 0;
            default:
                return this.chainRadius * 2;  // 기존 2.05에서 축소
        }
    }








    /**
     * 메인 애니메이션 루프
     * - requestAnimationFrame 사용
     * - update 및 draw 함수 호출
     */
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }


    /**
     * 전체 상태 업데이트
     * - 시나리오 상태 업데이트
     * - 체인 위치 업데이트
     * - 합의 라인 업데이트
     */
    update() {
        this.updateScenario();
        this.timeInState += 1/60;

        if (this.animation.inProgress) {
            this.updateChainPositions(performance.now());
        }

        // waiting 또는 step1 또는 step2 상태에서 라인 애니메이션 실행
        if (this.state === 'waiting' || this.state === 'step1' || this.state === 'step2') {
            this.updateConsensuses(this.state);
        }
    }

    
    /**
     * 체인 위치 업데이트
     * @param {number} currentTime - 현재 시간
     * - 애니메이션 진행도 계산
     * - 이징 효과 적용
     * - 체인 위치 보간
     */
    updateChainPositions(currentTime) {
        if (!this.animation.inProgress) return;

        const elapsed = currentTime - this.animation.startTime;
        const progress = Math.min(elapsed / this.animation.duration, 1);
        const easing = this.easeOutQuint(progress);

        // Update positions for all chains
        this.chainA.x = this.animation.startPosA.x + (this.animation.targetPosA.x - this.animation.startPosA.x) * easing;
        this.chainA.y = this.animation.startPosA.y + (this.animation.targetPosA.y - this.animation.startPosA.y) * easing;
        
        this.chainB.x = this.animation.startPosB.x + (this.animation.targetPosB.x - this.animation.startPosB.x) * easing;
        this.chainB.y = this.animation.startPosB.y + (this.animation.targetPosB.y - this.animation.startPosB.y) * easing;
        
        this.chainC.x = this.animation.startPosC.x + (this.animation.targetPosC.x - this.animation.startPosC.x) * easing;
        this.chainC.y = this.animation.startPosC.y + (this.animation.targetPosC.y - this.animation.startPosC.y) * easing;

        if (progress >= 1) {
            this.animation.inProgress = false;
        }
    }


    /**
     * 합의 라인 상태 업데이트
     * @param {string} state - 현재 상태
     * - 활성 노드 선택
     * - 합의 라인 생성 및 업데이트
     * - 투명도 처리
     */
    updateConsensuses(state) {
        const currentTime = performance.now();

        // 계속해서 새로운 라인 세트 생성
        if (this.Consensuses.length === 0 || currentTime - this.ConsensusAnimationState.lastCreateTime >= this.ConsensusAnimationState.interval) {
            this.selectRandomActiveNodes();
            this.Consensuses = this.createConsensuses(state);
            this.ConsensusAnimationState.lastCreateTime = currentTime;
            this.ConsensusAnimationState.startTime = currentTime;
        }

        if (this.Consensuses.length > 0) {
            const elapsed = currentTime - this.ConsensusAnimationState.startTime;
            
            this.Consensuses.forEach(consensus => {
                let duration;
                let progress;
                
                // 교집합과 비교집합 선의 duration을 다르게 적용
                duration = consensus.isIntersection ? 
                    this.ConsensusAnimationState.intersectionDuration + (elapsed * 0.1) : 
                    this.ConsensusAnimationState.duration;
        
                if (!consensus.isIntersection) {
                    const speed = 0.7;
                    progress = Math.min((elapsed / speed) / duration, 1);
                } else {
                    progress = Math.min(elapsed / duration, 1);
                }

                // 여기를 수정: getCurrentChain 메서드 사용
                const startChain = this.getCurrentChain(consensus.start.chain);
                const endChain = this.getCurrentChain(consensus.end.chain);

                if (startChain && endChain) {  // null 체크 추가
                    consensus.currentStart = {
                        x: startChain.x + startChain.radius * Math.cos(consensus.start.angle),
                        y: startChain.y + startChain.radius * Math.sin(consensus.start.angle)
                    };
                    
                    consensus.currentEnd = {
                        x: endChain.x + endChain.radius * Math.cos(consensus.end.angle),
                        y: endChain.y + endChain.radius * Math.sin(consensus.end.angle)
                    };

                    consensus.progress = progress;

                    // 비교집합 선의 투명도 처리
                    if (!consensus.isIntersection) {
                        if (progress >= 1) {
                            consensus.opacity = 0;
                        }
                    } else {
                        // 교집합 선의 투명도 처리
                        if (progress >= 0.02 && progress < 0.1) {
                            consensus.opacity = (0.1 - progress) * 10;
                        } else if (progress >= 0.1) {
                            consensus.opacity = 0;
                        } else {
                            consensus.opacity = 1;
                        }
                    }
                }
            });

            // 투명도가 0 이하면 라인 제거
            this.Consensuses = this.Consensuses.filter(consensus => consensus.opacity > 0);
        }
    }







    /**
     * 전체 화면 렌더링
     * - 교차 영역 렌더링
     * - 체인 및 노드 렌더링
     * - 레이블 및 상태 텍스트 렌더링
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        
        if ((this.state === 'step1' || this.state === 'step2') && 
            this.getDistance() < this.chainRadius * 2) {
            this.drawIntersection();
        }
        
        // Draw all chains
        this.drawChain(this.chainA.x, this.chainA.y, this.chainRadius);
        this.drawChain(this.chainB.x, this.chainB.y, this.chainRadius);
        this.drawChain(this.chainC.x, this.chainC.y, this.chainRadius);
        
        // Draw nodes for all chains
        ['A', 'B', 'C'].forEach(chainName => {
            this.fixedNodes[`chain${chainName}`].forEach(node => {
                const currentChain = chainName === 'A' ? this.chainA :
                                    chainName === 'B' ? this.chainB : this.chainC;
                const pos = this.calculateFixedNodePosition(node, currentChain);
                this.drawNode(pos);
            });
        });
        
        this.drawNodeLabel();
        
        if (this.Consensuses.length > 0) {
            this.Consensuses.forEach(consensus => {
                this.drawConsensus(consensus);
            });
        }

        this.drawImages();
        this.drawStatusText();
        // labels가 정의되어 있을 때만 drawLabels 호출
        if (this.labels) {
            this.drawLabels();
        }

    }

        /**
         * 체인 원형 렌더링
         * @param {number} x - 중심 x 좌표
         * @param {number} y - 중심 y 좌표
         * @param {number} radius - 반지름
         */
        drawChain(x, y, radius) {
            this.ctx.strokeStyle = 'rgba(40, 40, 40, 1)';
        this.ctx.consensusWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        }


        /**
         * 노드 렌더링
         * @param {Object} node - 노드 객체
         * - 위치 및 투명도 적용
         */
        drawNode(node) {
            const color = `rgba(40, 40, 40, ${node.opacity})`;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }


        /**
         * 노드 레이블 렌더링
         * - 노드 번호 표시
         * - 동기화 상태에 따른 텍스트 변경
         * - 각도별 텍스트 정렬 조정
         */
        drawNodeLabel() {
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
                
            // 두 원의 노드들에 대해 텍스트 그리기
            [
                { nodes: this.fixedNodes.chainA, chain: this.chainA, prefix: 'N' },
                { nodes: this.fixedNodes.chainB, chain: this.chainB, prefix: 'N' },
                { nodes: this.fixedNodes.chainC, chain: this.chainC, prefix: 'N' }
            ].forEach(({ nodes, chain, prefix }) => {
                nodes.forEach(node => {
                    const pos = this.calculateFixedNodePosition(node, chain);
                    
                    // 각도 정규화 (0 ~ 2π)
                    let angle = node.angle;
                    while (angle < 0) angle += 2 * Math.PI;
                    
                    // 기본 텍스트 오프셋
                    let textOffset = this.chainRadius * 0.05;
                    
                    // 기본 미세 조정 오프셋
                    let additionalOffsetX = 0;
                    let additionalOffsetY = 0;
                    const offsetAmount = 3;

                    // 특정 노드들에 대한 추가 조정
                    const specificAdjustments = {
                        // 3: { offsetMultiplier: 0.08, extraX: 0, extraY: 10 },   // N3
                        // 7: { offsetMultiplier: 0.08, extraX: 0, extraY: -10 },   // N7
                        // 11: { offsetMultiplier: 0.08, extraX: 0, extraY: -2 },   // N1
                        // 15: { offsetMultiplier: 0.08, extraX: 0, extraY: 10 }    // N15
                        1: { offsetMultiplier: 0.08, extraX: 0, extraY: -8 },    // N15
                        9: { offsetMultiplier: 0.08, extraX: 0, extraY: 8 }    // N15
                    };
                    
                    // 특정 노드에 대한 조정 적용
                    // if (specificAdjustments[node.number]) {
                    //     const adjustment = specificAdjustments[node.number];
                    //     textOffset = this.chainRadius * adjustment.offsetMultiplier;
                    // }

                    // 각도에 따른 텍스트 위치 계산
                    let textX = pos.x + Math.cos(angle) * textOffset;
                    let textY = pos.y + Math.sin(angle) * textOffset;
                    
                    // 특정 노드들에 대한 추가 오프셋 적용
                    if (specificAdjustments[node.number]) {
                        textX += specificAdjustments[node.number].extraX;
                        textY += specificAdjustments[node.number].extraY;
                    }
                    
                    // 텍스트 방향 조정을 위한 각도 계산
                    const textAngle = (angle + Math.PI * 2) % (Math.PI * 2);
                    
                    // 각도에 따른 텍스트 정렬 조정
                    if (textAngle > Math.PI * 0.45 && textAngle <= Math.PI * 0.55) {
                        // 정중앙 상단 (약 90도 부근)
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseconsensus = 'bottom';
                        additionalOffsetX = 0;
                        additionalOffsetY = 0;
                    } else if (textAngle > Math.PI * 1.45 && textAngle <= Math.PI * 1.55) {
                        // 정중앙 하단 (약 270도 부근)
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseconsensus = 'top';
                        additionalOffsetX = 0;
                        additionalOffsetY = 0;
                    } else if (textAngle <= Math.PI * 0.25 || textAngle > Math.PI * 1.75) {
                        // 오른쪽 영역 (0도 ~ 45도, 315도 ~ 360도)
                        this.ctx.textAlign = 'left';
                        this.ctx.textBaseconsensus = 'middle';
                        additionalOffsetX = 10;
                        additionalOffsetY = 0;
                    } else if (textAngle > Math.PI * 0.25 && textAngle <= Math.PI * 0.45) {
                        // 우상단 영역 (45도 ~ 90도)
                        this.ctx.textAlign = 'left';
                        this.ctx.textBaseconsensus = 'bottom';
                        additionalOffsetX = 10;
                        additionalOffsetY = -5;
                    } else if (textAngle > Math.PI * 0.55 && textAngle <= Math.PI * 0.75) {
                        // 좌상단 영역 (90도 ~ 135도)
                        this.ctx.textAlign = 'right';
                        this.ctx.textBaseconsensus = 'bottom';
                        additionalOffsetX = -10;
                        additionalOffsetY = -5;
                    } else if (textAngle > Math.PI * 0.75 && textAngle <= Math.PI * 1.25) {
                        // 왼쪽 영역 (135도 ~ 225도)
                        this.ctx.textAlign = 'right';
                        this.ctx.textBaseconsensus = 'middle';
                        additionalOffsetX = -10;
                        additionalOffsetY = 0;
                    } else if (textAngle > Math.PI * 1.25 && textAngle <= Math.PI * 1.45) {
                        // 좌하단 영역 (225도 ~ 270도)
                        this.ctx.textAlign = 'right';
                        this.ctx.textBaseconsensus = 'top';
                        additionalOffsetX = -10;
                        additionalOffsetY = 5;
                    } else if (textAngle > Math.PI * 1.55 && textAngle <= Math.PI * 1.75) {
                        // 우하단 영역 (270도 ~ 315도)
                        this.ctx.textAlign = 'left';
                        this.ctx.textBaseconsensus = 'top';
                        additionalOffsetX = 10;
                        additionalOffsetY = 5;
                    }

                    // 노드 번호에 따른 추가 조정
                    if (node.number === 1 ) {
                        // 상단 노드들
                        additionalOffsetY -= 5;
                    } else if (node.number === 9) {
                        // 하단 노드들
                        additionalOffsetY += 5;
                    }

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
                        if ( node.chain === 'A') {
                            this.ctx.fillStyle = `rgba(40, 40, 40, ${fadeProgress})`;
                            const text = `L2(N${node.number}) : L3(N${node.number}) : L3(N${node.number})`;
                            this.ctx.fillText(text, textX + additionalOffsetX, textY + additionalOffsetY);
                        }
                    } else {
                        // 진행 상태 - 번호만 표시
                        this.ctx.fillStyle = 'rgba(40, 40, 40, 1)';
                        const text = `${prefix}${node.number}`;
                        this.ctx.fillText(text, textX + additionalOffsetX, textY + additionalOffsetY);
                    }
                });
            });
        }


        /**
         * 교차 영역 렌더링
         * - A∩B, B∩C 교집합 영역 표시
         * - 투명도 및 색상 적용
         */
        drawIntersection() {
            // A∩B 교집합 그리기
            this.drawIntersectionArea(this.chainA, this.chainB);
            // B∩C 교집합 그리기
            this.drawIntersectionArea(this.chainB, this.chainC);
        }


        /**
         * 두 체인 간 교차 영역 렌더링 
         * @param {Object} chainA - 첫 번째 체인
         * @param {Object} chainB - 두 번째 체인
         */
        drawIntersectionArea(chainA, chainB) {
            const d = Math.hypot(chainB.x - chainA.x, chainB.y - chainA.y);
            // 100% 교집합 상태일 때 처리 추가
            if (d <= 0.001) {  // 완전히 겹친 상태
                this.ctx.fillStyle = 'rgba(0, 193, 132, 0.1)';
                this.ctx.beginPath();
                this.ctx.arc(chainA.x, chainA.y, this.chainRadius, 0, Math.PI * 2);
                this.ctx.fill();
                return;
            }
            
            // 너무 멀리 떨어진 경우만 return
            if (d >= this.chainRadius * 2) return;

            const a = (this.chainRadius * this.chainRadius - this.chainRadius * this.chainRadius + d * d) / (2 * d);
            const h = Math.sqrt(this.chainRadius * this.chainRadius - a * a);

            const px = chainA.x + a * (chainB.x - chainA.x) / d;
            const py = chainA.y + a * (chainB.y - chainA.y) / d;

            const intersectionNodes = [
                {
                    x: px + h * (chainB.y - chainA.y) / d,
                    y: py - h * (chainB.x - chainA.x) / d
                },
                {
                    x: px - h * (chainB.y - chainA.y) / d,
                    y: py + h * (chainB.x - chainA.x) / d
                }
            ];


            this.ctx.fillStyle = 'rgba(0, 193, 132, 0.1)';;
            this.ctx.beginPath();
            this.ctx.moveTo(intersectionNodes[0].x, intersectionNodes[0].y);

            let angle1 = Math.atan2(intersectionNodes[0].y - chainA.y, intersectionNodes[0].x - chainA.x);
            let angle2 = Math.atan2(intersectionNodes[1].y - chainA.y, intersectionNodes[1].x - chainA.x);
            if (angle2 < angle1) angle2 += 2 * Math.PI;
            this.ctx.arc(chainA.x, chainA.y, this.chainRadius, angle1, angle2);

            let angle3 = Math.atan2(intersectionNodes[1].y - chainB.y, intersectionNodes[1].x - chainB.x);
            let angle4 = Math.atan2(intersectionNodes[0].y - chainB.y, intersectionNodes[0].x - chainB.x);
            if (angle4 < angle3) angle4 += 2 * Math.PI;
            this.ctx.arc(chainB.x, chainB.y, this.chainRadius, angle3, angle4);


            this.ctx.closePath();
            this.ctx.fill();
        }


        /**
         * 합의 라인 렌더링
         * @param {Object} consensus - 합의 라인 객체
         * - 시작점과 끝점 연결
         * - 진행도에 따른 애니메이션
         */
        drawConsensus(consensus) {
            const isValidCoordinate = (x, y) => {
                return Number.isFinite(x) && Number.isFinite(y) && !isNaN(x) && !isNaN(y);
            };

            // 현재 이동 중인 노드의 위치 계산
            const currentX = consensus.currentStart.x + (consensus.currentEnd.x - consensus.currentStart.x) * consensus.progress;
            const currentY = consensus.currentStart.y + (consensus.currentEnd.y - consensus.currentStart.y) * consensus.progress;

            if (!isValidCoordinate(currentX, currentY) || 
                !isValidCoordinate(consensus.currentStart.x, consensus.currentStart.y)) {
                return;
            }

            // 선 그리기
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(40, 40, 40, ${consensus.opacity})`; // 투명도 적용
            this.ctx.consensusWidth = 1;
            this.ctx.moveTo(consensus.currentStart.x, consensus.currentStart.y);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();

        }

       
        /**
         * 상태 텍스트 렌더링
         * - 진행률 표시
         * - 상태 메시지 표시
         * - 동적 점 애니메이션
         */
        drawStatusText() {
            const ratio = this.getIntersectionRatio();
            const percentage = Math.round(ratio * 100);
            const currentTime = performance.now();
            const chainDiameter = this.chainRadius * 2;
            const isDeviceType = document.body.classList.contains('type-device');
            
            // 디바이스 타입에 따른 폰트 크기 설정
            const mainFontSize = isDeviceType ? '10px' : '14px';
            const percentageFontSize = isDeviceType ? '14px' : '20px';
            const evolutionFontSize = isDeviceType ? '12px' : '16px';

            // 10~70% 상태에서만 진행 중 텍스트 표시
            if (ratio > 0.1 && ratio < 0.99) {
                if (currentTime - this.statusText.nodesTimer > this.statusText.nodesInterval) {
                    this.statusText.nodes = this.statusText.nodes.length >= 3 ? '.' : this.statusText.nodes + '.';
                    this.statusText.nodesTimer = currentTime;
                }

                this.statusText.fadeTarget = 1;
            } else {
                this.statusText.fadeTarget = 0;
            }
            
            this.statusText.fadeOpacity += (this.statusText.fadeTarget - this.statusText.fadeOpacity) * 0.1;

            // 100% 상태 텍스트
            if (ratio >= 0.35 && ratio < 0.99 ) {
                this.ctx.textAlign = 'center';
                this.ctx.textBaseconsensus = 'middle';
                this.ctx.fillStyle = `rgba(40, 40, 40, ${this.statusText.fadeOpacity})`;
                
                this.ctx.font = `${mainFontSize} Times New Roman`;
                const baseY = this.chainA.y * 2;
                
                // 진행 텍스트와 ... 사이를 단일 스페이스로 설정
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Rollup syncing in progress${this.statusText.nodes}`, 
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
                const baseY = this.chainA.y + chainDiameter * 0.16;
                
                this.ctx.font = `${mainFontSize} Times New Roman`;
                this.ctx.fillText('Rollup sync completed.',
                    this.canvas.width/2,
                    baseY);
                    
                this.ctx.font = `${percentageFontSize} Times New Roman`;
                this.ctx.fillText('100%',
                    this.canvas.width/2,
                    baseY + spacing - 3);
                    
                // evolution 텍스트도 동일하게 단일 스페이스 적용
                this.ctx.font = `${evolutionFontSize} Times New Roman`;
                this.ctx.fillText(`Preparing for evolution${this.statusText.nodes}`,
                    this.canvas.width/2,
                    baseY + spacing * 2 - 10);
            } else {
                if (this.statusText.fadeOpacity > 0.01) {
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseconsensus = 'middle';
                    this.ctx.fillStyle = `rgba(40, 40, 40, ${this.statusText.fadeOpacity})`;
                    
                    this.ctx.font = `${mainFontSize} Times New Roman`;

                    const baseY = this.chainA.y * 2;
                    
                    // 진행 텍스트와 ... 사이를 단일 스페이스로 설정
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`Rollup syncing in progress${this.statusText.nodes}`, 
                        this.canvas.width/2, 
                        baseY);
                    
                    this.ctx.font = `${percentageFontSize} Times New Roman`;
                    this.ctx.fillText(`${percentage}%`,
                        this.canvas.width/2,
                        baseY + 25);
                }
            }
        }


        /**
         * 체인 레이블 텍스트 렌더링
         * - CO2, Net-Zero, COC 텍스트 표시
         * - 동기화 상태에 따른 위치 조정
         */
        drawImages() {
            const ratio = this.getIntersectionRatio();
            this.ctx.textAlign = 'center';
            this.ctx.textBaseconsensus = 'middle';
            this.ctx.fillStyle = 'rgba(40, 40, 40, 1)';
        
            const transitionThreshold = 0.7;
            
            // 더 작은 폰트 크기와 간격으로 조정
            const fontSize = Math.min(Math.max(Math.floor(this.chainRadius * 0.2), 16), 24); // 최대 24px로 제한
            const smallFontSize = Math.min(Math.max(Math.floor(this.chainRadius * 0.1), 10), 13); // 최대 14px로 제한
            
            // 텍스트 수직 간격을 더 좁게 조정
            const verticalSpacing = fontSize * 0.65; // 0.8에서 0.6으로 감소
        
            if (ratio >= transitionThreshold) {
                const transition = (ratio - transitionThreshold) / (1 - transitionThreshold);
                const easing = this.easeInOutQuad(transition);
                
                const centerX = this.canvas.width / 2;
                const centerY = this.chainA.y;
                
                // 최소 간격 보장하면서 수평 간격 조정
                const minSpacing = Math.max(this.chainRadius * 0.6, 56); // 간격을 더 좁게 조정
                const spacing = Math.max(minSpacing, this.chainRadius * 0.3 * (1 - easing));
        
                const co2X = Math.min(centerX - spacing, centerX - minSpacing);
                const zeroX = centerX;
                const cocX = Math.max(centerX + spacing, centerX + minSpacing);
        
                // 메인 텍스트 (위치 조정)
                this.ctx.font = `bold ${fontSize}px Times New Roman`;
                this.ctx.fillText('CO2', co2X, centerY - verticalSpacing/2);
                this.ctx.fillText('0', zeroX +5, centerY - verticalSpacing/2);
                this.ctx.fillText('COC', cocX, centerY - verticalSpacing/2);
        
                // 설명 텍스트 (위치 조정)
                this.ctx.font = `${smallFontSize}px Times New Roman`;
                this.ctx.fillText('Carbon Emission', co2X, centerY + verticalSpacing/2);
                this.ctx.fillText('Net-Zero', zeroX +5, centerY + verticalSpacing/2);
                this.ctx.fillText('Carbon Offset', cocX, centerY + verticalSpacing/2);
            } else {
                // 기본 상태 텍스트 렌더링 (더 컴팩트하게)
                this.ctx.font = `bold ${fontSize}px Times New Roman`;
                this.ctx.fillText('CO2', this.chainA.x, this.chainA.y - verticalSpacing/2);
                this.ctx.fillText('0', this.chainB.x, this.chainB.y - verticalSpacing/2);
                this.ctx.fillText('COC', this.chainC.x, this.chainC.y - verticalSpacing/2);
        
                this.ctx.font = `${smallFontSize}px Times New Roman`;
                this.ctx.fillText('Carbon Emission', this.chainA.x, this.chainA.y + verticalSpacing/2);
                this.ctx.fillText('Net-Zero', this.chainB.x, this.chainB.y + verticalSpacing/2);
                this.ctx.fillText('Carbon Offset', this.chainC.x, this.chainC.y + verticalSpacing/2);
            }
        
        }
        
       
        /**
         * 상호작용 레이블 렌더링
         * - 레이블 박스 그리기
         * - 연결선 그리기
         * - 호버 효과 적용
         */
        drawLabels() {
            if (!this.labels) return;
        
            const fontSize = 14;
            const lineHeight = 1.5;  // line-height 설정
            this.ctx.font = `${fontSize}px Times New Roman`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            this.labels.forEach(label => {
                const node = this.getNodePosition(label.nodeNumber);
                if (!node) return;
                
                const textWidth = this.ctx.measureText(label.text).width;
                const padding = { x: 10, y: 2.5 };
                
                // 박스 위치 계산
                const boxX = node.x - textWidth/2 - padding.x;
                const boxY = label.top ? 
                        node.y - label.distance - padding.y : 
                        node.y + label.distance - padding.y;
        
                const boxWidth = textWidth + padding.x * 2;
                const textHeight = fontSize * lineHeight;  // line-height 적용
                const boxHeight = textHeight + padding.y * 2;
                
                // N2 등의 텍스트가 가려지지 않도록 선 분리
                const consensusGap = 35; // 텍스트와 선 사이 간격
                const consensusStartY = label.top ? boxY + boxHeight : boxY;
                let  consensusEndY = label.top ? node.y : node.y;
        
                // N8, N10의 경우 아래로 consensusGap만큼 이동
                if (label.id === 'n8' || label.id === 'n10') {
                    consensusEndY += consensusGap;
                } else {
                    consensusEndY -= consensusGap;
                }
        
                
                // 외곽선 그리기
                    this.ctx.strokeStyle = this.hoveredLabel?.id === label.id ? 
                    'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, .5)';
                this.ctx.consensusWidth = 1.5;
                this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
                // 연결선 그리기
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, consensusStartY);
                this.ctx.lineTo(node.x, consensusEndY);
                this.ctx.stroke();
                
                // 텍스트 그리기
                this.ctx.fillStyle = this.hoveredLabel?.id === label.id ? 
                    'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, .5)';
                this.ctx.fillText(label.text, node.x, label.top ? boxY + boxHeight/2 : boxY + boxHeight/2);
            });
        }


    





    /**
     * 체인 간 거리 계산
     * @returns {number} - 두 체인 중심점 간의 거리
     */
    getDistance() {
        return Math.hypot(
            this.chainB.x - this.chainA.x,
            this.chainB.y - this.chainA.y
        );
    }


    /**
     * 교차 영역 비율 계산
     * @returns {number} - 0~1 사이의 교차 비율
     */
    getIntersectionRatio() {
        const distance = this.getDistance();
        const maxDistance = this.chainRadius * 2;
        
        if (distance >= maxDistance) return 0;
        if (distance <= 0) return 1;
        
        return 1 - (distance / maxDistance);
    }

    
    /**
     * B와 C 체인 간 교차점 계산
     * @returns {Array|null} - 교차점 좌표 배열 또는 null
     */
    getIntersectionNodesBC() {
        const d = Math.hypot(this.chainB.x - this.chainC.x, this.chainB.y - this.chainC.y);
        if (d >= this.chainRadius * 2 || d <= 0) return null;

        const a = (this.chainRadius * this.chainRadius - this.chainRadius * this.chainRadius + d * d) / (2 * d);
        const h = Math.sqrt(this.chainRadius * this.chainRadius - a * a);

        const px = this.chainB.x + a * (this.chainC.x - this.chainB.x) / d;
        const py = this.chainB.y + a * (this.chainC.y - this.chainB.y) / d;

        return [
            {
                x: px + h * (this.chainC.y - this.chainB.y) / d,
                y: py - h * (this.chainC.x - this.chainB.x) / d
            },
            {
                x: px - h * (this.chainC.y - this.chainB.y) / d,
                y: py + h * (this.chainC.x - this.chainB.x) / d
            }
        ];
    }

    
    /**
     * 노드의 특정 체인 영역 내 포함 여부 확인
     * @param {Object} node - 노드 객체
     * @param {Object} chain - 체인 객체
     * @returns {boolean} - 포함 여부
     */
    isNodeInChain(node, chain) {
        const dx = node.x - chain.x;
        const dy = node.y - chain.y;
        return Math.sqrt(dx * dx + dy * dy) <= chain.radius;
    }


    /**
     * 3중 교차 상태 확인
     * @returns {boolean} - 3개 체인의 교차 영역 존재 여부
     */
    hasTripleIntersection() {
        return this.getTripleIntersectionNodes().length > 0;
    }


    /**
     * 3중 교차 노드 계산
     * @returns {Array} - 모든 체인에 포함된 노드 배열
     * - 각 체인별로 다른 두 체인과의 교차 여부 확인
     * - 교차된 노드의 좌표와 속성 반환
     */
    getTripleIntersectionNodes() {
        const nodes = [];
        
        ['A', 'B', 'C'].forEach(chainName => {
            const currentChain = this.getCurrentChain(chainName);
            
            this.fixedNodes[`chain${chainName}`].forEach(node => {
                const pos = {
                    x: currentChain.x + currentChain.radius * Math.cos(node.angle),
                    y: currentChain.y + currentChain.radius * Math.sin(node.angle)
                };
                
                // 다른 두 원 모두와의 교집합 체크
                const otherChains = ['A', 'B', 'C'].filter(name => name !== chainName);
                const isInTripleIntersection = otherChains.every(otherName => {
                    const otherChain = this.getCurrentChain(otherName);
                    return this.isNodeInSingleChain(pos, otherChain);
                });
                
                if (isInTripleIntersection) {
                    nodes.push({
                        angle: node.angle,
                        chain: chainName,
                        x: pos.x,
                        y: pos.y
                    });
                }
            });
        });

        // 디버깅 로그
        return nodes;
    }


    /**
    * 노드의 교차 영역 포함 여부 확인
    * @param {Object} node - 확인할 노드
    *   @param {number} node.x - 노드의 x좌표
    *   @param {number} node.y - 노드의 y좌표
    *   @param {string} node.chain - 노드의 소속 체인
    * @returns {boolean} 다른 체인들과의 교차 영역 내 존재 여부
    */
    isNodeInIntersection(node) {
        // node.chain이 어느 원에 속하는지에 따라 다른 원들과의 교집합 체크
        switch(node.chain) {
            case 'A':
                // A원의 노드이 B원이나 C원과 겹치는지 확인
                return this.isNodeInChain(node, this.chainB) || this.isNodeInChain(node, this.chainC);
            case 'B':
                // B원의 노드이 A원이나 C원과 겹치는지 확인
                return this.isNodeInChain(node, this.chainA) || this.isNodeInChain(node, this.chainC);
            case 'C':
                // C원의 노드이 A원이나 B원과 겹치는지 확인
                return this.isNodeInChain(node, this.chainA) || this.isNodeInChain(node, this.chainB);
            default:
                return false;
        }
    }


    /**
     * 노드의 단일 체인 내 포함 여부 확인
     * @param {Object} node - 확인할 노드
     * @param {Object} targetChain - 대상 체인
     * @returns {boolean} - 해당 체인 내 포함 여부
     */
    isNodeInSingleChain(node, targetChain) {
        const dx = node.x - targetChain.x;
        const dy = node.y - targetChain.y;
        return Math.sqrt(dx * dx + dy * dy) <= targetChain.radius;
    }


    /**
     * 노드의 모든 체인 내 포함 여부 확인
     * @param {Object} node - 확인할 노드
     * @returns {boolean} - 모든 체인에 포함되는지 여부
     */
    isNodeInAllChains(node) {
        const otherChains = ['A', 'B', 'C'].filter(name => name !== node.chain)
            .map(name => this.getCurrentChain(name));
        
        return otherChains.every(chain => this.isNodeInSingleChain(node, chain));
    }













    /**
     * 전체 합의 라인 생성
     * @param {string} state - 현재 상태
     * @returns {Array} - 생성된 합의 라인 객체 배열
     * - 교차 영역과 비교집합 영역의 합의 라인 생성
     * - 상태에 따른 라인 속성 설정
     */
    createConsensuses(state) {
        const Consensuses = [];
        const intersectionRatio = this.getIntersectionRatio();

        if (state !== 'waiting' && state !== 'init') {
            // 3중 교집합 여부 확인
            const hasTripleIntersection = this.hasTripleIntersection();

            if (hasTripleIntersection) {
                // 3중 교집합 노드들만 처리
                this.processTripleIntersectionConsensuses(Consensuses);
            } else {
                // A∩B 교집합 처리
                this.processIntersectionConsensuses('A', 'B', Consensuses);
                // B∩C 교집합 처리
                this.processIntersectionConsensuses('B', 'C', Consensuses);
            }
        }

        // 비교집합 영역의 랜덤 선 생성
        if (intersectionRatio < 0.99) {
            ['A', 'B', 'C'].forEach(chain => {
                const currentChain = this.getCurrentChain(chain);
                if (!currentChain) return;

                const nonIntersectionNodes = this.fixedNodes[`chain${chain}`].filter(node => {
                    const pos = {
                        x: currentChain.x + currentChain.radius * Math.cos(node.angle),
                        y: currentChain.y + currentChain.radius * Math.sin(node.angle),
                        chain: chain
                    };
                    return !this.isNodeInIntersection(pos);
                });

                if (nonIntersectionNodes.length > 0) {
                    const startNode = nonIntersectionNodes[Math.floor(Math.random() * nonIntersectionNodes.length)];
                    
                    this.fixedNodes[`chain${chain}`].forEach(endNode => {
                        if (startNode !== endNode) {
                            Consensuses.push({
                                start: {
                                    angle: startNode.angle,
                                    chain: chain
                                },
                                end: {
                                    angle: endNode.angle,
                                    chain: endNode.chain
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

        return Consensuses;
    }


    /**
     * 교차 영역 합의 라인 처리
     * @param {string} chainA - 첫 번째 체인 식별자
     * @param {string} chainB - 두 번째 체인 식별자
     * @param {Array} Consensuses - 합의 라인 배열
     * - 두 체인 간 교차 영역의 노드들에 대한 합의 라인 생성
     */
    processIntersectionConsensuses(chainA, chainB, Consensuses) {
        const chainAObj = this.getCurrentChain(chainA);
        const chainBObj = this.getCurrentChain(chainB);
        
        // 각 원의 교집합 노드 찾기
        const intersectionNodesC1 = this.fixedNodes[`chain${chainA}`].filter(node => {
            const pos = this.calculateFixedNodePosition(node, chainAObj);
            return this.isNodeInSingleChain(pos, chainBObj);
        });

        const intersectionNodesC2 = this.fixedNodes[`chain${chainB}`].filter(node => {
            const pos = this.calculateFixedNodePosition(node, chainBObj);
            return this.isNodeInSingleChain(pos, chainAObj);
        });

        // chainA의 교집합 노드들에서 선 생성
        intersectionNodesC1.forEach(startNode => {
            // 같은 원의 모든 노드들과 연결
            this.fixedNodes[`chain${chainA}`].forEach(endNode => {
                if (startNode !== endNode) {
                    Consensuses.push(this.createIntersectionConsensus(startNode, endNode, chainA, chainA));
                }
            });
        });

        // chainB의 교집합 노드들에서 선 생성
        intersectionNodesC2.forEach(startNode => {
            // 같은 원의 모든 노드들과 연결
            this.fixedNodes[`chain${chainB}`].forEach(endNode => {
                if (startNode !== endNode) {
                    Consensuses.push(this.createIntersectionConsensus(startNode, endNode, chainB, chainB));
                }
            });
        });
    }


    /**
     * 3중 교차 영역 합의 라인 처리
     * @param {Array} Consensuses - 합의 라인 배열
     * - 3중 교차 영역 노드들의 합의 라인 생성
     * - 완전 동기화 상태 처리
     */
    processTripleIntersectionConsensuses(Consensuses) {
        const tripleIntersectionNodes = this.getTripleIntersectionNodes();
        const intersectionRatio = this.getIntersectionRatio();
        
        // 100% 교집합 상태 체크
        const isComplete = intersectionRatio >= 0.99;
        
        if (isComplete) {
            // 100% 상태일 때는 A 원의 모든 노드에서 선 생성
            this.fixedNodes.chainA.forEach(startNode => {
                this.fixedNodes.chainA.forEach(endNode => {
                    if (startNode.angle !== endNode.angle) {
                        Consensuses.push({
                            start: {
                                angle: startNode.angle,
                                chain: 'A'
                            },
                            end: {
                                angle: endNode.angle,
                                chain: 'A'
                            },
                            progress: Math.random() * 0.2,
                            opacity: 1,
                            isIntersection: true,
                            fadeOutProgress: 0,
                            duration: this.ConsensusAnimationState.intersectionDuration
                        });
                    }
                });
            });
        } else {
            // 100% 미만일 때는 기존 로직 유지
            tripleIntersectionNodes.forEach(startNode => {
                ['A', 'B', 'C'].forEach(targetChain => {
                    this.fixedNodes[`chain${targetChain}`].forEach(endNode => {
                        if (!(startNode.chain === targetChain && startNode.angle === endNode.angle)) {
                            Consensuses.push(this.createTripleIntersectionConsensus(startNode, endNode, targetChain));
                        }
                    });
                });
            });
        }
    }
    
    

    /**
     * 교차 영역 합의 라인 생성
     * @param {Object} startNode - 시작 노드
     * @param {Object} endNode - 종료 노드
     * @param {string} startChain - 시작 체인
     * @param {string} endChain - 종료 체인
     * @returns {Object} - 생성된 합의 라인 객체
     */
    createIntersectionConsensus(startNode, endNode, startChain, endChain) {
        return {
            start: {
                angle: startNode.angle,
                chain: startChain
            },
            end: {
                angle: endNode.angle,
                chain: endChain
            },
            progress: 0,
            opacity: 1,
            isIntersection: true,
            fadeOutProgress: 0
        };
    }


    /**
     * 3중 교차 합의 라인 생성
     * @param {Object} startNode - 시작 노드
     * @param {Object} endNode - 종료 노드
     * @param {string} targetChain - 대상 체인
     * @returns {Object} - 생성된 3중 교차 합의 라인 객체
     */
    createTripleIntersectionConsensus(startNode, endNode, targetChain) {
        return {
            start: {
                angle: startNode.angle,
                chain: startNode.chain
            },
            end: {
                angle: endNode.angle,
                chain: targetChain
            },
            progress: Math.random() * 0.2,
            opacity: 1,
            isIntersection: true,
            fadeOutProgress: 0,
            duration: this.ConsensusAnimationState.intersectionDuration
        };
    }


    /**
    * 비교집합 영역에서 랜덤한 활성 노드 선택
    * @description 각 체인(A, B, C)별로 교차 영역에 속하지 않은 노드들 중
    * 랜덤하게 하나씩 선택하여 ConsensusAnimationState.activeNodes에 저장
    * 
    * @updates {Object} ConsensusAnimationState.activeNodes
    *   @property {Object|null} A - A 체인의 활성 노드
    *   @property {Object|null} B - B 체인의 활성 노드 
    *   @property {Object|null} C - C 체인의 활성 노드
    */
    selectRandomActiveNodes() {
        // 각 원의 비교집합 노드들 찾기
        const nonIntersectionNodes = {
            A: this.fixedNodes.chainA.filter(node => 
                !this.isNodeInIntersection(this.calculateFixedNodePosition(node, this.chainA))),
            B: this.fixedNodes.chainB.filter(node => 
                !this.isNodeInIntersection(this.calculateFixedNodePosition(node, this.chainB))),
            C: this.fixedNodes.chainC.filter(node => 
                !this.isNodeInIntersection(this.calculateFixedNodePosition(node, this.chainC)))
        };

        // 각 원에서 하나씩 랜덤 선택
        this.ConsensusAnimationState.activeNodes = {
            A: nonIntersectionNodes.A.length > 0 ? 
                nonIntersectionNodes.A[Math.floor(Math.random() * nonIntersectionNodes.A.length)] : null,
            B: nonIntersectionNodes.B.length > 0 ? 
                nonIntersectionNodes.B[Math.floor(Math.random() * nonIntersectionNodes.B.length)] : null,
            C: nonIntersectionNodes.C.length > 0 ? 
                nonIntersectionNodes.C[Math.floor(Math.random() * nonIntersectionNodes.C.length)] : null
        };
    }












    /**
    * 고정 노드의 현재 위치를 계산
    * @param {Object} node - 계산할 노드 객체
    *   @param {number} node.angle - 노드의 각도
    *   @param {string} node.chain - 소속 체인 식별자
    *   @param {number} node.opacity - 노드 투명도
    * @param {Object} chain - 소속 체인 객체
    *   @param {number} chain.x - 체인의 중심 x좌표
    *   @param {number} chain.y - 체인의 중심 y좌표
    *   @param {number} chain.radius - 체인의 반지름
    * @returns {Object} - 계산된 노드 정보
    *   @returns {number} x - 노드의 x좌표
    *   @returns {number} y - 노드의 y좌표 
    *   @returns {string} chain - 소속 체인 식별자
    *   @returns {number} opacity - 노드 투명도
    */
    calculateFixedNodePosition(node, chain) {
        return {
            x: chain.x + chain.radius * Math.cos(node.angle),
            y: chain.y + chain.radius * Math.sin(node.angle),
            chain: node.chain,
            opacity: node.opacity
        };
    }


    /**
     * 색상 블렌딩 계산
     * @param {Object} color1 - 첫 번째 색상
     * @param {Object} color2 - 두 번째 색상
     * @param {number} ratio - 블렌딩 비율
     * @returns {Object} - 계산된 색상
     */
    blendColors(color1, color2, ratio) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * ratio),
            g: Math.round(color1.g + (color2.g - color1.g) * ratio),
            b: Math.round(color1.b + (color2.b - color1.b) * ratio)
        };
    }


    /**
     * RGB 색상을 RGBA 문자열로 변환
     * @param {Object} color - RGB 색상 객체
     * @param {number} alpha - 투명도
     * @returns {string} - RGBA 문자열
     */
    getRGBAString(color, alpha) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }


    /**
     * 현재 체인 객체 반환
     * @param {string} chain - 체인 식별자 ('A', 'B', 'C')
     * @returns {Object|null} - 해당하는 체인 객체 또는 null
     */
    getCurrentChain(chain) {
        switch(chain) {
            case 'A':
                return this.chainA;
            case 'B':
                return this.chainB;
            case 'C':
                return this.chainC;
            default:
                console.error('Invalid chain identifier:', chain);
                return null;
        }
    }


    /**
     * 특정 노드 번호의 위치 계산
     * @param {number} nodeNumber - 노드 번호
     * @returns {Object|null} - 노드의 x, y 좌표 또는 null
     */
    getNodePosition(nodeNumber) {
        const node = this.fixedNodes.chainB.find(p => p.number === nodeNumber);
        if (!node) return null;
        
        return {
            x: this.chainB.x + this.chainRadius * Math.cos(node.angle),
            y: this.chainB.y + this.chainRadius * Math.sin(node.angle)
        };
    }


    /**
     * 노드 위치를 체인에 맞게 조정
     * @param {Object} node - 조정할 노드 객체
     * @param {Object} chain - 대상 체인 객체
     * @returns {Object} - 조정된 노드 위치 및 속성
     */
    adjustNodeToChain(node, chain) {
        const dx = node.x - chain.x;
        const dy = node.y - chain.y;
        const currentRadius = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        return {
            x: chain.x + chain.radius * Math.cos(angle),
            y: chain.y + chain.radius * Math.sin(angle),
            chain: node.chain,
            opacity: node.opacity
        };
    }


    /**
     * 선형 보간 계산
     * @param {number} start - 시작값
     * @param {number} end - 종료값
     * @param {number} t - 진행도 (0~1)
     * @returns {number} - 보간된 값
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
        }


    /**
     * Quint 이징 효과 계산
     * @param {number} x - 진행도 (0~1)
     * @returns {number} - 계산된 이징 값
     */
    easeOutQuint(x) {
        return 1 - Math.pow(1 - x, 5);
    }
    

    /**
     * Quad 이징 효과 계산
     * @param {number} t - 진행도 (0~1)
     * @returns {number} - 계산된 이징 값
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }



}

document.addEventListener('DOMContentLoaded', () => {
new ChainRollupVisualizer();
});

