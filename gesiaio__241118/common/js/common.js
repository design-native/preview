// 스크립트 리스트

//    1. 팝업 열기
//    2. 팝업 닫기
//    8. 브라우저 높이 체크 스크립트 화 vh > px
//    9. 소스 로딩 완료 후 동작 스크립트






//  Desc :: 1. 팝업 열기
function popupShow(depth, target){
    if($('.popupItem[data-popup="' + target+'"]').length){

        if(depth == '2'){
            $('.popupItem[data-popup="' + target+'"]').show();
            $('body').addClass('popup-'+target);
            $('body').addClass('layerDepth2');
    
        }else if(depth == '9'){
            $('.popupItem[data-popup="' + target+'"]').show();
            $('body').addClass('popup-'+target);
            $('body').addClass('layerDepthAhead');
    
        }else{
            if(target == 'layer-alert1' || target == 'layer-alert2'){
                $('.layer .dim').hide();
            }else {
                $('.layer .dim').show();
            }

            $('.popupItem[data-popup="' + target+'"]').show();
            $('.popupItem[data-popup="' + target+'"]').addClass('NOW');
            $('.popup').show();
            $('body').addClass('popup-'+target);
         
            //  팝업 열기 애니메이션 부여를 위한 딜레이
            setTimeout(function() { 
                $('body').addClass('layerON');
            }, 500); 

    
            var scrollTop = $('.popupItem.NOW .popup-cont').scrollTop();
            var innerHeight = $('.popupItem.NOW .popup-cont').innerHeight();
            var scrollHeight = $('.popupItem.NOW .popup-cont').prop('scrollHeight');
            if (scrollTop + innerHeight >= scrollHeight ) {
                $('.scrollDown').hide()
            } else {
                $('.scrollDown').show()
            }
            
        };
        

    }



}

//  Desc :: 2. 팝업 닫기
function popupHide(target){
    $(".popupItem[data-popup='workDetail'] .popup-cont").scrollTop(0);
    if($('body').hasClass('layerDepthAhead') || $('body').is('layerDepthAhead, layerDepth2')){
        $('body').removeClass('layerDepthAhead');

        $('body').removeClass('__'+target);
        $('.popupItem[data-popup="' + target+'"]').hide();

    }else if($('body').hasClass('layerDepth2')){
        $('body').removeClass('layerDepth2');

        $('body').removeClass('__'+target);
        $('.popupItem[data-popup="' + target+'"]').hide();

    }else if(target == 'all'){
    }else{

        $('body').removeClass('layerON');

        
        setTimeout(function() { 
            $('body').removeClass('__'+target);
            $('.popupItem[data-popup="' + target+'"]').hide();
            $('.popupItem[data-popup="' + target+'"]').removeClass('NOW');
            $('.popup').hide();
        }, 500); 
        
        if($(document).width() > 900){
            if($('body').hasClass('type-device')){
                // $.fn.fullpage.setAutoScrolling(true); 
            }
        }
    }

    if(target == 'layer-alert1'){
        $('.layer-alert1 .alertInfo').text('');

    }
}


//  Desc :: 8. 브라우저 높이 체크 스크립트 화 vh > px
function vhCheck(){

    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    
}
window.addEventListener("resize", function () {
    vhCheck()
});


// 모든 data-lang 번역 텍스트 정의
let lang1 = ["CAuth", "CAuth"];
let lang2 = ["Carbon Authentication", "탄소 인증"];
let lang3 = ["Transaction Authentication", "거래 인증"];
let lang4 = ["Exchange Authentication", "교환 인증"];
let lang5 = ["Trader Authentication", "트레이더 인증"];
let lang6 = ["Emission Authentication", "배출 인증"];
let lang7 = ["Emission Data Provider Authentication", "배출 데이터 제공자 인증"];
let lang8 = ["Emission Data Administrator Authentication", "배출 데이터 관리자 인증"];
let lang9 = ["Offset Authentication", "상쇄 인증"];
let lang10 = ["Offset Data Provider Authentication", "상쇄 데이터 제공자 인증"];
let lang11 = ["Offset Data Administrator Authentication", "상쇄 데이터 관리자 인증"];
let lang12 = ["Platform", "플랫폼"];
let lang13 = ["Carbon Platform", "탄소 플랫폼"];
let lang14 = ["Net-Zero Dashboard", "넷제로 대시보드"];
let lang15 = ["Emission Dashboard", "배출 대시보드"];
let lang16 = ["Offset Dashboard", "상쇄 대시보드"];
let lang17 = ["Explore", "탐색"];
let lang18 = ["Carbon Explore", "탄소 탐색"];
let lang19 = ["Net-Zero Explore", "넷제로 탐색"];
let lang20 = ["Emission Explore", "배출 탐색"];
let lang21 = ["Offset Explore", "상쇄 탐색"];
let lang22 = ["Community", "커뮤니티"];
let lang23 = ["Developer", "개발자"];
let lang24 = ["Github", "Github"];
let lang25 = ["News", "뉴스"];
let lang26 = ["Medium", "Medium"];
let lang27 = ["Instagram", "인스타그램"];
let lang28 = ["Youtube", "유튜브"];
let lang29 = ["Communication", "커뮤니케이션"];
let lang30 = ["Twitter", "트위터"];
let lang31 = ["Telegram", "텔레그램"];
let lang32 = ["Net-Zero Layer 3 Platform", "넷제로 레이어 3 플랫폼"];
let lang33 = ["", ""];
let lang34 = ["", ""];
let lang35 = ["Net-Zero Consensus", "넷제로 컨센서스"];
let lang36 = ["Creating a digital carbon management platform<br/> that connects carbon emissions with reduction", "탄소 배출과 감축을 연결하는 디지털 탄소 관리 플랫폼을 구축"];
let lang37 = ["We help companies reducing carbon emissions and individuals supporting carbon offset activities to achieve transparent carbon neutrality through collaboration on a blockchain-based platform.<br/> Our platform supports various partners in effectively achieving their carbon reduction goals and aims to be at the center of a sustainable environmental ecosystem.", "우리는 기업의 탄소 배출 감소와 개인의 탄소 상쇄 활동을 지원하여 블록체인 기반 플랫폼에서의 협력을 통해 투명한 탄소 중립을 달성하도록 돕습니다.<br/> 우리 플랫폼은 다양한 파트너가 효과적으로 탄소 감축 목표를 달성할 수 있도록 지원하며 지속 가능한 환경 생태계의 중심이 되는 것을 목표로 합니다."];
let lang38 = ["Carbon Credit Burning Consensus", "탄소 크레딧 소각 컨센서스"];
let lang39 = ["Permanent carbon credit burning mechanism for carbon emission offsetting.", "탄소 배출 상쇄를 위한 영구적인 탄소 크레딧 소각 메커니즘."];
let lang40 = ["1. Carbon emission offset and carbon credit burning<br/>2. Carbon emission verification through burn request<br/>3. Thorough verification process via rollup<br/>4. Permanently recorded net-zero status on the blockchain", "1. 탄소 배출 상쇄 및 탄소 크레딧 소각<br/>2. 소각 요청을 통한 탄소 배출 검증<br/>3. 롤업을 통한 철저한 검증 프로세스<br/>4. 블록체인에 영구적으로 기록된 넷제로 상태"];
let lang41 = ["Carbon Reduction Consensus", "탄소 감축 컨센서스"];
let lang42 = ["We design systematic reduction strategies and strengthen sustainability through performance-based carbon credit issuance.", "우리는 체계적인 감축 전략을 설계하고 성과 기반 탄소 크레딧 발행을 통해 지속 가능성을 강화합니다."];
let lang43 = ["1. Accurate identification of emission sources<br/>2. Analysis and verification of reduction activities<br/>3. Carbon credit issuance upon achievement of reduction targets", "1. 배출원 정확히 식별<br/>2. 감축 활동 분석 및 검증<br/>3. 감축 목표 달성 시 탄소 크레딧 발행"];
let lang44 = ["Carbon Emission Data Tokenization", "탄소 배출 데이터 토큰화"];
let lang45 = ["The Notary Oracle tokenizes external carbon emission data using calculators from certified institutions.", "노타리 오라클은 인증 기관의 계산기를 사용하여 외부 탄소 배출 데이터를 토큰화합니다."];
let lang46 = ["Carbon Offset Data Tokenization", "탄소 상쇄 데이터 토큰화"];
let lang47 = ["The Notary Oracle tokenizes external carbon absorption and reduction data authenticated by certified institutions.", "노타리 오라클은 인증 기관에서 인증한 외부 탄소 흡수 및 감축 데이터를 토큰화합니다."];
let lang48 = ["Preventing Double Counting in Cross-Chain Token Transfers", "크로스체인 토큰 전송 시 이중 계산 방지"];
let lang49 = ["Carbon Credit Products", "탄소 크레딧 제품"];
let lang50 = ["ExoMad Green's Sustainable<br/>Biochar Project in Bolivia", "ExoMad Green의 지속 가능한<br/>바이오차 프로젝트 (볼리비아)"];
let lang51 = ["ExoMad Green's sustainable biochar project creates environmental and social value through a circular economy model.<br/> In March 2023, ExoMad Green established its first biochar facility in Concepción, Bolivia.<br/> We plan to significantly expand our operations during 2024.<br/> These facilities will collectively harness the power of biochar to sequester up to 200,000 tons of CO2 annually.", "ExoMad Green의 지속 가능한 바이오차 프로젝트는 순환 경제 모델을 통해 환경적 및 사회적 가치를 창출합니다.<br/> 2023년 3월, ExoMad Green은 볼리비아 콘셉시온에 첫 바이오차 시설을 설립했습니다.<br/> 2024년 동안 운영을 대대적으로 확장할 계획입니다.<br/> 이 시설들은 바이오차의 힘을 활용하여 연간 최대 200,000톤의 CO2를 격리할 것입니다."];
let lang52 = ["A Unique and Influential<br/>REDD+ Project Preserving<br/>the Tropical Rainforest", "독특하고 영향력 있는<br/>REDD+ 프로젝트로 열대 우림 보존"];
let lang53 = ["In collaboration with Netherlands-based Quadriz B.V., its local affiliate Quadriz Paraguay S.A., and Atenil S.A., a major landowner in Paraguay's Chaco, the project has implemented verified carbon standards along with climate, community, and biodiversity standards (VCS – CCBS) to avoid planned deforestation.", "네덜란드 기반 Quadriz B.V., 현지 계열사 Quadriz Paraguay S.A., 그리고 파라과이 차코 지역의 주요 지주인 Atenil S.A.와 협력하여 이 프로젝트는 기후, 커뮤니티 및 생물다양성 기준(VCS – CCBS)과 함께 검증된 탄소 기준을 구현하여 계획된 산림 벌채를 방지했습니다."];
let lang54 = ["Delta Blue<br/>Carbon Project", "델타 블루<br/>탄소 프로젝트"];
let lang55 = ["The Indus Delta Blue Carbon Project is working to restore one of the world's largest arid climate mangrove forests located within the Sindh Indus Delta region in Thatta and Sujawal areas of Southeastern Sindh province, Pakistan.", "인더스 델타 블루 탄소 프로젝트는 파키스탄 동남부 신드 주의 타타와 수자왈 지역에 위치한 세계에서 가장 큰 건조 기후 맹그로브 숲 중 하나를 복원하기 위해 노력하고 있습니다."];
let lang56 = ["CAuth", "CAuth"];
let lang57 = ["Carbon Authentication", "탄소 인증"];
let lang58 = ["Transaction Authentication", "거래 인증"];
let lang59 = ["Exchange Authentication", "교환 인증"];
let lang60 = ["Trader Authentication", "트레이더 인증"];
let lang61 = ["Emission Authentication", "배출 인증"];
let lang62 = ["Emission Data Provider Authentication", "배출 데이터 제공자 인증"];
let lang63 = ["Emission Data Administrator Authentication", "배출 데이터 관리자 인증"];
let lang64 = ["Offset Authentication", "상쇄 인증"];
let lang65 = ["Offset Data Provider Authentication", "상쇄 데이터 제공자 인증"];
let lang66 = ["Offset Data Administrator Authentication", "상쇄 데이터 관리자 인증"];
let lang67 = ["Platform", "플랫폼"];
let lang68 = ["Carbon Platform", "탄소 플랫폼"];
let lang69 = ["Net-Zero Dashboard", "넷제로 대시보드"];
let lang70 = ["Emission Dashboard", "배출 대시보드"];
let lang71 = ["Offset Dashboard", "상쇄 대시보드"];
let lang72 = ["Explore", "탐색"];
let lang73 = ["Carbon Explore", "탄소 탐색"];
let lang74 = ["Net-Zero Explore", "넷제로 탐색"];
let lang75 = ["Emission Explore", "배출 탐색"];
let lang76 = ["Offset Explore", "상쇄 탐색"];
let lang77 = ["Community", "커뮤니티"];
let lang78 = ["Developer", "개발자"];
let lang79 = ["Github", "Github"];
let lang80 = ["News", "뉴스"];
let lang81 = ["Medium", "Medium"];
let lang82 = ["Instagram", "인스타그램"];
let lang83 = ["Youtube", "유튜브"];
let lang84 = ["Communication", "커뮤니케이션"];
let lang85 = ["Twitter", "트위터"];
let lang86 = ["Telegram", "텔레그램"];
let lang87 = ["Copyright © 2024 GESIA. All rights reserved.", "저작권 © 2024 GESIA. 모든 권리 보유."];
let lang88 = ["Status", "상태"];
let lang89 = ["Legal", "법적"];
let lang90 = ["Privacy", "개인정보"];
let lang91 = ["Terms", "이용 약관"];

let lang92 = ["Net-Zero School", "넷제로 스쿨"];
let lang93 = [
    "A project that aggregates carbon emissions from elementary, middle, and high schools to contribute to achieving Net-Zero goals. By analyzing energy usage data from each school, it assesses carbon emissions and suggests reduction strategies.",
    "초등학교, 중학교, 고등학교의 탄소 배출량을 집계하여 넷제로 목표 달성에 기여하는 프로젝트입니다. 각 학교의 에너지 사용 데이터를 분석하여 탄소 배출량을 평가하고 감축 전략을 제안합니다."
];
let lang94 = ["GXCE ( Gesia X Carbon Exchange )", "GXCE (Gesia X 탄소 거래소)"];
let lang95 = [
    "GXCE is a rollup-based decentralized exchange (DEX) where users can trade carbon credits authenticated by certified institutions such as Verra, ProArles, and the Korea Forestry Promotion Institute. The platform emphasizes transparency in all carbon credit transactions, creating a trustworthy environment for carbon trading.",
    "GXCE는 Verra, ProArles, 한국산림진흥원과 같은 인증 기관에서 인증한 탄소 크레딧을 거래할 수 있는 롤업 기반 탈중앙화 거래소(DEX)입니다. 이 플랫폼은 모든 탄소 크레딧 거래에서 투명성을 강조하여 신뢰할 수 있는 탄소 거래 환경을 제공합니다."
];
let lang96 = ["Net-Zero Heroes", "넷제로 히어로즈"];
let lang97 = [
    "A campaign project designed to raise awareness about the climate crisis and encourage carbon reduction efforts. Through various platforms and social media, it highlights the importance of addressing climate change and offers practical ways to reduce one's carbon footprint.",
    "기후 위기에 대한 인식을 높이고 탄소 감축 노력을 독려하기 위해 설계된 캠페인 프로젝트입니다. 다양한 플랫폼과 소셜 미디어를 통해 기후 변화 대응의 중요성을 강조하고 개인의 탄소 발자국을 줄이는 실용적인 방법을 제공합니다."
];
let lang98 = ["Net-Zero Wallet", "넷제로 월렛"];
let lang99 = [
    "Net-Zero Wallet securely stores carbon credits issued by the Offset Chain and supports reliable carbon management and transactions through comprehensive authentication, including transaction, emission, and offset authentication.",
    "넷제로 월렛은 Offset Chain에서 발행한 탄소 크레딧을 안전하게 저장하고, 거래, 배출, 상쇄 인증을 포함한 종합 인증을 통해 신뢰할 수 있는 탄소 관리 및 거래를 지원합니다."
];
let lang100 = ["What is GESIA", "GESIA란"];
let lang101 = [
    "GESIA, a Net-Zero Layer 3 platform that transparently and efficiently manages carbon emission tracking, reduction, and offset activities, leverages innovative blockchain layer technology, IoT integration, and AI-based analysis to help businesses, individuals, and governments effectively achieve their carbon neutrality goals.",
    "GESIA는 탄소 배출 추적, 감축, 상쇄 활동을 투명하고 효율적으로 관리하는 넷제로 레이어 3 플랫폼으로, 혁신적인 블록체인 레이어 기술, IoT 통합 및 AI 기반 분석을 활용하여 기업, 개인 및 정부가 탄소 중립 목표를 효과적으로 달성하도록 지원합니다."
];



function changeLang(target){
    if(target == 'kr'){langNum = 2}
    if(target == 'en'){langNum = 1}


    if($('body').attr('data-location') == 'index'){
        

        
        for (i = 0; i < 97; i++) {
            var text = eval('lang'+(i+1));
            $('[data-lang="'+ (i+1) +'"]').html(text[(langNum - 1)]);
        }
    
    }else if($('body').attr('data-location') == 'about'){
        
        for (i = 0; i < 2; i++) {
            var text = eval('lang'+(i+1));
            $('[data-lang="'+ (i+1) +'"]').html(text[(langNum - 1)]);
        }
    
    
    }
    // let lang100 = ['<b>The New Standard of Digital Trust</b>', '<b>디지털 신뢰의 새로운 표준</b>'];
    // let lang101 = ['Based on 6G infrastructure and chain network technology, DONO VAULT provides reliable device authentication solutions and is a global company preventing the misuse of AI technologies like deepfakes.', '도노 볼트는 6G 인프라와 체인 네트워크 기술을 기반으로, 신뢰성 있는 기기 인증 솔루션을 제공하며 <br/>딥페이크와 같은 AI 기술의 악용을 방지하는 글로벌 기업입니다.'];

    // for (i = 100; i < 102; i++) {
    //     var text = eval('lang'+(i));
    //     $('[data-lang="'+ (i) +'"]').html(text[(langNum - 1)]);
    // }

    $('body').attr('data-lang',target);
    
    updateIntroText()

}

 



function mobileHeaderControll(){
    $('body').toggleClass('headerON');
    $('.ic-hamburger').toggleClass('ON');
}



function langToggle(){
    if($('body').attr('data-lang') == 'kr'){
        changeLang('en');
        $('.btnLang').html('<b class="langNow">EN</b>');
    }else{
        changeLang('kr')
        $('.btnLang').html('<b class="langNow">KR</b>');
    }
}


function updateIntroText() {
    var labelLang = 0; 
    if($('body').attr('data-lang') == 'en'){  var labelLang = 0; }
    else if($('body').attr('data-lang') == 'kr'){ var labelLang = 1;  }

    const labelTextMap = {
        n2: {
            title: lang92[labelLang], // Net-Zero School
            desc: lang93[labelLang]  // 상세 설명
        },
        n16: {
            title: lang94[labelLang], // GXCE ( Gesia X Carbon Exchange )
            desc: lang95[labelLang]  // 상세 설명
        },
        n8: {
            title: lang96[labelLang], // Net-Zero Heroes
            desc: lang97[labelLang]  // 상세 설명
        },
        n10: {
            title: lang98[labelLang], // Net-Zero Wallet
            desc: lang99[labelLang]  // 상세 설명
        },
        gesia: {
            title: lang100[labelLang], // What is GESIA
            desc: lang101[labelLang]  // 상세 설명
        }
    };
    
   $('#visualizer').on('mousemove', function(e) {
    const hoveredLabel = $('body').attr('data-intro');
    
    if (hoveredLabel && labelTextMap[hoveredLabel]) {
      $('.sec-intro .titleBox h3').text(labelTextMap[hoveredLabel].title);
      $('.sec-intro .titleBox h4').text(labelTextMap[hoveredLabel].desc);
    } else {
      $('.sec-intro .titleBox h3').text('');
      $('.sec-intro .titleBox h4').text('');
    }
   });


   $('.sec-intro .titleBox h3').text(labelTextMap.gesia.title);
   $('.sec-intro .titleBox h4').text(labelTextMap.gesia.desc);

   
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

        if(window.innerWidth < 900 ){
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
                'info'
            ],
            autoScrolling : scrolloverflowed,      
            fitToSection : scrolloverflowed,      
            responsiveWidth: 900,
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
        // if($('body').attr('data-location') == 'index'){
        //     setTimeout(function() {
                $('body').removeClass('loading')
        //         setTimeout(function() {
        //             $('.loadArea').remove();
        //        }, 900);
        //     }, 2000);
        // }else {
        // }

        onloadDONE();
        
    }, 100);
    vhCheck();




});




