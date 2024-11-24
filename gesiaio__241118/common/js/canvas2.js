
const ICON_CONFIG = {
    images: {},
    loaded: false,
    width: 45,          // 아이콘 너비
    height: 45,         // 아이콘 높이
    topPadding: 10,     // 박스 상단에서의 간격
    spacing: 42,        // 아이콘과 텍스트 사이 간격
    paths: {
        emissionC: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_emissionC.png',
        emissionT: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_emissionT.png',

        externalE: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalE.png',
        externalG: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalG.png',
        externalO: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalO.png',
        externalW: 'https://design-native.github.io/preview/gesiaio__241118/common/resources/icon-canvas_externalW.png'
    }
};
// 모든 아이콘 이미지 프리로드
function loadICON_CONFIG() {
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
    let movePoint = {
        x: 0,
        y: 0,
        init: false
    };

    let chainPoints = [];
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
    // Tree structure constants
const TREE_NODE_RADIUS = 3;
const NODE_DISTANCE = 35;
const BRANCH_ANGLE = Math.PI / 4;
const TREE_LEVELS = 6;

// Tree node structure
let treeNodes = [];
const consumptionLabels = [
    { text: "Electricity consumption", icon: "externalE" },
    { text: "Gas consumption", icon: "externalG" },
    { text: "Oil consumption", icon: "externalO" },
    { text: "　", icon: "" },
    { text: "···", icon: "" },
    { text: "　", icon: "" },
    { text: "Water consumption", icon: "externalW" }
];
let treeAnimationPoint = {
    x: 0,
    y: 0,
    init: false,
    currentNodeIndex: 0
};
const ANIMATION_SPEEDS = {
    tree: 1,      // 트리 애니메이션용 느린 속도
    regular: 3    // 기존 애니메이션 속도
};

    // 먼저 아이콘들을 로드
    try {
        await loadICON_CONFIG();
    } catch (error) {
        console.error('Failed to load ICON_CONFIG:', error);
    }
// 트리 경로 계산 함수 추가
function calculateTreePath() {
    let path = [];
    // 마지막 레벨의 노드들
    const lastLevelNodes = treeNodes.slice(-Math.pow(2, TREE_LEVELS));
    // 시작 노드 (마지막 레벨의 첫 번째 노드)
    let currentNode = lastLevelNodes[0];
    let currentIndex = treeNodes.indexOf(currentNode);
    
    while (currentIndex > 0) {
        path.push({x: currentNode.x, y: currentNode.y});
        // 부모 노드의 인덱스 계산
        const parentIndex = Math.floor((currentIndex - 1) / 2);
        currentNode = treeNodes[parentIndex];
        currentIndex = parentIndex;
    }
    // 루트 노드 추가
    path.push({x: currentNode.x, y: currentNode.y});
    
    return path;
}

function calculateTreeNodes(startX, startY) {
    treeNodes = [];
    let currentLevel = [{ x: startX, y: startY }];
    treeNodes.push(...currentLevel);

    for (let level = 0; level < TREE_LEVELS; level++) {
        const nextLevel = [];
        currentLevel.forEach(node => {
            // Calculate two child nodes with adjusted angles for flatter tree
            const upNode = {
                x: node.x - NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8), // 각도를 줄여서 더 평평하게
                y: node.y - NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            const downNode = {
                x: node.x - NODE_DISTANCE * Math.cos(BRANCH_ANGLE * 0.8),
                y: node.y + NODE_DISTANCE * Math.sin(BRANCH_ANGLE * 0.8)
            };
            nextLevel.push(upNode, downNode);
            treeNodes.push(upNode, downNode);
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
    const lastLevelNodes = treeNodes.slice(-Math.pow(2, TREE_LEVELS));
    
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

function drawTree() {
    // 선 먼저 그리기 (모든 선을 하나의 path로)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(50,50,50,1)';
    ctx.lineWidth = 1;
    
    treeNodes.forEach((node, index) => {
        if (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(treeNodes[parentIndex].x, treeNodes[parentIndex].y);
        }
    });
    ctx.stroke();

    // 노드 그리기
    treeNodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, TREE_NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    });

    // 가장 긴 텍스트의 너비 계산
    // 텍스트의 최대 크기 계산
    const textDimensions = getMaxTextDimensions(consumptionLabels);
    const labelSpacing = getLabelSpacing() + 3; // 노드 간격으로 라벨 간격 설정
    
    // 라벨 시작 위치 계산
    const labelStartX = treeNodes[treeNodes.length - 1].x - 20;
    const baseY = canvas.height / 2.2 - ((consumptionLabels.length - 1) * labelSpacing) / 2 + 3;
    const iconWidth = ICON_CONFIG.width/2;

    consumptionLabels.forEach((label, index) => {
        if (label.text) {
            const y = baseY + (index * labelSpacing);
            
            ctx.font = '18px "Times New Roman"';
            ctx.fillStyle = 'rgba(50,50,50,1)';
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
    });
}
    
    // 점 초기화 함수
    function initializeChainPoints() {
        chainPoints = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            chainPoints.push({
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            });
        }
    }
    
    // 점의 위치 계산 헬퍼 함수
    function calculatePointPosition(point, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(point.angle),
            y: centerY + radius * Math.sin(point.angle)
        };
    }

    
    // 선 그리기 함수 수정
function drawLine(line) {
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


function updateAnimationState(movePoint, step) {
    const centerY = canvas.height / 2.2;
    const radius = canvas.height * 0.4;
    const chain2X = canvas.width/2 + radius * 2;

    const dataMetrics = getMultilineTextDimensions("Original\nData");
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator",true);
    const tokenMetrics = getMultilineTextDimensions("Carbon Emission\nTOKEN",true);
    
    const positions = {
        data: {
            x: chain2X - radius - dataMetrics.width/2,
            y: centerY
        },
        calculator: {
            x: chain2X - calculatorMetrics.width/2,
            y: centerY
        },
        token: {
            x: chain2X,
            y: centerY + 120 - tokenMetrics.height/1.8
        }
    };

    const threshold = 5;
    const currentTime = performance.now();

    const distances = {
        data: Math.hypot(movePoint.x - positions.data.x, movePoint.y - positions.data.y),
        calculator: Math.hypot(movePoint.x - positions.calculator.x, movePoint.y - positions.calculator.y),
        token: Math.hypot(movePoint.x - positions.token.x, movePoint.y - positions.token.y)
    };

    // 선의 완료 상태를 더 정확하게 체크
    const activeLineStates = activeLines.map(line => ({
        progress: line.progress,
        maxLength: line.maxLength,
        opacity: line.opacity
    }));
    // console.log('Active Line States:', activeLineStates);

    // 모든 선이 완료되었는지 체크 (진행도가 1에 도달했거나 opacity가 0인 경우)
    const allLinesReachedTarget = activeLines.length === 0 || 
        activeLines.every(line => 
            line.progress >= 1 || line.opacity === 0
        );

    // console.log('All Lines Reached:', allLinesReachedTarget);
    // console.log('Pending Creations:', pendingLineCreations);
    if (step === 1 || step === 0) {
        // console.log('Step 0: Resetting all states');
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
            // console.log('Creating first N5 line');
            createLinesAtPosition(chain2X, centerY, radius, 'N5', currentTime);
        }
        // Calculator와 Token 위치는 대기열에 기록
        else if (distances.calculator < threshold) {
            if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
                // console.log('Recording Calculator point for later');
                pendingLineCreations.push({
                    position: { x: chain2X, y: centerY, radius: radius },
                    type: 'random'
                });
            }
        }
        else if (distances.token < threshold) {
            if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
                // console.log('Recording Token point for later');
                pendingLineCreations.push({
                    position: { x: chain2X, y: centerY, radius: radius },
                    type: 'random'
                });
            }
        }
    }
    // 다음 선 생성 처리
    if (pendingLineCreations.length > 0 && allLinesReachedTarget && activeLines.length === 0) {
        // console.log('Creating next line from queue');
        // console.log('Queue before creation:', JSON.stringify(pendingLineCreations));
        const nextCreation = pendingLineCreations.shift();
        createLinesAtPosition(nextCreation.position.x, nextCreation.position.y, nextCreation.position.radius, nextCreation.type, currentTime);
        // console.log('Queue after creation:', JSON.stringify(pendingLineCreations));
    }

    // 기존 선 업데이트
    updateLines(currentTime);
}

// updateLines 함수 수정
function updateLines(currentTime) {
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

    if (oldLength !== activeLines.length) {
        // console.log(`Lines updated: ${oldLength} -> ${activeLines.length}`);
    }
}

// createLines 함수도 수정
function createLines(sourcePoint, chain2X, centerY, radius, currentTime) {
    const lines = [];
    
    const startPos = calculatePointPosition(sourcePoint, chain2X, centerY, radius);
    
    chainPoints.forEach(targetPoint => {
        if (targetPoint.number !== sourcePoint.number) {
            const endPos = calculatePointPosition(targetPoint, chain2X, centerY, radius);
            
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
function createLinesAtPosition(x, y, radius, sourceType, currentTime) {
    // 최근 방문 기록 체크
    const visitedKey = `${x.toFixed(2)}-${y.toFixed(2)}`;
    const recentlyVisited = recentVisitedPositions.some(pos => pos.key === visitedKey && currentTime - pos.time < 500); // 0.5초 이내
    if (recentlyVisited) return;

    if (sourceType === 'N5') {
        currentSource = chainPoints.find(p => p.number === 5);
    } else {
        currentSource = chainPoints[Math.floor(Math.random() * chainPoints.length)];
    }
    const newLines = createLines(currentSource, x, y, radius, currentTime);
    activeLines = activeLines.concat(newLines);
    // console.log(sourceType);

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
        function drawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        }

        

        function drawText(text, x, y, hasBox = true, isBold = false, iconType = null) {
            const lines = text.split('\n');
            ctx.font = `${isBold ? 'bold' : 'normal'} 16px "Times New Roman"`;
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


    function drawArrow(points) {
        // 선 그리기
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // 화살표 (마지막 점에만)
        const lastPoint = points[points.length - 1];
        const secondLastPoint = points[points.length - 2];
        
        const angle = Math.atan2(lastPoint.y - secondLastPoint.y, lastPoint.x - secondLastPoint.x);
        
        // 화살표 크기 조정
        const arrowLength = 8;
        const arrowWidth = 6;
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle - Math.PI/6), 
                lastPoint.y - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle + Math.PI/6),
                lastPoint.y - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    }
        function drawDataPoint(x, y) {
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
    
    const padding = { x: 12, y: 6 };
    const iconSpace = hasIcon ? {
        height: ICON_CONFIG.height + ICON_CONFIG.spacing - padding.y * 2,
        width: Math.max(ICON_CONFIG.width - padding.x * 2.2, 0)
    } : {
        height: 0,
        width: 0
    };

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
    // 여러 데이터 포인트를 추적하기 위한 구조
let treeAnimationPoints = [];

// 트리 경로 계산 함수 수정
function calculateAllTreePaths() {
    const paths = [];
    // 마지막 레벨의 노드들
    const lastLevelNodes = treeNodes.slice(-Math.pow(2, TREE_LEVELS));
    
    // 각 마지막 레벨 노드에 대해 경로 생성
    lastLevelNodes.forEach(startNode => {
        let path = [];
        let currentNode = startNode;
        let currentIndex = treeNodes.indexOf(currentNode);
        
        while (currentIndex > 0) {
            path.push({x: currentNode.x, y: currentNode.y});
            // 부모 노드의 인덱스 계산
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            currentNode = treeNodes[parentIndex];
            currentIndex = parentIndex;
        }
        // 루트 노드 추가
        path.push({x: currentNode.x, y: currentNode.y});
        paths.push(path);
    });
    
    return paths;
}

// movePoints 초기화 함수
function initializeTreeAnimationPoints(paths) {
    treeAnimationPoints = paths.map(path => ({
        x: path[0].x,
        y: path[0].y,
        currentSegment: 0,
        path: path,
        active: true
    }));
}
        
function calculateAnimationPath(step) {
    const centerY = canvas.height / 2.2;
    const radius = canvas.height * 0.4;
    const chain1X = canvas.width/2 - radius * 2;
    const chain2X = canvas.width/2 + radius * 2;

    const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
    const data2Metrics = getMultilineTextDimensions("Original\nData", false);
    const notaryMetrics = getTextDimensions("Notary Oracle", true);
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator", true);

    const positions = {
        dataLeft: { x: chain1X + radius, y: centerY },
        dataRight: { x: chain2X - radius, y: centerY },
        notary: { x: (chain1X + chain2X) / 2, y: centerY },
        calculator: { x: chain2X, y: centerY },
        token: { x: chain2X, y: centerY + 120 }
    };
            
    if (step === 0) {
        return {
            points: [],  // 빈 배열 반환 - 트리 애니메이션은 별도 처리
            isTreeAnimation: true
        };
    }
    switch(step) {
        case 0:
            return {
                points: calculateTreePath()
            };
        case 1:
            return {
                points: [
                    { x: positions.dataLeft.x + dataMetrics.width/2, y: positions.dataLeft.y},
                    { x: positions.notary.x - notaryMetrics.width/2, y: positions.dataLeft.y }
                ]
            };
        // ... 기존 케이스들을 한 단계씩 밀어서 재정의
        case 2:
            return {
                points: [
                    { x: positions.notary.x + notaryMetrics.width/2, y: positions.dataRight.y },
                    { x: positions.dataRight.x - data2Metrics.width/2, y: positions.dataRight.y}
                ]
            };
        case 3:
            return {
                points: [
                    { x: positions.dataRight.x + data2Metrics.width/2, y: positions.dataRight.y },
                    { x: positions.calculator.x - calculatorMetrics.width/2, y: positions.calculator.y }
                ]
            };
        case 4:
            return {
                points: [
                    { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                    { x: positions.calculator.x, y: positions.token.y - calculatorMetrics.height/2 }
                ]
            };
        case 5:
            return {
                points: [
                    { x: positions.token.x, y: positions.token.y + calculatorMetrics.height/2 },
                    { x: positions.token.x, y: positions.token.y + calculatorMetrics.height/2 }
                ]
            };
    }
}

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerY = canvas.height / 2.2;
            // 원의 크기를 캔버스 높이의 40%로 유지
            const radius = canvas.height * 0.4;
            // 원 사이 간격을 지름 하나만큼으로 조정
            const chain1X = canvas.width/2 - radius * 2;
            const chain2X = canvas.width/2 + radius * 2;
            
            // 기본 원 그리기
            drawCircle(chain2X, centerY, radius);
        
            // Calculate and draw tree structure
            const dataMetrics = getMultilineTextDimensions("Original\nAggregated Data", false);
            const dataTextX = chain1X + radius - dataMetrics.width/2 ;
            drawText("Original\nAggregated Data", chain1X + radius, centerY, true, false);
            calculateTreeNodes(dataTextX, centerY);
            drawTree();

            // 활성화된 선 그리기
            activeLines.forEach(line => {
                drawLine(line);
            });
        
            // Chain 원의 점들 그리기
            chainPoints.forEach(point => {
                const pos = calculatePointPosition(point, chain2X, centerY, radius);
                
                // 점 그리기
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fill();
                
                // 점 번호 그리기
                const textRadius = radius + 15;
                const textPos = calculatePointPosition(point, chain2X, centerY, textRadius);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.font = '11px Times New Roman';
                ctx.fillText(`N${point.number}`, textPos.x - 6, textPos.y);
            });
        
            // 타이틀과 내부 텍스트
            const nameMetrics = getTextDimensions("Channel", true);
            drawText("External Channel", chain1X, canvas.height - nameMetrics.height/2,false, true);
        
            drawText("Carbon Emission Chain", chain2X, canvas.height - nameMetrics.height/2, false, true);
            drawText("Carbon Emission\nCalculator", chain2X, centerY, false, false,'emissionC');
            drawText("Carbon Emission\nTOKEN",  chain2X, centerY + 120, false, false,'emissionT');
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Oracle", (chain1X + chain2X) / 2, centerY - radius + radius/2,false,true);
            drawText("Notary Oracle", (chain1X + chain2X) / 2, centerY,true,true);
            drawText("Original\nData", chain2X - radius, centerY);
        
            // 각 이동 선의 중앙점 계산
            const path1 = calculateAnimationPath(1);
            const path2 = calculateAnimationPath(2);
            
            // data to notary 이동선의 중앙점 (첫 번째 점선의 x 위치)
            const midPoint1X = (path1.points[0].x + path1.points[1].x) / 2;
            const midPoint1Y = path1.points[0].y;
            
            // notary to data 이동선의 중앙점 (두 번째 점선의 x 위치)
            const midPoint2X = (path2.points[0].x + path2.points[1].x) / 2;
            const midPoint2Y = path2.points[0].y;
        
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
                    ctx.moveTo(midPoint2X, textBottomY);
                    ctx.lineTo(midPoint2X, midPoint2Y);
                }
                
                if (dashedLines.line1) {
                    ctx.moveTo(midPoint1X, textBottomY);
                    ctx.lineTo(midPoint1X, midPoint1Y);
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
            treeAnimationPoints.forEach(point => {
                if (point.active) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(50,50,50,1)';
                    ctx.fill();
                    
                    // 현재 세그먼트의 선 그리기
                    if (point.currentSegment < point.path.length - 1) {
                        const nextPoint = point.path[point.currentSegment + 1];
                        ctx.beginPath();
                        ctx.moveTo(point.path[point.currentSegment].x, point.path[point.currentSegment].y);
                        ctx.lineTo(nextPoint.x, nextPoint.y);
                        ctx.strokeStyle = 'rgba(50,50,50,0.5)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            paths.forEach(path => {
                drawArrow(path.points);
            });
        
            // 이동하는 점 그리기
            if (movePoint.init) {
                drawDataPoint(movePoint.x, movePoint.y);
            }
        }

// animate 함수 수정 - 선 애니메이션 업데이트 부분
function animate() {
    const currentTime = performance.now();
    
    if (currentStep === 0) {
        // 트리 애니메이션
        if (treeAnimationPoints.length === 0) {
            const paths = calculateAllTreePaths();
            initializeTreeAnimationPoints(paths);
        }
        
        let allFinished = true;
        treeAnimationPoints.forEach(point => {
            if (!point.active) return;
            
            const nextPoint = point.path[point.currentSegment + 1];
            if (nextPoint) {
                const dx = nextPoint.x - point.x;
                const dy = nextPoint.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 트리 애니메이션 전용 속도 사용
                if (distance <= ANIMATION_SPEEDS.tree) {
                    point.currentSegment++;
                    point.x = nextPoint.x;
                    point.y = nextPoint.y;
                } else {
                    const ratio = ANIMATION_SPEEDS.tree / distance;
                    point.x += dx * ratio;
                    point.y += dy * ratio;
                    allFinished = false;
                }
            }
            
            if (point.currentSegment >= point.path.length - 1) {
                point.active = false;
            } else {
                allFinished = false;
            }
        });
        
        if (allFinished) {
            // 트리 애니메이션 완료 후 잠시 대기
            currentStep = 1;
            treeAnimationPoints = [];
            movePoint.init = false;
            segmentIndex = 0;
        }
    } else {

        // 현재 이동 경로 계산
        const currentPath = calculateAnimationPath(currentStep).points;
        
        // 이동점 초기화
        if (!movePoint.init) {
            movePoint = {
                x: currentPath[0].x,
                y: currentPath[0].y,
                init: true
            };
        }

        // 다음 목표 지점
        const target = currentPath[segmentIndex + 1];
        
        if (target) {
            const dx = target.x - movePoint.x;
            const dy = target.y - movePoint.y;
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
                // 마지막 단계에서 리셋
                setTimeout(function() {
                    currentStep = 0;
                    dashedLines.line1 = false;
                    dashedLines.line2 = false;
                    shouldClearDashedLines = false;
                    movePoint.init = false;
                    segmentIndex = 0;
                }, 4130);
                currentStep = 5;
            }
            
            if (currentStep !== 5) {
                segmentIndex = 0;
                movePoint.init = false;
            }
        }
            } else {
                const ratio = ANIMATION_SPEEDS.regular / distance;
                movePoint.x += dx * ratio;
                movePoint.y += dy * ratio;
            }
        }
        // 선 애니메이션 업데이트
        updateLines(currentTime);
        
        // 위치 체크 및 상태 업데이트
        if (movePoint.init) {
            updateAnimationState(movePoint, currentStep);
        }
        
    }
    // 캔버스 다시 그리기
    draw();
    
    requestAnimationFrame(animate);
}
    window.addEventListener('resize', resizeCanvas);
    initializeChainPoints();
    resizeCanvas();

    animate();

}











function initializeCanvas2(canvasId){
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let currentStep = 0;
    let segmentIndex = 0;
    
    const steps = 3;
    const MOVE_SPEED = 3;
    let movePoint = {
        x: 0,
        y: 0,
        init: false
    };

    let chainPoints = [];
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

    

    // Chain 점 초기화 함수
    function initializeChainPoints() {
        chainPoints = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            chainPoints.push({
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            });
        }
    }

    // 점의 위치 계산 함수
    function calculatePointPosition(point, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(point.angle),
            y: centerY + radius * Math.sin(point.angle)
        };
    }

    // 선 그리기 함수
    function drawLine(line) {
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
    function createLines(sourcePoint, chain1X, centerY, radius, currentTime) {
        const lines = [];
        const startPos = calculatePointPosition(sourcePoint, chain1X, centerY, radius);
        
        chainPoints.forEach(targetPoint => {
            if (targetPoint.number !== sourcePoint.number) {
                const endPos = calculatePointPosition(targetPoint, chain1X, centerY, radius);
                
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

    function createLinesAtPosition(x, y, radius, sourceType, currentTime) {
        const visitedKey = `${x.toFixed(2)}-${y.toFixed(2)}`;
        const recentlyVisited = recentVisitedPositions.some(pos => 
            pos.key === visitedKey && currentTime - pos.time < RECENT_VISITED_DURATION
        );
        if (recentlyVisited) return;

        if (sourceType === 'N13') {
            currentSource = chainPoints.find(p => p.number === 13);
        } else {
            currentSource = chainPoints[Math.floor(Math.random() * chainPoints.length)];
        }
        const newLines = createLines(currentSource, x, y, radius, currentTime);
        activeLines = activeLines.concat(newLines);

        recentVisitedPositions.push({
            key: visitedKey,
            time: currentTime
        });
    }

    function updateLines(currentTime) {
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

    function updateAnimationState(movePoint, step) {
        const centerY = canvas.height / 2.2;
        const radius = canvas.height * 0.4;
        const chain1X = canvas.width/2 - radius * 2;

        const dataMetrics = getTextDimensions("DATA", true);
        const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry");
        const tokenMetrics = getTextDimensions("TOKEN", true);
        
        const positions = {
            data: {
                x: chain1X + radius,
                y: centerY + dataMetrics.height/2
            },
            calculator: {
                x: chain1X,
                y: centerY + calculatorMetrics.height/2
            },
            token: {
                x: chain1X,
                y: centerY + 120 - tokenMetrics.height/2
            }
        };

        const threshold = 5;
        const currentTime = performance.now();
    
        const distances = {
            data: Math.hypot(movePoint.x - positions.data.x, movePoint.y - positions.data.y),
            calculator: Math.hypot(movePoint.x - positions.calculator.x, movePoint.y - positions.calculator.y),
            token: Math.hypot(movePoint.x - positions.token.x, movePoint.y - positions.token.y)
        };
    
        // 선의 완료 상태를 체크
        const allLinesReachedTarget = activeLines.length === 0 || 
            activeLines.every(line => line.progress >= 1 || line.opacity === 0);
    
        if (step === 0) {
            activeLines = [];
            pendingLineCreations = [];
            recentVisitedPositions = [];
            currentSource = null;
            lastAnimationStep = null;
        }
    
        if (step !== 3) {
            // DATA 위치에서는 즉시 선 생성
            if (distances.data < threshold && activeLines.length === 0) {
                createLinesAtPosition(chain1X, centerY, radius, 'N13', currentTime);
            }
            // Calculator와 Token 위치는 대기열에 기록
            else if (distances.calculator < threshold) {
                if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
                    pendingLineCreations.push({
                        position: { x: chain1X, y: centerY, radius: radius },
                        type: 'random'
                    });
                }
            }
            else if (distances.token < threshold) {
                if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
                    pendingLineCreations.push({
                        position: { x: chain1X, y: centerY, radius: radius },
                        type: 'random'
                    });
                }
            }
        }
    
        // 다음 선 생성 처리
        if (pendingLineCreations.length > 0 && allLinesReachedTarget && activeLines.length === 0) {
            const nextCreation = pendingLineCreations.shift();
            createLinesAtPosition(nextCreation.position.x, nextCreation.position.y, nextCreation.position.radius, nextCreation.type, currentTime);
        }
    
        // 기존 선 업데이트
        updateLines(currentTime);
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



        function drawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        }

        function drawText(text, x, y, hasBox = true, isBold = false) {
            const lines = text.split('\n');
            ctx.font = `${isBold ? 'bold' : 'normal'} 16px "Times New Roman"`;
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
                const height = 40 + (lines.length - 1) * 18;
                const radius = 40 / 2;
                
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 18;
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fillText(line, x, lineY);
            });
        }


    function drawArrow(points) {
        // 선 그리기
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // 화살표 (마지막 점에만)
        const lastPoint = points[points.length - 1];
        const secondLastPoint = points[points.length - 2];
        
        const angle = Math.atan2(lastPoint.y - secondLastPoint.y, lastPoint.x - secondLastPoint.x);
        
        // 화살표 크기 조정
        const arrowLength = 10;
        const arrowWidth = 6;
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle - Math.PI/6), 
                lastPoint.y - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle + Math.PI/6),
                lastPoint.y - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    }
        function drawDataPoint(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        }
        function getTextDimensions(text, hasBox = true) {
            // 기본 폰트 설정
            ctx.font = `normal 16px "Times New Roman"`;
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
        function getMultilineTextDimensions(text) {
            const lines = text.split('\n');
            const lineHeight = 18;
            let maxWidth = 0;
            
            lines.forEach(line => {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                
                const padding = { x: 12, y: 6 };
                const width = textWidth + (padding.x * 2.2);
                const height = Math.max(40, textHeight + (padding.y * 2));
                
                maxWidth = Math.max(maxWidth, width);
            });
            
            return {
                width: maxWidth,
                height: lines.length * lineHeight + 12 // 여백 포함
            };
        }
        function calculateAnimationPath(step) {
            const centerY = canvas.height / 2.2;
            const radius = canvas.height * 0.4;
            const chain1X = canvas.width/2 - radius * 2;
            const chain2X = canvas.width/2 + radius * 2;
        
            const dataMetrics = getTextDimensions("DATA", true);
            const notaryMetrics = getTextDimensions("Notary Oracle", true);
            const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry");
            const tokenMetrics = getTextDimensions("TOKEN", true);
        
            const positions = {
                dataLeft: { x: chain2X - radius, y: centerY },
                dataRight: { x: chain1X + radius, y: centerY },
                notary: { x: (chain1X + chain2X) / 2, y: centerY },
                calculator: { x: chain1X, y: centerY },
                token: { x: chain1X, y: centerY + 120 }
            };
        
            let points = [];
        
            switch(step) {
                case 0:
                    points = [
                        { x: positions.dataLeft.x, y: positions.dataLeft.y - dataMetrics.height/2 },
                        { x: positions.dataLeft.x, y: positions.dataLeft.y - radius/4 },
                        { x: positions.notary.x, y: positions.notary.y - radius/4 },
                        { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 }
                    ];
                    break;
                case 1:
                    points = [
                        { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 },
                        { x: positions.notary.x, y: positions.notary.y + radius/4 },
                        { x: positions.dataRight.x, y: positions.dataRight.y + radius/4 },
                        { x: positions.dataRight.x, y: positions.dataRight.y + dataMetrics.height/2 }
                    ];
                    break;
                case 2:
                    points = [
                        { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                        { x: positions.token.x, y: positions.token.y - tokenMetrics.height/2 }
                    ];
                    break;
                default:
                    points = [
                        { x: positions.dataLeft.x, y: positions.dataLeft.y },
                        { x: positions.dataLeft.x, y: positions.dataLeft.y }
                    ];
            }
        
            return points;
        }

    // 기존의 draw 함수에 체인 포인트 그리기 추가
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerY = canvas.height / 2.2;
        const radius = canvas.height * 0.4;
        const chain1X = canvas.width/2 - radius * 2;
        const chain2X = canvas.width/2 + radius * 2;
    
        drawCircle(chain1X, centerY, radius);
        drawCircle(chain2X, centerY, radius);
    
        // 체인 포인트와 라인 그리기
        activeLines.forEach(line => {
            drawLine(line);
        });
    
        chainPoints.forEach(point => {
            const pos = calculatePointPosition(point, chain1X, centerY, radius);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            const textRadius = radius + 15;
            const textPos = calculatePointPosition(point, chain1X, centerY, textRadius);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '11px Times New Roman';
            ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
        });
    
        // 타이틀과 내부 텍스트
        drawText("External Channel", chain2X, centerY - radius + radius/2, false, true);
        drawText("Carbon Absorption", chain2X, centerY - 16);
        drawText("Carbon Reduction", chain2X, centerY + 16);
    
        drawText("Carbon Offset Chain", chain1X, centerY - radius + radius/2, false, true);
        drawText("Carbon Credits\nRegistry", chain1X, centerY, true, false);
        drawText("TOKEN", chain1X, centerY + 120);
    
        // 중앙 텍스트들과 점선
        const path1 = calculateAnimationPath(0);
        const path2 = calculateAnimationPath(1);
        
        const midPoint1X = (path1[1].x + path1[2].x) / 2;
        const midPoint1Y = path1[2].y;
        
        const midPoint2X = (path2[1].x + path2[2].x) / 2;
        const midPoint2Y = path2[1].y;
    
        const multiSignatureMetrics = getTextDimensions("Notarized Multi-Signature Oracle", true);
        const multiSignatureY = centerY - radius + radius/2;
        const textBottomY = multiSignatureY + multiSignatureMetrics.height/2;
    
        // Draw dashed lines based on animation state
        if (!shouldClearDashedLines) {
            ctx.beginPath();
            ctx.strokeStyle = '#333';
            ctx.setLineDash([5, 5]);
            
            if (dashedLines.line1) {
                ctx.moveTo(midPoint1X, textBottomY);
                ctx.lineTo(midPoint1X, midPoint1Y);
            }
            
            if (dashedLines.line2) {
                ctx.moveTo(midPoint2X, textBottomY);
                ctx.lineTo(midPoint2X, midPoint2Y);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
    
        drawText("Notarized Multi-Signature Oracle", (chain1X + chain2X) / 2, centerY - radius + radius/2, true);
        drawText("Notary Oracle", (chain1X + chain2X) / 2, centerY);
        drawText("DATA", chain1X + radius, centerY);
        drawText("DATA", chain2X - radius, centerY);
    
        // 화살표 그리기
        const paths = [
            calculateAnimationPath(0),
            calculateAnimationPath(1),
            calculateAnimationPath(2)
        ];
        
        paths.forEach(path => {
            if (path && path.length > 0) {
                drawArrow(path);
            }
        });
    
        if (movePoint.init) {
            drawDataPoint(movePoint.x, movePoint.y);
        }
    }

    function animate() {
        const currentTime = performance.now();
        const currentPath = calculateAnimationPath(currentStep);
        
        if (!movePoint.init) {
            movePoint = {
                x: currentPath[0].x,
                y: currentPath[0].y,
                init: true
            };
        }

        const target = currentPath[segmentIndex + 1];
        
        if (target) {
            const dx = target.x - movePoint.x;
            const dy = target.y - movePoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= MOVE_SPEED) {
                segmentIndex++;
                if (segmentIndex >= currentPath.length - 1) {
                    if (currentStep === 0) {
                        dashedLines.line1 = true;
                        currentStep = 1;
                    } else if (currentStep === 1) {
                        dashedLines.line2 = true;
                        currentStep = 2;
                    } else if (currentStep === 2) {
                        setTimeout(function() {
                            currentStep = 0;
                            dashedLines.line1 = false;
                            dashedLines.line2 = false;
                            shouldClearDashedLines = false;
                            movePoint.init = false;
                            segmentIndex = 0;
                        }, 4000);
                        currentStep = 3;
                    }
                    
                    if (currentStep !== 3) {
                        segmentIndex = 0;
                        movePoint.init = false;
                    }
                }
            } else {
                const ratio = MOVE_SPEED / distance;
                movePoint.x += dx * ratio;
                movePoint.y += dy * ratio;
            }
        }

        if (movePoint.init) {
            updateAnimationState(movePoint, currentStep);
        }
        
        // 캔버스 다시 그리기
        draw();
        
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resizeCanvas);
    initializeChainPoints();
    resizeCanvas();

    animate();

}








function initializeCanvas3(canvasId){

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let currentStep = 0;
    let segmentIndex = 0;

    const steps = 8;
    const MOVE_SPEED = 3;
    let movePoint = {
        x: 0,
        y: 0,
        init: false
    };

    let chainPoints1 = []; // 왼쪽 원의 점들
    let chainPoints2 = []; // 오른쪽 원의 점들
    let activeLines = [];
    let currentSource = null;
    
    // 선 애니메이션을 위한 상태
    const lineAnimationState = {
        duration: 1500,
        interval: 0,
    };

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
        function drawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        }

        function drawText(text, x, y, hasBox = true, isBold = false) {
            const lines = text.split('\n');
            ctx.font = `${isBold ? 'bold' : 'normal'} 16px "Times New Roman"`;
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
                const height = 40 + (lines.length - 1) * 18;
                const radius = 40 / 2;
                
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 18;
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fillText(line, x, lineY);
            });
        }


    function drawArrow(points) {
        // 선 그리기
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50,50,50,1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // 화살표 (마지막 점에만)
        const lastPoint = points[points.length - 1];
        const secondLastPoint = points[points.length - 2];
        
        const angle = Math.atan2(lastPoint.y - secondLastPoint.y, lastPoint.x - secondLastPoint.x);
        
        // 화살표 크기 조정
        const arrowLength = 0;
        const arrowWidth = 0;
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle - Math.PI/6), 
                lastPoint.y - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(lastPoint.x - arrowLength * Math.cos(angle + Math.PI/6),
                lastPoint.y - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
    }
        function drawDataPoint(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        }
        function getTextDimensions(text, hasBox = true) {
            // 기본 폰트 설정
            ctx.font = `normal 16px "Times New Roman"`;
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
    function initializeChainPoints() {
        chainPoints1 = [];
        chainPoints2 = [];
        const angleStep = (Math.PI * 2) / 16;
        
        for (let i = 0; i < 16; i++) {
            const point = {
                angle: -i * angleStep - Math.PI/2,
                number: i + 1
            };
            chainPoints1.push({...point});
            chainPoints2.push({...point});
        }
    }

    // 점의 위치 계산 함수
    function calculatePointPosition(point, centerX, centerY, radius) {
        return {
            x: centerX + radius * Math.cos(point.angle),
            y: centerY + radius * Math.sin(point.angle)
        };
    }

    // 선 그리기 함수
    function drawLine(line) {
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
    function createLines(sourcePoint, centerX, centerY, radius, chainPoints, currentTime) {
        const lines = [];
        const startPos = calculatePointPosition(sourcePoint, centerX, centerY, radius);
        
        chainPoints.forEach(targetPoint => {
            if (targetPoint.number !== sourcePoint.number) {
                const endPos = calculatePointPosition(targetPoint, centerX, centerY, radius);
                
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
    function updateLines(currentTime) {
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

    function createLinesAtPosition(x, y, radius, sourceType, chainPoints, currentTime) {
        let sourcePoint;
        
        if (sourceType === 'N5') {
            sourcePoint = chainPoints.find(p => p.number === 5);
        } else if (sourceType === 'N13') {
            sourcePoint = chainPoints.find(p => p.number === 13);
        } else {
            sourcePoint = chainPoints[Math.floor(Math.random() * chainPoints.length)];
        }

        const newLines = createLines(sourcePoint, x, y, radius, chainPoints, currentTime);
        activeLines = activeLines.concat(newLines);
    }

    let recentVisitedPositions1 = []; // 왼쪽 원의 방문 기록
    let recentVisitedPositions2 = []; // 오른쪽 원의 방문 기록
    const RECENT_VISITED_DURATION = 500;
    let pendingLineCreations1 = []; // 왼쪽 원의 대기열
    let pendingLineCreations2 = []; // 오른쪽 원의 대기열
    function updateAnimationState(movePoint, step) {
        const centerY = canvas.height / 2.2;
        const radius = canvas.height * 0.4;
        const chain1X = canvas.width/2 - radius * 2;
        const chain2X = canvas.width/2 + radius * 2;

        const tokenMetrics = getTextDimensions("TOKEN", true);
        const creditMetrics = getTextDimensions("Carbon Credit", true);
        
        const positions = {
            leftToken: {
                x: chain1X + radius,
                y: centerY + tokenMetrics.height/2
            },
            rightToken: {
                x: chain2X - radius,
                y: centerY - tokenMetrics.height/2
            },
            leftCredit: {
                x: chain1X + creditMetrics.width/2,
                y: centerY
            },
            rightCredit: {
                x: chain2X - creditMetrics.width/2,
                y: centerY
            }
        };

        const threshold = 5;
        const currentTime = performance.now();
        // 선의 완료 상태를 체크
        const allLinesReachedTarget = activeLines.length === 0 || 
            activeLines.every(line => line.progress >= 1 || line.opacity === 0);
    

        // TOKEN 위치 도달 감지 및 선 생성
        const distanceLeftToken = Math.hypot(movePoint.x - positions.leftToken.x, movePoint.y - positions.leftToken.y);
        const distanceRightToken = Math.hypot(movePoint.x - positions.rightToken.x, movePoint.y - positions.rightToken.y);
        const distanceLeftCredit = Math.hypot(movePoint.x - positions.leftCredit.x, movePoint.y - positions.leftCredit.y);
        const distanceRightCredit = Math.hypot(movePoint.x - positions.rightCredit.x, movePoint.y - positions.rightCredit.y);

        // if (step === 0) {
        //     pendingLineCreations1 = [];
        //     pendingLineCreations2 = [];
        //     recentVisitedPositions1 = [];
        //     recentVisitedPositions2 = [];
        //     activeLines = [];
        // }
    
        // 왼쪽 원의 위치 체크 및 대기열 추가
        if (distanceLeftToken < threshold) {
            const visitedKey = `leftToken-${currentTime}`;
            if (step !== 1) {
                if (!recentVisitedPositions1.some(pos => currentTime - pos.time < RECENT_VISITED_DURATION)) {
                    pendingLineCreations1.push({
                        position: { x: chain1X, y: centerY, radius: radius },
                        type: 'N13',
                        time: currentTime
                    });
                    recentVisitedPositions1.push({ key: visitedKey, time: currentTime });
                }
            }
        }
        else if (distanceLeftCredit < threshold) {
            const visitedKey = `leftCredit-${currentTime}`;
            if (!recentVisitedPositions1.some(pos => currentTime - pos.time < RECENT_VISITED_DURATION)) {
                pendingLineCreations1.push({
                    position: { x: chain1X, y: centerY, radius: radius },
                    type: 'random',
                    time: currentTime
                });
                recentVisitedPositions1.push({ key: visitedKey, time: currentTime });
            }
        }
    
        // 오른쪽 원의 위치 체크 및 대기열 추가
        if (distanceRightToken < threshold) {
            const visitedKey = `rightToken-${currentTime}`;
            if (!recentVisitedPositions2.some(pos => currentTime - pos.time < RECENT_VISITED_DURATION)) {
                pendingLineCreations2.push({
                    position: { x: chain2X, y: centerY, radius: radius },
                    type: 'N5',
                    time: currentTime
                });
                recentVisitedPositions2.push({ key: visitedKey, time: currentTime });
            }
        }
        else if (distanceRightCredit < threshold) {
            const visitedKey = `rightCredit-${currentTime}`;
            if (!recentVisitedPositions2.some(pos => currentTime - pos.time < RECENT_VISITED_DURATION)) {
                pendingLineCreations2.push({
                    position: { x: chain2X, y: centerY, radius: radius },
                    type: 'random',
                    time: currentTime
                });
                recentVisitedPositions2.push({ key: visitedKey, time: currentTime });
            }
        }
    
        // 대기열에서 선 생성 처리 (왼쪽 원)
        if (pendingLineCreations1.length > 0 && allLinesReachedTarget) {
            const nextCreation = pendingLineCreations1.shift();
            createLinesAtPosition(
                nextCreation.position.x,
                nextCreation.position.y,
                nextCreation.position.radius,
                nextCreation.type,
                chainPoints1,
                currentTime
            );
        }
    
        // 대기열에서 선 생성 처리 (오른쪽 원)
        if (pendingLineCreations2.length > 0 && allLinesReachedTarget) {
            const nextCreation = pendingLineCreations2.shift();
            createLinesAtPosition(
                nextCreation.position.x,
                nextCreation.position.y,
                nextCreation.position.radius,
                nextCreation.type,
                chainPoints2,
                currentTime
            );
        }

        updateLines(currentTime);
    }
    
        
    function calculateAnimationPath(step) {
        const centerY = canvas.height / 2.2;
        const radius = canvas.height * 0.4;
        const chain1X = canvas.width/2 - radius * 2;
        const chain2X = canvas.width/2 + radius * 2;
    
        const creditMetrics = getTextDimensions("Carbon Credit", true);
        const notaryMetrics = getTextDimensions("Notary Bridge", true);
        const tokenMetrics = getTextDimensions("TOKEN", true);

        const positions = {
            dataLeft: { x: chain1X + radius, y: centerY },
            dataRight: { x: chain2X - radius, y: centerY },
            notary: { x: (chain1X + chain2X) / 2, y: centerY },
            token: { x: chain2X, y: centerY + 100 }
        };
    
        let points = [];
        switch(step) {
            case 0:
                points = [
                    { x: chain1X + creditMetrics.width/2 , y: positions.dataLeft.y },
                    { x: positions.dataLeft.x - tokenMetrics.width/2 , y: positions.dataLeft.y }
                ];
                break;
            case 1:
                points = [
                    { x: positions.dataLeft.x, y: positions.dataLeft.y + tokenMetrics.height/2 },
                    { x: positions.dataLeft.x, y: positions.dataLeft.y + radius/3 },
                    { x: positions.notary.x, y: positions.notary.y + radius/3 },
                    { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 }
                ];
                break;
            case 2:
                points = [
                    { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 },
                    { x: positions.notary.x, y: positions.notary.y - radius/4 },
                    { x: positions.dataRight.x, y: positions.dataRight.y - radius/4 },
                    { x: positions.dataRight.x, y: positions.dataRight.y - tokenMetrics.height/2 }
                ];
                break;
            case 3:
                points = [
                    { x: positions.dataRight.x + tokenMetrics.width/2, y:positions.dataRight.y },
                    { x: positions.token.x - creditMetrics.width/2, y: positions.dataRight.y }
                ];
                break;
            case 4:
                points = [
                    { x: positions.token.x - creditMetrics.width/2, y: positions.dataRight.y },
                    { x: positions.dataRight.x + tokenMetrics.width/2, y:positions.dataRight.y }
                ];
                break;
            case 5:
                points = [
                    { x: positions.dataRight.x, y: positions.dataRight.y - tokenMetrics.height/2 },
                    { x: positions.dataRight.x, y: positions.dataRight.y - radius/4 },
                    { x: positions.notary.x, y: positions.notary.y - radius/4 },
                    { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 }
                ];
                break;
            case 6:
                points = [
                    { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 },
                    { x: positions.notary.x, y: positions.notary.y + radius/3 },
                    { x: positions.dataLeft.x, y: positions.dataLeft.y + radius/3 },
                    { x: positions.dataLeft.x, y: positions.dataLeft.y + tokenMetrics.height/2 }
                ];
                break;
            case 7:
                points = [
                    { x: positions.dataLeft.x - tokenMetrics.width/2 , y: positions.dataLeft.y },
                    { x: chain1X + creditMetrics.width/2 , y: positions.dataLeft.y }
                ];
                break;
            default:
                points = [
                    { x: positions.dataLeft.x, y: positions.dataLeft.y },
                    { x: positions.dataLeft.x, y: positions.dataLeft.y }
                ];
        }
        return points;
    }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
    const centerY = canvas.height / 2.2;
    // 원의 크기를 캔버스 높이의 40%로 유지
    const radius = canvas.height * 0.4;
    // 원 사이 간격을 지름 하나만큼으로 조정
    const chain1X = canvas.width/2 - radius * 2;
    const chain2X = canvas.width/2 + radius * 2;
        
            drawCircle(chain1X, centerY, radius);
            drawCircle(chain2X, centerY, radius);
        
    // 체인 포인트와 라인 그리기
    activeLines.forEach(line => {
        drawLine(line);
    });

    // 왼쪽 원의 체인 포인트
    chainPoints1.forEach(point => {
        const pos = calculatePointPosition(point, chain1X, centerY, radius);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        
        const textRadius = radius + 15;
        const textPos = calculatePointPosition(point, chain1X, centerY, textRadius);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.font = '11px Times New Roman';
        ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
    });

    // 오른쪽 원의 체인 포인트
    chainPoints2.forEach(point => {
        const pos = calculatePointPosition(point, chain2X, centerY, radius);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        
        const textRadius = radius + 15;
        const textPos = calculatePointPosition(point, chain2X, centerY, textRadius);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.font = '11px Times New Roman';
        ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
    });
            // 타이틀과 내부 텍스트
            drawText("Carbon Offset Chain", chain1X, centerY - radius + radius/2, false, true);
            drawText("Carbon Credit", chain1X, centerY );
        
            drawText("Net-Zero Chain", chain2X, centerY - radius + radius/2, false, true);
            drawText("Carbon Credit", chain2X, centerY, true, false);
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Bridge", (chain1X + chain2X) / 2,  centerY - radius + radius/2, true);
            drawText("Notary Bridge", (chain1X + chain2X) / 2, centerY);
            drawText("TOKEN", chain1X + radius, centerY);
            drawText("TOKEN", chain2X - radius, centerY);
        
        // 각 이동 선의 중앙점 계산
    const path1 = calculateAnimationPath(1);
    const path2 = calculateAnimationPath(2);
    
    // 점선 그리기 부분을 다음과 같이 수정
// data to notary 이동선의 중앙점 (첫 번째 점선의 x 위치)
const midPoint1X = (path1[1].x + path1[2].x) / 2;
const midPoint1Y = path1[2].y;

// notary to data 이동선의 중앙점 (두 번째 점선의 x 위치)
const midPoint2X = (path2[1].x + path2[2].x) / 2;
const midPoint2Y = path2[2].y;

    // Notarized Multi-Signature Oracle 텍스트 높이 계산
    const multiSignatureMetrics = getTextDimensions("Notarized Multi-Signature Oracle", true);
    const multiSignatureY = centerY - radius + radius/2;
    const textBottomY = multiSignatureY + multiSignatureMetrics.height/2;

    // 점선 그리기
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(50,50,50,1)';
    ctx.setLineDash([5, 5]);
    
    // 첫 번째 점선
    ctx.moveTo(midPoint1X, textBottomY);
    ctx.lineTo(midPoint1X, midPoint1Y);
    
    // 두 번째 점선
    ctx.moveTo(midPoint2X, textBottomY);
    ctx.lineTo(midPoint2X, midPoint2Y);
    
    ctx.stroke();
    ctx.setLineDash([]);
        
        const paths = [
            calculateAnimationPath(0),
            calculateAnimationPath(1),
            calculateAnimationPath(2),
            calculateAnimationPath(3),
            calculateAnimationPath(4),
            calculateAnimationPath(5),
            calculateAnimationPath(6),
            calculateAnimationPath(7)
        ];
        
        // 선 먼저 그리기
       paths.forEach(path => {
        if (path && path.length > 0) {
            drawArrow(path);
        }
    });

    // 이동 점 그리기
    if (movePoint.init) {
        drawDataPoint(movePoint.x, movePoint.y);
    }
    }
    function animate() {
        const currentTime = performance.now();
        const currentPath = calculateAnimationPath(currentStep);
        
        if (!movePoint.init) {
            movePoint = {
                x: currentPath[0].x,
                y: currentPath[0].y,
                init: true
            };
        }
    
        const target = currentPath[segmentIndex + 1];
        
        if (target) {
            const dx = target.x - movePoint.x;
            const dy = target.y - movePoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= MOVE_SPEED) {
                segmentIndex++;
                if (segmentIndex >= currentPath.length - 1) {
                    segmentIndex = 0;
                    currentStep = (currentStep + 1) % steps;
                    movePoint.init = false;
                }
            } else {
                const ratio = MOVE_SPEED / distance;
                movePoint.x += dx * ratio;
                movePoint.y += dy * ratio;
            }
        }
 
        if (movePoint.init) {
            updateAnimationState(movePoint, currentStep);
        }
        
        draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    initializeChainPoints();
    resizeCanvas();
    animate();

}




initializeCanvas1('canvas1');
initializeCanvas2('canvas2');
initializeCanvas3('canvas3');
