//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'

let loadCounter = 1;
let $palDiv = $('#pal-div');
let $loadBut = $('#load-but')

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


function loadingOn(){
    $loadBut.text('Loading');
    $loadBut.removeClass('btn-primary');
    $loadBut.addClass('btn-warning');
    $loadBut.prop('disabled',true);
};
function loadingOff(){
    $loadBut.text('See More');
    $loadBut.removeClass('btn-warning');
    $loadBut.addClass('btn-primary');
    $loadBut.prop('disabled',false);
};

async function loadPalettes(){
    loadingOn();
    let response = await axios.get(`${BASE_URL}/palettes/browse/load?page=0`);
    let palettes = response.data['palettes'];
    for (let eachPalette in palettes){
        let eachPal = generateHTMLPrev(palettes[eachPalette]);
        $palDiv.append($(eachPal));
    };
    loadingOff();
};
loadPalettes();

async function loadMorePalettes(){
    $loadBut.on('click', async function(){
        loadingOn();
        let response = await axios.get(`${BASE_URL}/palettes/browse/load?page=${loadCounter}`);
        loadCounter++;
        let palettes = response.data['palettes'];
        for (let eachPalette in palettes){
            let eachPal = generateHTMLPrev(palettes[eachPalette]);
            $palDiv.append($(eachPal));
        };
        if (palettes.length < 16){
            $loadBut.text('No More Palettes');
            $loadBut.removeClass('btn-primary');
            $loadBut.addClass('btn-danger');
            $loadBut.unbind('click');
            $loadBut.prop('disabled',true)
        }
        if (palettes.length == 16){
            let response = await axios.get(`${BASE_URL}/palettes/browse?page=${loadCounter}`);
            let palettes = response.data['palettes'];
            if (palettes.length == 0){
                $loadBut.text('No More Palettes');
                $loadBut.removeClass('btn-primary');
                $loadBut.addClass('btn-danger');
                $loadBut.unbind('click');
                $loadBut.prop('disabled',true)
            };
        }
        if (palettes.length > 16){
            loadingOff();
        };

    });
};
loadMorePalettes();

function generateHTMLPrev(palette){
    let name = palette['name'];
    let id = palette['id'];
    let userID = palette['user_id'];
    let user = palette['user'];
    let main = palette['main'];
    let lightC = palette['light_c'];
    let lightA = palette['light_a'];
    let darkC = palette['dark_c'];
    let darkA = palette['dark_a'];

    let htmlString = 
    `<div class="palette-prev ${name}">
        <div class="color-main" id="color-main" style="background-color: ${main};"></div>
        <div class="color-small no-left-border" id="color-light-c" style="background-color: ${lightC};"></div>
        <div class="color-small" id="color-light-a" style="background-color: ${lightA};"></div>
        <div class="color-small" id="color-dark-c" style="background-color: ${darkC};"></div>
        <div class="color-small no-right-border" id="color-dark-a" style="background-color: ${darkA};"></div>
        <a href='/palettes/${id}'>
            <h6>${name}</h6>
        </a>
        <i>Created by <a href="/users/${userID}">${user}</a></i>
    </div>`;
    return htmlString;
}

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
    newTag.addClass('btn btn-primary');
    newTag.on('mouseover', () => {
        newTag.addClass('btn-danger');
        newTag.removeClass('btn-primary');});
    newTag.on('mouseout', () => {
        newTag.addClass('btn-primary');
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

tagSearchBar.on('keyup', tagSearchHandler)