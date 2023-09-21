const BASE_URL = 'https://palette-place.onrender.com/';
//Simple script to hide the confirm button and then show it when the first is clicked.
$('#confirm-button').hide();
$('#del-button').click(function(){
    $('#confirm-button').show();
});

function charCounter(){
    let $charCount = $('#char-counter');
    let $inputField = $('textarea');
    let len = $inputField.val().length;
    $charCount.text(`${len}/200`);
    if (len > 200){
        $charCount.css('color','red');
        $('#save-button').prop('disabled',true);
    } if (len <=200){
        $charCount.css('color','#E5EBEF');
        $('#save-button').prop('disabled',false);
    }
};
charCounter();
$('textarea').on('keyup', function(){
    charCounter();
});

async function editPalette(){
    //Function to save the palette to the database
    $('#save-button').click(async function(event){
        event.preventDefault();
        let palID = $('.palette-editor').attr('id');
        let nameIn = $('#name').val();
        let descIn = $('#desc').val();
        let tags = [];
        $('#tag-cont').find('input[type=checkbox]').each(function(){
            if (this.checked){
                tags.push(this.dataset.name);
            };
        });
        let response = await axios.post(`${BASE_URL}/palettes/${palID}/edit`, {name : nameIn, desc : descIn, tags : tags});
        let redirUrl = response.data.redir_url;
        window.location.replace(`${BASE_URL}${redirUrl}`);
    });
};
editPalette();