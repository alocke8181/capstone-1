//Simple script to hide the confirm button and then show it when the first is clicked.
$('#confirm-button').hide();
$('#del-button').click(function(){
    $('#confirm-button').show();
});