//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'
addedTags = $('#added-tags');

$('#confirm-button').hide();
$('#del-button').click(function(){
    $('#confirm-button').show();
});

function checkLengths(){
    let nameLen = $('#name').val().length;
    let descLen = $('#desc').val().length;
    if ((nameLen <= 20 && nameLen >=1) && (descLen <=200)){
        $('#save-button').prop('disabled',false);
    }else{
        $('#save-button').prop('disabled',true);
    };
};
checkLengths();

function nameCounter(){
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

async function editPalette(){
    //Function to save the palette to the database
    $('#save-button').click(async function(event){
        event.preventDefault();
        let palID = $('.palette-editor').attr('id');
        let nameIn = $('#name').val();
        let descIn = $('#desc').val();
        let tags = [];
        addedTags.find('button').each((idx, child) =>{
            tags.push($(child).attr('name'));
        });
        let response = await axios.post(`${BASE_URL}/palettes/${palID}/edit`, {name : nameIn, desc : descIn, tags : tags});
        let redirUrl = response.data.redir_url;
        window.location.replace(`${BASE_URL}${redirUrl}`);
    });
};
editPalette();

function addListenersToExistingTags(){
    let oldTags = $('.btn-primary');
    console.log(oldTags);
    oldTags.each((eachTag) =>{
        let tag = $(oldTags[eachTag]);
        tag.on('mouseover', () => {
            tag.addClass('btn-danger');
            tag.removeClass('btn-primary');});
        tag.on('mouseout', () => {
            tag.addClass('btn-primary');
            tag.removeClass('btn-danger');});
        tag.on('click', (e) => {
            e.preventDefault();
            tag.remove();});    
    });
};

addListenersToExistingTags();