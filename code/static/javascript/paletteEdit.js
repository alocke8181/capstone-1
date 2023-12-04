addedTags = $('#added-tags');

$('#confirm-del-button').hide();
$('#del-button').click(function(){
    $('#confirm-del-button').show();
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
    //Adds listeners to tags that are already added to the palette
    let oldTags = $('.btn-primary');
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