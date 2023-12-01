//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'
let tagList;
const tagSearchBar = $('#tag-search');
let sugList = $('#suggestions');
const noResult = 'No Tags Found!';
const addedTags = $('#added-tags');

async function getTags(){
    let response = await axios.get(`${BASE_URL}/tags`);
    tagList = response.data.tags;
};
getTags();


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

function searchTagList(str){
    let lower = str.toLowerCase();
    let results = tagList.filter(eachTag => eachTag.toLowerCase().includes(lower));
    if (results.length ==0){
        results.push(noResult);
    }if(results.length >5){
        results = results.slice(0,5);
    };
    return results;
};

function clearSuggestions(){
	if(sugList.children().length > 0){
		Array.from(sugList.children()).forEach(eachChild => eachChild.remove());
	};
};

function tagSearchHandler(e){
    clearSuggestions();
    let query = tagSearchBar.val();
    if(query !== ''){
        let tags = searchTagList(query);
        showSuggestions(tags,query);
    }else{
        tagSearchBar.val(tagSearchBar.defaultValue);
    };
};

function showSuggestions(tags, query){
    tags.forEach(eachTag =>{
        let sugg = $('<button>');
        if(eachTag !== noResult){
            sugg.html(boldSuggestion(eachTag, query));
            sugg.addClass('btn btn-secondary');
            sugg.on('mouseover', () => {
                sugg.addClass('btn-success');
                sugg.removeClass('btn-secondary');});
            sugg.on('mouseout', () => {
                sugg.addClass('btn-secondary');
                sugg.removeClass('btn-success');});  
            sugg.on('click', (e) => {
                e.preventDefault();
                addTag(eachTag);
            });
        }else{
            sugg.text(noResult);
            sugg.addClass('btn btn-danger');
            sugg.prop('disabled',true);
        };
        sugList.append(sugg);
    });
};

function addTag(tag){
    if(checkTagAlreadyAdded(tag)){
        return;
    }else{
    let newTag = $('<button>');
    newTag.attr('name', tag);
    newTag.attr('id', tag);
    newTag.addClass('btn btn-secondary');
    newTag.on('mouseover', () => {
        newTag.addClass('btn-danger');
        newTag.removeClass('btn-secondary');});
    newTag.on('mouseout', () => {
        newTag.addClass('btn-secondary');
        newTag.removeClass('btn-danger');});    
    newTag.text(tag);
    newTag.on('click', (e) => {
        e.preventDefault();
        newTag.remove();
    });
    addedTags.append(newTag);
    tagSearchBar.val('');
    clearSuggestions();
}
};

function checkTagAlreadyAdded(tag){
    let added = false;
    if(addedTags.children().length >0){
        addedTags.children().each((idx, child) =>{
            if($(child).attr('id') == tag){
                added = true;
            };
        });
    };
    return added;
};

function boldSuggestion(tag, query){
    let tagLower = tag.toLowerCase();
    let queryLower = query.toLowerCase();
    let firstIdx = tagLower.indexOf(queryLower);
    let lastIdx = firstIdx + query.length;

    let firstStr = tag.slice(0,firstIdx);
    let boldStr = tag.slice(firstIdx, lastIdx);
    let lastStr = tag.slice(lastIdx);
    return firstStr + "<b>" + boldStr + "</b>" + lastStr;
};

function addListenersToTags(){
    if(addedTags.children().length >0){
        addedTags.children().each((idx, child) =>{
            let $child = $(child);
            $child.on('mouseover', () => {
                $child.addClass('btn-danger');
                $child.removeClass('btn-secondary');});
            $child.on('mouseout', () => {
                $child.addClass('btn-secondary');
                $child.removeClass('btn-danger');});    
            $child.on('click', (e) => {
                e.preventDefault();
                $child.remove();
            });
        });
    };
};
addListenersToTags();

tagSearchBar.on('keyup', tagSearchHandler)