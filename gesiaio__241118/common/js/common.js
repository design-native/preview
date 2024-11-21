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
let lang4 = ["Exchange Authentication", "거래소 인증"];
let lang5 = ["Trader Authentication", "거래자 인증"];
let lang6 = ["Emission Authentication", "배출 인증"];
let lang7 = ["Emission Data Provider Authentication", "배출 데이터 제공자 인증"];
let lang8 = ["Emission Data Administrator Authentication", "배출 데이터 관리자 인증"];
let lang9 = ["Offset Authentication", "상쇄 인증"];
let lang10 = ["Offset Data Provider Authentication", "상쇄 데이터 제공자 인증"];
let lang11 = ["Offset Data Administrator Authentication", "상쇄 데이터 관리자 인증"];
let lang12 = ["Platform", "플랫폼"];
let lang13 = ["Carbon Platform", "탄소 플랫폼"];
let lang14 = ["NetZero Dashboard", "넷제로 대시보드"];
let lang15 = ["Emission Dashboard", "배출 대시보드"];
let lang16 = ["Offset Dashboard", "상쇄 대시보드"];
let lang17 = ["Explore", "탐색"];
let lang18 = ["Carbon Explore", "탄소 탐색"];
let lang19 = ["NetZero Explore", "넷제로 탐색"];
let lang20 = ["Emission Explore", "배출 탐색"];
let lang21 = ["Offset Explore", "상쇄 탐색"];
let lang22 = ["Community", "커뮤니티"];
let lang23 = ["Developer", "개발자"];
let lang24 = ["Github", "깃허브"];
let lang25 = ["News", "뉴스"];
let lang26 = ["Medium", "미디엄"];
let lang27 = ["Instagram", "인스타그램"];
let lang28 = ["Youtube", "유튜브"];
let lang29 = ["Communication", "소통"];
let lang30 = ["Twitter", "트위터"];
let lang31 = ["Telegram", "텔레그램"];
let lang32 = ["Net-Zero Layer 3 Platform", "넷제로 레이어 3 플랫폼"];
let lang33 = ["", ""];
let lang34 = ["", ""];
let lang35 = ["Net-Zero Consensus", "넷제로 컨센서스"];
let lang36 = ["Carbon Credit Burning Consensus", "탄소 크레딧 소각 컨센서스"];
let lang37 = [
    "1. Carbon emission offset and carbon credit burning<br/>2. Carbon emission verification through burn request<br/>3. Thorough verification process via rollup<br/>4. Permanently recorded net-zero status on the blockchain",
    "1. 탄소 배출 상쇄 및 탄소 크레딧 소각<br/>2. 소각 요청을 통한 탄소 배출 검증<br/>3. 롤업을 통한 철저한 검증 프로세스<br/>4. 블록체인에 영구적으로 기록된 넷제로 상태"
];
let lang38 = ["Carbon Reduction Consensus", "탄소 감축 컨센서스"];
let lang39 = [
    "1. Accurate identification of emission sources<br/>2. Analysis and verification of reduction activities<br/>3. Carbon credit issuance upon achievement of reduction targets",
    "1. 배출원의 정확한 식별<br/>2. 감축 활동 분석 및 검증<br/>3. 감축 목표 달성 시 탄소 크레딧 발급"
];
let lang40 = ["Carbon Emission Data Tokenization", "탄소 배출 데이터 토큰화"];
let lang41 = ["The Notary Oracle tokenizes external carbon emission data using calculators from certified institutions.", "공증 오라클은 인증된 기관의 계산기를 사용하여 외부 탄소 배출 데이터를 토큰화합니다."];
let lang42 = ["Carbon Offset Data Tokenization", "탄소 상쇄 데이터 토큰화"];
let lang43 = ["The Notary Oracle tokenizes external carbon absorption and reduction data authenticated by certified institutions.", "공증 오라클은 인증된 기관이 인증한 외부 탄소 흡수 및 감축 데이터를 토큰화합니다."];
let lang44 = ["Preventing Double Counting in Cross-Chain Token Transfers", "체인 간 토큰 전송에서 중복 계산 방지"];
let lang45 = ["Carbon Credit Products", "탄소 크레딧 제품"];
let lang46 = ["ExoMad Green's Sustainable<br/>Biochar Project in Bolivia", "ExoMad Green의 지속 가능한<br/>바이오차 프로젝트"];
let lang47 = [
    "ExoMad Green's sustainable biochar project<br/>creates environmental and social value<br/>through a circular economy model.",
    "ExoMad Green의 지속 가능한 바이오차 프로젝트는<br/>순환 경제 모델을 통해 환경적 및 사회적 가치를 창출합니다."
];
let lang48 = ["A Unique and Influential<br/>REDD+ Project Preserving<br/>the Tropical Rainforest", "열대우림을 보존하는<br/>독창적이고 영향력 있는 REDD+ 프로젝트"];
let lang49 = [
    "In collaboration with Netherlands-based<br/>Quadriz B.V., its local affiliate Quadriz<br/>Paraguay S.A., and Atenil S.A., the project<br/>has implemented verified carbon standards.",
    "네덜란드의 Quadriz B.V., 지역 계열사 Quadriz Paraguay S.A., Atenil S.A.와 협력하여 이 프로젝트는<br/>검증된 탄소 표준을 구현했습니다."
];
let lang50 = ["Delta Blue<br/>Carbon Project", "델타 블루<br/>탄소 프로젝트"];
let lang51 = [
    "The Indus Delta Blue Carbon Project works<br/>to restore one of the world's largest arid climate<br/>mangrove forests located in Pakistan.",
    "인더스 델타 블루 탄소 프로젝트는 파키스탄에 위치한 세계 최대의 건조 기후 맹그로브 숲 중 하나를 복원하기 위해 노력합니다."
];
let lang52 = ["CAuth", "CAuth"];
let lang53 = ["Carbon Authentication", "탄소 인증"];
let lang54 = ["Transaction Authentication", "거래 인증"];
let lang55 = ["Exchange Authentication", "거래소 인증"];
let lang56 = ["Trader Authentication", "거래자 인증"];
let lang57 = ["Emission Authentication", "배출 인증"];
let lang58 = ["Emission Data Provider Authentication", "배출 데이터 제공자 인증"];
let lang59 = ["Emission Data Administrator Authentication", "배출 데이터 관리자 인증"];
let lang60 = ["Offset Authentication", "상쇄 인증"];
let lang61 = ["Offset Data Provider Authentication", "상쇄 데이터 제공자 인증"];
let lang62 = ["Offset Data Administrator Authentication", "상쇄 데이터 관리자 인증"];
let lang63 = ["Platform", "플랫폼"];
let lang64 = ["Carbon Platform", "탄소 플랫폼"];
let lang65 = ["NetZero Dashboard", "넷제로 대시보드"];
let lang66 = ["Emission Dashboard", "배출 대시보드"];
let lang67 = ["Offset Dashboard", "상쇄 대시보드"];
let lang68 = ["Explore", "탐색"];
let lang69 = ["Carbon Explore", "탄소 탐색"];
let lang70 = ["NetZero Explore", "넷제로 탐색"];
let lang71 = ["Emission Explore", "배출 탐색"];
let lang72 = ["Offset Explore", "상쇄 탐색"];
let lang73 = ["Community", "커뮤니티"];
let lang74 = ["Developer", "개발자"];
let lang75 = ["Github", "깃허브"];
let lang76 = ["News", "뉴스"];
let lang77 = ["Medium", "미디엄"];
let lang78 = ["Instagram", "인스타그램"];
let lang79 = ["Youtube", "유튜브"];
let lang80 = ["Communication", "소통"];
let lang81 = ["Twitter", "트위터"];
let lang82 = ["Telegram", "텔레그램"];
let lang83 = ["Copyright © 2024 GESIA. All rights reserved.", "저작권 © 2024 GESIA. 모든 권리 보유."];
let lang84 = ["Status", "상태"];
let lang85 = ["Legal", "법적 고지"];
let lang86 = ["Privacy", "개인정보 보호"];
let lang87 = ["Terms", "이용 약관"];
let lang88 = ["Net-Zero School", "넷제로 스쿨"];
let lang89 = [
    "A project that aggregates carbon emissions from elementary, middle, and high schools to contribute to achieving Net-Zero goals. By analyzing energy usage data from each school, it assesses carbon emissions and suggests reduction strategies.",
    "초등학교, 중학교, 고등학교의 탄소 배출량을 집계하여 넷제로 목표 달성에 기여하는 프로젝트입니다. 각 학교의 에너지 사용 데이터를 분석하여 탄소 배출량을 평가하고 감축 전략을 제안합니다."
];
let lang90 = ["GXCE ( Gesia X Carbon Exchange )", "GXCE (Gesia X 탄소 거래소)"];
let lang91 = [
    "GXCE is a rollup-based decentralized exchange (DEX) where users can trade carbon credits authenticated by certified institutions such as Verra, ProArles, and the Korea Forestry Promotion Institute. The platform emphasizes transparency in all carbon credit transactions, creating a trustworthy environment for carbon trading.",
    "GXCE는 Verra, ProArles, 한국산림진흥원과 같은 인증 기관에서 인증한 탄소 크레딧을 거래할 수 있는 롤업 기반 탈중앙화 거래소(DEX)입니다. 이 플랫폼은 모든 탄소 크레딧 거래에서 투명성을 강조하여 신뢰할 수 있는 탄소 거래 환경을 제공합니다."
];
let lang92 = ["Net-Zero Heroes", "넷제로 히어로즈"];
let lang93 = [
    "A campaign project designed to raise awareness about the climate crisis and encourage carbon reduction efforts. Through various platforms and social media, it highlights the importance of addressing climate change and offers practical ways to reduce one's carbon footprint.",
    "기후 위기에 대한 인식을 높이고 탄소 감축 노력을 독려하기 위해 설계된 캠페인 프로젝트입니다. 다양한 플랫폼과 소셜 미디어를 통해 기후 변화 대응의 중요성을 강조하고 개인의 탄소 발자국을 줄이는 실용적인 방법을 제공합니다."
];
let lang94 = ["Net-Zero Wallet", "넷제로 월렛"];
let lang95 = [
    "Net-Zero Wallet securely stores carbon credits issued by the Offset Chain and supports reliable carbon management and transactions through comprehensive authentication, including transaction, emission, and offset authentication.",
    "넷제로 월렛은 Offset Chain에서 발행한 탄소 크레딧을 안전하게 저장하고, 거래, 배출, 상쇄 인증을 포함한 종합 인증을 통해 신뢰할 수 있는 탄소 관리 및 거래를 지원합니다."
];
let lang96 = ["What is GESIA", "GESIA란"];
let lang97 = [
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
            title: lang88[labelLang], // Net-Zero School
            desc: lang89[labelLang]  // 상세 설명
        },
        n16: {
            title: lang90[labelLang], // GXCE ( Gesia X Carbon Exchange )
            desc: lang91[labelLang]  // 상세 설명
        },
        n8: {
            title: lang92[labelLang], // Net-Zero Heroes
            desc: lang93[labelLang]  // 상세 설명
        },
        n10: {
            title: lang94[labelLang], // Net-Zero Wallet
            desc: lang95[labelLang]  // 상세 설명
        },
        gesia: {
            title: lang96[labelLang], // What is GESIA
            desc: lang97[labelLang]  // 상세 설명
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




