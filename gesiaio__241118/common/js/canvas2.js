function initializeCanvas1(canvasId){

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let animationPoints = [];
    let currentStep = 0;
    let segmentIndex = 0;
    let currentX = 0;
    let currentY = 0;

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
    let lastAnimationStep = null;

    // 선 애니메이션을 위한 상태
    const lineAnimationState = {
        duration: 1500,    // 더 빠른 선 애니메이션
        interval: 0,   // 더 빠른 생성 간격
        lastCreateTime: 0
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
    const centerY = canvas.height / 2;
    const radius = canvas.height * 0.45;
    const circle2X = canvas.width/2 + radius * 2;

    const dataMetrics = getTextDimensions("DATA", true);
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator");
    const tokenMetrics = getTextDimensions("TOKEN", true);
    
    const positions = {
        data: {
            x: circle2X - radius,
            y: centerY - dataMetrics.height/2
        },
        calculator: {
            x: circle2X - calculatorMetrics.width/2,
            y: centerY
        },
        token: {
            x: circle2X,
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
    if (step === 0) {
        // console.log('Step 0: Resetting all states');
        activeLines = [];
        pendingLineCreations = [];
        recentVisitedPositions = [];
        currentSource = null;
        lastAnimationStep = null;
    }
    if (step !== 4) {
        // 새로운 선 생성 예약
        // DATA 위치 (첫 번째 점)에서는 즉시 생성하고 기록하지 않음
        if (distances.data < threshold && activeLines.length === 0) {
            // console.log('Creating first N5 line');
            createLinesAtPosition(circle2X, centerY, radius, 'N5', currentTime);
        }
        // Calculator와 Token 위치는 대기열에 기록
        else if (distances.calculator < threshold) {
            if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
                // console.log('Recording Calculator point for later');
                pendingLineCreations.push({
                    position: { x: circle2X, y: centerY, radius: radius },
                    type: 'random'
                });
            }
        }
        else if (distances.token < threshold) {
            if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
                // console.log('Recording Token point for later');
                pendingLineCreations.push({
                    position: { x: circle2X, y: centerY, radius: radius },
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
function createLines(sourcePoint, circle2X, centerY, radius, currentTime) {
    const lines = [];
    
    const startPos = calculatePointPosition(sourcePoint, circle2X, centerY, radius);
    
    chainPoints.forEach(targetPoint => {
        if (targetPoint.number !== sourcePoint.number) {
            const endPos = calculatePointPosition(targetPoint, circle2X, centerY, radius);
            
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

        
    function drawText(text, x, y, hasBox = true, isBold = false) {
        const lines = text.split('\n');
        ctx.font = `${isBold ? 'bold' : 'normal'} 30px "Times New Roman"`;
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
            const height = 45 + (lines.length - 1) * 35;
            const radius = 45 / 2;
            
            // Determine background and border colors based on dashed line states
            let backgroundColor = 'rgba(255,255,255,1)';
            let borderColor = 'rgba(50,50,50,1)';
            let textColor = 'rgba(50,50,50,1)';
            
            ctx.fillStyle = backgroundColor;
            ctx.beginPath();
            ctx.roundRect(x - width/2, y - height/2, width, height, radius);
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw text with appropriate color
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 35;
                ctx.fillStyle = textColor;
                ctx.fillText(line, x, lineY);
            });
        } else {
            // Non-box text remains unchanged
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 35;
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fillText(line, x, lineY);
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
            ctx.font = `normal 30px "Times New Roman"`;
            const metrics = ctx.measureText(text);
            
            // 텍스트 기본 크기
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            
            if (hasBox) {
                const padding = { x: 12, y: 6 };
                return {
                    width: textWidth + (padding.x * 2.2),
                    height: Math.max(45, textHeight + (padding.y * 2)) // 최소 높이 45px
                };
            }
            
            return {
                width: textWidth,
                height: textHeight
            };
        }
        function getMultilineTextDimensions(text) {
            const lines = text.split('\n');
            const lineHeight = 35;
            let maxWidth = 0;
            
            lines.forEach(line => {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                
                const padding = { x: 12, y: 6 };
                const width = textWidth + (padding.x * 2.2);
                const height = Math.max(45, textHeight + (padding.y * 2));
                
                maxWidth = Math.max(maxWidth, width);
            });
            
            return {
                width: maxWidth,
                height: lines.length * lineHeight + 12 // 여백 포함
            };
        }
    
        function calculateAnimationPath(step) {
            const centerY = canvas.height / 2;
            const radius = canvas.height * 0.45;
            const circle1X = canvas.width/2 - radius * 2;
            const circle2X = canvas.width/2 + radius * 2;

            const dataMetrics = getTextDimensions("DATA", true);
            const notaryMetrics = getTextDimensions("Notary Oracle", true);
            const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator");

            // 정확한 위치 계산을 위해 수정
            const positions = {
                dataLeft: { x: circle1X + radius, y: centerY },
                dataRight: { x: circle2X - radius, y: centerY },
                notary: { x: (circle1X + circle2X) / 2, y: centerY },
                calculator: { x: circle2X, y: centerY },
                token: { x: circle2X, y: centerY + 120 }
            };
                
            switch(step) {
                case 0:
                    return {
                        points: [
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + dataMetrics.height/2 },
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + radius/3 },
                            { x: positions.notary.x, y: positions.notary.y + radius/3 },
                            { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 }
                        ]
                    };
                case 1:
                    return {
                        points: [
                            { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 },
                            { x: positions.notary.x, y: positions.notary.y - radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y - radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y- dataMetrics.height/2 }
                        ]
                    };
                case 2:
                    return {
                        points: [
                            { x: positions.dataRight.x + dataMetrics.width/2, y: positions.dataRight.y },
                            { x: positions.calculator.x - calculatorMetrics.width/2, y: positions.calculator.y }
                        ]
                    };
                case 3:
                    return {
                        points: [
                            { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                            { x: positions.token.x, y: positions.token.y - dataMetrics.height/2 }
                        ]
                    };
                case 4:
                    return {
                        points: [
                            { x: positions.token.x, y: positions.token.y - dataMetrics.height/2 },
                            { x: positions.token.x, y: positions.token.y + dataMetrics.height/2 }
                        ]
                    };
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerY = canvas.height / 2;
            // 원의 크기를 캔버스 높이의 45%로 유지
            const radius = canvas.height * 0.45;
            // 원 사이 간격을 지름 하나만큼으로 조정
            const circle1X = canvas.width/2 - radius * 2;
            const circle2X = canvas.width/2 + radius * 2;
            
            // 기본 원 그리기
            drawCircle(circle1X, centerY, radius);
            drawCircle(circle2X, centerY, radius);
        
            // 활성화된 선 그리기
            activeLines.forEach(line => {
                drawLine(line);
            });
        
            // Chain 원의 점들 그리기
            chainPoints.forEach(point => {
                const pos = calculatePointPosition(point, circle2X, centerY, radius);
                
                // 점 그리기
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.fill();
                
                // 점 번호 그리기
                const textRadius = radius + 15;
                const textPos = calculatePointPosition(point, circle2X, centerY, textRadius);
                ctx.fillStyle = 'rgba(50,50,50,1)';
                ctx.font = '11px Times New Roman';
                ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
            });
        
            // 타이틀과 내부 텍스트
            drawText("External Channel", circle1X, centerY - radius + radius/2, false, true);
            drawText("Electricity Usage", circle1X, centerY - 30);
            drawText("Gas Usage", circle1X, centerY + 30);
            drawText("...", circle1X, centerY + 90, false, true);
        
            drawText("Carbon Emission Chain", circle2X, centerY - radius + radius/2, false, true);
            drawText("Carbon Emission\nCalculator", circle2X, centerY, true, false);
            drawText("TOKEN", circle2X, centerY + 120);
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Oracle", (circle1X + circle2X) / 2, centerY - radius + radius/2, true);
            drawText("Notary Oracle", (circle1X + circle2X) / 2, centerY);
            drawText("DATA", circle1X + radius, centerY);
            drawText("DATA", circle2X - radius, centerY);
        
            // 각 이동 선의 중앙점 계산
            const path1 = calculateAnimationPath(0);
            const path2 = calculateAnimationPath(1);
            
            // data to notary 이동선의 중앙점 (첫 번째 점선의 x 위치)
            const midPoint1X = (path1.points[1].x + path1.points[2].x) / 2;
            const midPoint1Y = path1.points[2].y;
            
            // notary to data 이동선의 중앙점 (두 번째 점선의 x 위치)
            const midPoint2X = (path2.points[1].x + path2.points[2].x) / 2;
            const midPoint2Y = path2.points[1].y;
        
            // Notarized Multi-Signature Oracle 텍스트 높이 계산
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
                // ctx.setLineDash([]);
            }
        
            // 모든 경로 화살표 그리기
            const paths = [
                calculateAnimationPath(0),
                calculateAnimationPath(1),
                calculateAnimationPath(2),
                calculateAnimationPath(3)
            ];
            
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
        
        if (distance <= MOVE_SPEED) {
            segmentIndex++;
            if (segmentIndex >= currentPath.length - 1) {
                // Handle path completion
                if (currentStep === 0) {
                    dashedLines.line1 = true;
                    currentStep = 1;
                } else if (currentStep === 1) {
                    dashedLines.line2 = true;
                    currentStep = 2;
                } else if (currentStep === 2) {
                    dashedLines.line1 = true;
                    dashedLines.line2 = true;
                    currentStep = 3;
                } else if (currentStep === 3) {
                    // Reset everything for the next cycle after 4.5s delay
                    setTimeout(function() {
                        currentStep = 0;
                        dashedLines.line1 = false;
                        dashedLines.line2 = false;
                        shouldClearDashedLines = false;
                        movePoint.init = false;
                        segmentIndex = 0;
                    }, 4000); // 4.5초 지연
                    
                    // Prevent further animation during the delay
                    currentStep = 4; // 임시 상태로 설정하여 대기 중임을 표시
                }
                
                // Reset segment and movement for next path only if not in waiting state
                if (currentStep !== 4) {
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
    // 선 애니메이션 업데이트
    updateLines(currentTime);
    
    // 위치 체크 및 상태 업데이트
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











function initializeCanvas2(canvasId){
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let animationPoints = [];
    let currentStep = 0;
    let segmentIndex = 0;
    let currentX = 0;
    let currentY = 0;
    
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
    let lastAnimationStep = null;

    // 선 애니메이션을 위한 상태
    const lineAnimationState = {
        duration: 1500,    // 더 빠른 선 애니메이션
        interval: 0,   // 더 빠른 생성 간격
        lastCreateTime: 0
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
    function createLines(sourcePoint, circle1X, centerY, radius, currentTime) {
        const lines = [];
        const startPos = calculatePointPosition(sourcePoint, circle1X, centerY, radius);
        
        chainPoints.forEach(targetPoint => {
            if (targetPoint.number !== sourcePoint.number) {
                const endPos = calculatePointPosition(targetPoint, circle1X, centerY, radius);
                
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
        const centerY = canvas.height / 2;
        const radius = canvas.height * 0.45;
        const circle1X = canvas.width/2 - radius * 2;

        const dataMetrics = getTextDimensions("DATA", true);
        const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry");
        const tokenMetrics = getTextDimensions("TOKEN", true);
        
        const positions = {
            data: {
                x: circle1X + radius,
                y: centerY + dataMetrics.height/2
            },
            calculator: {
                x: circle1X,
                y: centerY + calculatorMetrics.height/2
            },
            token: {
                x: circle1X,
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
                createLinesAtPosition(circle1X, centerY, radius, 'N13', currentTime);
            }
            // Calculator와 Token 위치는 대기열에 기록
            else if (distances.calculator < threshold) {
                if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY)) {
                    pendingLineCreations.push({
                        position: { x: circle1X, y: centerY, radius: radius },
                        type: 'random'
                    });
                }
            }
            else if (distances.token < threshold) {
                if (!pendingLineCreations.some(p => p.type === 'random' && p.position.y === centerY + 120)) {
                    pendingLineCreations.push({
                        position: { x: circle1X, y: centerY, radius: radius },
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
            ctx.font = `${isBold ? 'bold' : 'normal'} 30px "Times New Roman"`;
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
                const height = 45 + (lines.length - 1) * 35;
                const radius = 45 / 2;
                
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 35;
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
            ctx.font = `normal 30px "Times New Roman"`;
            const metrics = ctx.measureText(text);
            
            // 텍스트 기본 크기
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            
            if (hasBox) {
                const padding = { x: 12, y: 6 };
                return {
                    width: textWidth + (padding.x * 2.2),
                    height: Math.max(45, textHeight + (padding.y * 2)) // 최소 높이 45px
                };
            }
            
            return {
                width: textWidth,
                height: textHeight
            };
        }
        function getMultilineTextDimensions(text) {
            const lines = text.split('\n');
            const lineHeight = 35;
            let maxWidth = 0;
            
            lines.forEach(line => {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                
                const padding = { x: 12, y: 6 };
                const width = textWidth + (padding.x * 2.2);
                const height = Math.max(45, textHeight + (padding.y * 2));
                
                maxWidth = Math.max(maxWidth, width);
            });
            
            return {
                width: maxWidth,
                height: lines.length * lineHeight + 12 // 여백 포함
            };
        }
        function calculateAnimationPath(step) {
            const centerY = canvas.height / 2;
            const radius = canvas.height * 0.45;
            const circle1X = canvas.width/2 - radius * 2;
            const circle2X = canvas.width/2 + radius * 2;
        
            const dataMetrics = getTextDimensions("DATA", true);
            const notaryMetrics = getTextDimensions("Notary Oracle", true);
            const calculatorMetrics = getMultilineTextDimensions("Carbon Credits\nRegistry");
            const tokenMetrics = getTextDimensions("TOKEN", true);
        
            const positions = {
                dataLeft: { x: circle2X - radius, y: centerY },
                dataRight: { x: circle1X + radius, y: centerY },
                notary: { x: (circle1X + circle2X) / 2, y: centerY },
                calculator: { x: circle1X, y: centerY },
                token: { x: circle1X, y: centerY + 120 }
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
        
        const centerY = canvas.height / 2;
        const radius = canvas.height * 0.45;
        const circle1X = canvas.width/2 - radius * 2;
        const circle2X = canvas.width/2 + radius * 2;
    
        drawCircle(circle1X, centerY, radius);
        drawCircle(circle2X, centerY, radius);
    
        // 체인 포인트와 라인 그리기
        activeLines.forEach(line => {
            drawLine(line);
        });
    
        chainPoints.forEach(point => {
            const pos = calculatePointPosition(point, circle1X, centerY, radius);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.fill();
            
            const textRadius = radius + 15;
            const textPos = calculatePointPosition(point, circle1X, centerY, textRadius);
            ctx.fillStyle = 'rgba(50,50,50,1)';
            ctx.font = '11px Times New Roman';
            ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
        });
    
        // 타이틀과 내부 텍스트
        drawText("External Channel", circle2X, centerY - radius + radius/2, false, true);
        drawText("Carbon Absorption", circle2X, centerY - 30);
        drawText("Carbon Reduction", circle2X, centerY + 30);
    
        drawText("Carbon Offset Chain", circle1X, centerY - radius + radius/2, false, true);
        drawText("Carbon Credits\nRegistry", circle1X, centerY, true, false);
        drawText("TOKEN", circle1X, centerY + 120);
    
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
    
        drawText("Notarized Multi-Signature Oracle", (circle1X + circle2X) / 2, centerY - radius + radius/2, true);
        drawText("Notary Oracle", (circle1X + circle2X) / 2, centerY);
        drawText("DATA", circle1X + radius, centerY);
        drawText("DATA", circle2X - radius, centerY);
    
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

    let animationPoints = [];
    let currentStep = 0;
    let segmentIndex = 0;
    let currentX = 0;
    let currentY = 0;

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
        lastCreateTime: 0
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
            ctx.font = `${isBold ? 'bold' : 'normal'} 30px "Times New Roman"`;
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
                const height = 45 + (lines.length - 1) * 35;
                const radius = 45 / 2;
                
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.roundRect(x - width/2, y - height/2, width, height, radius);
                ctx.fill();
                ctx.strokeStyle = 'rgba(50,50,50,1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            lines.forEach((line, i) => {
                const lineY = y + (i - (lines.length-1)/2) * 35;
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
            ctx.font = `normal 30px "Times New Roman"`;
            const metrics = ctx.measureText(text);
            
            // 텍스트 기본 크기
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            
            if (hasBox) {
                const padding = { x: 12, y: 6 };
                return {
                    width: textWidth + (padding.x * 2.2),
                    height: Math.max(45, textHeight + (padding.y * 2)) // 최소 높이 45px
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
        const centerY = canvas.height / 2;
        const radius = canvas.height * 0.45;
        const circle1X = canvas.width/2 - radius * 2;
        const circle2X = canvas.width/2 + radius * 2;

        const tokenMetrics = getTextDimensions("TOKEN", true);
        const creditMetrics = getTextDimensions("Carbon Credit", true);
        
        const positions = {
            leftToken: {
                x: circle1X + radius,
                y: centerY + tokenMetrics.height/2
            },
            rightToken: {
                x: circle2X - radius,
                y: centerY - tokenMetrics.height/2
            },
            leftCredit: {
                x: circle1X + creditMetrics.width/2,
                y: centerY
            },
            rightCredit: {
                x: circle2X - creditMetrics.width/2,
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
                        position: { x: circle1X, y: centerY, radius: radius },
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
                    position: { x: circle1X, y: centerY, radius: radius },
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
                    position: { x: circle2X, y: centerY, radius: radius },
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
                    position: { x: circle2X, y: centerY, radius: radius },
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
        const centerY = canvas.height / 2;
        const radius = canvas.height * 0.45;
        const circle1X = canvas.width/2 - radius * 2;
        const circle2X = canvas.width/2 + radius * 2;
    
        const creditMetrics = getTextDimensions("Carbon Credit", true);
        const notaryMetrics = getTextDimensions("Notary Bridge", true);
        const tokenMetrics = getTextDimensions("TOKEN", true);

        const positions = {
            dataLeft: { x: circle1X + radius, y: centerY },
            dataRight: { x: circle2X - radius, y: centerY },
            notary: { x: (circle1X + circle2X) / 2, y: centerY },
            token: { x: circle2X, y: centerY + 100 }
        };
    
        let points = [];
        switch(step) {
            case 0:
                points = [
                    { x: circle1X + creditMetrics.width/2 , y: positions.dataLeft.y },
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
                    { x: circle1X + creditMetrics.width/2 , y: positions.dataLeft.y }
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
            
    const centerY = canvas.height / 2;
    // 원의 크기를 캔버스 높이의 45%로 유지
    const radius = canvas.height * 0.45;
    // 원 사이 간격을 지름 하나만큼으로 조정
    const circle1X = canvas.width/2 - radius * 2;
    const circle2X = canvas.width/2 + radius * 2;
        
            drawCircle(circle1X, centerY, radius);
            drawCircle(circle2X, centerY, radius);
        
    // 체인 포인트와 라인 그리기
    activeLines.forEach(line => {
        drawLine(line);
    });

    // 왼쪽 원의 체인 포인트
    chainPoints1.forEach(point => {
        const pos = calculatePointPosition(point, circle1X, centerY, radius);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        
        const textRadius = radius + 15;
        const textPos = calculatePointPosition(point, circle1X, centerY, textRadius);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.font = '11px Times New Roman';
        ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
    });

    // 오른쪽 원의 체인 포인트
    chainPoints2.forEach(point => {
        const pos = calculatePointPosition(point, circle2X, centerY, radius);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.fill();
        
        const textRadius = radius + 15;
        const textPos = calculatePointPosition(point, circle2X, centerY, textRadius);
        ctx.fillStyle = 'rgba(50,50,50,1)';
        ctx.font = '11px Times New Roman';
        ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
    });
            // 타이틀과 내부 텍스트
            drawText("Carbon Offset Chain", circle1X, centerY - radius + radius/2, false, true);
            drawText("Carbon Credit", circle1X, centerY );
        
            drawText("Net-Zero Chain", circle2X, centerY - radius + radius/2, false, true);
            drawText("Carbon Credit", circle2X, centerY, true, false);
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Bridge", (circle1X + circle2X) / 2,  centerY - radius + radius/2, true);
            drawText("Notary Bridge", (circle1X + circle2X) / 2, centerY);
            drawText("TOKEN", circle1X + radius, centerY);
            drawText("TOKEN", circle2X - radius, centerY);
        
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
