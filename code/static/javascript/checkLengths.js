function checkLengths(){
    //Check the lengths of the name and description boxes
    let nameLen = $('#name').val().length;
    let descLen = $('#desc').val().length;
    if ((nameLen <= 20 && nameLen >=1) && (descLen <=200)){
        $('#confirm-button').prop('disabled',false);
    }else{
        $('#confirm-button').prop('disabled',true);
    };
};

function nameCounter(){
    //Counts the number of characters for the name box
    let $charCount = $('#name-counter');
    let $inputField = $('#name');
    let len = $inputField.val().length;
    $charCount.text(`${len}/20`);
    if (len > 20 || len <=0){
        $charCount.css('color','red');
    } if (len <=20 && len >=1){
        $charCount.css('color','#E5EBEF');
    }
};
nameCounter();
$('#name').on('keyup', function(){
    nameCounter();
    checkLengths();
});

function descCounter(){
    //Counts the number of characters for the desc box
    let $charCount = $('#desc-counter');
    let $inputField = $('#desc');
    let len = $inputField.val().length;
    $charCount.text(`${len}/200`);
    if (len > 200){
        $charCount.css('color','red');
    } if (len <=200 && len >=1){
        $charCount.css('color','#E5EBEF');
    }
};

descCounter();
$('#desc').on('keyup', function(){
    descCounter();
    checkLengths();
});