var currentPage = 0;

$('.book')
.on('click', '.ACTIVE .btnNext', nextPage)
.on('click', '.flipped .btnPrev', prevPage);

// var hammertime = new Hammer($('.book')[0]);
// hammertime.on("swipeleft", nextPage);
// hammertime.on("swiperight", prevPage);

function prevPage() {
  
  $('.flipped')
    .last()
    .removeClass('flipped')
    .addClass('ACTIVE')
    .siblings('.page')
    .removeClass('ACTIVE');
}
function nextPage() {
  
  $('.ACTIVE')
    .removeClass('ACTIVE')
    .addClass('flipped')
    .next('.page')
    .addClass('ACTIVE')
    .siblings();
    
    
}