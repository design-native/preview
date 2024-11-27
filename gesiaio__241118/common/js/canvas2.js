
const ICON_CONFIG = {
    images: {},
    loaded: false,
    width: 45,          // 아이콘 너비
    height: 45,         // 아이콘 높이
    topPadding: 12,     // 박스 상단에서의 간격
    spacing: 44,        // 아이콘과 텍스트 사이 간격
    paths: {
        emissionC: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_emissionC.png',
        emissionT: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_emissionT.png',
        creditT: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_creditT.png',
        creditR: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_creditR.png',

        externalE: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalE.png',
        externalG: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalG.png',
        externalO: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalO.png',
        externalW: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalW.png',
        externalR: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalR.png',
        externalA: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalA.png',

        netB: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_netB.png',
        netR: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_netR.png',
    }
};
// 모든 아이콘 이미지 프리로드
function loadIcons() {
    if (ICON_CONFIG.loaded) return Promise.resolve();

    const loadPromises = Object.entries(ICON_CONFIG.paths).map(([key, path]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                ICON_CONFIG.images[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = path;
        });
    });

    return Promise.all(loadPromises).then(() => {
        ICON_CONFIG.loaded = true;
    });
}


async function initializeCanvas1(canvasId){

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let currentStep = 0;
    let segmentIndex = 0;

    const steps = 4;
    const MOVE_SPEED = 3;
    let moveNode = {
        x: 0,
        y: 0,
        init: false
    };

    let chainNodes = [];
    let activeLines = [];
    let currentSource = null;

    // 선 애니메이션을 위한 상태
    const lineAnimationState = {
        duration: 1500,    // 더 빠른 선 애니메이션
    };

    let dashedLines = {
        line1: false,
        line2: false
    };
    let shouldClearDashedLines = false;

    let recentVisitedPositions = [];
    const RECENT_VISITED_DURATION = 500; // 1초 동안 기억
    // 도달한 포인트를 기억하기 위한 상태 추가
    let pendingLineCreation = {
        shouldCreate: false,
        position: null,
        type: null
    };
    let pendingLineCreations = [];



    // Aggregation structure constants
    const AGGREGATION_NODE_RADIUS = 3;
    const NODE_DISTANCE = 35;
    const BRANCH_ANGLE = Math.PI / 4;
    const AGGREGATION_LEVELS = 6;

    // Aggregation node structure
    let aggregationNodes = [];
    const consumptionLabels = [
        { text: "Electricity consumption", icon: "externalE" },
        { text: "Gas consumption", icon: "externalG" },
        { text: "Oil consumption", icon: "externalO" },
        { text: "·", icon: "" },
        { text: "·", icon: "" },
        { text: "·", icon: "" },
        { text: "Water consumption", icon: "externalW" }
    ];
    let aggregationAnimationNode = {
        x: 0,
        y: 0,
        init: false,
        currentNodeIndex: 0
    };
    const ANIMATION_SPEEDS = {
        aggregation: 1,      // 트리 애니메이션용 느린 속도
        regular: 3    // 기존 애니메이션 속도
    };

    // 먼저 아이콘들을 로드
    try {
        await loadIcons();
    } catch (error) {
        console.error('Failed to load ICON_CONFIG:', error);
    }
// 트리 경로 계산 함수 추가
function calculateAggregationPath() {
    let path = [];
    // 마지막 레벨의 노드들
    const lastLevelNodes = aggregationNodes.slice(-Math.pow(2, AGGREGATION_LEVELS));
    // 시작 노드 (마지막 레벨의 첫 번째 노드)
    let currentNode = lastLevelNodes[0];
    let currentIndex = aggregationNodes.indexOf(currentNode);
    
    while (currentIndex > 0) {
        path.push({x: currentNode.x, y: currentNode.y});
        // 부모 노드의 인덱스 계산
        const parentIndex = Math.floor((currentIndex - 1) / 2);
        currentNode = aggregationNodes[parentIndex];
        currentIndex = parentIndex;
    }
    // 루트 노드 추가
    path.push({x: currentNode.x, y: currentNode.y});
    
    // 트리 애니메이션 시작 위치 및 크기 조정
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aggregationAnimationScale = 0.7; // 트리 애니메이션 크기 조절 계수
    
    path.forEach(node => {
        node.x = node.x * aggregationAnimationScale + canvasWidth * 0.15;
        node.y = node.y * aggregationAnimationScale + canvasHeight * 0.15;
    });
    
    return path;
}
let aggregationAnimationNodes = [];

function initializeAggregationAnimationNodes(paths) {
    aggregationAnimationNodes = paths.map(path => ({
        x: path[0].x,
        y: path[0].y,
        currentSegment: 0,
        path: path,
        active: true
    }));
}
function calculateAggregationNodes(startX, startY) {
    aggregationNodes = [];
    let currentLevel = [{ x: startX, y: startY }];
    aggregationNodes.push(...currentLevel);

    for (let level = 0; level < AGGREGATION_LEVELS; level++) {
        const nextLevel = [];
        currentLevel.forEach(node => {
            // Calculate two child nodes with adjusted angles for flatter aggregation
            const upNode = {
                x: node.x - NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8), // 각도를 줄여서 더 평평하게
                y: node.y - NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            const downNode = {
                x: node.x - NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8),
                y: node.y + NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            nextLevel.push(upNode, downNode);
            aggregationNodes.push(upNode, downNode);
        });
        currentLevel = nextLevel;
    }
}
function getMaxTextDimensions(labels) {
    ctx.font = '18px "Times New Roman"';
    let maxWidth = 0;
    let maxHeight = 0;
    
    labels.forEach(label => {
        if (label.text) {
            const metrics = ctx.measureText(label.text);
            maxWidth = Math.max(maxWidth, metrics.width);
            
            // 텍스트 높이 계산
            const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            maxHeight = Math.max(maxHeight, height);
        }
    });
    
    return {
        width: maxWidth,
        height: maxHeight,
        lineHeight: maxHeight * 1.2 // 줄 간격을 위한 lineHeight 추가 (보통 1.2배)
    };
}
function getLabelSpacing() {
    // 마지막 레벨의 노드들을 선택
    const lastLevelNodes = aggregationNodes.slice(-Math.pow(2, AGGREGATION_LEVELS));
    
    // 연속된 두 노드 사이의 y값 차이 계산
    let totalSpacing = 0;
    let spacingCount = 0;
    
    for (let i = 0; i < lastLevelNodes.length - 1; i++) {
        const spacing = Math.abs(lastLevelNodes[i + 1].y - lastLevelNodes[i].y);
        totalSpacing += spacing;
        spacingCount++;
    }
    
    // 평균 간격 반환
    return totalSpacing / spacingCount;
}

function drawAggregation() {
    // 선 먼저 그리기 (모든 선을 하나의 path로)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(50,50,50,1)';
    ctx.lineWidth = 1;
    
    aggregationNodes.forEach((node, index) => {
        if (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(aggregationNodes[parentIndex].x, aggregationNodes[parentIndex].y);
        }
    });
    ctx.stroke();

    // 노드 그리기
    aggregationNodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, AGGREGATION_NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    });

    // 가장 긴 텍스트의 너비 계산
    // 텍스트의 최대 크기 계산
    const textDimensions = getMaxTextDimensions(consumptionLabels);
    const labelSpacing = getLabelSpacing() + 5; // 노드 간격으로 라벨 간격 설정
    
    // 라벨 시작 위치 계산
    const labelStartX = aggregationNodes[aggregationNodes.length - 1].x - 20;
    const baseY = canvas.height / 2.05 - ((consumptionLabels.length - 1) * labelSpacing) / 2 + 3;
    const iconWidth = ICON_CONFIG.width/2;

    consumptionLabels.forEach((label, index) => {
        if (label.text) {
            const y = baseY + (index * labelSpacing);
            
            ctx.font = '18px "Times New Roman"';
            ctx.fillStyle = 'rgba(50,50,50,1)';
            
            // 특수 문자(···)일 경우 중앙 정렬로 처리
            if (label.text === '·') {
                ctx.textAlign = 'center';
                // labelStartX에서 전체 width의 절반만큼 왼쪽으로 이동한 지점을 중앙으로 설정
                const centerX = labelStartX - textDimensions.width/2;
                ctx.fillText(label.text, centerX, y - textDimensions.height/2);
            } else {
                // 일반 텍스트는 기존대로 왼쪽 정렬
                ctx.textAlign = 'left';
                // Icon
                if (label.icon && ICON_CONFIG.images[label.icon]) {
                    const icon = ICON_CONFIG.images[label.icon];
                    ctx.drawImage(icon, labelStartX - textDimensions.width - iconWidth - 14, y - ICON_CONFIG.height/2, ICON_CONFIG.width/2, ICON_CONFIG.height/2);
                } else {
                    ctx.fillText(label.icon, labelStartX - textDimensions.width - iconWidth - 6, y - textDimensions.height/2);
                }
                
                // Text
                ctx.fillText(label.text, labelStartX - textDimensions.width - 5, y - textDimensions.height/2);
            }
        }
    });
}
    
    // 점 초기화 함수
    function initializeChainNodes() {
        chainNodes = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            chainNodes.push({
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            });
        }
    }
    
    // 점의 위치 계산 헬퍼 함수
    function calculateNodePosition(node, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(node.angle),
            y: centerY + radius * Math.sin(node.angle)
        };
    }

    
    // 선 그리기 함수 수정
function drawConsensus(line) {
    if (!line.start || !line.end) return;

    const actualProgress = Math.min(line.progress, line.maxLength);
    const currentX = line.start.x + (line.end.x - line.start.x) * actualProgress;
    const currentY = line.start.y + (line.end.y - line.start.y) * actualProgress;

    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = `rgba(50, 50, 50, ${line.opacity})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
}


function updateAnimationState(moveNode, step) {
    const centerY = canvas.height / 2.05;
    const radius = canvas.height * 0.4;
    const chainBX = canvas.width/2 + radius * 2;

    const dataMetrics = getMultilineTextDimensions("Original\nData");
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator",true);
    const tokenMetrics = getMultilineTextDimensions("Carbon Emission\nTOKEN",true);
    
    const positions = {
        data: {
            x: chainBX - radius - dataMetrics.width/2,
            y: centerY
        },
        calculator: {
            x: chainBX - calculatorMetrics.width/2,
            y: centerY
        },
        token: {
            x: chainBX,
            y: centerY + 120 - tokenMetrics.height/1.8
        }
    };

    const threshold = 5;
    const currentTime = performance.now();

    const distances = {
        data: Math.hypot(moveNode.x - positions.data.x, moveNode.y - positions.data.y),
        calculator: Math.hypot(moveNode.x - positions.calculator.x, moveNode.y - positions.calculator.y),
        token: Math.hypot(moveNode.x - positions.token.x, moveNode.y - positions.token.y)
    };

    // 선의 완료 상태를 더 정확하게 체크
    const activeLineStates = activeLines.map(line => ({
        progress: line.progress,
        maxLength: line.maxLength,
        opacity: line.opacity
    }));
    

    // 모든 선이 완료되었는지 체크 (진행도가 1에 도달했거나 opacity가 0인 경우)
    const allLinesReachedTarget = activeLines.length === 0 || 
        activeLines.every(line => 
            line.progress >= 1 || line.opacity === 0
        );

    
    if (step === 1 || step === 0) {
        activeLines = [];
        pendingLineCreations = [];
        recentVisitedPositions = [];
        currentSource = null;
        lastAnimationStep = null;
    }
    if (step !== 5 || step !== 0) {
        // 새로운 선 생성 예약
        // DATA 위치 (첫 번째 점)에서는 즉시 생성하고 기록하지 않음
        if (distances.data < threshold && activeLines.length === 0) {
            createConsensusesAtPosition(chainBX, centerY, radius, 'N5', currentTime);
            Array(3).fill().forEach(() => {
                pendingLineCreations.push({
                    position: { x: chainBX, y: centerY, radius: radius },
                    type: 'random'
                });
            });
        }
        // Calculator와 Token 위치는 대기열에 기록
        // else if (distances.calculator < threshold) {
        //     if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
        //         pendingLineCreations.push({
        //             position: { x: chainBX, y: centerY, radius: radius },
        //             type: 'random'
        //         });
        //     }
        // }
        // else if (distances.token < threshold) {
        //     if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
        //         pendingLineCreations.push({
        //             position: { x: chainBX, y: centerY, radius: radius },
        //             type: 'random'
        //         });
        //     }
        // }
    }
    // 다음 선 생성 처리
    if (pendingLineCreations.length > 0 && allLinesReachedTarget && activeLines.length === 0) {
        const nextCreation = pendingLineCreations.shift();
        createConsensusesAtPosition(nextCreation.position.x, nextCreation.position.y, nextCreation.position.radius, nextCreation.type, currentTime);
    }
    // 기존 선 업데이트
    updateConsensuses(currentTime);
}

// updateConsensuses 함수 수정
function updateConsensuses(currentTime) {
    const oldLength = activeLines.length;
    activeLines = activeLines.filter(line => {
        const elapsed = currentTime - line.startTime;
        const duration = lineAnimationState.duration;
        
        // 진행도 업데이트
        line.progress = Math.min(elapsed / duration, 1);
        
        // 선이 목표에 도달했을 때의 처리
        if (line.progress >= line.maxLength) {
            line.opacity = 0;
        }
        
        return line.progress < 1; // 완전히 끝난 선은 제거
    });

}

// createConsensuses 함수도 수정
function createConsensuses(sourceNode, chainBX, centerY, radius, currentTime) {
    const lines = [];
    
    const startPos = calculateNodePosition(sourceNode, chainBX, centerY, radius);
    
    chainNodes.forEach(targetNode => {
        if (targetNode.number !== sourceNode.number) {
            const endPos = calculateNodePosition(targetNode, chainBX, centerY, radius);
            
            lines.push({
                start: startPos,
                end: endPos,
                progress: 0,
                opacity: 1,
                startTime: currentTime,
                duration: lineAnimationState.duration,  // 1.5초 적용
                maxLength: 1
            });
        }
    });
    
    return lines;
}
function createConsensusesAtPosition(x, y, radius, sourceType, currentTime) {
    // 최근 방문 기록 체크
    const visitedKey = `${x.toFixed(2)}-${y.toFixed(2)}`;
    const recentlyVisited = recentVisitedPositions.some(pos => pos.key === visitedKey && currentTime - pos.time < 500); // 0.5초 이내
    if (recentlyVisited) return;

    if (sourceType === 'N5') {
        currentSource = chainNodes.find(p => p.number === 5);
    } else {
        currentSource = chainNodes[Math.floor(Math.random() * chainNodes.length)];
    }
    const newLines = createConsensuses(currentSource, x, y, radius, currentTime);
    activeLines = activeLines.concat(newLines);

    // 최근 방문 기록 추가
    recentVisitedPositions.push({
        key: visitedKey,
        time: currentTime
    });
}
function resizeCanvas() {
   const vh = window.innerHeight;
   const vw = window.innerWidth;
   const aspectRatio = 25/9;
   const minWidth = 1280; // 최소 너비 설정
   const maxWidth = 1600; // 최소 너비 설정
   
   // 너비를 먼저 계산 - 화면의 90% 사용하되 최소값 보장
   let width = Math.min(Math.max(minWidth, vw * 0.9), maxWidth);
   let height = width / aspectRatio;
   
   // 높이가 화면의 90%를 넘으면 높이 기준으로 다시 계산
   if (height > vh * 0.9) {
       height = vh * 0.9;
       width = Math.max(minWidth, height * aspectRatio);
   }
   
   canvas.width = width;
   canvas.height = height;
   draw();
}
        function drawChain(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        }

        

        function drawText(text, x, y, hasBox = true, isBold = false, iconType = null) {
            const lines = text.split('\n');
            ctx.font = `${isBold ? 'bold' : 'normal'} 18px "Times New Roman"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (hasBox) {
                let maxWidth = 0;
                lines.forEach(line => {
                    const metrics = ctx.measureText(line);
                    maxWidth = Math.max(maxWidth, metrics.width);
                });
                
                const padding = { x: 12, y: 6 };
                const width = maxWidth + padding.x * 2.2;
                const iconHeight = iconType ? ICON_CONFIG.spacing : 0;  // 아이콘용 공간
                const height = 40 + (lines.length - 1) * 18 + iconHeight;
                const radius = 40 / 2;
                
                // 배경 및 테두리
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // 아이콘 그리기
                if (iconType && ICON_CONFIG.images[iconType]) {
                    const iconY = y - height/2 + ICON_CONFIG.topPadding;
                    const icon = ICON_CONFIG.images[iconType];
                    // 아이콘 중앙 정렬을 위한 x 위치 계산
                    const iconX = x - (ICON_CONFIG.width / 2);
                    ctx.drawImage(
                        icon, 
                        iconX, 
                        iconY, 
                        ICON_CONFIG.width, 
                        ICON_CONFIG.height
                    );
                }
                
                // 텍스트 그리기
                lines.forEach((line, i) => {
                    const lineY = y + (i - (lines.length-1)/2) * 18;
                    const adjustedY = iconType ? lineY + iconHeight/2 : lineY;
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fillText(line, x, adjustedY);
                });
            } else {
                // 박스 없는 경우
                if (iconType && ICON_CONFIG.images[iconType]) {
                    const iconY = y - ICON_CONFIG.spacing;
                    const icon = ICON_CONFIG.images[iconType];
                    const iconX = x - (ICON_CONFIG.width / 2);
                    ctx.drawImage(
                        icon, 
                        iconX, 
                        iconY, 
                        ICON_CONFIG.width, 
                        ICON_CONFIG.height
                    );
                }
        
                lines.forEach((line, i) => {
                    const lineY = y + (i - (lines.length-1)/2) * 18;
                    const adjustedY = iconType ? lineY + ICON_CONFIG.spacing/2 : lineY;
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fillText(line, x, adjustedY);
                });
            }
        }


        function drawArrow(nodes, isInChain = false) {
            // 선 그리기
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(50,50,50,1)';
            ctx.lineWidth = 1;
            
            // Chain 내부의 선인 경우 dash 스타일 적용
            if (isInChain) {
                ctx.setLineDash([4, 4]); // dash 패턴 설정
            } else {
                ctx.setLineDash([]); // 실선
            }
            
            ctx.moveTo(nodes[0].x, nodes[0].y);
            for(let i = 1; i < nodes.length; i++) {
                ctx.lineTo(nodes[i].x, nodes[i].y);
            }
            ctx.stroke();
            
            // dash 스타일 초기화 (화살표는 항상 실선)
            ctx.setLineDash([]);
            
            // 화살표 (마지막 점에만)
            const lastNode = nodes[nodes.length - 1];
            const secondLastNode = nodes[nodes.length - 2];
            
            const angle = Math.atan2(lastNode.y - secondLastNode.y, lastNode.x - secondLastNode.x);
            
            // 화살표 크기 조정
            const arrowLength = 8;
            const arrowWidth = 6;
            
            ctx.beginPath();
            ctx.moveTo(lastNode.x, lastNode.y);
            ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle - Math.PI/6), 
                    lastNode.y - arrowLength * Math.sin(angle - Math.PI/6));
            ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle + Math.PI/6),
                    lastNode.y - arrowLength * Math.sin(angle + Math.PI/6));
            ctx.closePath();
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
        }
        function drawDataNode(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        }
        // getTextDimensions 함수가 정확한 박스 크기를 반환하는지 확인
        function getTextDimensions(text, hasBox = true) {
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            
            if (hasBox) {
                const padding = { x: 12, y: 6 };
                return {
                    width: textWidth + (padding.x * 2.2),
                    height: Math.max(40, textHeight + (padding.y * 2))
                };
            }
            
            return {
                width: textWidth,
                height: textHeight
            };
        }
        
// getMultilineTextDimensions도 정확한 높이 계산하도록 수정
function getMultilineTextDimensions(text, hasIcon = false, hasBox = false) {
    const lines = text.split('\n');
    const lineHeight = 18;
    let maxWidth = 0;
    
    // 폰트 설정을 명시적으로 지정
    ctx.font = '18px "Times New Roman"';
    
    const padding = { x: 12, y: 6 };
    const iconSpace = hasIcon ? {
        height: ICON_CONFIG.height + ICON_CONFIG.spacing - padding.y * 2,
        width: Math.max(ICON_CONFIG.width - padding.x * 2.2, 0)
    } : {
        height: 0,
        width: 0
    };

    
    
    // 각 라인의 너비 계산을 로깅
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        const width = metrics.width + (padding.x * 2.2) + iconSpace.width;
        maxWidth = Math.max(maxWidth, width);
    });


    if (hasBox) {
        return {
            width: maxWidth,
            height: (lines.length * lineHeight) + (padding.y * 2) + iconSpace.height
        };
    }
    
    return {
        width: maxWidth,
        height: (lines.length * lineHeight) + ICON_CONFIG.height + ICON_CONFIG.topPadding
    };
}

// draw 함수 내에서도 확인
function draw() {
    // ...
    const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
    
    const dataTextX = chainAX + radius - dataMetrics.width/2;
    // ...
}
    // 여러 데이터 포인트를 추적하기 위한 구조

// 트리 경로 계산 함수 수정
function calculateAllAggregationPaths() {
    const paths = [];
    // 마지막 레벨의 시작과 끝 인덱스 계산 수정
    const levelSize = Math.pow(2, AGGREGATION_LEVELS);  // 마지막 레벨의 노드 수
    const totalNodes = Math.pow(2, AGGREGATION_LEVELS + 1) - 1;  // 전체 노드 수
    const lastLevelStart = totalNodes - levelSize;  // 마지막 레벨 시작 인덱스
    
    // 마지막 레벨의 노드들
    const lastLevelNodes = aggregationNodes.slice(lastLevelStart, totalNodes);
    
    // 각 마지막 레벨 노드에 대해 경로 생성
    lastLevelNodes.forEach(startNode => {
        let path = [];
        let currentNode = startNode;
        let currentIndex = aggregationNodes.indexOf(currentNode);
        
        // 루트까지의 경로 생성
        while (currentIndex > 0) {
            path.push({x: currentNode.x, y: currentNode.y});
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            currentNode = aggregationNodes[parentIndex];
            currentIndex = parentIndex;
        }
        // 루트 노드 추가
        path.push({x: currentNode.x, y: currentNode.y});
        paths.push(path);
    });
    
    return paths;
}

// moveNodes 초기화 함수
function initializeAggregationAnimationNodes(paths) {
    aggregationAnimationNodes = paths.map(path => ({
        x: path[0].x,
        y: path[0].y,
        currentSegment: 0,
        path: path,
        active: true
    }));
}
        
function calculateAnimationPath(step) {
    const centerY = canvas.height / 2.05;
    const radius = canvas.height * 0.4;
    const chainAX = canvas.width/2 - radius * 2;
    const chainBX = canvas.width/2 + radius * 2;

    const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
    const data2Metrics = getMultilineTextDimensions("Original\nData", false);
    const notaryMetrics = getTextDimensions("Notary Oracle", true);
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator", true);
    let isInChain = false;
    const positions = {
        dataLeft: { x: chainAX + radius, y: centerY },
        dataRight: { x: chainBX - radius, y: centerY },
        notary: { x: (chainAX + chainBX) / 2, y: centerY },
        calculator: { x: chainBX, y: centerY },
        token: { x: chainBX, y: centerY + 120 }
    };
            
    if (step === 0) {
        return {
            nodes: [],  // 빈 배열 반환 - 트리 애니메이션은 별도 처리
            isAggregationAnimation: true
        };
    }
    switch(step) {
        case 0:
            return {
                nodes: calculateAggregationPath()
            };
        case 1:
            return {
                nodes: [
                    { x: positions.dataLeft.x + dataMetrics.width/2, y: positions.dataLeft.y},
                    { x: positions.notary.x - notaryMetrics.width/2 - 5, y: positions.dataLeft.y }
                ]
            };
        // ... 기존 케이스들을 한 단계씩 밀어서 재정의
        case 2:
            return {
                nodes: [
                    { x: positions.notary.x + notaryMetrics.width/2 + 5, y: positions.dataRight.y },
                    { x: positions.dataRight.x - data2Metrics.width/2, y: positions.dataRight.y}
                ]
            };
        case 3:
            return {
                nodes: [
                    { x: positions.dataRight.x + data2Metrics.width/2, y: positions.dataRight.y },
                    { x: positions.calculator.x - calculatorMetrics.width/2, y: positions.calculator.y }
                ],
                isInChain: true  // 체인 내부 선
            };
        case 4:
            return {
                nodes: [
                    { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                    { x: positions.calculator.x, y: positions.token.y - calculatorMetrics.height/2 }
                ],
                isInChain: true
            };
        case 5:
            return {
                nodes: [
                    { x: positions.token.x, y: positions.token.y + calculatorMetrics.height/2 },
                    { x: positions.token.x, y: positions.token.y + calculatorMetrics.height/2 }
                ],
                isInChain: true
            };
    }
}

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerY = canvas.height / 2.05;
            // 원의 크기를 캔버스 높이의 40%로 유지
            const radius = canvas.height * 0.4;
            // 원 사이 간격을 지름 하나만큼으로 조정
            const chainAX = canvas.width/2 - radius * 2;
            const chainBX = canvas.width/2 + radius * 2;
            
            // 기본 원 그리기
            drawChain(chainBX, centerY, radius);
        
            // Calculate and draw aggregation structure
            const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
            const dataTextX = chainAX + radius - dataMetrics.width/2 ;
            drawText("Original\nAggregated Data", chainAX + radius, centerY, true, false);
            calculateAggregationNodes(dataTextX, centerY);
            drawAggregation();

            // 활성화된 선 그리기
            activeLines.forEach(line => {
                drawConsensus(line);
            });
        
            // Chain 원의 점들 그리기
            chainNodes.forEach(node => {
                const pos = calculateNodePosition(node, chainBX, centerY, radius);
                
                // 점 그리기
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fill();
                
                // 점 번호 그리기
                const textRadius = radius + 15;
                const textPos = calculateNodePosition(node, chainBX, centerY, textRadius);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.font = '12px Times New Roman';
                ctx.fillText(`N${node.number}`, textPos.x - 6, textPos.y);
            });
        
            // 타이틀과 내부 텍스트
            const nameMetrics = getTextDimensions("Channel", true);
            drawText("External Channel", chainAX, canvas.height - nameMetrics.height/2,false, true);
        
            drawText("Carbon Emission Chain", chainBX, canvas.height - nameMetrics.height/2, false, true);
            drawText("Carbon Emission\nCalculator", chainBX, centerY, false, false,'emissionC');
            drawText("Carbon Emission\nTOKEN",  chainBX, centerY + 120, false, false,'emissionT');
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Oracle", (chainAX + chainBX) / 2, centerY - radius + radius/2,false,true);
            drawText("Notary Oracle", (chainAX + chainBX) / 2, centerY,true,true);
            drawText("Original\nData", chainBX - radius, centerY);
        
            // 각 이동 선의 중앙점 계산
            const path1 = calculateAnimationPath(1);
            const path2 = calculateAnimationPath(2);
            
            // data to notary 이동선의 중앙점 (첫 번째 점선의 x 위치)
            const midNode1X = (path1.nodes[0].x + path1.nodes[1].x) / 2;
            const midNode1Y = path1.nodes[0].y;
            
            // notary to data 이동선의 중앙점 (두 번째 점선의 x 위치)
            const midNode2X = (path2.nodes[0].x + path2.nodes[1].x) / 2;
            const midNode2Y = path2.nodes[0].y;
        
            // Notarized Multi-Signature Oracle 텍스트 높이 계산
            const multiSignatureMetrics = getTextDimensions("Notarized Multi-Signature Oracle", true);
            const multiSignatureY = centerY - radius + radius/2;
            const textBottomY = multiSignatureY + multiSignatureMetrics.height/2;
        
            // Draw dashed lines based on animation state
            if (!shouldClearDashedLines) {
                ctx.beginPath();
                ctx.strokeStyle = '#333';
                ctx.setLineDash([5, 5]);
                
                if (dashedLines.line2) {
                    ctx.moveTo(midNode2X, textBottomY);
                    ctx.lineTo(midNode2X, midNode2Y);
                }
                
                if (dashedLines.line1) {
                    ctx.moveTo(midNode1X, textBottomY);
                    ctx.lineTo(midNode1X, midNode1Y);
                }
                
                ctx.stroke();
                // ctx.setLineDash([]);
            }
        
            // 모든 경로 화살표 그리기
            const paths = [
                calculateAnimationPath(1),
                calculateAnimationPath(2),
                calculateAnimationPath(3),
                calculateAnimationPath(4),

            ];
            
            // 트리 애니메이션 포인트 그리기
            aggregationAnimationNodes.forEach(node => {
                if (node.active) {
                    // 현재 이동 중인 점 그리기
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fill();
                    
                    // 현재 세그먼트의 선 그리기
                    if (node.currentSegment < node.path.length - 1) {
                        const nextNode = node.path[node.currentSegment + 1];
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);  // node.path[node.currentSegment].x 대신 현재 위치 사용
                        ctx.lineTo(nextNode.x, nextNode.y);
                        ctx.strokeStyle = 'rgba(50,50,50,0.5)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            paths.forEach(path => {
                drawArrow(path.nodes, path.isInChain); 
            });
        
            
            const currentPath = calculateAnimationPath(currentStep);

            // moveNode 그리기 - isInChain이 true가 아닐 때만 그림
            if (moveNode.init && (!currentPath || !currentPath.isInChain)) {
                drawDataNode(moveNode.x, moveNode.y);
            }
        }

// animate 함수 수정 - 선 애니메이션 업데이트 부분
function animate() {
    const currentTime = performance.now();
    
    if (currentStep === 0) {
        // 트리 애니메이션
        if (aggregationAnimationNodes.length === 0) {
            const paths = calculateAllAggregationPaths();
            initializeAggregationAnimationNodes(paths);
        }
        
        let allFinished = true;
        aggregationAnimationNodes.forEach(node => {
            if (!node.active) return;
            
            const nextNode = node.path[node.currentSegment + 1];
            if (nextNode) {
                const dx = nextNode.x - node.x;
                const dy = nextNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= ANIMATION_SPEEDS.aggregation) {
                    node.x = nextNode.x;
                    node.y = nextNode.y;
                    node.currentSegment++;
                } else {
                    const ratio = ANIMATION_SPEEDS.aggregation / distance;
                    node.x += dx * ratio;
                    node.y += dy * ratio;
                    allFinished = false;
                }
            }
            
            if (node.currentSegment >= node.path.length - 1) {
                node.active = false;
            } else {
                allFinished = false;
            }
        });
        
        if (allFinished) {
            // 트리 애니메이션 완료 후 잠시 대기
            currentStep = 1;
            aggregationAnimationNodes = [];
            moveNode.init = false;
            segmentIndex = 0;
        }
    } else {

        // 현재 이동 경로 계산
        const currentPath = calculateAnimationPath(currentStep).nodes;
        
        // 이동점 초기화
        if (!moveNode.init) {
            moveNode = {
                x: currentPath[0].x,
                y: currentPath[0].y,
                init: true
            };
        }

        // 다음 목표 지점
        const target = currentPath[segmentIndex + 1];
        
        if (target) {
            const dx = target.x - moveNode.x;
            const dy = target.y - moveNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= ANIMATION_SPEEDS.regular) {
                segmentIndex++;
                
        if (segmentIndex >= currentPath.length - 1) {
            if (currentStep === 0) {
                currentStep = 1;
            } else if (currentStep === 1) {
                currentStep = 2;
                dashedLines.line1 = true;
            } else if (currentStep === 2) {
                currentStep = 3;
                dashedLines.line2 = true;
                
            } else if (currentStep === 3) {
                currentStep = 4;
                dashedLines.line1 = true;
                dashedLines.line2 = true;

            } else if (currentStep === 4) {
                currentStep = 5;
                // activeLines의 상태를 확인하는 함수
                const checkAllLinesComplete = () => {
                    // 모든 선이 완료되었는지 체크 (진행도가 1에 도달했거나 opacity가 0인 경우)
                    const allLinesComplete = activeLines.length === 0 || 
                        activeLines.every(line => line.progress >= 1 || line.opacity === 0);
                    
                    if (allLinesComplete) {
                        // 모든 선이 완료되면 초기화
                        currentStep = 0;
                        dashedLines.line1 = false;
                        dashedLines.line2 = false;
                        shouldClearDashedLines = false;
                        segmentIndex = 0;
                    } else {
                        // 아직 완료되지 않았다면 다시 체크
                        requestAnimationFrame(checkAllLinesComplete);
                    }
                };
                
                // 선 완료 체크 시작
                checkAllLinesComplete();
            }
            
            if (currentStep !== 5) {
                segmentIndex = 0;
                moveNode.init = false;
            }
        }
            } else {
                const ratio = ANIMATION_SPEEDS.regular / distance;
                moveNode.x += dx * ratio;
                moveNode.y += dy * ratio;
            }
        }
        // 선 애니메이션 업데이트
        updateConsensuses(currentTime);
        
        // 위치 체크 및 상태 업데이트
        if (moveNode.init) {
            updateAnimationState(moveNode, currentStep);
        }
        
    }
    // 캔버스 다시 그리기
    draw();
    
    requestAnimationFrame(animate);
}
    window.addEventListener('resize', resizeCanvas);
    initializeChainNodes();
    resizeCanvas();

    animate();

}











async function initializeCanvas2(canvasId){
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let currentStep = 0;
    let segmentIndex = 0;
    
    const steps = 3;
    const MOVE_SPEED = 3;
    let moveNode = {
        x: 0,
        y: 0,
        init: false
    };

    let chainNodes = [];
    let activeLines = [];
    let currentSource = null;

    // 선 애니메이션을 위한 상태
    const lineAnimationState = {
        duration: 1500,    // 더 빠른 선 애니메이션
    };

    let dashedLines = {
        line1: false,
        line2: false
    };
    let shouldClearDashedLines = false;
    let recentVisitedPositions = [];
    const RECENT_VISITED_DURATION = 500;
    let pendingLineCreations = [];

    


    
    // Aggregation structure constants
const AGGREGATION_NODE_RADIUS = 3;
const NODE_DISTANCE = 35;
const BRANCH_ANGLE = Math.PI / 4;
const AGGREGATION_LEVELS = 6;

// Aggregation node structure
let aggregationNodes = [];
const consumptionLabels = [
    { text: "Carbon Absorption", icon: "externalA" },
    { text: "　", icon: "" },
    { text: "·", icon: "" },
    { text: "·", icon: "" },
    { text: "·", icon: "" },
    { text: "　", icon: "" },
    { text: "Carbon Reduction", icon: "externalR" }
];
let aggregationAnimationNode = {
    x: 0,
    y: 0,
    init: false,
    currentNodeIndex: 0
};
const ANIMATION_SPEEDS = {
    aggregation: 1,      // 트리 애니메이션용 느린 속도
    regular: 3    // 기존 애니메이션 속도
};

    // 먼저 아이콘들을 로드
    try {
        await loadIcons();
    } catch (error) {
        console.error('Failed to load ICON_CONFIG:', error);
    }
// 트리 경로 계산 함수 추가
function calculateAggregationPath() {
    let path = [];
    // 마지막 레벨의 노드들
    const lastLevelNodes = aggregationNodes.slice(-Math.pow(2, AGGREGATION_LEVELS));
    // 시작 노드 (마지막 레벨의 첫 번째 노드)
    let currentNode = lastLevelNodes[0];
    let currentIndex = aggregationNodes.indexOf(currentNode);
    
    while (currentIndex > 0) {
        path.push({x: currentNode.x, y: currentNode.y});
        // 부모 노드의 인덱스 계산
        const parentIndex = Math.floor((currentIndex - 1) / 2);
        currentNode = aggregationNodes[parentIndex];
        currentIndex = parentIndex;
    }
    // 루트 노드 추가
    path.push({x: currentNode.x, y: currentNode.y});
    
    // 트리 애니메이션 시작 위치 및 크기 조정
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aggregationAnimationScale = 0.7; // 트리 애니메이션 크기 조절 계수
    
    path.forEach(node => {
        node.x = node.x * aggregationAnimationScale + canvasWidth * 0.15;
        node.y = node.y * aggregationAnimationScale + canvasHeight * 0.15;
    });
    
    return path;
}

function initializeAggregationAnimationNodes(paths) {
    aggregationAnimationNodes = paths.map(path => ({
        x: path[0].x,
        y: path[0].y,
        currentSegment: 0,
        path: path,
        active: true
    }));
}
function getMaxTextDimensions(labels) {
    ctx.font = '18px "Times New Roman"';
    let maxWidth = 0;
    let maxHeight = 0;
    
    labels.forEach(label => {
        if (label.text) {
            const metrics = ctx.measureText(label.text);
            maxWidth = Math.max(maxWidth, metrics.width);
            
            // 텍스트 높이 계산
            const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            maxHeight = Math.max(maxHeight, height);
        }
    });
    
    return {
        width: maxWidth,
        height: maxHeight,
        lineHeight: maxHeight * 1.2 // 줄 간격을 위한 lineHeight 추가 (보통 1.2배)
    };
}
function getLabelSpacing() {
    // 마지막 레벨의 노드들을 선택
    const lastLevelNodes = aggregationNodes.slice(-Math.pow(2, AGGREGATION_LEVELS));
    
    // 연속된 두 노드 사이의 y값 차이 계산
    let totalSpacing = 0;
    let spacingCount = 0;
    
    for (let i = 0; i < lastLevelNodes.length - 1; i++) {
        const spacing = Math.abs(lastLevelNodes[i + 1].y - lastLevelNodes[i].y);
        totalSpacing += spacing;
        spacingCount++;
    }
    
    // 평균 간격 반환
    return totalSpacing / spacingCount;
}
function calculateAggregationNodes(startX, startY) {
    
    aggregationNodes = [];
    let currentLevel = [{ x: startX, y: startY }];
    aggregationNodes.push(...currentLevel);

    for (let level = 0; level < AGGREGATION_LEVELS; level++) {
        const nextLevel = [];
        currentLevel.forEach(node => {
            // Changed the sign of x calculation from negative to positive
            const upNode = {
                x: node.x + NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8), // 부호를 바꿈 (- → +)
                y: node.y - NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            const downNode = {
                x: node.x + NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8), // 부호를 바꿈 (- → +)
                y: node.y + NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            nextLevel.push(upNode, downNode);
            aggregationNodes.push(upNode, downNode);
        });
        currentLevel = nextLevel;
    }
}

function drawAggregation() {
    // 선 먼저 그리기 (모든 선을 하나의 path로)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(50,50,50,1)';
    ctx.lineWidth = 1;
    
    aggregationNodes.forEach((node, index) => {
        if (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(aggregationNodes[parentIndex].x, aggregationNodes[parentIndex].y);
        }
    });
    ctx.stroke();

    // 노드 그리기
    aggregationNodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, AGGREGATION_NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    });

    // 텍스트의 최대 크기 계산
    const textDimensions = getMaxTextDimensions(consumptionLabels);
    const labelSpacing = getLabelSpacing() + 5;
    
    // 라벨 시작 위치 수정 - 트리의 오른쪽에 표시
    const labelStartX = aggregationNodes[aggregationNodes.length - 1].x + 20; // 부호 변경 (- → +)
    const baseY = canvas.height / 2.05 - ((consumptionLabels.length - 1) * labelSpacing) / 2;
    const iconWidth = ICON_CONFIG.width/2;

    consumptionLabels.forEach((label, index) => {
        if (label.text) {
            const y = baseY + (index * labelSpacing);
            
            ctx.font = '18px "Times New Roman"';
            ctx.fillStyle = 'rgba(50,50,50,1)';
            if (label.text === '·') {
                ctx.textAlign = 'center';
                // labelStartX에서 전체 width의 절반만큼 왼쪽으로 이동한 지점을 중앙으로 설정
                const centerX = labelStartX + iconWidth*2 + textDimensions.width/2;
                ctx.fillText(label.text, centerX, y - textDimensions.height/2);
            } else {
                ctx.textAlign = 'left';
                // Icon
                if (label.icon && ICON_CONFIG.images[label.icon]) {
                    const icon = ICON_CONFIG.images[label.icon];
                    ctx.drawImage(icon, labelStartX, y - ICON_CONFIG.height/4, ICON_CONFIG.width/2, ICON_CONFIG.height/2);
                }
                
                // Text - 아이콘 오른쪽에 텍스트 배치
                ctx.fillText(label.text, labelStartX + iconWidth + 10, y);
            }
        }
    });
}
    // Chain 점 초기화 함수
    function initializeChainNodes() {
        chainNodes = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            chainNodes.push({
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            });
        }
    }

    // 점의 위치 계산 함수
    function calculateNodePosition(node, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(node.angle),
            y: centerY + radius * Math.sin(node.angle)
        };
    }

    // 선 그리기 함수
    function drawConsensus(line) {
        if (!line.start || !line.end) return;

        const actualProgress = Math.min(line.progress, line.maxLength);
        const currentX = line.start.x + (line.end.x - line.start.x) * actualProgress;
        const currentY = line.start.y + (line.end.y - line.start.y) * actualProgress;

        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(50, 50, 50, ${line.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // 선 생성 함수
    function createConsensuses(sourceNode, chainAX, centerY, radius, currentTime) {
        const lines = [];
        const startPos = calculateNodePosition(sourceNode, chainAX, centerY, radius);
        
        chainNodes.forEach(targetNode => {
            if (targetNode.number !== sourceNode.number) {
                const endPos = calculateNodePosition(targetNode, chainAX, centerY, radius);
                
                lines.push({
                    start: startPos,
                    end: endPos,
                    progress: 0,
                    opacity: 1,
                    startTime: currentTime,
                    duration: lineAnimationState.duration,
                    maxLength: 1
                });
            }
        });
        
        return lines;
    }

    function createConsensusesAtPosition(x, y, radius, sourceType, currentTime) {
        const visitedKey = `${x.toFixed(2)}-${y.toFixed(2)}`;
        const recentlyVisited = recentVisitedPositions.some(pos => 
            pos.key === visitedKey && currentTime - pos.time < RECENT_VISITED_DURATION
        );
        if (recentlyVisited) return;

        if (sourceType === 'N13') {
            currentSource = chainNodes.find(p => p.number === 13);
        } else {
            currentSource = chainNodes[Math.floor(Math.random() * chainNodes.length)];
        }
        const newLines = createConsensuses(currentSource, x, y, radius, currentTime);
        activeLines = activeLines.concat(newLines);

        recentVisitedPositions.push({
            key: visitedKey,
            time: currentTime
        });
    }

    function updateConsensuses(currentTime) {
        activeLines = activeLines.filter(line => {
            const elapsed = currentTime - line.startTime;
            const duration = lineAnimationState.duration;
            
            line.progress = Math.min(elapsed / duration, 1);
            
            if (line.progress >= line.maxLength) {
                line.opacity = 0;
            }
            
            return line.progress < 1;
        });
    }

    function updateAnimationState(moveNode, step) {
        const centerY = canvas.height / 2.05;
        const radius = canvas.height * 0.4;
        const chainAX = canvas.width/2 - radius * 2;

        const dataMetrics = getMultilineTextDimensions("Original\nData");
        const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry",true);
        const tokenMetrics = getMultilineTextDimensions("Carbon Credits\nTOKEN",true);

        const positions = {
            data: {
                x: chainAX + radius - dataMetrics.width/2,
                y: centerY
            },
            calculator: {
                x: chainAX + calculatorMetrics.width/2,
                y: centerY
            },
            token: {
                x: chainAX,
                y: centerY + 120 - tokenMetrics.height/2
            }
        };

        const threshold = 5;
        const currentTime = performance.now();
    
        const distances = {
            data: Math.hypot(moveNode.x - positions.data.x, moveNode.y - positions.data.y),
            calculator: Math.hypot(moveNode.x - positions.calculator.x, moveNode.y - positions.calculator.y),
            token: Math.hypot(moveNode.x - positions.token.x, moveNode.y - positions.token.y)
        };
    
        // 선의 완료 상태를 체크
        const allLinesReachedTarget = activeLines.length === 0 || 
            activeLines.every(line => line.progress >= 1 || line.opacity === 0);
    
    if (step === 1 || step === 0) {
        activeLines = [];
        pendingLineCreations = [];
        recentVisitedPositions = [];
        currentSource = null;
        lastAnimationStep = null;
    }
    
        if (step !== 5 || step !== 0) {
            // DATA 위치에서는 즉시 선 생성
            if (distances.data < threshold && activeLines.length === 0) {
                createConsensusesAtPosition(chainAX, centerY, radius, 'N13', currentTime);
                Array(3).fill().forEach(() => {
                    pendingLineCreations.push({
                        position: { x: chainAX, y: centerY, radius: radius },
                        type: 'random'
                    });
                });
            }
            // Calculator와 Token 위치는 대기열에 기록
            // else if (distances.calculator < threshold) {
            //     if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
            //         pendingLineCreations.push({
            //             position: { x: chainAX, y: centerY, radius: radius },
            //             type: 'random'
            //         });
            //     }
            // }
            // else if (distances.token < threshold) {
            //     if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
            //         pendingLineCreations.push({
            //             position: { x: chainAX, y: centerY, radius: radius },
            //             type: 'random'
            //         });
            //     }
            // }
        }
    
        // 다음 선 생성 처리
        if (pendingLineCreations.length > 0 && allLinesReachedTarget && activeLines.length === 0) {
            const nextCreation = pendingLineCreations.shift();
            createConsensusesAtPosition(nextCreation.position.x, nextCreation.position.y, nextCreation.position.radius, nextCreation.type, currentTime);
        }
        console.log(pendingLineCreations);
    
        // 기존 선 업데이트
        updateConsensuses(currentTime);
    }

    // 캔버스 리사이징 함수
    function resizeCanvas() {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const aspectRatio = 25/9;
        const minWidth = 1280;
        const maxWidth = 1600;
        
        let width = Math.min(Math.max(minWidth, vw * 0.9), maxWidth);
        let height = width / aspectRatio;
        
        if (height > vh * 0.9) {
            height = vh * 0.9;
            width = Math.max(minWidth, height * aspectRatio);
        }
        
        canvas.width = width;
        canvas.height = height;
        draw();
    }



        function drawChain(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        }


        function drawText(text, x, y, hasBox = true, isBold = false, iconType = null) {
            const lines = text.split('\n');
            ctx.font = `${isBold ? 'bold' : 'normal'} 18px "Times New Roman"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (hasBox) {
                let maxWidth = 0;
                lines.forEach(line => {
                    const metrics = ctx.measureText(line);
                    maxWidth = Math.max(maxWidth, metrics.width);
                });
                
                const padding = { x: 12, y: 6 };
                const width = maxWidth + padding.x * 2.2;
                const iconHeight = iconType ? ICON_CONFIG.spacing : 0;  // 아이콘용 공간
                const height = 40 + (lines.length - 1) * 18 + iconHeight;
                const radius = 40 / 2;
                
                // 배경 및 테두리
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // 아이콘 그리기
                if (iconType && ICON_CONFIG.images[iconType]) {
                    const iconY = y - height/2 + ICON_CONFIG.topPadding;
                    const icon = ICON_CONFIG.images[iconType];
                    // 아이콘 중앙 정렬을 위한 x 위치 계산
                    const iconX = x - (ICON_CONFIG.width / 2);
                    ctx.drawImage(
                        icon, 
                        iconX, 
                        iconY, 
                        ICON_CONFIG.width, 
                        ICON_CONFIG.height
                    );
                }
                
                // 텍스트 그리기
                lines.forEach((line, i) => {
                    const lineY = y + (i - (lines.length-1)/2) * 18;
                    const adjustedY = iconType ? lineY + iconHeight/2 : lineY;
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fillText(line, x, adjustedY);
                });
            } else {
                // 박스 없는 경우
                if (iconType && ICON_CONFIG.images[iconType]) {
                    const iconY = y - ICON_CONFIG.spacing;
                    const icon = ICON_CONFIG.images[iconType];
                    const iconX = x - (ICON_CONFIG.width / 2);
                    ctx.drawImage(
                        icon, 
                        iconX, 
                        iconY, 
                        ICON_CONFIG.width, 
                        ICON_CONFIG.height
                    );
                }
        
                lines.forEach((line, i) => {
                    const lineY = y + (i - (lines.length-1)/2) * 18;
                    const adjustedY = iconType ? lineY + ICON_CONFIG.spacing/2 : lineY;
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fillText(line, x, adjustedY);
                });
            }
        }


        function drawArrow(nodes, isInChain = false) {
            // 선 그리기
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(50,50,50,1)';
            ctx.lineWidth = 1;
            
            // Chain 내부의 선인 경우 dash 스타일 적용
            if (isInChain) {
                ctx.setLineDash([4, 4]); // dash 패턴 설정
            } else {
                ctx.setLineDash([]); // 실선
            }
            
            ctx.moveTo(nodes[0].x, nodes[0].y);
            for(let i = 1; i < nodes.length; i++) {
                ctx.lineTo(nodes[i].x, nodes[i].y);
            }
            ctx.stroke();
            
            // dash 스타일 초기화 (화살표는 항상 실선)
            ctx.setLineDash([]);
            
            // 화살표 (마지막 점에만)
            const lastNode = nodes[nodes.length - 1];
            const secondLastNode = nodes[nodes.length - 2];
            
            const angle = Math.atan2(lastNode.y - secondLastNode.y, lastNode.x - secondLastNode.x);
            
            // 화살표 크기 조정
            const arrowLength = 8;
            const arrowWidth = 6;
            
            ctx.beginPath();
            ctx.moveTo(lastNode.x, lastNode.y);
            ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle - Math.PI/6), 
                    lastNode.y - arrowLength * Math.sin(angle - Math.PI/6));
            ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle + Math.PI/6),
                    lastNode.y - arrowLength * Math.sin(angle + Math.PI/6));
            ctx.closePath();
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
        }
        function drawDataNode(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        }
        function getTextDimensions(text, hasBox = true) {
            // 기본 폰트 설정
            ctx.font = `normal 18px "Times New Roman"`;
            const metrics = ctx.measureText(text);
            
            // 텍스트 기본 크기
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            
            if (hasBox) {
                const padding = { x: 12, y: 6 };
                return {
                    width: textWidth + (padding.x * 2.2),
                    height: Math.max(40, textHeight + (padding.y * 2)) // 최소 높이 40px
                };
            }
            
            return {
                width: textWidth,
                height: textHeight
            };
        }
        // getMultilineTextDimensions도 정확한 높이 계산하도록 수정
        function getMultilineTextDimensions(text, hasIcon = false, hasBox = false) {
            const lines = text.split('\n');
            const lineHeight = 18;
            let maxWidth = 0;
            
            // 폰트 설정을 명시적으로 지정
            ctx.font = '18px "Times New Roman"';
            
            const padding = { x: 12, y: 6 };
            const iconSpace = hasIcon ? {
                height: ICON_CONFIG.height + ICON_CONFIG.spacing - padding.y * 2,
                width: Math.max(ICON_CONFIG.width - padding.x * 2.2, 0)
            } : {
                height: 0,
                width: 0
            };
        
            
            
            // 각 라인의 너비 계산을 로깅
            lines.forEach(line => {
                const metrics = ctx.measureText(line);
                const width = metrics.width + (padding.x * 2.2) + iconSpace.width;
                maxWidth = Math.max(maxWidth, width);
            });
        
            if (hasBox) {
                return {
                    width: maxWidth,
                    height: (lines.length * lineHeight) + (padding.y * 2) + iconSpace.height
                };
            }
            
            return {
                width: maxWidth,
                height: (lines.length * lineHeight) + ICON_CONFIG.height + ICON_CONFIG.topPadding
            };
        }
        
        // draw 함수 내에서도 확인
        function draw() {
            // ...
            const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
            
            const dataTextX = chainAX + radius - dataMetrics.width/2;
            // ...
        }
            // 여러 데이터 포인트를 추적하기 위한 구조
        let aggregationAnimationNodes = [];
        
        // 트리 경로 계산 함수 수정
        function calculateAllAggregationPaths() {
            const paths = [];
            // 마지막 레벨의 노드들
            const lastLevelNodes = aggregationNodes.slice(-Math.pow(2, AGGREGATION_LEVELS));
            
            // 각 마지막 레벨 노드에 대해 경로 생성
            lastLevelNodes.forEach(startNode => {
                let path = [];
                let currentNode = startNode;
                let currentIndex = aggregationNodes.indexOf(currentNode);
                
                while (currentIndex > 0) {
                    path.push({x: currentNode.x, y: currentNode.y});
                    // 부모 노드의 인덱스 계산
                    const parentIndex = Math.floor((currentIndex - 1) / 2);
                    currentNode = aggregationNodes[parentIndex];
                    currentIndex = parentIndex;
                }
                // 루트 노드 추가
                path.push({x: currentNode.x, y: currentNode.y});
                paths.push(path);
            });
            
            return paths;
        }
        
        // moveNodes 초기화 함수
        function initializeAggregationAnimationNodes(paths) {
            aggregationAnimationNodes = paths.map(path => ({
                x: path[0].x,
                y: path[0].y,
                currentSegment: 0,
                path: path,
                active: true
            }));
        }
                
        function calculateAnimationPath(step) {
            const centerY = canvas.height / 2.05;
            const radius = canvas.height * 0.4;
            const chainAX = canvas.width/2 - radius * 2;
            const chainBX = canvas.width/2 + radius * 2;
        
            const dataMetrics = getMultilineTextDimensions("Original\nData");
            const data2Metrics = getMultilineTextDimensions("Original\nAggregated Data");
            const notaryMetrics = getTextDimensions("Notary Oracle", true);
            const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry",true);
            const tokenMetrics = getMultilineTextDimensions("Carbon Credits\nTOKEN",true);
            let isInChain = false;
        
            const positions = {
                dataLeft: { x: chainAX + radius, y: centerY },
                dataRight: { x: chainBX - radius, y: centerY },
                notary: { x: (chainAX + chainBX) / 2, y: centerY },
                calculator: { x: chainAX, y: centerY },
                token: { x: chainAX, y: centerY + 120 }
            };
        
            let nodes = [];
        
            if (step === 0) {
                return {
                    nodes: [],  // 빈 배열 반환 - 트리 애니메이션은 별도 처리
                    isAggregationAnimation: true
                };
            }
            switch(step) {
                case 0:
                    return {
                        nodes: calculateAggregationPath() || [],  // calculateAggregationPath가 undefined를 반환할 경우 빈 배열 사용
                        isInChain: false,
                        isAggregationAnimation: true
                    };
                case 1:
                    nodes = [
                        { x: positions.dataRight.x - data2Metrics.width/2, y: positions.dataRight.y },
                        { x: positions.notary.x + notaryMetrics.width/2, y: positions.dataRight.y  },
                    ];
                    break;
                case 2:
                    nodes = [
                        { x: positions.notary.x - notaryMetrics.width/2, y: positions.dataLeft.y },
                        { x: positions.dataLeft.x + dataMetrics.width/2, y: positions.dataLeft.y  },
                    ];
                    break;
                case 3:
                    nodes = [
                        { x: positions.dataLeft.x - dataMetrics.width/2, y: positions.dataLeft.y  },
                        { x: positions.calculator.x + calculatorMetrics.width/2, y: positions.calculator.y  }
                    ];
                    isInChain = true;
                    break;
                case 4:
                    nodes = [
                        { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                        { x: positions.calculator.x, y: positions.token.y - tokenMetrics.height/2 }
                    ];
                    isInChain = true;
                    break;
                case 5:
                    nodes = [
                        { x: positions.dataLeft.x, y: positions.dataLeft.y },
                        { x: positions.dataLeft.x, y: positions.dataLeft.y }
                    ];
                    isInChain = true;
            }
        
            // nodes가 있는 경우 객체로 반환
            if (nodes) {
                return {
                    nodes: nodes,
                    isInChain: isInChain
                };
            }
            return nodes;
        }

    // 기존의 draw 함수에 체인 포인트 그리기 추가
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerY = canvas.height / 2.05;
        const radius = canvas.height * 0.4;
        const chainAX = canvas.width/2 - radius * 2;
        const chainBX = canvas.width/2 + radius * 2;
    
        drawChain(chainAX, centerY, radius);
    
            // Calculate and draw aggregation structure
            const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
            const dataTextX = chainBX - radius + dataMetrics.width/2 ;
            calculateAggregationNodes(dataTextX, centerY);
            drawText("Original\nAggregated Data", chainBX - radius, centerY);
            drawAggregation();

        // 체인 포인트와 라인 그리기
        activeLines.forEach(line => {
            drawConsensus(line);
        });
    
        chainNodes.forEach(node => {
            const pos = calculateNodePosition(node, chainAX, centerY, radius);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            const textRadius = radius + 15;
            const textPos = calculateNodePosition(node, chainAX, centerY, textRadius);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '12px Times New Roman';
            ctx.fillText(`N${node.number}`, textPos.x, textPos.y);
        });
    
        // 타이틀과 내부 텍스트
        const nameMetrics = getTextDimensions("Channel", true);
        drawText("Original\nData", chainAX + radius, centerY, true, false);

        drawText("External Channel", chainBX, canvas.height - nameMetrics.height/2, false, true);
    
        drawText("Carbon Offset Chain", chainAX, canvas.height - nameMetrics.height/2, false, true);
        drawText("Carbon Credits\nRegistry", chainAX, centerY,  false, false,'creditR');
        drawText("Carbon Credits\nTOKEN", chainAX, centerY + 120, false, false,'creditT');
    
        // 중앙 텍스트들과 점선
        const path1 = calculateAnimationPath(1);
        const path2 = calculateAnimationPath(2);
        
    const midNode1X = (path1.nodes[0].x + path1.nodes[1].x) / 2;
    const midNode1Y = path1.nodes[0].y;

    const midNode2X = (path2.nodes[0].x + path2.nodes[1].x) / 2;
    const midNode2Y = path2.nodes[0].y;
    
        const multiSignatureMetrics = getTextDimensions("Notarized Multi-Signature Oracle", true);
        const multiSignatureY = centerY - radius + radius/2;
        const textBottomY = multiSignatureY + multiSignatureMetrics.height/2;
    
        // Draw dashed lines based on animation state
        if (!shouldClearDashedLines) {
            ctx.beginPath();
            ctx.strokeStyle = '#333';
            ctx.setLineDash([5, 5]);
            
            if (dashedLines.line1) {
                ctx.moveTo(midNode1X, textBottomY);
                ctx.lineTo(midNode1X, midNode1Y);
            }
            
            if (dashedLines.line2) {
                ctx.moveTo(midNode2X, textBottomY);
                ctx.lineTo(midNode2X, midNode2Y);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
    
        drawText("Notarized Multi-Signature Oracle", (chainAX + chainBX) / 2, centerY - radius + radius/2, false,true);
        drawText("Notary Oracle", (chainAX + chainBX) / 2, centerY);
    
        // 화살표 그리기
        const paths = [
            calculateAnimationPath(1),
            calculateAnimationPath(2),
            calculateAnimationPath(3),
            calculateAnimationPath(4)
        ];
        
            // 트리 애니메이션 포인트 그리기
            aggregationAnimationNodes.forEach(node => {
                if (node.active) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fill();
                    
                    // 현재 세그먼트의 선 그리기
                    if (node.currentSegment < node.path.length - 1) {
                        const nextNode = node.path[node.currentSegment + 1];
                        ctx.beginPath();
                        ctx.moveTo(node.path[node.currentSegment].x, node.path[node.currentSegment].y);
                        ctx.lineTo(nextNode.x, nextNode.y);
                        ctx.strokeStyle = 'rgba(50,50,50,0.5)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });
            paths.forEach(path => {
                // case 0의 특수한 경우와 나머지 경우 모두 처리
                if (path && path.nodes && path.nodes.length > 0) {
                    drawArrow(path.nodes, path.isInChain);
                }
            });
        const currentPath = calculateAnimationPath(currentStep);

        // moveNode 그리기 - isInChain이 true가 아닐 때만 그림
        if (moveNode.init && (!currentPath || !currentPath.isInChain)) {
            drawDataNode(moveNode.x, moveNode.y);
        }
    }

    function animate() {
        const currentTime = performance.now();

        
    if (currentStep === 0) {
        // 트리 애니메이션
        if (aggregationAnimationNodes.length === 0) {
            const paths = calculateAllAggregationPaths();
            initializeAggregationAnimationNodes(paths);
        }
        
        let allFinished = true;
        aggregationAnimationNodes.forEach(node => {
            if (!node.active) return;
            
            const nextNode = node.path[node.currentSegment + 1];
            if (nextNode) {
                const dx = nextNode.x - node.x;
                const dy = nextNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 트리 애니메이션 전용 속도 사용
                if (distance <= ANIMATION_SPEEDS.aggregation) {
                    node.currentSegment++;
                    node.x = nextNode.x;
                    node.y = nextNode.y;
                } else {
                    const ratio = ANIMATION_SPEEDS.aggregation / distance;
                    node.x += dx * ratio;
                    node.y += dy * ratio;
                    allFinished = false;
                }
            }
            
            if (node.currentSegment >= node.path.length - 1) {
                node.active = false;
            } else {
                allFinished = false;
            }
        });
        
        if (allFinished) {
            // 트리 애니메이션 완료 후 잠시 대기
            currentStep = 1;
            aggregationAnimationNodes = [];
            moveNode.init = false;
            segmentIndex = 0;
        }
    } else {
        const currentPath = calculateAnimationPath(currentStep);

if (!moveNode.init && currentPath.nodes && currentPath.nodes.length > 0) {
    moveNode = {
        x: currentPath.nodes[0].x,
        y: currentPath.nodes[0].y,
        init: true
    };
}

const target = currentPath.nodes ? currentPath.nodes[segmentIndex + 1] : null;

if (target) {
    const dx = target.x - moveNode.x;
    const dy = target.y - moveNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= MOVE_SPEED) {
        segmentIndex++;
        if (segmentIndex >= currentPath.nodes.length - 1) {
            if (currentStep === 0) {
                currentStep = 1;
            } else if (currentStep === 1) {
                dashedLines.line1 = true;
                currentStep = 2;
            } else if (currentStep === 2) {
                dashedLines.line2 = true;
                currentStep = 3;
            } else if (currentStep === 3) {
                dashedLines.line1 = true;
                dashedLines.line2 = true;
                currentStep = 4;
            } else if (currentStep === 4) {
                currentStep = 5;
                const checkAllAnimationsComplete = () => {
                    // 활성화된 선들이 모두 완료되었는지 체크
                    const allLinesComplete = activeLines.length === 0 || 
                        activeLines.every(line => line.progress >= 1 || line.opacity === 0);
                    
                    // 대기 중인 선 생성이 모두 처리되었는지 체크
                    const allPendingComplete = pendingLineCreations.length === 0;
                    
                    if (allLinesComplete && allPendingComplete) {
                        // 모든 애니메이션과 대기열이 완료되면 초기화
                        currentStep = 0;
                        dashedLines.line1 = false;
                        dashedLines.line2 = false;
                        shouldClearDashedLines = false;
                        moveNode.init = false;
                        segmentIndex = 0;
                    } else {
                        // 아직 완료되지 않았다면 다시 체크
                        requestAnimationFrame(checkAllAnimationsComplete);
                    }
                };
                
                // 애니메이션 완료 체크 시작
                checkAllAnimationsComplete();
            }
            
            if (currentStep !== 5) {
                segmentIndex = 0;
                moveNode.init = false;
            }
        }
    } else {
        const ratio = MOVE_SPEED / distance;
        moveNode.x += dx * ratio;
        moveNode.y += dy * ratio;
    }
}

// 트리 애니메이션이 아닌 경우에만 updateAnimationState 호출
if (moveNode.init && !currentPath.isAggregationAnimation) {
    updateAnimationState(moveNode, currentStep);
}
    }
        // 캔버스 다시 그리기
        draw();
        
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resizeCanvas);
    initializeChainNodes();
    resizeCanvas();

    animate();

}














async function initializeCanvas3(canvasId){

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let currentStep = 0;
    let segmentIndex = 0;

    const steps = 4; // 새로운 애니메이션 스텝 수정
    const MOVE_SPEED = 3;
    
    let moveNode1 = { // 왼쪽에서 오는 데이터 포인트
        x: 0,
        y: 0,
        init: false
    };
    let moveNode2 = { // 오른쪽에서 오는 데이터 포인트
        x: 0,
        y: 0,
        init: false
    };
    let moveNode3 = { // 위로 올라가는 데이터 포인트
        x: 0,
        y: 0,
        init: false
    };
    let moveNode4 = { // 위로 올라가는 데이터 포인트
        x: 0,
        y: 0,
        init: false
    };

    let chainNodes1 = [];
    let chainNodes2 = [];
    let chainNodes3 = [];
    let activeLines = [];
    
    const lineAnimationState = {
        duration: 1500,
        interval: 0,
    };

    try {
        await loadIcons();
    } catch (error) {
        console.error('Failed to load ICON_CONFIG:', error);
    }


    function resizeCanvas() {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const aspectRatio = 23/9;
        const minWidth = 1280; // 최소 너비 설정
        const maxWidth = 1600; // 최소 너비 설정
        
        // 너비를 먼저 계산 - 화면의 90% 사용하되 최소값 보장
        let width = Math.min(Math.max(minWidth, vw * 0.9), maxWidth);
        let height = width / aspectRatio;
        
        // 높이가 화면의 90%를 넘으면 높이 기준으로 다시 계산
        if (height > vh * 0.9) {
            height = vh * 0.9;
            width = Math.max(minWidth, height * aspectRatio);
        }
        
        canvas.width = width;
        canvas.height = height;
        draw();
     }
     
    // 타원 그리기 함수 추가
    function drawEllipse(x, y, radiusX, radiusY) {
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    function drawChain(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawText(text, x, y, hasBox = true, isBold = false, iconType = null) {
        const lines = text.split('\n');
        ctx.font = `${isBold ? 'bold' : 'normal'} 18px "Times New Roman"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (hasBox) {
            let maxWidth = 0;
            lines.forEach(line => {
                const metrics = ctx.measureText(line);
                maxWidth = Math.max(maxWidth, metrics.width);
            });
            
            const padding = { x: 12, y: 6 };
            const width = maxWidth + padding.x * 2.2;
            const iconHeight = iconType ? ICON_CONFIG.spacing : 0;  // 아이콘용 공간
            const height = 40 + (lines.length - 1) * 18 + iconHeight;
            const radius = 40 / 2;
            
            // 배경 및 테두리
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.beginPath();
            ctx.roundRect(x - width/2, y - height/2, width, height, radius);
            ctx.fill();
            ctx.strokeStyle = 'rgba(50,50,50,1)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // 아이콘 그리기
            if (iconType && ICON_CONFIG.images[iconType]) {
                const iconY = y - height/2 + ICON_CONFIG.topPadding;
                const icon = ICON_CONFIG.images[iconType];
                // 아이콘 중앙 정렬을 위한 x 위치 계산
                const iconX = x - (ICON_CONFIG.width / 2);
                ctx.drawImage(
                    icon, 
                    iconX, 
                    iconY, 
                    ICON_CONFIG.width, 
                    ICON_CONFIG.height
                );
            }
            
            // 텍스트 그리기
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 18;
                const adjustedY = iconType ? lineY + iconHeight/2 : lineY;
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fillText(line, x, adjustedY);
            });
        } else {
            // 박스 없는 경우
            if (iconType && ICON_CONFIG.images[iconType]) {
                const iconY = iconType.includes('net') 
                    ? y - ICON_CONFIG.spacing - 8  // net을 포함하는 경우 5픽셀 더 위로
                    : y - ICON_CONFIG.spacing;     // 그 외의 경우 기존 위치
                
                const icon = ICON_CONFIG.images[iconType];
                const iconX = x - (ICON_CONFIG.width / 2);
                const iconSize = ICON_CONFIG.width;
                ctx.drawImage(
                    icon, 
                    iconX, 
                    iconY, 
                    iconSize, 
                    iconSize
                );
            }
    
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 18;
                const adjustedY = iconType ? lineY + ICON_CONFIG.spacing/2 : lineY;
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fillText(line, x, adjustedY);
            });
        }
    }

    // getMultilineTextDimensions도 정확한 높이 계산하도록 수정
    function getMultilineTextDimensions(text, hasIcon = false, hasBox = false) {
        const lines = text.split('\n');
        const lineHeight = 18;
        let maxWidth = 0;
        
        // 폰트 설정을 명시적으로 지정
        ctx.font = '18px "Times New Roman"';
        
        const padding = { x: 12, y: 6 };
        const iconSpace = hasIcon ? {
            height: ICON_CONFIG.height + ICON_CONFIG.spacing - padding.y * 2,
            width: Math.max(ICON_CONFIG.width - padding.x * 2.2, 0)
        } : {
            height: 0,
            width: 0
        };
    
        
        
        // 각 라인의 너비 계산을 로깅
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            const width = metrics.width + (padding.x * 2.2) + iconSpace.width;
            
            maxWidth = Math.max(maxWidth, width);
        });
    

    
        if (hasBox) {
            return {
                width: maxWidth,
                height: (lines.length * lineHeight) + (padding.y * 2) + iconSpace.height
            };
        }
        
        return {
            width: maxWidth,
            height: (lines.length * lineHeight) + ICON_CONFIG.height + ICON_CONFIG.topPadding
        };
    }
    
    // draw 함수 내에서도 확인
    function draw() {
        // ...
        const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
        
        const dataTextX = chainAX + radius - dataMetrics.width/2;
        // ...
    }

    function drawArrow(nodes, isInChain = false) {
        // 선 그리기
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        
        // Chain 내부의 선인 경우 dash 스타일 적용
        if (isInChain) {
            ctx.setLineDash([4, 4]); // dash 패턴 설정
        } else {
            ctx.setLineDash([]); // 실선
        }
        
        ctx.moveTo(nodes[0].x, nodes[0].y);
        for(let i = 1; i < nodes.length; i++) {
            ctx.lineTo(nodes[i].x, nodes[i].y);
        }
        ctx.stroke();
        
        // dash 스타일 초기화 (화살표는 항상 실선)
        ctx.setLineDash([]);
        
        // 화살표 (마지막 점에만)
        const lastNode = nodes[nodes.length - 1];
        const secondLastNode = nodes[nodes.length - 2];
        
        const angle = Math.atan2(lastNode.y - secondLastNode.y, lastNode.x - secondLastNode.x);
        
        // 화살표 크기 조정
        const arrowLength = 8;
        const arrowWidth = 6;
        
        ctx.beginPath();
        ctx.moveTo(lastNode.x, lastNode.y);
        ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle - Math.PI/6), 
                lastNode.y - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(lastNode.x - arrowLength * Math.cos(angle + Math.PI/6),
                lastNode.y - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    }
    function drawDataNode(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    }
    function getTextDimensions(text, hasBox = true) {
        // 기본 폰트 설정
        ctx.font = `normal 18px "Times New Roman"`;
        const metrics = ctx.measureText(text);
        
        // 텍스트 기본 크기
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        
        if (hasBox) {
            const padding = { x: 12, y: 6 };
            return {
                width: textWidth + (padding.x * 2.2),
                height: Math.max(40, textHeight + (padding.y * 2)) // 최소 높이 40px
            };
        }
        
        return {
            width: textWidth,
            height: textHeight
        };
    }

        
    // Chain 점 초기화 함수
    function initializeChainNodes() {
        chainNodes1 = [];
        chainNodes2 = [];
        chainNodes3 = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            const node = {
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            };
            chainNodes1.push({...node});
            chainNodes2.push({...node});
            chainNodes3.push({...node});
        }
    }

    // 점의 위치 계산 함수
    function calculateNodePosition(node, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(node.angle),
            y: centerY + radius * Math.sin(node.angle)
        };
    }

    // 선 그리기 함수
    function drawConsensus(line) {
        if (!line.start || !line.end) return;

        const actualProgress = Math.min(line.progress, line.maxLength);
        const currentX = line.start.x + (line.end.x - line.start.x) * actualProgress;
        const currentY = line.start.y + (line.end.y - line.start.y) * actualProgress;

        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(50, 50, 50, ${line.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // 선 생성 함수
function createConsensuses(sourceNode, centerX, centerY, radius, chainNodes, currentTime, isEllipse = false) {
    const lines = [];
    let startPos;
    
    // 타원인 경우의 시작점 계산
    if (isEllipse) {
        const ellipseRadius = {x: radius * 1.45, y: radius * 0.4};
        startPos = {
            x: centerX + ellipseRadius.x * Math.cos(sourceNode.angle),
            y: centerY + ellipseRadius.y * Math.sin(sourceNode.angle)
        };
    } else {
        startPos = calculateNodePosition(sourceNode, centerX, centerY, radius);
    }
    
    chainNodes.forEach(targetNode => {
        if (targetNode.number !== sourceNode.number) {
            let endPos;
            // 타원인 경우의 끝점 계산
            if (isEllipse) {
                const ellipseRadius = {x: radius * 1.45, y: radius * 0.4};
                endPos = {
                    x: centerX + ellipseRadius.x * Math.cos(targetNode.angle),
                    y: centerY + ellipseRadius.y * Math.sin(targetNode.angle)
                };
            } else {
                endPos = calculateNodePosition(targetNode, centerX, centerY, radius);
            }
            
            lines.push({
                start: startPos,
                end: endPos,
                progress: 0,
                opacity: 1,
                startTime: currentTime,
                duration: lineAnimationState.duration,
                maxLength: 1
            });
        }
    });
    
    return lines;
}

    // 선 업데이트 함수
    function updateConsensuses(currentTime) {
        activeLines = activeLines.filter(line => {
            const elapsed = currentTime - line.startTime;
            const duration = lineAnimationState.duration;
            
            line.progress = Math.min(elapsed / duration, 1);
            
            if (line.progress >= line.maxLength) {
                line.opacity = 0;
            }
            
            return line.progress < 1;
        });
    }

// createConsensusesAtPosition 함수 수정
function createConsensusesAtPosition(x, y, radius, sourceType, chainNodes, currentTime, isEllipse = false) {
    let sourceNode;
    
    if (sourceType === 'N5') {
        sourceNode = chainNodes.find(p => p.number === 5);
    } else if (sourceType === 'N13') {
        sourceNode = chainNodes.find(p => p.number === 13);
    } else if (sourceType === 'random') {
        sourceNode = chainNodes[Math.floor(Math.random() * chainNodes.length)];
    }

    const newLines = createConsensuses(sourceNode, x, y, radius, chainNodes, currentTime, isEllipse);
    activeLines = activeLines.concat(newLines);
}

    let recentVisitedPositions1 = []; // 왼쪽 원의 방문 기록
    let recentVisitedPositions2 = []; // 오른쪽 원의 방문 기록
    const RECENT_VISITED_DURATION = 500;
    let pendingLineCreations1 = []; // 왼쪽 원의 대기열
    let pendingLineCreations2 = []; // 오른쪽 원의 대기열
    function updateAnimationState(moveNode, step) {
        const currentTime = performance.now();

        const centerY = canvas.height / 1.8;
        const radius = canvas.height * 0.3;
        const chainAX = canvas.width/2 - radius * 2.5;
        const chainBX = canvas.width/2 + radius * 2.5;
        const bridgeX = (chainAX + chainBX) / 2;
        const consensusY = centerY - radius * 1.15;
        const radius2 = canvas.height * 0.35;
        const ellipseRadius = {x: radius * 1.45, y: radius * 0.4}; // 타원의 반지름
    
        // 선의 완료 상태를 체크
        const allLinesReachedTarget = activeLines.length === 0 || 
            activeLines.every(line => line.progress >= 1 || line.opacity === 0);
    
        // 1.5초마다 각 체인에서 랜덤하게 선 생성
        const INTERVAL = 1500; // 1.5초
    
        // 시간 경과 체크를 위한 정적 변수 (클로저를 통해 상태 유지)
        if (!updateAnimationState.lastGenerationTime) {
            updateAnimationState.lastGenerationTime = currentTime;
        }
    
        if (currentTime - updateAnimationState.lastGenerationTime >= INTERVAL) {
            // 모든 이전 선들이 목표에 도달했는지 확인
            if (allLinesReachedTarget) {
                // 왼쪽 체인 (Chain 1)
                createConsensusesAtPosition(
                    chainAX,
                    centerY,
                    radius,
                    'random',
                    chainNodes1,
                    currentTime,
                    false
                );
    
                // 오른쪽 체인 (Chain 2)
                createConsensusesAtPosition(
                    chainBX,
                    centerY,
                    radius,
                    'random',
                    chainNodes2,
                    currentTime,
                    false
                );
    
                // 중앙 타원 체인
                createConsensusesAtPosition(
                    bridgeX,
                    consensusY,
                    radius,
                    'random',
                    chainNodes3,
                    currentTime,
                    true
                );
    
                // 시간 업데이트
                updateAnimationState.lastGenerationTime = currentTime;
            }
        }
    
        // 기존의 선 업데이트 로직
        updateConsensuses(currentTime);
    }
    
        
    function calculateAnimationPath(step) {
        const centerY = canvas.height / 1.8;
        const radius = canvas.height * 0.3;
        const chainAX = canvas.width/2 - radius * 2.5;
        const chainBX = canvas.width/2 + radius * 2.5;
        const bridgeX = (chainAX + chainBX) / 2;
        const consensusY = centerY - radius * 1.15;
        const radius2 = canvas.height * 0.3 * 0.4;
        
        const tokenMetrics = getMultilineTextDimensions("Carbon Emission\nToken",false);
        const dataMetrics = getMultilineTextDimensions("Carbon Emission\nToken Aggregation",true);
        const notaryMetrics = getTextDimensions("Notary Bridge", true);
        const netMetrics = getMultilineTextDimensions("Carbon Credit Burning\nConsensus",false,false);
        
        let pathArray = [];
    let isInChain = false;
        
        switch(step) {
            case 0: // 브릿지로 이동
                pathArray = [
                    {
                        nodes: [
                            { x: chainAX + radius + dataMetrics.width/2 - 10, y: centerY },
                            { x: bridgeX - notaryMetrics.width/2, y: centerY }
                        ],
                    },
                    {
                        nodes: [
                            { x: chainBX - radius - dataMetrics.width/2 + 10, y: centerY },
                            { x: bridgeX + notaryMetrics.width/2, y: centerY }
                        ],
                    }
                ];
                break;
            case 1: // 수직 이동
                pathArray = [
                    {
                        nodes: [
                            { x: bridgeX, y: centerY - notaryMetrics.height/2 },
                            { x: bridgeX, y: consensusY + radius2 + notaryMetrics.height/2 }
                        ],
                    }
                ];
                break;
        }
        return pathArray;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
            
        const centerY = canvas.height / 1.8;
        const radius = canvas.height * 0.3;
        const chainAX = canvas.width/2 - radius * 2.5;
        const chainBX = canvas.width/2 + radius * 2.5;
        const bridgeX = (chainAX + chainBX) / 2;
        const consensusY = centerY - radius * 1.15;
        const radius2 = canvas.height * 0.3 * 0.4;
        const ellipseRadius = {x: radius * 1.45, y: radius * 0.4}; // 타원의 반지름
        
        
        const nameMetrics = getTextDimensions("Channel", true);
        const net1Metrics = getTextDimensions("Carbon Credit Burning\nConsensus", true);
        const net2Metrics = getTextDimensions("Carbon Reduction\nConsensus", true);

        // 기존 원들 그리기
        drawChain(chainAX, centerY, radius);
        drawChain(chainBX, centerY, radius);
        // 새로운 타원 그리기
        const ellipseY = centerY - radius * 1.15;
        drawEllipse(bridgeX, ellipseY, ellipseRadius.x, ellipseRadius.y);
        
        // 체인 포인트와 라인 그리기
        activeLines.forEach(line => {
            drawConsensus(line);
        });

        // 왼쪽 원의 체인 포인트
        chainNodes1.forEach(node => {
            const pos = calculateNodePosition(node, chainAX, centerY, radius);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            const textRadius = radius + 15;
            const textPos = calculateNodePosition(node, chainAX, centerY, textRadius);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '12px Times New Roman';
            ctx.fillText(`N${node.number}`, textPos.x, textPos.y);
        });

        // 오른쪽 원의 체인 포인트
        chainNodes2.forEach(node => {
            const pos = calculateNodePosition(node, chainBX, centerY, radius);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            const textRadius = radius + 15;
            const textPos = calculateNodePosition(node, chainBX, centerY, textRadius);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '12px Times New Roman';
            ctx.fillText(`N${node.number}`, textPos.x, textPos.y);
        });

        
        chainNodes3.forEach(node => {
            // 타원 위의 점 위치 계산
            const angle = node.angle;
            const pos = {
                x: bridgeX + ellipseRadius.x * Math.cos(angle),
                y: consensusY + ellipseRadius.y * Math.sin(angle)
            };
            
            // 점 그리기
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            // 텍스트 위치 계산 (타원 바깥쪽)
            const textOffset = 12; // 텍스트 간격
            const textPos = {
                x: bridgeX + (ellipseRadius.x + textOffset) * Math.cos(angle),
                y: consensusY + (ellipseRadius.y + textOffset) * Math.sin(angle)
            };
            
            // 텍스트 그리기
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '12px Times New Roman';
            ctx.fillText(`N${node.number}`, textPos.x, textPos.y);
        });

        // Net-Zero Chain 텍스트
        drawText("Net-Zero Chain", bridgeX, 0 + 10, false, true);
        
        // Net-Zero Consensus 텍스트
        drawText("Net-Zero Consensus", bridgeX, ellipseY + ellipseRadius.y);
        
        // 기울어진 Consensus 텍스트와 선

        drawText("Carbon Credit Burning\nConsensus", 
            bridgeX - radius2*1.4, consensusY , false, false,'netB');
        drawText("Carbon Reduction\nConsensus",
            bridgeX + radius2*1.4, consensusY , false, false,'netR');

        // 타이틀과 내부 텍스트
        drawText("Carbon Emission Chain", chainAX,  canvas.height - nameMetrics.height/2, false, true);
        drawText("Carbon Emission\nToken", chainAX, centerY , false, false,'emissionT');
    
        drawText("Carbon Offset Chain", chainBX,  canvas.height - nameMetrics.height/2, false, true);
        drawText("Carbon Credit\nToken", chainBX, centerY, false, false,'emissionT');
    
        // 중앙 텍스트들
        drawText("Notarized Multi-Signature Bridge", (chainAX + chainBX) / 2, centerY + radius - radius/2, false,true);

        drawText("Notary Bridge", (chainAX + chainBX) / 2, centerY);
        drawText("Carbon Emission\nToken Aggregation", chainAX + radius, centerY);
        drawText("Carbon Emission\nToken Aggregation", chainBX - radius, centerY);
        
        // 각 이동 선의 중앙점 계산
        const paths1 = calculateAnimationPath(0);
        const paths2 = calculateAnimationPath(0);

        // 점선 그리기 부분을 다음과 같이 수정
        // data to notary 이동선의 중앙점 (첫 번째 점선의 x 위치)
        const midNode1X = (paths1[0].nodes[0].x + paths1[0].nodes[1].x) / 2;
        const midNode1Y = paths1[0].nodes[0].y;
        const midNode2X = (paths2[1].nodes[0].x + paths2[1].nodes[1].x) / 2;
        const midNode2Y = paths2[1].nodes[0].y;
        // Notarized Multi-Signature Oracle 텍스트 높이 계산
        const multiSignatureMetrics = getTextDimensions("Notarized Multi-Signature Oracle", true);
        const multiSignatureY = centerY + radius - radius/2;
        const textBottomY = multiSignatureY - multiSignatureMetrics.height/2;

        // 점선 그리기
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.setLineDash([5, 5]);
        
        // 첫 번째 점선
        ctx.moveTo(midNode1X, textBottomY);
        ctx.lineTo(midNode1X, midNode1Y);
        
        // 두 번째 점선
        ctx.moveTo(midNode2X, textBottomY);
        ctx.lineTo(midNode2X, midNode2Y);
        
        ctx.stroke();
        ctx.setLineDash([]);
            
        const paths = [
            ...calculateAnimationPath(0), // spread operator로 두 경로를 모두 포함
            ...calculateAnimationPath(1),
        ];
        
    // 화살표 그리기
paths.forEach(path => {
    if (path && path.nodes && path.nodes.length > 0) {
        drawArrow(path.nodes, path.isInChain);
    }
});
        // 이동 점 그리기
    if (moveNode1.init) drawDataNode(moveNode1.x, moveNode1.y);
    if (moveNode2.init) drawDataNode(moveNode2.x, moveNode2.y);
    if (moveNode3.init) drawDataNode(moveNode3.x, moveNode3.y);
}
    
// moveNodeToTarget 함수 추가
function moveNodeToTarget(node, target) {
    if (!node || !target) return false;

    const dx = target.x - node.x;
    const dy = target.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= MOVE_SPEED) {
        node.x = target.x;
        node.y = target.y;
        return true;
    } else {
        const ratio = MOVE_SPEED / distance;
        node.x += dx * ratio;
        node.y += dy * ratio;
        return false;
    }
}

function animate() {
    const currentTime = performance.now();
    const allPaths = calculateAnimationPath(currentStep);
    
    const centerY = canvas.height / 1.8;
    const radius = canvas.height * 0.3;
    const chainAX = canvas.width/2 - radius * 2.5;
    const chainBX = canvas.width/2 + radius * 2.5;
    const bridgeX = (chainAX + chainBX) / 2;
    const nameMetrics = getTextDimensions("Channel", true);
    
    if (!allPaths || allPaths.length === 0) return;
    switch(currentStep) {
        case 0: // 브릿지로 이동
            if (!moveNode1.init && !moveNode2.init) {
                moveNode1 = { ...allPaths[0].nodes[0], init: true };
                moveNode2 = { ...allPaths[1].nodes[0], init: true };
            }
            
            let bridgeTarget1 = moveNode1.init && moveNodeToTarget(moveNode1, allPaths[0].nodes[1]);
            let bridgeTarget2 = moveNode2.init && moveNodeToTarget(moveNode2, allPaths[1].nodes[1]);
            
            if (bridgeTarget1 && bridgeTarget2) {
                currentStep = 1;
                moveNode1.init = false;
                moveNode2.init = false;
                moveNode3 = { 
                    x: bridgeX, 
                    y: centerY - nameMetrics.height/2,
                    init: true 
                };
            }
            break;
            
        case 1: // 수직 이동
            if (!moveNode3.init) {
                moveNode3 = { 
                    x: bridgeX, 
                    y: centerY - nameMetrics.height/2, 
                    init: true 
                };
            }
            
            if (moveNodeToTarget(moveNode3, allPaths[0].nodes[1])) {
                currentStep = 0;
                // 여기서 moveNode3를 초기화
                moveNode3.init = false;
                moveNode3 = {
                    x: 0,
                    y: 0,
                    init: false
                };
            }
            break;
            
    }
    updateConsensuses(currentTime);
    
    if (moveNode1.init) {
        updateAnimationState(moveNode1, currentStep);
    }


    draw();
    requestAnimationFrame(animate);
}
    window.addEventListener('resize', resizeCanvas);
    initializeChainNodes();
    resizeCanvas();
    animate();

}






initializeCanvas1('CarbonEmissionChain');
initializeCanvas2('CarbonOffsetChain');
initializeCanvas3('CarbonNetZeroChain');
