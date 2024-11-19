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



function changeLang(target){
    if(target == 'kr'){langNum = 2}
    if(target == 'en'){langNum = 1}


    if($('body').attr('data-location') == 'index'){
        

        let lang1 = ["Together, let's open up new possibilities for chain network with OAuth 3. <br/>Effortlessly manage complex chain network networks with a single account, unlocking a seamless, fully integrated experience like never before.", "OAuth 3로 체인 네트워크의 새로운 가능성을 함께 열어갑시다. <br/>하나의 계정으로 복잡한 체인 네트워크를 손쉽게 관리하고, 그 어느 때보다 원활하고 통합된 경험을 제공합니다."];
        let lang2 = ["1. Extended", "1. 확장된 기능"];
        let lang3 = ["2. Notarization", "2. 공증"];
        let lang4 = ["3. Channel", "3. 채널"];
        let lang5 = ["4. Recovery", "4. 복구"];
        let lang6 = ["EN", "KR"];
        let lang7 = ["Standby Mode", "대기 모드"];
        let lang8 = ["Step 1", "1단계"];
        let lang9 = ["Step 2", "2단계"];
        let lang10 = ["Step 3", "3단계"];
        let lang11 = ["Together, let's open up new possibilities for chain network with OAuth 3. <br/>Effortlessly manage complex chain network networks with a single account, unlocking a seamless, fully integrated experience like never before.", "OAuth 3로 체인 네트워크의 새로운 가능성을 함께 열어갑시다. <br/>하나의 계정으로 복잡한 체인 네트워크를 손쉽게 관리하고, 그 어느 때보다 원활하고 통합된 경험을 제공합니다."];
        let lang12 = ["<b>OAuth 3</b>", "<b>OAuth 3</b>"];
        let lang13 = ["Effortlessly manage complex chain network networks with <br/>a single account, unlocking a seamless, fully integrated experience like never before.", "하나의 계정으로 복잡한 체인 네트워크를 손쉽게 관리하고, <br/>그 어느 때보다 원활하고 통합된 경험을 제공합니다."];
        let lang14 = ["All Assets in One Account", "모든 자산을 하나의 계정에"];
        let lang15 = ["Manage and own chain network assets scattered across multiple chains with a single account.<br/>Simplify complex multi-chain network environments by integrating them for easier operation.", "여러 체인에 분산된 체인 네트워크 자산을 하나의 계정으로 관리하고 소유하십시오.<br/>복잡한 멀티 체인 네트워크 환경을 통합하여 운영을 단순화합니다."];
        let lang16 = ["Connection Across All Networks", "모든 네트워크 간 연결"];
        let lang17 = ["All you need is one account.<br/>Synchronize all chain network networks with a single account, making asset management across multiple chains easier and more optimized than ever.", "필요한 것은 하나의 계정뿐입니다.<br/>하나의 계정으로 모든 체인 네트워크를 동기화하여 여러 체인에 걸친 자산 관리를 그 어느 때보다 간편하고 최적화된 방식으로 제공합니다."];
        let lang18 = ["Real-Time Asset Synchronization", "실시간 자산 동기화"];
        let lang19 = ["Keep assets across multiple chains up-to-date with real-time synchronization.<br/>Manage your assets seamlessly with accurate data that instantly responds to changes.", "여러 체인에 걸친 자산을 실시간 동기화로 최신 상태로 유지하십시오.<br/>변경 사항에 즉시 반응하는 정확한 데이터로 자산을 원활하게 관리하세요."];
        let lang20 = ["Extended Account", "확장된 계정"];
        let lang21 = ["Decentralized Account Management through Perceptron Sync", "퍼셉트론 싱크를 통한 탈중앙화 계정 관리"];
        let lang22 = ["Secure and Consistent Multi-Chain Account Deployment with Perceptron Sync", "퍼셉트론 싱크를 통한 안전하고 일관된 멀티 체인 계정 배포"];
        let lang23 = ["With Perceptron Sync, you can easily deploy and manage secure and consistent accounts across various chain networks without external intervention.", "퍼셉트론 싱크를 통해 외부 개입 없이 다양한 체인 네트워크에 걸쳐 안전하고 일관된 계정을 쉽게 배포하고 관리할 수 있습니다."];
        let lang24 = ["Account Creation Notarization", "계정 생성 공증"];
        let lang25 = ["Now, you can use a single secure account consistently across multiple chain network networks like Ethereum, Bitcoin, and Solana.<br/>No need to create separate accounts for each chain—manage your account easily and enhance connectivity across chain networks!", "이제 이더리움, 비트코인, 솔라나 등 여러 체인 네트워크에서 하나의 안전한 계정을 일관되게 사용할 수 있습니다.<br/>각 체인에 별도의 계정을 생성할 필요 없이 계정을 쉽게 관리하고 체인 네트워크 간 연결성을 강화하십시오!"];
        let lang26 = ["Unified Access", "통합 접근"];
        let lang27 = ["Access multiple chain network ecosystems with a single account, reducing complexity and enhancing user experience.", "하나의 계정으로 여러 체인 네트워크 생태계에 접근하여 복잡성을 줄이고 사용자 경험을 향상시킵니다."];
        let lang28 = ["Enhanced Security", "강화된 보안"];
        let lang29 = ["Advanced authentication protocols ensure that your account is securely protected across all connected chains.", "고급 인증 프로토콜로 연결된 모든 체인에서 계정이 안전하게 보호됩니다."];
        let lang30 = ["Seamless Interoperability", "원활한 상호운용성"];
        let lang31 = ["Manage assets and interactions across various chains from a single point of control, without additional configurations.", "추가 설정 없이 하나의 제어 지점에서 여러 체인에 걸친 자산과 상호작용을 관리하십시오."];
        let lang32 = ["Dedicated Channel Synchronization", "전용 채널 동기화"];
        let lang33 = ["Real-Time Synchronization of Dedicated Account State Channels Across Chain Networks", "체인 네트워크 간 전용 계정 상태 채널의 실시간 동기화"];
        let lang34 = ["Real-time synchronization of dedicated account state channels enables consistent and rapid data updates across multiple chain networks.", "전용 계정 상태 채널의 실시간 동기화를 통해 여러 체인 네트워크에서 일관되고 빠른 데이터 업데이트가 가능합니다."];
        let lang35 = ["Fast Data Synchronization", "빠른 데이터 동기화"];
        let lang36 = ["Real-time synchronization of state changes across multiple chain networks ensures updates are reflected without delay.", "여러 체인 네트워크에서 상태 변경의 실시간 동기화를 통해 지연 없이 업데이트가 반영됩니다."];
        let lang37 = ["High Security", "높은 보안"];
        let lang38 = ["Consistent account security protocols across all networks enable safe state management.", "모든 네트워크에 걸친 일관된 계정 보안 프로토콜이 안전한 상태 관리를 가능하게 합니다."];
        let lang39 = ["Account dedicated channel notarization is a mechanism that synchronizes accounts and assets in real time in a multi-chain network environment, enhancing transaction security.", "계정 전용 채널 공증은 멀티 체인 네트워크 환경에서 계정과 자산을 실시간으로 동기화하여 거래 보안을 강화하는 메커니즘입니다."];
        let lang40 = ["Account Recovery", "계정 복구"];
        let lang41 = ["Notary Account Recovery and Account Synchronization", "공증된 계정 복구 및 계정 동기화"];
        let lang42 = ["Secure Disconnection of Existing Account", "기존 계정의 안전한 연결 해제"];
        let lang43 = ["The existing account is securely disconnected by using the SEED phrase set by the user when creating the account.", "계정 생성 시 사용자가 설정한 SEED 문구를 사용하여 기존 계정을 안전하게 연결 해제합니다."];
        let lang44 = ["New Account Linking", "새 계정 연결"];
        let lang45 = ["After disconnecting the existing account, the SEED phrase is automatically checked for a match. If successfully matched, the new account links with the CA (Certified Account), ensuring secure continuity of asset and data management.", "기존 계정 연결 해제 후 SEED 문구가 자동으로 일치하는지 확인됩니다. 성공적으로 일치하면 새 계정이 CA(인증 계정)와 연결되어 자산 및 데이터 관리의 안전한 연속성을 보장합니다."];
        let lang46 = ["Notary Account Recovery is a technical mechanism that addresses security issues and real-time synchronization that arise during the account recovery and asset synchronization processes.", "공증된 계정 복구는 계정 복구 및 자산 동기화 과정에서 발생하는 보안 문제와 실시간 동기화를 해결하는 기술적 메커니즘입니다."];
        let lang47 = ["Copyright © 2024 OPEN ENTRY. All rights reserved.", "저작권 © 2024 OPEN ENTRY. 모든 권리 보유."];
        let lang48 = ["Status", "상태"];
        let lang49 = ["Legal", "법적 고지"];
        let lang50 = ["Privacy", "개인 정보 보호"];
        let lang51 = ["Terms", "이용 약관"];
        let lang52 = ["Integrated Account Creation Across Chain Networks", "체인 네트워크 간 통합된 계정 생성"];
        
        for (i = 0; i < 52; i++) {
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
    $('.langNow').text($('.langItem[data-lang="'+target+'"]').text());
    

}

 



function setFlowBanner(target) {
    const $wrap = $('.'+target);
    const $list = $('.'+target+' .list');
    let wrapWidth = ''; 
    let listWidth = '';
    const speed = 60; 

    let $clone = $list.clone();
    $wrap.append($clone);
    flowBannerAct()

    let oldWChk = window.innerWidth > 1279 ? 'pc' : window.innerWidth > 767 ? 'ta' : 'mo';
    $(window).on('resize', function() {
        let newWChk = window.innerWidth > 1279 ? 'pc' : window.innerWidth > 767 ? 'ta' : 'mo';
        if (newWChk != oldWChk) {
            oldWChk = newWChk;
            flowBannerAct();
        }
    });

    function flowBannerAct() {
        if (wrapWidth != '') {
            $wrap.find('.list').css({
                'animation': 'none'
            });
            $wrap.find('.list').slice(2).remove();
        }
        wrapWidth = $wrap.width();
        listWidth = $list.width();
        wrapHeight = $wrap.height();
        listHeight = $list.height();

        if($wrap.hasClass('flowY')){
            if (listHeight < wrapHeight) {
                const listCount = Math.ceil(wrapHeight * 2 / listHeight);
                for (let i = 2; i < listCount; i++) {
                    $clone = $clone.clone();
                    $wrap.append($clone);
                }
            }
            $wrap.find('.list').css({
                'animation': `${listHeight / speed}s linear infinite flowRollingY`
            });
        }else{
            
            if (listWidth < wrapWidth) {
                const listCount = Math.ceil(wrapWidth * 2 / listWidth);
                for (let i = 2; i < listCount; i++) {
                    $clone = $clone.clone();
                    $wrap.append($clone);
                }
            }
            if($wrap.hasClass('flowXreverse')){

                $wrap.find('.list').css({
                    'animation': `${listWidth / speed}s linear infinite flowRollingXreverse`
                });
            }else{
                
                $wrap.find('.list').css({
                    'animation': `${listWidth / speed}s linear infinite flowRolling`
                });
            }
        }
    }

}

(function($) {
    $.fn.extend({
      flowBanner: function(options) {
  
        var defaults = {
          control: false,
          speed: 20,
          ctrlSelector: 'box-flow-ctrl',
          wrapSelector: 'box-flow-wrap',
          playSelector: 'btn-play',
          pauseSelector: 'btn-pause',
          playText: '재생',
          pauseText: '일시정지'
        };
  
        var opt = $.extend(defaults, options);
  
        return this.each(function() {
          var o = opt;
          var left = 0;
          var timer = '';
          var ctrl = o.control;
          var speed = o.speed;
          var ctrlSelector = o.ctrlSelector;
          var wrapSelector = o.wrapSelector;
          var playSelector = o.playSelector;
          var pauseSelector = o.pauseSelector;
          var playText = o.playText;
          var pauseText = o.pauseText;
          var $box = $(this);
          var $wrap = '<div class="' + wrapSelector + '"><\/div>';
          var $banner = $box.children("li");
          var $bannerSize = $banner.length;
          var $bannerW = $banner.outerWidth(true);
          var $ctrlHtml = '';
          $ctrlHtml += '<div class="' + ctrlSelector + '">';
          $ctrlHtml += '	<button type="button" class="' + playSelector + '">' + playText + '<\/button>';
          $ctrlHtml += '	<button type="button" class="' + pauseSelector + '">' + pauseText + '<\/button>';
          $ctrlHtml += '<\/div>';
  
  
          $box.wrap($wrap);
          $box.width($bannerW * $bannerSize);
          flowPlay();
  
          if (ctrl) {
            $box.parent().before($ctrlHtml);
  
            $box.parent().prev('.' + ctrlSelector).on("click", "button", function(e) {
              e.preventDefault;
  
              if ($(this).hasClass(playSelector)) {
                flowPause();
                flowPlay();
              }
  
              if ($(this).hasClass(pauseSelector)) {
                flowPause();
              }
            });
          }
  
        //   $box.on("mouseenter", function() {
        //     flowPause();
        //   }).on("mouseleave", function() {
        //     flowPlay();
        //   });
  
          $banner.on("focusin", "a", function() {
            flowPause();
          }).on("focusout", "a", function() {
            flowPause();
            flowPlay();
          });
  
          function flow() {
  
            if (Math.abs(left) >= $bannerW) {
              left = 0;
              $box.children("li").first().appendTo($box);
            }
  
            left = left - 1;
            $box.css({
              'left': left
            });
  
          }
  
          function flowPause() {
            clearInterval(timer);
          }
  
          function flowPlay() {
            timer = setInterval(flow, speed);
          }
  
        });
      }
    });
  })(jQuery);
  
  $(function() {
    $(".box-flow").flowBanner({
      control: false
      //speed: 20
    });
  });

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





function onloadDONE(){       // All element interaction script  - sys 221016
    if(window.location.hash !== ''){
        location.href = window.location.hash;
    }
    
    $(  'header .category .cateItem').on('click touch', function(){
        $('body').removeClass('headerON');
        $('.ic-hamburger').removeClass('ON');
    });




    const labelTextMap = {
        n2: {
          title: 'Net Zero School',
          desc: 'A project that aggregates carbon emissions from elementary, middle, and high schools to contribute to achieving net zero goals. By analyzing energy usage data from each school, it assesses carbon emissions and suggests reduction strategies.'
        },
        n16: {
          title: 'GXCE ( Gesia X Carbon Exchange )',
          desc: 'GXCE is a rollup-based decentralized exchange (DEX) where users can trade carbon credits authenticated by certified institutions such as Verra, ProArles, and the Korea Forestry Promotion Institute. The platform emphasizes transparency in all carbon credit transactions, creating a trustworthy environment for carbon trading.'
        }, 
        n8: {
          title: 'Net Zero Heroes',
          desc: 'A campaign project designed to raise awareness about the climate crisis and encourage carbon reduction efforts. Through various platforms and social media, it highlights the importance of addressing climate change and offers practical ways to reduce one\'s carbon footprint.'
        },
        n10: {
          title: 'Net Zero Wallet', 
          desc: 'Net Zero Wallet securely stores carbon credits issued by the Offset Chain and supports reliable carbon management and transactions through comprehensive authentication, including transaction, emission, and offset authentication.'
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
    

}



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
            scrolloverflowed = true;
            // scrolloverflowed = true;
        }
        $('#fullpage').fullpage({
            sectionSelector: '.secItem',
            anchors: [
                'intro',
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




