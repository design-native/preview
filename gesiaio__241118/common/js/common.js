/**
 * 브라우저 창 높이를 체크하고 CSS 변수에 설정하는 함수
 * @returns {void}
 */
function vhCheck(){

    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    
}
window.addEventListener("resize", function () {
    vhCheck()
});



/**
 * 선택된 언어로 페이지의 모든 다국어 텍스트를 변경하는 함수
 * @param {string} target - 변경할 언어('kr' 또는 'en')
 * @returns {void}
 */
let lang1 = ["CAuth", "CAuth"];
let lang2 = ["Carbon Authentication", "탄소 인증"];
let lang3 = ["Carbon Authentication", "탄소 인증"];
let lang4 = ["Transaction Authentication", "거래 인증"];
let lang5 = ["Emission Authentication", "배출 인증"];
let lang6 = ["Offset Authentication", "오프셋 인증"];
let lang7 = ["Platform", "플랫폼"];
let lang8 = ["Carbon Platform", "탄소 플랫폼"];
let lang9 = ["Net-Zero Dashboard", "넷제로 대시보드"];
let lang10 = ["Emission Dashboard", "배출 대시보드"];
let lang11 = ["Offset Dashboard", "오프셋 대시보드"];
let lang12 = ["Explore", "탐색"];
let lang13 = ["Carbon Explore", "탄소 탐색"];
let lang14 = ["Net-Zero Explore", "넷제로 탐색"];
let lang15 = ["Emission Explore", "배출 탐색"];
let lang16 = ["Offset Explore", "오프셋 탐색"];
let lang17 = ["Community", "커뮤니티"];
let lang18 = ["Community", "커뮤니티"];
let lang19 = ["Developer", "개발자"];
let lang20 = ["Github", "깃허브"];
let lang21 = ["News", "뉴스"];
let lang22 = ["Medium", "미디엄"];
let lang23 = ["Instagram", "인스타그램"];
let lang24 = ["Youtube", "유튜브"];
let lang25 = ["Communication", "커뮤니케이션"];
let lang26 = ["Twitter", "트위터"];
let lang27 = ["Telegram", "텔레그램"];
let lang28 = ["<b>Net-Zero Layer 3 Platform</b>", "<b>넷제로 레이어 3 플랫폼</b>"];
let lang29 = ["", ""]; // Empty content
let lang30 = ["", ""]; // Empty content
let lang31 = ["<b>Net-Zero Consensus</b>", "<b>넷제로 합의</b>"];
let lang32 = [
  "The Net-Zero Consensus is a mechanism designed to transparently manage and coordinate carbon emissions, reductions, and carbon credits. <br/>It leverages blockchain technology to reliably verify and record carbon credits (emission rights and offset credits), reduction activities, and the burning process.",
  "넷제로 합의는 탄소 배출, 감축 및 탄소 크레딧을 투명하게 관리하고 조정하기 위해 설계된 메커니즘입니다. <br/>이것은 블록체인 기술을 활용하여 탄소 크레딧(배출권 및 오프셋 크레딧), 감축 활동 및 소각 과정을 신뢰성 있게 검증하고 기록합니다."
];
let lang33 = ["<b>Carbon Credit Burning Consensus</b>", "<b>탄소 크레딧 소각 합의</b>"];
let lang34 = [
  "1. Carbon emission offset and carbon credit burning<br/>2. Carbon emission verification through burn request<br/>3. Thorough verification process via rollup<br/>4. Permanently recorded net-zero status on the blockchain",
  "1. 탄소 배출 상쇄 및 탄소 크레딧 소각<br/>2. 소각 요청을 통한 탄소 배출 검증<br/>3. 롤업을 통한 철저한 검증 과정<br/>4. 블록체인에 영구적으로 기록된 넷제로 상태"
];
let lang35 = ["<b>Carbon Reduction Consensus</b>", "<b>탄소 감축 합의</b>"];
let lang36 = [
  "1. Accurate identification of emission sources<br/>2. Analysis and verification of reduction activities<br/>3. Carbon credit issuance upon achievement of reduction targets",
  "1. 배출원 정확한 식별<br/>2. 감축 활동 분석 및 검증<br/>3. 감축 목표 달성 시 탄소 크레딧 발행"
];
let lang37 = ["<b>Carbon Emission Data Tokenization</b>", "<b>탄소 배출 데이터 토큰화</b>"];
let lang38 = [
  "To tokenize centralized carbon emission data, the Notary Oracle verifies the data and <br/>certifies it through a multi-signature process between the sender and receiver, ensuring the reliability of the external data.",
  "중앙집중식 탄소 배출 데이터를 토큰화하기 위해, 공증자 오라클은 데이터를 검증하고 송신자와 수신자 간의 다중 서명 과정을 통해 이를 인증하여 외부 데이터의 신뢰성을 보장합니다."
];
let lang39 = ["The Notary Oracle tokenizes external carbon emission data using calculators from certified institutions.", "공증자 오라클은 인증된 기관의 계산기를 사용하여 외부 탄소 배출 데이터를 토큰화합니다."];
let lang40 = ["<b>Carbon Offset Data Tokenization</b>", "<b>탄소 오프셋 데이터 토큰화</b>"];
let lang41 = [
  "To tokenize centralized carbon offset data (carbon absorption and carbon reduction), the Notary Oracle verifies the data and certifies it through a multi-signature process between the data sender and receiver, ensuring the reliability of the external data.",
  "중앙집중식 탄소 오프셋 데이터(탄소 흡수 및 탄소 감축)를 토큰화하기 위해, 공증자 오라클은 데이터를 검증하고 데이터 송신자와 수신자 간의 다중 서명 과정을 통해 이를 인증하여 외부 데이터의 신뢰성을 보장합니다."
];
let lang42 = ["The Notary Oracle tokenizes external carbon absorption and reduction data authenticated by certified institutions.", "공증자 오라클은 인증된 기관에 의해 인증된 외부 탄소 흡수 및 감축 데이터를 토큰화합니다."];
let lang43 = ["<b>Net-Zero Consensus Algorithm for Carbon Emission and Offset Tokenization</b>", "<b>탄소 배출 및 오프셋 토큰화를 위한 넷제로 합의 알고리즘</b>"];
let lang44 = [
  "An Integrated Framework for Achieving Net-Zero by Aggregating Carbon Emission and Offset Data and Implementing a Consensus Algorithm for Carbon Credit Burning and Reduction through a Notarized Multi-Signature Process.",
  "공증된 다중 서명 과정을 통해 탄소 배출 및 오프셋 데이터를 집계하고 탄소 크레딧 소각 및 감축을 위한 합의 알고리즘을 구현하여 넷제로를 달성하기 위한 통합 프레임워크."
];
let lang45 = ["Implementing Net Zero by Certifying Carbon Data Tokens through Consensus Algorithms and Multi-Signature Validation", "합의 알고리즘 및 다중 서명 검증을 통해 탄소 데이터 토큰을 인증하여 넷제로 구현"];
let lang46 = ["<b>Carbon Credit Products</b>", "<b>탄소 크레딧 제품</b>"];
let lang47 = ["<b>ExoMad Green's Sustainable<br/>Biochar Project in Bolivia</b>", "<b>ExoMad Green의 지속 가능한<br/>바이오차 프로젝트 (볼리비아)</b>"];
let lang48 = [
  "ExoMad Green's sustainable biochar project creates environmental and social value through a circular economy model. In March 2023, ExoMad Green established its first biochar facility in Concepción, Bolivia. We plan to significantly expand our operations during 2024. These facilities will collectively harness the power of biochar to sequester up to 200,000 tons of CO2 annually.",
  "ExoMad Green의 지속 가능한 바이오차 프로젝트는 순환 경제 모델을 통해 환경적 및 사회적 가치를 창출합니다. 2023년 3월, ExoMad Green은 볼리비아 콘셉시온에 첫 번째 바이오차 시설을 설립했습니다. 2024년 동안 우리의 운영을 크게 확장할 계획입니다. 이 시설들은 바이오차의 힘을 결합하여 연간 최대 200,000톤의 CO2를 격리할 것입니다."
];
let lang49 = ["<b>A Unique and Influential<br/>REDD+ Project Preserving<br/>the Tropical Rainforest</b>", "<b>독특하고 영향력 있는<br/>REDD+ 프로젝트, 열대 우림 보존</b>"];
let lang50 = [
  "In collaboration with Netherlands-based Quadriz B.V., its local affiliate Quadriz Paraguay S.A., and Atenil S.A., a major landowner in Paraguay's Chaco, the project has implemented verified carbon standards along with climate, community, and biodiversity standards (VCS – CCBS) to avoid planned deforestation.",
  "네덜란드 기반 Quadriz B.V., 그 지역 자회사 Quadriz Paraguay S.A., 그리고 파라과이 차코의 주요 토지 소유주인 Atenil S.A.와의 협력을 통해, 이 프로젝트는 기후, 커뮤니티, 생물 다양성 기준(VCS – CCBS)과 함께 검증된 탄소 기준을 구현하여 계획된 삼림 벌채를 방지했습니다."
];
let lang51 = ["<b>Delta Blue Carbon Project</b>", "<b>델타 블루 탄소 프로젝트</b>"];
let lang52 = [
  "The Indus Delta Blue Carbon Project is working to restore one of the world's largest arid climate mangrove forests located within the Sindh Indus Delta region in Thatta and Sujawal areas of Southeastern Sindh province, Pakistan.",
  "인더스 델타 블루 탄소 프로젝트는 파키스탄 동남부 신드 주의 타타와 수자왈 지역에 위치한 세계에서 가장 큰 건조 기후 맹그로브 숲 중 하나를 복원하기 위해 노력하고 있습니다."
];
let lang53 = ["<b>CaaS(Carbon as a Service)</b>", "<b>CaaS(서비스로서의 탄소)</b>"];
let lang54 = ["<b>Verification Agencies</b>", "<b>검증 기관</b>"];
let lang55 = [
  "Verification agencies ensure the accuracy and trustworthiness of carbon credits.<br/> They evaluate the validity of carbon emission reduction activities and verify the quality of the credits.",
  "검증 기관은 탄소 크레딧의 정확성과 신뢰성을 보장합니다.<br/> 그들은 탄소 배출 감소 활동의 유효성을 평가하고 크레딧의 품질을 검증합니다."
];
let lang56 = ["<b>Carbon Credit Exchanges</b>", "<b>탄소 크레딧 거래소</b>"];
let lang57 = [
  "Carbon credit exchanges act as platforms that connect buyers and sellers of carbon credits.<br/>They provide a fair and transparent trading environment and facilitate the distribution of credits.",
  "탄소 크레딧 거래소는 탄소 크레딧의 구매자와 판매자를 연결하는 플랫폼 역할을 합니다.<br/> 그들은 공정하고 투명한 거래 환경을 제공하며 크레딧의 배포를 용이하게 합니다."
];
let lang58 = ["<b>Retiree or Burner</b>", "<b>탄소 크레딧 소각자</b>"];
let lang59 = [
  "Carbon credit retirees are entities, such as companies or organizations, that retire carbon credits to achieve net-zero emissions. <br/>They participate in offsetting carbon emissions by retiring credits.",
  "<b>탄소 크레딧 소각자</b>는 순제로 배출을 달성하기 위해 탄소 크레딧을 소각하는 기업이나 조직과 같은 단체입니다.<br/> 그들은 크레딧을 소각함으로써 탄소 배출을 상쇄하는 데 참여합니다."
];
let lang60 = ["<b>AI as a Service</b>", "<b>AI 서비스</b>"];
let lang61 = [
  "AIaaS automates carbon credit management and decision-making processes while providing predictive data. <br/>This enables market analysis and efficient resource allocation.",
  "AIaaS는 탄소 크레딧 관리 및 의사 결정 프로세스를 자동화하면서 예측 데이터를 제공합니다.<br/> 이는 시장 분석과 효율적인 자원 할당을 가능하게 합니다."
];
let lang62 = ["<b>Explore as a Service</b>", "<b>탐색 서비스</b>"];
let lang63 = [
  "EaaS analyzes and visualizes data to deliver insights and trends in the carbon credit market. <br/>It helps users clearly understand the outcomes of carbon reduction activities.",
  "EaaS는 데이터를 분석하고 시각화하여 탄소 크레딧 시장의 통찰력과 트렌드를 제공합니다.<br/> 이는 사용자가 탄소 감축 활동의 결과를 명확하게 이해하는 데 도움을 줍니다."
];
let lang64 = ["<b>Blockchain as a Service</b>", "<b>블록체인 서비스</b>"];
let lang65 = [
  "BaaS utilizes blockchain technology to securely and transparently record transaction histories. <br/>It ensures data integrity and enhances the security of transactions.",
  "BaaS는 블록체인 기술을 활용하여 거래 내역을 안전하고 투명하게 기록합니다.<br/> 이는 데이터 무결성을 보장하고 거래의 보안을 강화합니다."
];
let lang66 = ["<b>Platform as a Service</b>", "<b>플랫폼 서비스</b>"];
let lang67 = [
  "PaaS provides a modular platform for developing and deploying custom carbon credit applications. <br/>It supports flexible infrastructure to meet diverse user needs.",
  "PaaS는 맞춤형 탄소 크레딧 애플리케이션을 개발하고 배포하기 위한 모듈식 플랫폼을 제공합니다.<br/> 이는 다양한 사용자 요구를 충족하기 위해 유연한 인프라를 지원합니다."
];
let lang68 = ["CAuth", "CAuth"];
let lang69 = ["Carbon Authentication", "탄소 인증"];
let lang70 = ["Transaction Authentication", "거래 인증"];
let lang71 = ["Emission Authentication", "배출 인증"];
let lang72 = ["Offset Authentication", "오프셋 인증"];
let lang73 = ["Platform", "플랫폼"];
let lang74 = ["Carbon Platform", "탄소 플랫폼"];
let lang75 = ["Net-Zero Dashboard", "넷제로 대시보드"];
let lang76 = ["Emission Dashboard", "배출 대시보드"];
let lang77 = ["Offset Dashboard", "오프셋 대시보드"];
let lang78 = ["Explore", "탐색"];
let lang79 = ["Carbon Explore", "탄소 탐색"];
let lang80 = ["Net-Zero Explore", "넷제로 탐색"];
let lang81 = ["Emission Explore", "배출 탐색"];
let lang82 = ["Offset Explore", "오프셋 탐색"];
let lang83 = ["Community", "커뮤니티"];
let lang84 = ["Community", "커뮤니티"];
let lang85 = ["Developer", "개발자"];
let lang86 = ["Github", "깃허브"];
let lang87 = ["News", "뉴스"];
let lang88 = ["Medium", "미디엄"];
let lang89 = ["Instagram", "인스타그램"];
let lang90 = ["Youtube", "유튜브"];
let lang91 = ["Communication", "커뮤니케이션"];
let lang92 = ["Twitter", "트위터"];
let lang93 = ["Telegram", "텔레그램"];
let lang94 = ["Copyright © 2024 GESIA. All rights reserved.", "저작권 © 2024 GESIA. 모든 권리 보유."];
let lang95 = ["Status", "상태"];
let lang96 = ["Legal", "법적"];
let lang97 = ["Privacy", "개인정보 보호"];
let lang98 = ["Terms", "약관"];

let lang99 = ["<b>Net-Zero School</b>", "<b>넷제로 스쿨</b>"];
let lang100 = [
    "A project that aggregates carbon emissions from elementary, middle, and high schools to contribute to achieving Net-Zero goals. <br/>By analyzing energy usage data from each school, it assesses carbon emissions and suggests reduction strategies.",
    "초등학교, 중학교, 고등학교의 탄소 배출량을 집계하여 넷제로 목표 달성에 기여하는 프로젝트입니다. <br/>각 학교의 에너지 사용 데이터를 분석하여 탄소 배출량을 평가하고 감축 전략을 제안합니다."
];

let lang101 = ["<b>GXCE ( Gesia X Carbon Exchange )</b>", "<b>GXCE (Gesia X 탄소 거래소)</b>"];
let lang102 = [
    "GXCE is a rollup-based decentralized exchange (DEX) where users can trade carbon credits authenticated by certified institutions such as Verra, ProArles, and the Korea Forestry Promotion Institute. <br/>The platform emphasizes transparency in all carbon credit transactions, creating a trustworthy environment for carbon trading.",
    "GXCE는 Verra, ProArles, 한국산림진흥원과 같은 인증 기관에서 인증한 탄소 크레딧을 거래할 수 있는 롤업 기반 탈중앙화 거래소(DEX)입니다. <br/>이 플랫폼은 모든 탄소 크레딧 거래에서 투명성을 강조하여 신뢰할 수 있는 탄소 거래 환경을 제공합니다."
];

let lang103 = ["<b>Net-Zero Heroes</b>", "<b>넷제로 히어로즈</b>"];
let lang104 = [
    "A campaign project designed to raise awareness about the climate crisis and encourage carbon reduction efforts. <br/>Through various platforms and social media, it highlights the importance of addressing climate change and offers practical ways to reduce one's carbon footprint.",
    "기후 위기에 대한 인식을 높이고 탄소 감축 노력을 독려하기 위해 설계된 캠페인 프로젝트입니다. <br/>다양한 플랫폼과 소셜 미디어를 통해 기후 변화 대응의 중요성을 강조하고 개인의 탄소 발자국을 줄이는 실용적인 방법을 제공합니다."
];

let lang105 = ["<b>Net-Zero Wallet</b>", "<b>넷제로 월렛</b>"];
let lang106 = [
    "Net-Zero Wallet securely stores carbon credits issued <br/>by the Offset Chain and supports reliable carbon management and transactions through comprehensive authentication, including transaction, emission, and offset authentication.",
    "넷제로 월렛(Net-Zero Wallet)은 오프셋 체인(Offset Chain)에서 발행된 탄소 크레딧을 안전하게 저장하며, 거래, 배출, 상쇄 인증을 포함한 종합적인 인증 과정을 통해 신뢰할 수 있는 탄소 관리와 거래를 지원합니다."
];

let lang107 = ["<b>What is GESIA</b>", "<b>GESIA란</b>"];
let lang108 = [
    "GESIA, a Net-Zero Layer 3 platform that transparently and efficiently manages <br/>carbon emission tracking, reduction, and offset activities, leverages innovative blockchain layer technology, IoT integration, and AI-based analysis to help businesses, individuals, and governments effectively achieve their carbon neutrality goals.",
    "GESIA는 탄소 배출 추적, 감축, 상쇄 활동을 투명하고 효율적으로 관리하는 넷제로 레이어 3 플랫폼으로, <br/>혁신적인 블록체인 레이어 기술, IoT 통합 및 AI 기반 분석을 활용하여 기업, 개인 및 정부가 탄소 중립 목표를 효과적으로 달성하도록 지원합니다."
];


function changeLang(target){
    if(target == 'kr'){langNum = 2}
    if(target == 'en'){langNum = 1}


    if($('body').attr('data-location') == 'index'){
        

        
        for (i = 0; i < 108; i++) {
            var text = eval('lang'+(i+1));
            $('[data-lang="'+ (i+1) +'"]').html(text[(langNum - 1)]);
        }
    
    }else if($('body').attr('data-location') == 'about'){
        
        for (i = 0; i < 2; i++) {
            var text = eval('lang'+(i+1));
            $('[data-lang="'+ (i+1) +'"]').html(text[(langNum - 1)]);
        }
    
    
    }
    $('body').attr('data-lang',target);
    
    updateIntroText()

}


/**
 * 모바일 헤더의 열기/닫기를 전환하는 함수
 * @returns {void}
 */
function mobileHeaderControll(){
    $('body').toggleClass('headerON');
    $('.ic-hamburger').toggleClass('ON');
}


/**
 * 언어 변경 버튼 클릭 이벤트를 처리하는 함수
 * @param {string|null|undefined} target - 변경할 언어('kr' 또는 'en'), 없으면 현재 언어 전환
 * @returns {void}
 */
function langToggle(target){
    if(target == null || target == undefined){

        if($('body').attr('data-lang') == 'kr'){
            changeLang('en');
            $('.btnLang').html('<b class="langNow">EN</b>');
        }else{
            changeLang('kr')
            $('.btnLang').html('<b class="langNow">KR</b>');
        }
    }else {
        changeLang(target)
        $('.btnLang').removeClass('ACTIVE');
        $('.btnLang[data-lang="'+target+'"]').addClass('ACTIVE');
    }
}


/**
 * 인트로 섹션의 텍스트를 업데이트하는 함수
 * @returns {void}
 */
function updateIntroText() {
    var labelLang = 0; 
    if($('body').attr('data-lang') == 'en'){  var labelLang = 0; }
    else if($('body').attr('data-lang') == 'kr'){ var labelLang = 1;  }

    const labelTextMap = {
        n2: {
            title: lang99[labelLang],    // Net-Zero School
            desc: lang100[labelLang]     // 상세 설명
        },
        n16: {
            title: lang101[labelLang],   // GXCE (Gesia X Carbon Exchange)
            desc: lang102[labelLang]     // 상세 설명
        },
        n8: {
            title: lang103[labelLang],   // Net-Zero Heroes
            desc: lang104[labelLang]     // 상세 설명
        },
        n10: {
            title: lang105[labelLang],   // Net-Zero Wallet
            desc: lang106[labelLang]     // 상세 설명
        },
        gesia: {
            title: lang107[labelLang],   // What is GESIA
            desc: lang108[labelLang]     // 상세 설명
        }
    };
    
   $('#visualizer').on('mousemove', function(e) {
    const hoveredLabel = $('body').attr('data-intro');
    
    if (hoveredLabel && labelTextMap[hoveredLabel]) {
      $('.sec-intro .titleBox h3').html(labelTextMap[hoveredLabel].title);
      $('.sec-intro .titleBox h4').html(labelTextMap[hoveredLabel].desc);
    } else {
      $('.sec-intro .titleBox h3').html('');
      $('.sec-intro .titleBox h4').html('');
    }
   });


   $('.sec-intro .titleBox h3').html(labelTextMap.gesia.title);
   $('.sec-intro .titleBox h4').html(labelTextMap.gesia.desc);

   
    // 모든 텍스트 콘텐츠를 숨겨진 div에 렌더링하여 최대 높이 계산
    const $tempDiv = $('<div/>', {
        style: 'position:absolute; visibility:hidden; width:' + $('.sec-intro .titleBox:last-child').width() + 'px'
    }).appendTo('body');
    
    let maxHeight = 0;
    
    // labelTextMap의 모든 텍스트를 렌더링하여 높이 체크
    Object.values(labelTextMap).forEach(content => {
        $tempDiv.html(`<h3>${content.title}</h3><h4>${content.desc}</h4>`);
        maxHeight = Math.max(maxHeight, $tempDiv.height());
    });
    
    $tempDiv.remove();
    
    // 최대 높이에 여유값 추가
    $('.sec-intro .titleBox:last-child').css('min-height', maxHeight + 20);
};


function onloadDONE(){       // All element interaction script  - sys 221016
    if(window.location.hash !== ''){
        location.href = window.location.hash;
    }
    
    $(  'header .category .cateItem').on('click touch', function(){
        $('body').removeClass('headerON');
        $('.ic-hamburger').removeClass('ON');
    });


    updateIntroText() ;

}


let resizeTimer;
$(window).on('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // 위의 높이 계산 코드 실행
    // 모든 텍스트 콘텐츠를 숨겨진 div에 렌더링하여 최대 높이 계산
    updateIntroText() ;
  }, 250);
});


function loadHTML() {
    // 헤더를 불러오기
    fetch('./layout/header.html')  // 같은 폴더 내 header.html을 가져옴
    .then(response => response.text())
    .then(data => {
      document.getElementById('header').innerHTML = data;
    });

    // 푸터를 불러오기
    fetch('./layout/footer.html')  // 같은 폴더 내 footer.html을 가져옴
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer').innerHTML = data;
    });
  }

  // 모든 리소스가 로드된 후에 헤더와 푸터를 로드

//   window.onload = loadHTML;



$(document).ready(function() {
    


      

    
    setTimeout(function() {

        var scrolloverflowed;

        if(window.innerWidth < 900 || window.innerHeight < 700 ){
            $('body').attr('data-fullpage','break');
            scrolloverflowed = false;
        } else {
            // scrolloverflowed = false;
            scrolloverflowed = true;
        }
        $('#fullpage').fullpage({
            sectionSelector: '.secItem',
            anchors: [
                'intro',
                'consensus',
                'emission',
                'offset',
                'cross-chain',
                'products',
                'partner1',
                'partner2',
                'partner3',
                'info',
            ],
            // scrollBar: true,
            autoScrolling : scrolloverflowed,      
            fitToSection : scrolloverflowed,      
            responsiveWidth: 900,
            responsiveHeight: 700,
            verticalCentered: true,
            fixedElements: 'header',
            animateAnchor : false,
            afterResponsive: function(isResponsive){
                window.location.reload();
            }
            
        });

        if( /Android|webOS|iPhone|Macintosh|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            $('body').addClass('type-device');      
        }
        $('body').removeClass('loading')

        onloadDONE();
        
    }, 100);
    vhCheck();




});




