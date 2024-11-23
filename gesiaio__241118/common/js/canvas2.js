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
        duration: 1200,    // 더 빠른 선 애니메이션
        interval: 1000,   // 더 빠른 생성 간격
        lastCreateTime: 0
    };

    let dashedLines = {
        line1: false,
        line2: false
    };
    let shouldClearDashedLines = false;

    function resetAnimation() {
        // Reset animation state
        currentStep = 0;
        segmentIndex = 0;
        movePoint.init = false;
        
        // Reset dashed lines state
        dashedLines.line1 = false;
        dashedLines.line2 = false;
        shouldClearDashedLines = false;
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

    // 랜덤 점 선택 및 선 생성 테스트 함수
    // function testRandomLines() {
    //     const centerY = canvas.height / 2;
    //     const radius = canvas.height * 0.45;
    //     const circle2X = canvas.width/2 + radius * 2;

    //     // 랜덤하게 점 선택
    //     currentSource = chainPoints[Math.floor(Math.random() * chainPoints.length)];
    //     console.log("Selected point:", currentSource.number);

    //     // 선택된 점에서 다른 모든 점으로 선 생성
    //     const newLines = createLines(currentSource, circle2X, centerY, radius);
        
    //     // 이전 선들 제거하고 새로운 선들로 교체
    //     activeLines = newLines;
    //     lineAnimationState.lastCreateTime = performance.now();
    // }

    // // 1초마다 테스트 실행
    // setInterval(testRandomLines, 1000);
    // 선 생성 함수 단순화
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
                duration: lineAnimationState.duration,
                maxLength: 1  // 선의 최대 길이를 15%로 증가
            });
        }
    });
    
    return lines;
}

    // updateLines 함수 단순화
function updateLines(currentTime) {
    activeLines = activeLines.filter(line => {
        const elapsed = currentTime - line.startTime;
        const duration = line.duration;
        
        // 진행도 업데이트
        line.progress = Math.min(elapsed / duration, 1);
        
        // 선이 최대 길이에 도달한 후 페이드 아웃 시작 시점 조정
        if (line.progress >= line.maxLength) {
            // 페이드 아웃 구간을 더 길게 조정
            const fadeOutStart = line.maxLength;
            const fadeOutDuration = 0.3; // 전체 진행도의 30%를 페이드 아웃에 사용
            const fadeProgress = (line.progress - fadeOutStart) / fadeOutDuration;
            line.opacity = Math.max(0, 1 - fadeProgress);
        }
        
        return line.opacity > 0;
    });
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

let recentVisitedPositions = [];
const RECENT_VISITED_DURATION = 500; // 1초 동안 기억

// updateAnimationState 함수 수정
function updateAnimationState(movePoint) {
    const centerY = canvas.height / 2;
    const radius = canvas.height * 0.45;
    const circle2X = canvas.width/2 + radius * 2;

    // DATA 텍스트 크기 계산
    const dataMetrics = getTextDimensions("DATA", true);
    const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator");
    const tokenMetrics = getTextDimensions("TOKEN", true);
    // 각 위치 정밀하게 계산
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

    // 위치 체크 여유 범위
    const threshold = 10;
    const currentTime = performance.now();

    // 각 위치와의 거리 계산
    const distances = {
        data: Math.hypot(movePoint.x - positions.data.x, movePoint.y - positions.data.y),
        calculator: Math.hypot(movePoint.x - positions.calculator.x, movePoint.y - positions.calculator.y),
        token: Math.hypot(movePoint.x - positions.token.x, movePoint.y - positions.token.y)
    };


    // DATA 위치 체크
    if (distances.data < threshold) {
        createLinesAtPosition(circle2X, centerY, radius, 'N5', currentTime);
    }
    // Calculator 위치 체크
    else if (distances.calculator < threshold) {
        createLinesAtPosition(circle2X, centerY, radius, 'random', currentTime);
    }
    // Token 위치 체크
    else if (distances.token < threshold) {
        createLinesAtPosition(circle2X, centerY, radius, 'random', currentTime);
    }
    // 중간 지점에서는 선 제거
    else {
        currentSource = null;
        lastAnimationStep = null;
        activeLines = activeLines.filter(line => line.startTime + line.duration > currentTime);

        // 최근 방문 기록 정리
        recentVisitedPositions = recentVisitedPositions.filter(pos => currentTime - pos.time < RECENT_VISITED_DURATION);
    }

    // 선 애니메이션 업데이트
    updateLines(currentTime);
}


function createLinesAtPosition(x, y, radius, sourceType, currentTime) {
    // 최근 방문 기록 체크
    const visitedKey = `${x.toFixed(2)}-${y.toFixed(2)}`;
    const recentlyVisited = recentVisitedPositions.some(pos => pos.key === visitedKey && currentTime - pos.time < 100); // 0.5초 이내
    if (recentlyVisited) return;

    if (sourceType === 'N5') {
        currentSource = chainPoints.find(p => p.number === 5);
    } else {
        currentSource = chainPoints[Math.floor(Math.random() * chainPoints.length)];
    }
    const newLines = createLines(currentSource, x, y, radius, currentTime);
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
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

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
            
            // Special styling for "Notarized Multi-Signature Oracle"
            if (text === "Notarized Multi-Signature Oracle") {
                if (dashedLines.line1 && !dashedLines.line2) {
                    // Only line1 is true: special border color
                    textColor = '#333';
                    borderColor = '#333';
                } else if (dashedLines.line1 && dashedLines.line2) {
                    // Both lines are true: special background and white text
                    textColor = '#333';
                    borderColor = '#333';
                }else {
                     textColor = 'rgba(50,50,50,0)';
                     backgroundColor = 'rgba(255,255,255,0)';
                    borderColor = 'rgba(50,50,50,0)';
                }
            }
            
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
                // const textRadius = radius + 15;
                // const textPos = calculatePointPosition(point, circle2X, centerY, textRadius);
                // ctx.fillStyle = 'rgba(50,50,50,1)';
                // ctx.font = '11px Times New Roman';
                // ctx.fillText(`N${point.number}`, textPos.x, textPos.y);
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
                updateAnimationState(movePoint);
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
                        // Reset everything for the next cycle
                        currentStep = 0;
                        setTimeout(function(){
                            dashedLines.line1 = false;
                            dashedLines.line2 = false;
                            shouldClearDashedLines = false;
                        }, 150);
                    }
                    
                    // Reset segment and movement for next path
                    segmentIndex = 0;
                    movePoint.init = false;
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
        updateAnimationState(movePoint);
    }
    
    // 캔버스 다시 그리기
    draw();
    
    requestAnimationFrame(animate);
}
    initializeChainPoints();
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
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

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
         
            // 실시간 텍스트 크기 계산
            const font = `normal 30px "Times New Roman"`;
            const dataMetrics = getTextDimensions("DATA", true);
            const notaryMetrics = getTextDimensions("Notary Oracle", true);
            const calculatorMetrics = getMultilineTextDimensions("Carbon Emission\nCalculator");
            const tokenMetrics = getTextDimensions("TOKEN", true);
         
            // 텍스트 위치 계산
            const positions = {
                dataLeft: { x: circle2X - radius, y: centerY }, // 오른쪽 원의 DATA
                dataRight: { x: circle1X + radius, y: centerY }, // 왼쪽 원의 DATA  
                notary: { x: (circle1X + circle2X) / 2, y: centerY }, // 중앙 Notary
                calculator: { x: circle1X, y: centerY }, // 왼쪽 원의 Calculator
                token: { x: circle1X, y: centerY + 100 } // 왼쪽 원의 TOKEN
            };
         
            switch(step) {
                case 0: // 오른쪽 DATA에서 Notary로
                    return {
                        points: [
                            { x: positions.dataLeft.x, y: positions.dataLeft.y - dataMetrics.height/2 },
                            { x: positions.dataLeft.x, y: positions.dataLeft.y - radius/4 },
                            { x: positions.notary.x, y: positions.notary.y - radius/4 },
                            { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 }
                        ]
                    };
                case 1: // Notary에서 왼쪽 DATA로
                    return {
                        points: [
                            { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 },
                            { x: positions.notary.x, y: positions.notary.y + radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y + radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y + dataMetrics.height/2 }
                        ]
                    };
                case 2: // Calculator에서 TOKEN으로
                    return {
                        points: [
                            { x: positions.calculator.x, y: positions.calculator.y + calculatorMetrics.height/2 },
                            { x: positions.token.x, y: positions.token.y }
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
        
            drawCircle(circle1X, centerY, radius);
            drawCircle(circle2X, centerY, radius);
        
            // 타이틀과 내부 텍스트
            drawText("External Channel", circle2X, centerY - radius + radius/2, false, true);
            drawText("Carbon Absorption", circle2X, centerY - 30);
            drawText("Carbon Reduction", circle2X, centerY + 30);
        
            drawText("Carbon Offset Chain", circle1X, centerY - radius + radius/2, false, true);
            drawText("Carbon Credits\nRegistry", circle1X, centerY, true, false);
            drawText("TOKEN", circle1X, centerY + 120);
        
            // 중앙 텍스트들
            drawText("Notarized Multi-Signature Oracle", (circle1X + circle2X) / 2,  centerY - radius + radius/2, true);
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
            calculateAnimationPath(2)
        ];
        
        // 선 먼저 그리기
        paths.forEach(path => {
            drawArrow(path.points);
        });

    // 이동 점 그리기
    if (movePoint.init) {
        drawDataPoint(movePoint.x, movePoint.y);
    }
    }
    function animate() {
        const currentPath = calculateAnimationPath(currentStep).points;
        
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
        
        draw();
        requestAnimationFrame(animate);
    }

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
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

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
    
        function calculateAnimationPath(step) {
            const centerY = canvas.height / 2;
            const radius = canvas.height * 0.45;
            const circle1X = canvas.width/2 - radius * 2;
            const circle2X = canvas.width/2 + radius * 2;
        
            // 실시간 텍스트 크기 계산
            const font = `normal 30px "Times New Roman"`;
            const creditMetrics = getTextDimensions("Carbon Credit", true);
            const notaryMetrics = getTextDimensions("Notary Bridge", true);
            const tokenMetrics = getTextDimensions("TOKEN", true);


            // 텍스트 위치 계산
            const positions = {
                dataLeft: { x: circle1X + radius, y: centerY },
                dataRight: { x: circle2X - radius, y: centerY },
                notary: { x: (circle1X + circle2X) / 2, y: centerY },
                token: { x: circle2X, y: centerY + 100 }
            };
        
            switch(step) {
                case 0:
                    return {
                        points: [
                            { x: circle1X + creditMetrics.width/2 , y: positions.dataLeft.y },
                            { x: positions.dataLeft.x - tokenMetrics.width/2 , y: positions.dataLeft.y }
                        ]
                    };
                case 1:
                    return {
                        points: [
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + tokenMetrics.height/2 },
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + radius/3 },
                            { x: positions.notary.x, y: positions.notary.y + radius/3 },
                            { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 }
                        ]
                    };
                case 2:
                    return {
                        points: [
                            { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 },
                            { x: positions.notary.x, y: positions.notary.y - radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y - radius/4 },
                            { x: positions.dataRight.x, y: positions.dataRight.y - tokenMetrics.height/2 }
                        ]
                    };
                case 3:
                    return {
                        points: [
                            { x: positions.dataRight.x + tokenMetrics.width/2, y:positions.dataRight.y },
                            { x: positions.token.x - creditMetrics.width/2, y: positions.dataRight.y }
                        ]
                    };
                case 4:
                    return {
                        points: [
                            { x: positions.token.x - creditMetrics.width/2, y: positions.dataRight.y },
                            { x: positions.dataRight.x + tokenMetrics.width/2, y:positions.dataRight.y }
                        ]
                    };
                case 5:
                    return {
                        points: [
                            { x: positions.dataRight.x, y: positions.dataRight.y - tokenMetrics.height/2 },
                            { x: positions.dataRight.x, y: positions.dataRight.y - radius/4 },
                            { x: positions.notary.x, y: positions.notary.y - radius/4 },
                            { x: positions.notary.x, y: positions.notary.y - notaryMetrics.height/2 },
                        ]
                    };
                    
                case 6:
                    return {
                        points: [
                            { x: positions.notary.x, y: positions.notary.y + notaryMetrics.height/2 },
                            { x: positions.notary.x, y: positions.notary.y + radius/3 },
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + radius/3 },
                            { x: positions.dataLeft.x, y: positions.dataLeft.y + tokenMetrics.height/2 }
                        ]
                    };

                case 7:
                    return {
                        points: [
                            { x: positions.dataLeft.x - tokenMetrics.width/2 , y: positions.dataLeft.y },
                            { x: circle1X + creditMetrics.width/2 , y: positions.dataLeft.y }
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
        
            drawCircle(circle1X, centerY, radius);
            drawCircle(circle2X, centerY, radius);
        
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
            drawArrow(path.points);
        });

    // 이동 점 그리기
    if (movePoint.init) {
        drawDataPoint(movePoint.x, movePoint.y);
    }
    }
    function animate() {
        const currentPath = calculateAnimationPath(currentStep).points;
        
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
        
        draw();
        requestAnimationFrame(animate);
    }

    animate();

}




initializeCanvas1('canvas1');
initializeCanvas2('canvas2');
initializeCanvas3('canvas3');
