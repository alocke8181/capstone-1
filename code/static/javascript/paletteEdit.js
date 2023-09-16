const BASE_URL = 'http://127.0.0.1:5000/';
//Simple script to hide the confirm button and then show it when the first is clicked.
$('#confirm-button').hide();
$('#del-button').click(function(){
    $('#confirm-button').show();
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