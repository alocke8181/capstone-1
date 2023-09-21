//Simple script to hide the confirm button and then show it when the first is clicked.
$('#confirm-button').hide();
$('#del-button').click(function(){
    $('#confirm-button').show();
});

function charCounter(){
    let $charCount = $('#char-counter');
    let $inputField = $('textarea');
    let len = $inputField.val().length;
    $charCount.text(`${len}/300`);
    if (len > 300){
        $charCount.css('color','red');
        $('#save-button').prop('disabled',true);
    } if (len <=300){
        $charCount.css('color','#E5EBEF');
        $('#save-button').prop('disabled',false);
    }
};
charCounter();
$('textarea').on('keyup', function(){
    charCounter();
});