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




 



function mobileHeaderControll(){
    $('body').toggleClass('headerON');
    $('.ic-hamburger').toggleClass('ON');
}






function onloadDONE(){       // All element interaction script  - sys 221016
    if(window.location.hash !== ''){
        location.href = window.location.hash;
    }
    
    $(  'header .category .cateItem').on('click touch', function(){
        $('body').removeClass('headerON');
        $('.ic-hamburger').removeClass('ON');
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

        if( /Android|webOS|iPhone|Macintosh|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            $('body').addClass('type-device');      
        }

        onloadDONE();
        
    }, 100);
    vhCheck();




});




